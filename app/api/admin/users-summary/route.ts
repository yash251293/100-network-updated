import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuthToken } from '@/lib/authUtils';

const ADMIN_EMAIL = 'yashrawlani00@gmail.com';

interface UserSummary {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  registrationDate: string; // ISO string
  jobsPostedCount: number;
  applicationsSubmittedCount: number;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const authPayload = verifyAuthToken(authHeader);

  if (!authPayload) {
    return NextResponse.json({ success: false, message: 'Authentication failed: Invalid or missing token' }, { status: 401 });
  }

  const { userId } = authPayload;

  try {
    // Verify if the authenticated user is the admin
    const adminUserResult = await query('SELECT email FROM users WHERE id = $1', [userId]);
    if (adminUserResult.rows.length === 0 || adminUserResult.rows[0].email !== ADMIN_EMAIL) {
      return NextResponse.json({ success: false, message: 'Forbidden: User is not authorized to access this resource' }, { status: 403 });
    }

    // Fetch all users and their basic profile info
    const usersQuery = `
      SELECT
        u.id,
        u.email,
        u.created_at as registrationDate,
        p.first_name as firstName,
        p.last_name as lastName
      FROM users u
      LEFT JOIN profiles p ON u.id = p.id
      ORDER BY u.created_at DESC;
    `;
    const usersResult = await query(usersQuery);
    const users = usersResult.rows;

    const userSummaries: UserSummary[] = [];

    for (const user of users) {
      // Count jobs posted
      const jobsPostedResult = await query('SELECT COUNT(*) as count FROM jobs WHERE posted_by_user_id = $1', [user.id]);
      const jobsPostedCount = parseInt(jobsPostedResult.rows[0].count, 10);

      // Count applications submitted
      const appsSubmittedResult = await query('SELECT COUNT(*) as count FROM job_applications WHERE user_id = $1', [user.id]);
      const applicationsSubmittedCount = parseInt(appsSubmittedResult.rows[0].count, 10);

      userSummaries.push({
        id: user.id,
        email: user.email,
        firstName: user.firstname,
        lastName: user.lastname,
        registrationDate: user.registrationdate,
        jobsPostedCount,
        applicationsSubmittedCount,
      });
    }

    return NextResponse.json({ success: true, data: userSummaries }, { status: 200 });

  } catch (error: any) {
    console.error('Error in GET /api/admin/users-summary:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
