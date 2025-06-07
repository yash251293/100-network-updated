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
  context: { params: { id: string } }
) {
  const id = context.params?.id; // Safely access id

  // Explicitly check if id is a valid string before any other operation
  if (typeof id !== 'string' || id.trim() === '') {
    console.error("Bookmark API received invalid or missing ID in params. ID:", id);
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid or missing job ID in URL path for bookmark operation.',
        errors: { id: ["Job ID must be a non-empty string."] },
        formErrors: []
      },
      { status: 400 }
    );
  }

  // Add logging for the received ID (similar to the other API route)
  console.log(`Bookmark API (${request.method}) received RAW ID:`, id);
  console.log(`Bookmark API (${request.method}) Type of RAW ID:`, typeof id);
  console.log(`Bookmark API (${request.method}) Length of RAW ID:`, id.length);

  const paramsValidation = paramsSchema.safeParse({ id });
  if (!paramsValidation.success) {
    console.error(`Bookmark API (${request.method}) Zod validation failed for ID:`, id, "Errors:", paramsValidation.error.flatten());
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid job ID format',
        errors: paramsValidation.error.flatten().fieldErrors,
        formErrors: paramsValidation.error.flatten().formErrors
      },
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
  context: { params: { id: string } }
) {
  const id = context.params?.id; // Safely access id

  // Explicitly check if id is a valid string before any other operation
  if (typeof id !== 'string' || id.trim() === '') {
    console.error("Bookmark API received invalid or missing ID in params. ID:", id);
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid or missing job ID in URL path for bookmark operation.',
        errors: { id: ["Job ID must be a non-empty string."] },
        formErrors: []
      },
      { status: 400 }
    );
  }

  // Add logging for the received ID (similar to the other API route)
  console.log(`Bookmark API (${request.method}) received RAW ID:`, id);
  console.log(`Bookmark API (${request.method}) Type of RAW ID:`, typeof id);
  console.log(`Bookmark API (${request.method}) Length of RAW ID:`, id.length);

  const paramsValidation = paramsSchema.safeParse({ id });
  if (!paramsValidation.success) {
    console.error(`Bookmark API (${request.method}) Zod validation failed for ID:`, id, "Errors:", paramsValidation.error.flatten());
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid job ID format',
        errors: paramsValidation.error.flatten().fieldErrors,
        formErrors: paramsValidation.error.flatten().formErrors
      },
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
