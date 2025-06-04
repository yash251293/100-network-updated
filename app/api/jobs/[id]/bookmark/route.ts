import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyAuthToken } from '@/lib/authUtils'; // Removed AuthError import

const paramsSchema = z.object({
  id: z.string().uuid({ message: "Invalid job ID format" }),
});

// Helper function to check job existence
async function checkJobExists(jobId: string) {
  const jobCheckResult = await query('SELECT id FROM jobs WHERE id = $1', [jobId]);
  return jobCheckResult.rows.length > 0;
}

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

  try {
    if (!(await checkJobExists(jobId))) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }

    const insertQuery = `
      INSERT INTO user_job_bookmarks (user_id, job_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, job_id) DO NOTHING;
    `;
    await query(insertQuery, [userId, jobId]);

    return NextResponse.json(
      { success: true, message: 'Job bookmarked successfully' },
      { status: 201 }
    );

  } catch (error: any) {
    console.error(`Error in POST /api/jobs/${jobId}/bookmark:`, error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ success: false, message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    // Example of specific DB error, though ON CONFLICT should prevent most FK issues if user/job exist
    if (error.code === '23503') {
        return NextResponse.json({ success: false, message: 'Failed to bookmark due to data integrity issue.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
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

  try {
    // It's okay if job doesn't exist for a DELETE, means bookmark also doesn't exist or is orphaned.
    // if (!(await checkJobExists(jobId))) {
    //   return NextResponse.json({ success: false, message: 'Job not found, cannot remove bookmark.' }, { status: 404 });
    // }

    const deleteQuery = `
      DELETE FROM user_job_bookmarks
      WHERE user_id = $1 AND job_id = $2;
    `;
    const result = await query(deleteQuery, [userId, jobId]);

    if (result.rowCount > 0) {
      return NextResponse.json(
        { success: true, message: 'Bookmark removed successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: 'Bookmark not found or job was not bookmarked by the user.' },
        { status: 404 }
      );
    }

  } catch (error: any) {
    console.error(`Error in DELETE /api/jobs/${jobId}/bookmark:`, error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ success: false, message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
