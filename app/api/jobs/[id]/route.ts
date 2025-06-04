import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';
import { verifyAuthToken, AuthError } from '@/lib/authUtils';

const paramsSchema = z.object({
  id: z.string().uuid({ message: "Invalid job ID format" }),
});

// Schema for PUT request body - all fields optional
const updateJobSchema = z.object({
  companyId: z.string().uuid().optional(),
  title: z.string().min(1, 'Title cannot be empty').optional(),
  description: z.string().min(1, 'Description cannot be empty').optional(),
  responsibilities: z.string().optional().nullable(),
  requirements: z.string().optional().nullable(),
  benefits: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  jobType: z.string().min(1, 'Job type cannot be empty').optional(),
  experienceLevel: z.string().optional().nullable(),
  salaryMin: z.number().int().positive().optional().nullable(),
  salaryMax: z.number().int().positive().optional().nullable(),
  salaryCurrency: z.string().optional().nullable(),
  salaryPeriod: z.string().optional().nullable(),
  applicationDeadline: z.string().datetime({ offset: true }).optional().nullable(),
  status: z.string().optional(), // e.g., "Draft", "Open", "Closed", "Filled"
  skills: z.array(z.string().min(1)).optional().nullable(),
}).refine(data => {
    if (data.salaryMin && data.salaryMax && data.salaryMin > data.salaryMax) {
        return false;
    }
    return true;
}, {
    message: "salaryMin cannot be greater than salaryMax",
    path: ["salaryMin"],
});


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const validationResult = paramsSchema.safeParse(params);

  if (!validationResult.success) {
    return NextResponse.json(
      { success: false, message: 'Invalid input', errors: validationResult.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { id: jobId } = validationResult.data;

  const sqlQuery = `
    SELECT
      j.id, j.title, j.description, j.responsibilities, j.requirements, j.benefits,
      j.location, j.job_type, j.experience_level, j.salary_min, j.salary_max,
      j.salary_currency, j.salary_period, j.application_deadline, j.status,
      j.published_at, j.created_at, j.updated_at, j.posted_by_user_id,
      c.id as company_id, c.name as company_name, c.description as company_description,
      c.logo_url as company_logo_url, c.website_url as company_website_url,
      c.industry as company_industry, c.company_size as company_size,
      c.hq_location as company_hq_location,
      STRING_AGG(DISTINCT s.name, ', ') WITHIN GROUP (ORDER BY s.name) as skills_list
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
    LEFT JOIN job_skills_link jsl ON j.id = jsl.job_id
    LEFT JOIN skills s ON jsl.skill_id = s.id
    WHERE j.id = $1
    GROUP BY
      j.id, c.id, c.name, c.description, c.logo_url, c.website_url, c.industry, c.company_size, c.hq_location;
  `;

  try {
    const result = await query(sqlQuery, [jobId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }

    const dbRow = result.rows[0];
    const jobDetails = {
      id: dbRow.id, title: dbRow.title, description: dbRow.description,
      responsibilities: dbRow.responsibilities, requirements: dbRow.requirements,
      benefits: dbRow.benefits, location: dbRow.location, jobType: dbRow.job_type,
      experienceLevel: dbRow.experience_level, salaryMin: dbRow.salary_min,
      salaryMax: dbRow.salary_max, salaryCurrency: dbRow.salary_currency,
      salaryPeriod: dbRow.salary_period, applicationDeadline: dbRow.application_deadline,
      status: dbRow.status, publishedAt: dbRow.published_at, createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at, postedByUserId: dbRow.posted_by_user_id,
      company: {
        id: dbRow.company_id, name: dbRow.company_name, description: dbRow.company_description,
        logoUrl: dbRow.company_logo_url, websiteUrl: dbRow.company_website_url,
        industry: dbRow.company_industry, size: dbRow.company_size, hqLocation: dbRow.company_hq_location,
      },
      skills: dbRow.skills_list ? dbRow.skills_list.split(', ').map((s: string) => s.trim()) : [],
    };
    return NextResponse.json({ success: true, data: jobDetails });
  } catch (error: any) {
    console.error(`Error fetching job details for ID [${jobId}]:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch job details. ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest, // Use NextRequest for auth token
  { params }: { params: { id: string } }
) {
  const paramValidation = paramsSchema.safeParse(params);
  if (!paramValidation.success) {
    return NextResponse.json({ success: false, message: 'Invalid job ID format', errors: paramValidation.error.flatten().fieldErrors }, { status: 400 });
  }
  const jobId = paramValidation.data.id;

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
    return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
  }
  const userId = authPayload.userId;

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  const bodyValidation = updateJobSchema.safeParse(body);
  if (!bodyValidation.success) {
    return NextResponse.json({ success: false, message: 'Invalid request body', errors: bodyValidation.error.flatten().fieldErrors }, { status: 400 });
  }
  const updateData = bodyValidation.data;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ success: false, message: 'No fields to update' }, { status: 400 });
  }


  try {
    await query('BEGIN');

    const jobCheckResult = await query('SELECT posted_by_user_id FROM jobs WHERE id = $1', [jobId]);
    if (jobCheckResult.rows.length === 0) {
      await query('ROLLBACK');
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }
    if (jobCheckResult.rows[0].posted_by_user_id !== userId) {
      // Add admin check here in future if needed: e.g. && !authPayload.isAdmin
      await query('ROLLBACK');
      return NextResponse.json({ success: false, message: 'Forbidden: You do not own this job posting' }, { status: 403 });
    }

    const { skills, ...jobDataFields } = updateData;
    const setClauses: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Map Zod schema keys to database columns
    const columnMapping: { [key: string]: string } = {
        companyId: 'company_id',
        jobType: 'job_type',
        experienceLevel: 'experience_level',
        salaryMin: 'salary_min',
        salaryMax: 'salary_max',
        salaryCurrency: 'salary_currency',
        salaryPeriod: 'salary_period',
        applicationDeadline: 'application_deadline',
        // direct mapping for others: title, description, responsibilities, requirements, benefits, location, status
    };

    for (const key in jobDataFields) {
        if (jobDataFields.hasOwnProperty(key) && (jobDataFields as any)[key] !== undefined) {
            const columnName = columnMapping[key] || key; // Use mapped name or key itself
            setClauses.push(`${columnName} = $${paramIndex++}`);
            // Handle date conversion for applicationDeadline
            if (key === 'applicationDeadline' && (jobDataFields as any)[key] !== null) {
                queryParams.push(new Date((jobDataFields as any)[key]));
            } else {
                queryParams.push((jobDataFields as any)[key]);
            }
        }
    }

    if (setClauses.length > 0) {
      setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
      const updateJobQuery = `UPDATE jobs SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`;
      queryParams.push(jobId);
      await query(updateJobQuery, queryParams);
    }

    if (skills !== undefined) { // Check if 'skills' key was present in the body
      await query('DELETE FROM job_skills_link WHERE job_id = $1', [jobId]);
      if (skills && skills.length > 0) { // skills can be null or empty array
        for (const skillName of skills) {
          let skillResult = await query('SELECT id FROM skills WHERE LOWER(name) = LOWER($1)', [skillName]);
          let skillId;
          if (skillResult.rows.length === 0) {
            const newSkillResult = await query('INSERT INTO skills (name) VALUES ($1) RETURNING id', [skillName]);
            skillId = newSkillResult.rows[0].id;
          } else {
            skillId = skillResult.rows[0].id;
          }
          await query('INSERT INTO job_skills_link (job_id, skill_id) VALUES ($1, $2) ON CONFLICT (job_id, skill_id) DO NOTHING', [jobId, skillId]);
        }
      }
    }

    await query('COMMIT');
    return NextResponse.json({ success: true, message: 'Job updated successfully' });

  } catch (error: any) {
    await query('ROLLBACK');
    console.error(`Error updating job ID [${jobId}]:`, error);
     if (error.code === '23503' && error.constraint === 'jobs_company_id_fkey') {
        return NextResponse.json({ success: false, message: 'Company not found or invalid companyId.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Failed to update job. ' + (error.message || 'Unknown error') }, { status: 500 });
  }
}


export async function DELETE(
  request: NextRequest, // Use NextRequest for auth token
  { params }: { params: { id: string } }
) {
  const paramValidation = paramsSchema.safeParse(params);
  if (!paramValidation.success) {
    return NextResponse.json({ success: false, message: 'Invalid job ID format', errors: paramValidation.error.flatten().fieldErrors }, { status: 400 });
  }
  const jobId = paramValidation.data.id;

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
    return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
  }
  const userId = authPayload.userId;

  try {
    // First, check if the job exists and if the user is the owner
    const jobCheckResult = await query('SELECT posted_by_user_id FROM jobs WHERE id = $1', [jobId]);
    if (jobCheckResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }
    if (jobCheckResult.rows[0].posted_by_user_id !== userId) {
      // Add admin check here in future if needed
      return NextResponse.json({ success: false, message: 'Forbidden: You do not own this job posting' }, { status: 403 });
    }

    // If checks pass, delete the job
    // ON DELETE CASCADE in schema should handle job_skills_link, job_applications, user_job_bookmarks
    const deleteResult = await query('DELETE FROM jobs WHERE id = $1', [jobId]);

    if (deleteResult.rowCount === 0) {
      // Should ideally be caught by the check above, but as a safeguard
      return NextResponse.json({ success: false, message: 'Job not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Job deleted successfully' });

  } catch (error: any) {
    console.error(`Error deleting job ID [${jobId}]:`, error);
    return NextResponse.json({ success: false, message: 'Failed to delete job. ' + (error.message || 'Unknown error') }, { status: 500 });
  }
}
