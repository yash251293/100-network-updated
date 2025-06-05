import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';
import { verifyAuthToken } from '@/lib/authUtils'; // Removed AuthError import

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
  status: z.string().optional(),
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
  request: NextRequest, // Changed to NextRequest
  context: { params: { id: string } }
) {
  const awaitedParams = await context.params;
  const id = awaitedParams?.id;

  // Explicitly check if id is a valid string before any other operation
  if (typeof id !== 'string' || id.trim() === '') {
    console.error("API received invalid or missing ID in params. ID:", id);
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid or missing job ID in URL path.',
        errors: { id: ["Job ID must be a non-empty string."] }, // Provide a specific error structure
        formErrors: []
      },
      { status: 400 }
    );
  }

  // Use the local 'id' variable for all logging (already confirmed as string)
  console.log("RAW ID received by API:", id);
  console.log("Type of RAW ID:", typeof id); // Will be 'string'
  console.log("Length of RAW ID:", id.length); // No need for '?.'
  // For more detailed inspection, log the char codes
  const charCodes = [];
  for (let i = 0; i < id.length; i++) {
    charCodes.push(id.charCodeAt(i));
  }
  console.log("Char codes of RAW ID:", charCodes.join(', '));

  // Pass an object { id } to safeParse, matching the schema structure
  const validationResult = paramsSchema.safeParse({ id });

  if (!validationResult.success) {
    console.error("Zod validation failed for ID:", id, "Errors:", validationResult.error.flatten());
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid input',
        errors: validationResult.error.flatten().fieldErrors,
        formErrors: validationResult.error.flatten().formErrors
      },
      { status: 400 }
    );
  }
  const { id: jobId } = validationResult.data; // jobId is the validated UUID string

  const authHeader = request.headers.get('Authorization');
  const authPayload = verifyAuthToken(authHeader);
  const currentUserId = authPayload?.userId;

  const sqlQuery = `
    WITH JobSpecificSkills AS (
      SELECT DISTINCT s.name
      FROM skills s
      JOIN job_skills_link jsl ON s.id = jsl.skill_id
      WHERE jsl.job_id = $1
    )
    SELECT
      j.id, j.title, j.description, j.responsibilities, j.requirements, j.benefits,
      j.location, j.job_type, j.experience_level, j.salary_min, j.salary_max,
      j.salary_currency, j.salary_period, j.application_deadline, j.status,
      j.published_at, j.created_at, j.updated_at, j.posted_by_user_id,
      c.id as company_id, c.name as company_name, c.description as company_description,
      c.logo_url as company_logo_url, c.website_url as company_website_url,
      c.industry as company_industry, c.company_size as company_size,
      c.hq_location as company_hq_location,
      (SELECT STRING_AGG(jss.name, ', ' ORDER BY jss.name) FROM JobSpecificSkills jss) as skills_list
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
    WHERE j.id = $1;
  `;

  try {
    const result = await query(sqlQuery, [jobId]);
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }
    const dbRow = result.rows[0];

    let isBookmarked = false;
    let hasApplied = false;

    if (currentUserId && dbRow) {
      // Check bookmark status
      const bookmarkCheckSql = "SELECT EXISTS (SELECT 1 FROM user_job_bookmarks WHERE user_id = $1 AND job_id = $2)";
      const bookmarkResult = await query(bookmarkCheckSql, [currentUserId, jobId]);
      if (bookmarkResult.rows.length > 0) {
        isBookmarked = bookmarkResult.rows[0].exists;
      }

      // Check application status
      const applicationCheckSql = "SELECT EXISTS (SELECT 1 FROM job_applications WHERE user_id = $1 AND job_id = $2)";
      const applicationResult = await query(applicationCheckSql, [currentUserId, jobId]);
      if (applicationResult.rows.length > 0) {
        hasApplied = applicationResult.rows[0].exists;
      }
    }

    const finalJobDetails = {
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
      isBookmarked: currentUserId ? isBookmarked : false,
      hasApplied: currentUserId ? hasApplied : false
    };
    return NextResponse.json({ success: true, data: finalJobDetails });
  } catch (error: any) {
    console.error(`Error in GET /api/jobs/${jobId}:`, error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const awaitedParams = await params;
  const paramValidation = paramsSchema.safeParse(awaitedParams);
  if (!paramValidation.success) {
    return NextResponse.json({ success: false, message: 'Invalid job ID format', errors: paramValidation.error.flatten().fieldErrors }, { status: 400 });
  }
  const jobId = paramValidation.data.id;

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
      await query('ROLLBACK');
      return NextResponse.json({ success: false, message: 'Forbidden: You do not own this job posting' }, { status: 403 });
    }

    const { skills, ...jobDataFields } = updateData;
    const setClauses: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    const columnMapping: { [key: string]: string } = {
        companyId: 'company_id', jobType: 'job_type', experienceLevel: 'experience_level',
        salaryMin: 'salary_min', salaryMax: 'salary_max', salaryCurrency: 'salary_currency',
        salaryPeriod: 'salary_period', applicationDeadline: 'application_deadline',
    };

    for (const key in jobDataFields) {
        if (jobDataFields.hasOwnProperty(key) && (jobDataFields as any)[key] !== undefined) {
            const columnName = columnMapping[key] || key;
            setClauses.push(`${columnName} = $${paramIndex++}`);
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

    if (skills !== undefined) {
      await query('DELETE FROM job_skills_link WHERE job_id = $1', [jobId]);
      if (skills && skills.length > 0) {
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
    console.error(`Error in PUT /api/jobs/${jobId}:`, error);
    if (error.code === '23503' && error.constraint === 'jobs_company_id_fkey') {
        return NextResponse.json({ success: false, message: 'Company not found or invalid companyId.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const awaitedParams = await params;
  const paramValidation = paramsSchema.safeParse(awaitedParams);
  if (!paramValidation.success) {
    return NextResponse.json({ success: false, message: 'Invalid job ID format', errors: paramValidation.error.flatten().fieldErrors }, { status: 400 });
  }
  const jobId = paramValidation.data.id;

  const authHeader = request.headers.get('Authorization');
  const authPayload = verifyAuthToken(authHeader);

  if (!authPayload) {
    return NextResponse.json({ success: false, message: 'Authentication failed: Invalid or missing token' }, { status: 401 });
  }
  const { userId } = authPayload;

  try {
    const jobCheckResult = await query('SELECT posted_by_user_id FROM jobs WHERE id = $1', [jobId]);
    if (jobCheckResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }
    if (jobCheckResult.rows[0].posted_by_user_id !== userId) {
      return NextResponse.json({ success: false, message: 'Forbidden: You do not own this job posting' }, { status: 403 });
    }

    const deleteResult = await query('DELETE FROM jobs WHERE id = $1', [jobId]);

    if (deleteResult.rowCount === 0) {
      return NextResponse.json({ success: false, message: 'Job not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Job deleted successfully' });

  } catch (error: any) {
    console.error(`Error in DELETE /api/jobs/${jobId}:`, error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
