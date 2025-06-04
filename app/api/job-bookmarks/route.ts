import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyAuthToken, AuthError } from '@/lib/authUtils';

const getBookmarksQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
  sortBy: z.enum(['bookmark_date', 'job_publish_date', 'job_title']).optional().default("bookmark_date"),
  sortOrder: z.enum(['asc', 'desc']).optional().default("desc"),
});

export async function GET(request: NextRequest) {
  // 1. Authentication
  let authPayload;
  try {
    authPayload = await verifyAuthToken(request);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    }
    return NextResponse.json({ success: false, message: 'Authentication failed' }, { status: 401 });
  }

  if (!authPayload || !authPayload.userId) {
    return NextResponse.json({ success: false, message: 'User not authenticated or user ID missing' }, { status: 401 });
  }
  const userId = authPayload.userId;

  // 2. Query Parameter Validation
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validationResult = getBookmarksQuerySchema.safeParse(params);

  if (!validationResult.success) {
    return NextResponse.json({
      success: false,
      message: 'Invalid query parameters',
      errors: validationResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const {
    page,
    limit,
    sortBy,
    sortOrder,
  } = validationResult.data;

  // 3. Database Query Construction
  const offset = (page - 1) * limit;
  const queryParams: any[] = [userId]; // Start with userId for WHERE clause
  let paramIndex = 2; // Next param index will be $2

  let baseQuery = `
    SELECT
      ujb.created_at as bookmark_date,
      j.id as job_id,
      j.title as job_title,
      j.description as job_description, -- Added job_description
      j.location as job_location,
      j.job_type,
      j.experience_level,
      j.published_at as job_published_at,
      j.status as job_status, -- Added job_status
      c.id as company_id, -- Added company_id
      c.name as company_name,
      c.logo_url as company_logo_url,
      STRING_AGG(DISTINCT s.name, ', ') WITHIN GROUP (ORDER BY s.name) as skills_list
    FROM user_job_bookmarks ujb
    JOIN jobs j ON ujb.job_id = j.id
    JOIN companies c ON j.company_id = c.id
    LEFT JOIN job_skills_link jsl ON j.id = jsl.job_id
    LEFT JOIN skills s ON jsl.skill_id = s.id
    WHERE ujb.user_id = $1
    GROUP BY
      ujb.created_at,
      j.id,
      j.title,
      j.description,
      j.location,
      j.job_type,
      j.experience_level,
      j.published_at,
      j.status,
      c.id,
      c.name,
      c.logo_url
  `;

  const countQuery = `
    SELECT COUNT(*) as total_items
    FROM user_job_bookmarks
    WHERE user_id = $1;
  `;
  const countQueryParams = [userId];

  // ORDER BY clause
  const sortColumnMapping: { [key: string]: string } = {
    'bookmark_date': 'ujb.created_at',
    'job_publish_date': 'j.published_at',
    'job_title': 'j.title',
  };
  const safeSortBy = sortColumnMapping[sortBy] || 'ujb.created_at'; // Default sort

  baseQuery += ` ORDER BY ${safeSortBy} ${sortOrder.toUpperCase()}`;
  baseQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryParams.push(limit, offset);

  try {
    const bookmarksResult = await query(baseQuery, queryParams);
    const countResult = await query(countQuery, countQueryParams);

    const totalItems = parseInt(countResult.rows[0].total_items, 10);
    const totalPages = Math.ceil(totalItems / limit);

    const bookmarkedJobs = bookmarksResult.rows.map(job => ({
      ...job,
      // Ensure skills_list is an array, even if null (no skills)
      skills_list: job.skills_list ? job.skills_list.split(', ').map((s: string) => s.trim()) : [],
       // Optionally truncate description if it was added and is too long for a list view
      job_description: job.job_description?.substring(0, 150) + (job.job_description?.length > 150 ? '...' : ''),
    }));

    return NextResponse.json({
      data: bookmarkedJobs,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });

  } catch (error: any) {
    console.error(`Error fetching bookmarked jobs for user ID [${userId}]:`, error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch bookmarked jobs. ' + (error.message || 'Unknown error'),
    }, { status: 500 });
  }
}
