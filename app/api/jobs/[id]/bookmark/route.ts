import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyAuthToken, AuthError } from '@/lib/authUtils';

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

  try {
    // 3. Check Job Existence
    if (!(await checkJobExists(jobId))) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }

    // 4. Database Operation - Bookmark
    const insertQuery = `
      INSERT INTO user_job_bookmarks (user_id, job_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, job_id) DO NOTHING;
    `;
    // We don't necessarily need to know if it was newly inserted or already existed for a simple success message.
    // rowCount might be 0 if ON CONFLICT DO NOTHING occurs, or 1 if new.
    await query(insertQuery, [userId, jobId]);

    // 5. Response
    return NextResponse.json(
      { success: true, message: 'Job bookmarked successfully' },
      // Using 200 OK generally for "action acknowledged and processed",
      // 201 might be more specific if we checked rowCount and it was 1.
      // For simplicity and idempotency feel, 200 is fine. Or stick to 201 for "creation" aspect.
      { status: 201 }
    );

  } catch (error: any) {
    console.error(`Error bookmarking job ID [${jobId}] for user ID [${userId}]:`, error);
    // Check for specific foreign key error if, somehow, user_id was invalid (though it comes from token)
     if (error.code === '23503' && error.constraint === 'user_job_bookmarks_user_id_fkey') {
        // This case should ideally not happen if userId from token is always valid
        return NextResponse.json({ success: false, message: 'User not found.' }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, message: 'Failed to bookmark job. ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

  try {
    // 3. Check Job Existence (Optional here, as DELETE might not care if job is gone, only if bookmark is gone)
    // However, for consistency and clearer error messages, it's good to keep.
    // If the job doesn't exist, a bookmark for it shouldn't exist either, or is orphaned.
    if (!(await checkJobExists(jobId))) {
      // If job doesn't exist, a bookmark for it is implicitly gone or invalid.
      // Depending on desired strictness, could return 404 for job not found,
      // or proceed to delete which would result in rowCount 0 -> bookmark not found.
      // For this implementation, let's be strict: if job is gone, then bookmark is effectively gone.
      return NextResponse.json({ success: false, message: 'Job not found, cannot remove bookmark.' }, { status: 404 });
    }

    // 4. Database Operation - Remove Bookmark
    const deleteQuery = `
      DELETE FROM user_job_bookmarks
      WHERE user_id = $1 AND job_id = $2;
    `;
    const result = await query(deleteQuery, [userId, jobId]);

    // 5. Response
    if (result.rowCount > 0) {
      return NextResponse.json(
        { success: true, message: 'Bookmark removed successfully' },
        { status: 200 }
      );
    } else {
      // This means no bookmark was found for this user and job.
      // This could also happen if the job_id was valid but the user hadn't bookmarked it.
      return NextResponse.json(
        { success: false, message: 'Bookmark not found or job was not bookmarked by the user.' },
        { status: 404 }
      );
    }

  } catch (error: any) {
    console.error(`Error removing bookmark for job ID [${jobId}] for user ID [${userId}]:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove bookmark. ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
