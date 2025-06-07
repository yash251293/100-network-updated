import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyAuthToken } from '@/lib/authUtils'; // Removed AuthError import

const paramsSchema = z.object({
  id: z.string().uuid({ message: "Invalid job ID format" }),
});

const applicationBodySchema = z.object({
  coverLetter: z.string().optional().nullable(),
  resumeUrl: z.string().url({ message: "Invalid resume URL format" }).optional().nullable(),
});

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const awaitedParams = await context.params;
  const routeJobId = awaitedParams?.id;
  if (typeof routeJobId !== 'string' || routeJobId.trim() === '') {
    console.error("Apply API received invalid or missing job ID in params. ID:", routeJobId);
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid or missing job ID in URL path for apply operation.',
        errors: { id: ["Job ID must be a non-empty string."] },
        formErrors: []
      },
      { status: 400 }
    );
  }
  // Add logging for the received ID
  console.log(`Apply API (POST) received RAW routeJobId:`, routeJobId);

  const paramsValidation = paramsSchema.safeParse({ id: routeJobId });
  if (!paramsValidation.success) {
    console.error(`Apply API (POST) Zod validation failed for routeJobId:`, routeJobId, "Errors:", paramsValidation.error.flatten());
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid job ID format in URL',
        errors: paramsValidation.error.flatten().fieldErrors,
        formErrors: paramsValidation.error.flatten().formErrors
      },
      { status: 400 }
    );
  }
  const jobId = paramsValidation.data.id; // Use the validated jobId

  const authHeader = request.headers.get('Authorization');
  const authPayload = verifyAuthToken(authHeader);

  if (!authPayload) {
    return NextResponse.json({ success: false, message: 'Authentication failed: Invalid or missing token' }, { status: 401 });
  }
  const { userId } = authPayload;

  let body;
  try {
    body = await request.json();
    console.log("Apply API received body:", body); // Logging for request body
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  const bodyValidation = applicationBodySchema.safeParse(body);
  if (!bodyValidation.success) {
    console.error("Apply API Zod validation failed for body. Body:", body, "Errors:", bodyValidation.error.flatten());
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid request body for application',
        errors: bodyValidation.error.flatten().fieldErrors,
        formErrors: bodyValidation.error.flatten().formErrors
      },
      { status: 400 }
    );
  }
  const { coverLetter, resumeUrl } = bodyValidation.data;

  try {
    const jobResult = await query('SELECT status FROM jobs WHERE id = $1', [jobId]);
    if (jobResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }
    const jobStatus = jobResult.rows[0].status;
    if (jobStatus !== 'Open') {
      return NextResponse.json(
        { success: false, message: 'This job is not currently accepting applications.' },
        { status: 400 }
      );
    }

    const duplicateCheckResult = await query(
      'SELECT id FROM job_applications WHERE job_id = $1 AND user_id = $2',
      [jobId, userId]
    );
    if (duplicateCheckResult.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'You have already applied for this job.' },
        { status: 400 }
      );
    }

    const insertQuery = `
      INSERT INTO job_applications (job_id, user_id, cover_letter, resume_url, application_date, status)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 'Applied')
      RETURNING id;
    `;
    const insertParams = [jobId, userId, coverLetter, resumeUrl];
    const applicationResult = await query(insertQuery, insertParams);
    const newApplicationId = applicationResult.rows[0].id;

    return NextResponse.json(
      { success: true, message: 'Application submitted successfully', applicationId: newApplicationId },
      { status: 201 }
    );

  } catch (error: any) {
    console.error(`Error in POST /api/jobs/${jobId}/apply:`, error);
    if (error instanceof z.ZodError) { // Should be caught by earlier checks, but as a safeguard
        return NextResponse.json({ success: false, message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    if (error.code === '23503' && error.constraint === 'job_applications_job_id_fkey') { // Example of specific DB error
        return NextResponse.json({ success: false, message: 'Job not found or invalid.' }, { status: 404 });
    }
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
