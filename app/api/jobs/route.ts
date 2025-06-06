import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyAuthToken } from '@/lib/authUtils';

const postJobSchema = z.object({
  companyId: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  location: z.string().optional(),
  jobType: z.string().min(1, 'Job type is required'),
  experienceLevel: z.string().optional(),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  salaryCurrency: z.string().optional().default('USD'),
  salaryPeriod: z.string().optional().default('Annual'),
  applicationDeadline: z.union([
    z.string().datetime({ offset: true, message: "Invalid date format for deadline. Must be ISO 8601." }),
    z.null()
  ]).optional(),
  status: z.string().optional().default('Draft'),
  skills: z.array(z.string().min(1)).optional(),
}).refine(data => {
    if (data.salaryMin && data.salaryMax && data.salaryMin > data.salaryMax) {
        return false;
    }
    return true;
}, {
    message: "salaryMin cannot be greater than salaryMax",
    path: ["salaryMin"],
});

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const authPayload = verifyAuthToken(authHeader);

  if (!authPayload) {
    return NextResponse.json({ success: false, message: 'Authentication failed: Invalid or missing token' }, { status: 401 });
  }
  const { userId: postedByUserId } = authPayload;

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  console.log("POST /api/jobs - Received body:", JSON.stringify(body, null, 2));

  const validationResult = postJobSchema.safeParse(body);
  if (!validationResult.success) {
    const flatErrors = validationResult.error.flatten();
    console.error("POST /api/jobs - Zod validation failed. Body:", JSON.stringify(body, null, 2));
    console.error("POST /api/jobs - Zod errors:", JSON.stringify(flatErrors, null, 2));
    return NextResponse.json(
      {
        success: false,
        message: "Invalid job data provided.",
        errors: flatErrors.fieldErrors,
        formErrors: flatErrors.formErrors
      },
      { status: 400 }
    );
  }

  const {
    companyId, title, description, responsibilities, requirements, benefits, location,
    jobType, experienceLevel, salaryMin, salaryMax, salaryCurrency, salaryPeriod,
    applicationDeadline, status, skills,
  } = validationResult.data; // Use validationResult.data from here

  try {
    await query('BEGIN');
    const jobInsertQuery = `
      INSERT INTO jobs (
        company_id, posted_by_user_id, title, description, responsibilities,
        requirements, benefits, location, job_type, experience_level,
        salary_min, salary_max, salary_currency, salary_period,
        application_deadline, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id;
    `;
    const jobInsertParams = [
      companyId, postedByUserId, title, description, responsibilities,
      requirements, benefits, location, jobType, experienceLevel,
      salaryMin, salaryMax, salaryCurrency, salaryPeriod,
      applicationDeadline ? new Date(applicationDeadline) : null, status,
    ];
    const jobResult = await query(jobInsertQuery, jobInsertParams);
    const newJobId = jobResult.rows[0].id;

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
        await query(
          'INSERT INTO job_skills_link (job_id, skill_id) VALUES ($1, $2) ON CONFLICT (job_id, skill_id) DO NOTHING',
          [newJobId, skillId]
        );
      }
    }
    await query('COMMIT');
    return NextResponse.json({ success: true, message: 'Job created successfully', jobId: newJobId }, { status: 201 });
  } catch (error: any) {
    await query('ROLLBACK');
    console.error('Error in POST /api/jobs:', error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ success: false, message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    if (error.code === '23503' && error.constraint === 'jobs_company_id_fkey') {
        return NextResponse.json({ success: false, message: 'Company not found.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

const getJobsQuerySchema = z.object({
  searchTerm: z.string().optional(),
  jobType: z.string().optional(),
  experienceLevel: z.string().optional(),
  location: z.string().optional(),
  skills: z.string().optional(),
  companyId: z.string().uuid().optional(),
  status: z.string().optional().default("Open"),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
  sortBy: z.enum(['published_at', 'title', 'salary_min', 'created_at']).optional().default("published_at"),
  sortOrder: z.enum(['asc', 'desc']).optional().default("desc"),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validationResult = getJobsQuerySchema.safeParse(params);

  if (!validationResult.success) {
    return NextResponse.json({
      success: false, message: 'Invalid query parameters',
      errors: validationResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const {
    searchTerm, jobType, experienceLevel, location, skills: skillsString,
    companyId, status, page, limit, sortBy, sortOrder,
  } = validationResult.data;

  const offset = (page - 1) * limit;
  const queryParams: any[] = [];
  let paramIndex = 1;

  const cteClause = `
    WITH DistinctJobSkills AS (
        SELECT DISTINCT jsl.job_id, s.name AS skill_name
        FROM job_skills_link jsl
        JOIN skills s ON jsl.skill_id = s.id
    ),
    AggregatedJobSkills AS (
        SELECT djs.job_id, ARRAY_AGG(djs.skill_name ORDER BY djs.skill_name) AS skills_array
        FROM DistinctJobSkills djs
        GROUP BY djs.job_id
    )
  `;

  let baseSelect = `
    SELECT
      j.id, j.title, j.location, j.job_type, j.experience_level,
      j.salary_min, j.salary_max, j.salary_currency, j.salary_period,
      j.published_at, j.description, j.status, j.created_at,
      c.id as company_id, -- Added company_id
      c.name as company_name,
      c.logo_url as company_logo_url,
      COALESCE(ajs.skills_array, ARRAY[]::VARCHAR[]) AS skills
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
    LEFT JOIN AggregatedJobSkills ajs ON j.id = ajs.job_id
  `;

  let countSelect = `SELECT COUNT(DISTINCT j.id) as total_items FROM jobs j JOIN companies c ON j.company_id = c.id`;

  const whereClauses: string[] = [];
  const countWhereClauses: string[] = [];

  const skillsArray = skillsString?.split(',').map(s => s.trim()).filter(s => s.length > 0);
  if (skillsArray && skillsArray.length > 0) {
    const skillPlaceholders = skillsArray.map((_, i) => `$${paramIndex + i}`).join(', ');
    const skillFilterSubQuery = `
      j.id IN (
        SELECT jsl_filter.job_id
        FROM job_skills_link jsl_filter
        JOIN skills s_filter ON jsl_filter.skill_id = s_filter.id
        WHERE s_filter.name ILIKE ANY(ARRAY[${skillPlaceholders}])
        GROUP BY jsl_filter.job_id
        HAVING COUNT(DISTINCT LOWER(s_filter.name)) = ${skillsArray.length}
      )
    `;
    whereClauses.push(skillFilterSubQuery);
    countWhereClauses.push(skillFilterSubQuery);
    skillsArray.forEach(skill => queryParams.push(skill));
    paramIndex += skillsArray.length;
  }

  if (status) {
    whereClauses.push(`j.status = $${paramIndex}`);
    countWhereClauses.push(`j.status = $${paramIndex}`);
    queryParams.push(status);
    paramIndex++;
  }
  if (searchTerm) {
    const st = `%${searchTerm}%`;
    const searchTermClause = `(j.title ILIKE $${paramIndex} OR j.description ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`;
    whereClauses.push(searchTermClause);
    countWhereClauses.push(searchTermClause);
    queryParams.push(st);
    paramIndex++;
  }
  if (jobType) {
    whereClauses.push(`j.job_type = $${paramIndex}`);
    countWhereClauses.push(`j.job_type = $${paramIndex}`);
    queryParams.push(jobType);
    paramIndex++;
  }
  if (experienceLevel) {
    whereClauses.push(`j.experience_level = $${paramIndex}`);
    countWhereClauses.push(`j.experience_level = $${paramIndex}`);
    queryParams.push(experienceLevel);
    paramIndex++;
  }
  if (location) {
    const loc = `%${location}%`;
    whereClauses.push(`j.location ILIKE $${paramIndex}`);
    countWhereClauses.push(`j.location ILIKE $${paramIndex}`);
    queryParams.push(loc);
    paramIndex++;
  }
  if (companyId) {
    whereClauses.push(`j.company_id = $${paramIndex}`);
    countWhereClauses.push(`j.company_id = $${paramIndex}`);
    queryParams.push(companyId);
    paramIndex++;
  }

  let finalDataQuery = cteClause + baseSelect;
  if (whereClauses.length > 0) {
    finalDataQuery += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  let finalCountQuery = countSelect;
  if (countWhereClauses.length > 0) {
    finalCountQuery += ` WHERE ${countWhereClauses.join(' AND ')}`;
  }

  const allowedSortBy = ['published_at', 'title', 'salary_min', 'created_at', 'company_name'];
  const safeSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'published_at';
  const sortColumn = safeSortBy === 'company_name' ? 'c.name' : `j.${safeSortBy}`;
  finalDataQuery += ` ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}`;

  finalDataQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  const finalQueryParams = [...queryParams, limit, offset];
  const finalCountQueryParams = queryParams.slice(0, queryParams.length);

  try {
    const jobsResult = await query(finalDataQuery, finalQueryParams);
    const countResult = await query(finalCountQuery, finalCountQueryParams);

    const totalItems = parseInt(countResult.rows[0].total_items, 10);
    const totalPages = Math.ceil(totalItems / limit);

    const transformedJobs = jobsResult.rows.map(row => {
      const {
        company_id, company_name, company_logo_url, skills, description, // skills_list removed, skills (as array) is now directly from query
        ...jobProps
      } = row;
      return {
        ...jobProps,
        description: description?.substring(0, 150) + (description?.length > 150 ? '...' : ''),
        company: {
          id: company_id,
          name: company_name,
          logo_url: company_logo_url,
        },
        skills: skills || [], // skills is already an array from the query (or an empty array)
      };
    });

    return NextResponse.json({
      data: transformedJobs,
      pagination: { totalItems, totalPages, currentPage: page, pageSize: limit },
    });
  } catch (error: any) {
    console.error('Error in GET /api/jobs:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
