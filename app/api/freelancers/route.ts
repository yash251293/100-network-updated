import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuthToken } from '@/lib/authUtils';
import { z } from 'zod';

const freelancersQuerySchema = z.object({
  searchTerm: z.string().optional(),
  skills: z.string().optional(), // Comma-separated skill names
  page: z.string().optional().default('1').transform(val => parseInt(val, 10)),
  limit: z.string().optional().default('10').transform(val => parseInt(val, 10)),
});

interface Freelancer {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  freelanceHeadline: string | null;
  location: string | null;
  skills: string[];
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const authPayload = verifyAuthToken(authHeader);

  if (!authPayload) {
    return NextResponse.json({ success: false, message: 'Authentication failed: Invalid or missing token' }, { status: 401 });
  }

  const url = new URL(request.url);
  const queryParamsFromUrl = Object.fromEntries(url.searchParams.entries());

  const validationResult = freelancersQuerySchema.safeParse(queryParamsFromUrl);

  if (!validationResult.success) {
    return NextResponse.json(
      { success: false, message: 'Invalid query parameters', errors: validationResult.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { searchTerm, skills: skillsQueryParam, page, limit } = validationResult.data;
  const offset = (page - 1) * limit;

  const skillNamesArray = skillsQueryParam ? skillsQueryParam.split(',').map(s => s.trim()).filter(s => s) : [];

  let baseQuery = `
    FROM
        profiles p
    JOIN
        users u ON p.id = u.id
  `;
  let countBaseQuery = `FROM profiles p JOIN users u ON p.id = u.id`;

  const whereClauses: string[] = ['p.is_available_for_freelance = TRUE'];
  const queryParams: any[] = [];
  let paramIndex = 1;

  let ctes = "";

  if (skillNamesArray.length > 0) {
    ctes = `
      WITH FilteredUsersBySkill AS (
          SELECT us.user_id
          FROM user_skills us
          JOIN skills s ON us.skill_id = s.id
          WHERE s.name = ANY($${paramIndex++})
          GROUP BY us.user_id
          HAVING COUNT(DISTINCT s.name) = $${paramIndex++}
      )
    `;
    queryParams.push(skillNamesArray);
    queryParams.push(skillNamesArray.length);

    baseQuery += ` JOIN FilteredUsersBySkill fus ON u.id = fus.user_id `;
    countBaseQuery += ` JOIN FilteredUsersBySkill fus ON u.id = fus.user_id `;
  }


  if (searchTerm) {
    const searchTermClause = `
      (p.first_name ILIKE $${paramIndex} OR
       p.last_name ILIKE $${paramIndex} OR
       p.freelance_headline ILIKE $${paramIndex} OR
       p.freelance_bio ILIKE $${paramIndex})
    `;
    whereClauses.push(searchTermClause);
    queryParams.push(`%${searchTerm}%`);
    paramIndex++;
  }

  const whereCondition = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const mainDataQuery = `
    ${ctes}
    SELECT
        u.id as "userId",
        p.first_name as "firstName",
        p.last_name as "lastName",
        p.avatar_url as "avatarUrl",
        p.freelance_headline as "freelanceHeadline",
        p.location,
        COALESCE(s_agg.skills_array, ARRAY[]::VARCHAR[]) as "skills"
    ${baseQuery}
    LEFT JOIN LATERAL (
        SELECT ARRAY_AGG(DISTINCT s.name ORDER BY s.name) as skills_array
        FROM user_skills us_inner
        JOIN skills s ON us_inner.skill_id = s.id
        WHERE us_inner.user_id = u.id
    ) s_agg ON TRUE
    ${whereCondition}
    ORDER BY
        p.updated_at DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++};
  `;
  const finalQueryParamsForData = [...queryParams, limit, offset];


  const totalCountQuery = `
    ${ctes}
    SELECT COUNT(DISTINCT u.id) as "total"
    ${countBaseQuery}
    ${whereCondition};
  `;
  // Query params for count are the same as for main query, excluding limit/offset
  const finalQueryParamsForCount = [...queryParams];


  try {
    const dataResult = await query(mainDataQuery, finalQueryParamsForData);
    const freelancers: Freelancer[] = dataResult.rows;

    const countResult = await query(totalCountQuery, finalQueryParamsForCount);
    const totalItems = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      success: true,
      data: freelancers,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in GET /api/freelancers:', error);
    // Log the generated queries and params for debugging if it's a DB error
    console.error('Failed Query (Data):', mainDataQuery);
    console.error('Failed Query Params (Data):', finalQueryParamsForData);
    console.error('Failed Query (Count):', totalCountQuery);
    console.error('Failed Query Params (Count):', finalQueryParamsForCount);
    return NextResponse.json({ success: false, message: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
