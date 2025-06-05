import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuthToken } from '@/lib/authUtils';
import { z } from 'zod';

const ADMIN_EMAIL = 'yashrawlani00@gmail.com';

const paramsSchema = z.object({
  userId: z.string().uuid({ message: "Invalid user ID format" }),
});

export async function GET(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  const authHeader = request.headers.get('Authorization');
  const authPayload = verifyAuthToken(authHeader);

  if (!authPayload) {
    return NextResponse.json({ success: false, message: 'Authentication failed: Invalid or missing token' }, { status: 401 });
  }

  const adminUserId = authPayload.userId;

  try {
    // Verify if the authenticated user is the admin
    const adminUserResult = await query('SELECT email FROM users WHERE id = $1', [adminUserId]);
    if (adminUserResult.rows.length === 0 || adminUserResult.rows[0].email !== ADMIN_EMAIL) {
      return NextResponse.json({ success: false, message: 'Forbidden: User is not authorized to access this resource' }, { status: 403 });
    }

    // Validate path parameter userId
    const routeUserId = context.params?.userId; // Access from context.params
    if (typeof routeUserId !== 'string' || routeUserId.trim() === '') {
      // Log this attempt for security/monitoring if needed
      console.warn('Admin API: Attempt to access user details with invalid or missing target user ID in path.');
      return NextResponse.json({ success: false, message: 'Invalid or missing target user ID in URL path.' }, { status: 400 });
    }

    const paramsValidation = paramsSchema.safeParse({ userId: routeUserId });
    if (!paramsValidation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid target user ID format in URL', errors: paramsValidation.error.flatten().fieldErrors, formErrors: paramsValidation.error.flatten().formErrors },
        { status: 400 }
      );
    }
    const targetUserId = paramsValidation.data.userId;

    // --- Fetch all data for the targetUserId ---

    // 1. User and Profile Data
    const userProfileQuery = `
      SELECT
        u.id as "userId", u.email, u.created_at as "registrationDate",
        p.first_name as "firstName", p.last_name as "lastName", p.avatar_url as "avatarUrl",
        p.headline, p.bio, p.location, p.linkedin_url as "linkedinUrl",
        p.github_url as "githubUrl", p.website_url as "websiteUrl", p.phone,
        p.job_type as "preferredJobType", p.experience_level as "preferredExperienceLevel",
        p.remote_work_preference as "remoteWorkPreference", p.preferred_industries as "preferredIndustries"
      FROM users u
      LEFT JOIN profiles p ON u.id = p.id
      WHERE u.id = $1;
    `;
    const userProfileResult = await query(userProfileQuery, [targetUserId]);
    if (userProfileResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Target user not found' }, { status: 404 });
    }
    const userDetails: any = { ...userProfileResult.rows[0] }; // Make a mutable copy

    // 2. User Skills
    const skillsQuery = `
      SELECT s.name, us.proficiency_level as "proficiencyLevel"
      FROM user_skills us
      JOIN skills s ON us.skill_id = s.id
      WHERE us.user_id = $1;
    `;
    const skillsResult = await query(skillsQuery, [targetUserId]);
    userDetails.skills = skillsResult.rows;

    // 3. User Experience
    const experienceQuery = `
      SELECT title, company_name as "companyName", location, start_date as "startDate", end_date as "endDate", current_job as "currentJob", description
      FROM user_experience
      WHERE user_id = $1
      ORDER BY "startDate" DESC, id DESC;
    `;
    const experienceResult = await query(experienceQuery, [targetUserId]);
    userDetails.experience = experienceResult.rows;

    // 4. User Education
    const educationQuery = `
      SELECT school_name as "schoolName", degree, field_of_study as "fieldOfStudy", start_date as "startDate", end_date as "endDate", current_student as "currentStudent", description
      FROM user_education
      WHERE user_id = $1
      ORDER BY "startDate" DESC, id DESC;
    `;
    const educationResult = await query(educationQuery, [targetUserId]);
    userDetails.education = educationResult.rows;

    // 5. Jobs Posted by User
    const jobsPostedQuery = `
      SELECT id, title, job_type as "jobType", status, created_at as "createdAt", published_at as "publishedAt"
      FROM jobs
      WHERE posted_by_user_id = $1
      ORDER BY "createdAt" DESC;
    `;
    const jobsPostedResult = await query(jobsPostedQuery, [targetUserId]);
    userDetails.jobsPosted = jobsPostedResult.rows;

    // 6. Applications Submitted by User
    const applicationsQuery = `
      SELECT
        ja.id as "applicationId", ja.application_date as "applicationDate", ja.status as "applicationStatus",
        j.id as "jobId", j.title as "jobTitle",
        c.name as "companyName"
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      WHERE ja.user_id = $1
      ORDER BY ja.application_date DESC;
    `;
    const applicationsResult = await query(applicationsQuery, [targetUserId]);
    userDetails.applicationsSubmitted = applicationsResult.rows;

    return NextResponse.json({ success: true, data: userDetails }, { status: 200 });

  } catch (error: any) {
    console.error(`Error in GET /api/admin/users/${context.params?.userId}:`, error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
