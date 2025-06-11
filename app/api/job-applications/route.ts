import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyAuthToken } from '@/lib/authUtils'; // Removed AuthError import

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
  const authHeader = request.headers.get('Authorization');
  const authPayload = verifyAuthToken(authHeader);

  if (!authPayload) {
    return NextResponse.json({ success: false, message: 'Authentication failed: Invalid or missing token' }, { status: 401 });
  }
  const { userId: requestingUserId } = authPayload;
  // const isAdmin = authPayload.isAdmin || false; // Future: for admin overrides

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
    userId: queryUserId,
    jobId: queryJobId,
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

  try { // Added try block for authorization logic that might throw DB errors
    if (queryUserId) {
      if (queryUserId !== requestingUserId /* && !isAdmin */) {
        return NextResponse.json({ success: false, message: 'Forbidden: You can only view your own applications.' }, { status: 403 });
      }
      whereClauses.push(`ja.user_id = $${paramIndex++}`);
      queryParams.push(queryUserId);
      countQueryParams.push(queryUserId);
    }
    else if (queryJobId) {
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
    }
    else {
        whereClauses.push(`ja.user_id = $${paramIndex++}`);
        queryParams.push(requestingUserId);
        countQueryParams.push(requestingUserId);
    }

    if (status) {
      whereClauses.push(`ja.status = $${paramIndex++}`);
      queryParams.push(status);
      countQueryParams.push(status);
    }

    const offset = (page - 1) * limit;

    let baseQuery = `
      SELECT
        ja.id as application_id, ja.job_id, ja.user_id, ja.application_date, ja.status,
        ja.cover_letter, ja.resume_url, ja.notes, ja.created_at, ja.updated_at,
        j.title as job_title, j.location as job_location,
        c.name as company_name, c.logo_url as company_logo_url,
        u.email as applicant_email,
        p.first_name as applicant_first_name,
        p.last_name as applicant_last_name
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      JOIN users u ON ja.user_id = u.id
      LEFT JOIN profiles p ON u.id = p.id
    `;

    let countQuery = `
      SELECT COUNT(DISTINCT ja.id) as total_items
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      JOIN users u ON ja.user_id = u.id
      LEFT JOIN profiles p ON u.id = p.id
    `;

    if (whereClauses.length > 0) {
      const whereString = `WHERE ${whereClauses.join(' AND ')}`;
      baseQuery += ` ${whereString}`;
      countQuery += ` ${whereString}`;
    }

    const allowedSortBy: { [key: string]: string } = {
      'application_date': 'ja.application_date', 'j.title': 'j.title', 'c.name': 'c.name'
    };
    const safeSortBy = allowedSortBy[sortBy] || 'ja.application_date';

    baseQuery += ` ORDER BY ${safeSortBy} ${sortOrder.toUpperCase()}`;
    baseQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(limit, offset);

    const applicationsResult = await query(baseQuery, queryParams);
    const countResult = await query(countQuery, countQueryParams);

    const totalItems = parseInt(countResult.rows[0].total_items, 10);
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      data: applicationsResult.rows,
      pagination: { totalItems, totalPages, currentPage: page, pageSize: limit },
    });

  } catch (error: any) {
    console.error('Error in GET /api/job-applications:', error);
    if (error instanceof z.ZodError) { // Should be caught by earlier checks
        return NextResponse.json({ success: false, message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
