import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyAuthToken, AuthError } from '@/lib/authUtils';

const paramsSchema = z.object({
  id: z.string().uuid({ message: "Invalid job ID format" }),
});

const applicationBodySchema = z.object({
  coverLetter: z.string().optional().nullable(),
  resumeUrl: z.string().url({ message: "Invalid resume URL format" }).optional().nullable(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Validate Job ID from path
  const paramsValidation = paramsSchema.safeParse(params);
  if (!paramsValidation.success) {
    return NextResponse.json(
      { success: false, message: 'Invalid job ID format', errors: paramsValidation.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const jobId = paramsValidation.data.id;

  // 2. Authenticate User
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

  // 3. Validate Request Body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  const bodyValidation = applicationBodySchema.safeParse(body);
  if (!bodyValidation.success) {
    return NextResponse.json(
      { success: false, message: 'Invalid request body', errors: bodyValidation.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const { coverLetter, resumeUrl } = bodyValidation.data;

  try {
    // 4. Business Logic & Database Operations

    // Check Job Status
    const jobResult = await query('SELECT status FROM jobs WHERE id = $1', [jobId]);
    if (jobResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }
    const jobStatus = jobResult.rows[0].status;
    // Assuming 'Open' is the primary status for accepting applications.
    // You might have other statuses like 'Accepting Applications', 'Actively Hiring' etc.
    if (jobStatus !== 'Open') {
      return NextResponse.json(
        { success: false, message: 'This job is not currently accepting applications.' },
        { status: 400 }
      );
    }

    // Check for Duplicate Applications
    const duplicateCheckResult = await query(
      'SELECT id FROM job_applications WHERE job_id = $1 AND user_id = $2',
      [jobId, userId]
    );
    if (duplicateCheckResult.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'You have already applied for this job.' },
        { status: 400 } // 409 Conflict might also be appropriate
      );
    }

    // Insert Application
    const insertQuery = `
      INSERT INTO job_applications (job_id, user_id, cover_letter, resume_url, application_date, status)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 'Applied')
      RETURNING id;
    `;
    const insertParams = [jobId, userId, coverLetter, resumeUrl];
    const applicationResult = await query(insertQuery, insertParams);
    const newApplicationId = applicationResult.rows[0].id;

    // 5. Response
    return NextResponse.json(
      { success: true, message: 'Application submitted successfully', applicationId: newApplicationId },
      { status: 201 }
    );

  } catch (error: any) {
    console.error(`Error submitting application for job ID [${jobId}] by user ID [${userId}]:`, error);
    // Specific error for foreign key violation if companyId for the job was somehow invalid (though checked by job existence)
    if (error.code === '23503' && error.constraint === 'job_applications_job_id_fkey') {
        return NextResponse.json({ success: false, message: 'Job not found or invalid.' }, { status: 404 });
    }
    return NextResponse.json(
      { success: false, message: 'Failed to submit application. ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
