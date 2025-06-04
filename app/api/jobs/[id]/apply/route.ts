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
  { params }: { params: { id: string } }
) {
  const paramsValidation = paramsSchema.safeParse(params);
  if (!paramsValidation.success) {
    return NextResponse.json(
      { success: false, message: 'Invalid job ID format', errors: paramsValidation.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const jobId = paramsValidation.data.id;

  const authHeader = request.headers.get('Authorization');
  const authPayload = verifyAuthToken(authHeader);

  if (!authPayload) {
    return NextResponse.json({ success: false, message: 'Authentication failed: Invalid or missing token' }, { status: 401 });
  }
  const { userId } = authPayload;

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
