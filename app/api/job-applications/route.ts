import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyAuthToken, AuthError } from '@/lib/authUtils';

const getApplicationsQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  jobId: z.string().uuid().optional(),
  status: z.string().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
  sortBy: z.enum(['application_date', 'j.title', 'c.name']).optional().default("application_date"),
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
  const requestingUserId = authPayload.userId;
  // const isAdmin = authPayload.isAdmin || false; // Future: for admin overrides

  // 2. Query Parameter Validation
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validationResult = getApplicationsQuerySchema.safeParse(params);

  if (!validationResult.success) {
    return NextResponse.json({
      success: false,
      message: 'Invalid query parameters',
      errors: validationResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const {
    userId: queryUserId, // User whose applications are being requested
    jobId: queryJobId,     // Job for which applications are being requested
    status,
    page,
    limit,
    sortBy,
    sortOrder,
  } = validationResult.data;

  const queryParams: any[] = [];
  const countQueryParams: any[] = [];
  const whereClauses: string[] = [];
  let paramIndex = 1;

  // 3. Authorization
  // Scenario 1: User requests their own applications
  if (queryUserId) {
    if (queryUserId !== requestingUserId /* && !isAdmin */) {
      return NextResponse.json({ success: false, message: 'Forbidden: You can only view your own applications.' }, { status: 403 });
    }
    whereClauses.push(`ja.user_id = $${paramIndex++}`);
    queryParams.push(queryUserId);
    countQueryParams.push(queryUserId);
  }
  // Scenario 2: Job poster requests applications for their job
  else if (queryJobId) {
    try {
      const jobCheckResult = await query('SELECT posted_by_user_id FROM jobs WHERE id = $1', [queryJobId]);
      if (jobCheckResult.rows.length === 0) {
        return NextResponse.json({ success: false, message: 'Job not found.' }, { status: 404 });
      }
      if (jobCheckResult.rows[0].posted_by_user_id !== requestingUserId /* && !isAdmin */) {
        return NextResponse.json({ success: false, message: 'Forbidden: You can only view applications for jobs you posted.' }, { status: 403 });
      }
      whereClauses.push(`ja.job_id = $${paramIndex++}`);
      queryParams.push(queryJobId);
      countQueryParams.push(queryJobId);
    } catch (dbError: any) {
      console.error("Database error checking job ownership:", dbError);
      return NextResponse.json({ success: false, message: 'Server error validating access.' }, { status: 500 });
    }
  }
  // Scenario 3: Default - user requests their own applications if no specific filters given
  else {
    // if (!isAdmin) { // If not admin, default to own applications
      whereClauses.push(`ja.user_id = $${paramIndex++}`);
      queryParams.push(requestingUserId);
      countQueryParams.push(requestingUserId);
    // } else {
      // Admin can see all if no specific filter, or this part can be removed if admin must specify a filter
    // }
  }

  if (status) {
    whereClauses.push(`ja.status = $${paramIndex++}`);
    queryParams.push(status);
    countQueryParams.push(status);
  }

  // 4. Database Query Construction
  const offset = (page - 1) * limit;

  let baseQuery = `
    SELECT
      ja.id as application_id, ja.job_id, ja.user_id, ja.application_date, ja.status,
      ja.cover_letter, ja.resume_url, ja.notes, ja.created_at, ja.updated_at,
      j.title as job_title, j.location as job_location,
      c.name as company_name, c.logo_url as company_logo_url,
      u.email as applicant_email, -- Added applicant email
      p.first_name as applicant_first_name, -- Added applicant first name
      p.last_name as applicant_last_name -- Added applicant last name
    FROM job_applications ja
    JOIN jobs j ON ja.job_id = j.id
    JOIN companies c ON j.company_id = c.id
    JOIN users u ON ja.user_id = u.id -- Join with users table
    LEFT JOIN profiles p ON u.id = p.id -- Left Join with profiles table
  `;

  let countQuery = `
    SELECT COUNT(DISTINCT ja.id) as total_items
    FROM job_applications ja
    JOIN jobs j ON ja.job_id = j.id
    JOIN companies c ON j.company_id = c.id
    JOIN users u ON ja.user_id = u.id -- Join with users table
    LEFT JOIN profiles p ON u.id = p.id -- Left Join with profiles table
  `;

  if (whereClauses.length > 0) {
    const whereString = `WHERE ${whereClauses.join(' AND ')}`;
    baseQuery += ` ${whereString}`;
    countQuery += ` ${whereString}`;
  }

  // ORDER BY clause - ensure sortBy is a valid column name
  const allowedSortBy: { [key: string]: string } = {
    'application_date': 'ja.application_date',
    'j.title': 'j.title',
    'c.name': 'c.name'
  };
  const safeSortBy = allowedSortBy[sortBy] || 'ja.application_date'; // Default sort

  baseQuery += ` ORDER BY ${safeSortBy} ${sortOrder.toUpperCase()}`;
  baseQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryParams.push(limit, offset);

  try {
    const applicationsResult = await query(baseQuery, queryParams);
    const countResult = await query(countQuery, countQueryParams);

    const totalItems = parseInt(countResult.rows[0].total_items, 10);
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      data: applicationsResult.rows,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });

  } catch (error: any) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch job applications. ' + (error.message || 'Unknown error'),
    }, { status: 500 });
  }
}
