import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyAuthToken } from '@/lib/authUtils';

const getBookmarksQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
  sortBy: z.enum(['bookmark_date', 'job_publish_date', 'job_title']).optional().default("bookmark_date"),
  sortOrder: z.enum(['asc', 'desc']).optional().default("desc"),
});

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const authPayload = verifyAuthToken(authHeader);

  if (!authPayload) {
    return NextResponse.json({ success: false, message: 'Authentication failed: Invalid or missing token' }, { status: 401 });
  }
  const { userId } = authPayload;

  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validationResult = getBookmarksQuerySchema.safeParse(params);

  if (!validationResult.success) {
    return NextResponse.json({
      success: false, message: 'Invalid query parameters',
      errors: validationResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { page, limit, sortBy, sortOrder } = validationResult.data;
  const offset = (page - 1) * limit;

  // Parameters for the main data query
  const dataQueryParams: any[] = [userId, limit, offset];
  // Parameters for the count query
  const countQueryParams = [userId];

  try {
    const cteClause = `
      WITH DistinctJobSkills AS (
          SELECT DISTINCT jsl.job_id, s.name AS skill_name
          FROM job_skills_link jsl
          JOIN skills s ON jsl.skill_id = s.id
      ),
      AggregatedJobSkills AS (
          SELECT djs.job_id, STRING_AGG(djs.skill_name, ', ' ORDER BY djs.skill_name) AS skills_list
          FROM DistinctJobSkills djs
          GROUP BY djs.job_id
      )
    `;

    let baseQuery = `
      ${cteClause}
      SELECT
        ujb.created_at as bookmark_date,
        j.id as job_id, j.title as job_title, j.description as job_description,
        j.location as job_location, j.job_type, j.experience_level,
        j.published_at as job_published_at, j.status as job_status,
        c.id as company_id, c.name as company_name, c.logo_url as company_logo_url,
        COALESCE(ajs.skills_list, '') AS skills_list
      FROM user_job_bookmarks ujb
      JOIN jobs j ON ujb.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      LEFT JOIN AggregatedJobSkills ajs ON j.id = ajs.job_id
      WHERE ujb.user_id = $1
    `;

    const countQuery = `
      SELECT COUNT(*) as total_items
      FROM user_job_bookmarks
      WHERE user_id = $1;
    `;

    const sortColumnMapping: { [key: string]: string } = {
      'bookmark_date': 'ujb.created_at',
      'job_publish_date': 'j.published_at',
      'job_title': 'j.title',
    };
    const safeSortBy = sortColumnMapping[sortBy] || 'ujb.created_at';

    baseQuery += ` ORDER BY ${safeSortBy} ${sortOrder.toUpperCase()}`;
    baseQuery += ` LIMIT $2 OFFSET $3`; // Parameters are $1=userId, $2=limit, $3=offset

    const bookmarksResult = await query(baseQuery, dataQueryParams);
    const countResult = await query(countQuery, countQueryParams);

    const totalItems = parseInt(countResult.rows[0].total_items, 10);
    const totalPages = Math.ceil(totalItems / limit);

    const bookmarkedJobs = bookmarksResult.rows.map(job => ({
      ...job,
      skills_list: job.skills_list ? job.skills_list.split(', ').map((s: string) => s.trim()) : [],
      job_description: job.job_description?.substring(0, 150) + (job.job_description?.length > 150 ? '...' : ''),
    }));

    return NextResponse.json({
      data: bookmarkedJobs,
      pagination: { totalItems, totalPages, currentPage: page, pageSize: limit },
    });

  } catch (error: any) {
    console.error(`Error in GET /api/job-bookmarks for user ID [${userId}]:`, error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ success: false, message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
