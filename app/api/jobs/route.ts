import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyAuthToken, AuthError } from '@/lib/authUtils'; // Assuming AuthError is exported for specific error handling

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
  applicationDeadline: z.string().datetime({ offset: true }).optional(),
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

export async function POST(request: Request) {
  let token;
  try {
    token = await verifyAuthToken(request);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    }
    return NextResponse.json({ success: false, message: 'Authentication failed' }, { status: 401 });
  }

  if (!token || !token.userId) {
    return NextResponse.json({ success: false, message: 'User not authenticated or user ID missing' }, { status: 401 });
  }
  const postedByUserId = token.userId;

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  const validationResult = postJobSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json({
      success: false,
      message: 'Invalid input',
      errors: validationResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const {
    companyId,
    title,
    description,
    responsibilities,
    requirements,
    benefits,
    location,
    jobType,
    experienceLevel,
    salaryMin,
    salaryMax,
    salaryCurrency,
    salaryPeriod,
    applicationDeadline,
    status,
    skills,
  } = validationResult.data;

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

    return NextResponse.json({
      success: true,
      message: 'Job created successfully',
      jobId: newJobId,
    }, { status: 201 });

  } catch (error: any) {
    await query('ROLLBACK');
    console.error('Error creating job:', error);
    if (error.code === '23503' && error.constraint === 'jobs_company_id_fkey') {
        return NextResponse.json({ success: false, message: 'Company not found.' }, { status: 400 });
    }
    return NextResponse.json({
      success: false,
      message: 'Failed to create job posting. ' + (error.message || 'Unknown error'),
    }, { status: 500 });
  }
}

const getJobsQuerySchema = z.object({
  searchTerm: z.string().optional(),
  jobType: z.string().optional(),
  experienceLevel: z.string().optional(),
  location: z.string().optional(),
  skills: z.string().optional(), // Comma-separated skill names
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
      success: false,
      message: 'Invalid query parameters',
      errors: validationResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const {
    searchTerm,
    jobType,
    experienceLevel,
    location,
    skills: skillsString,
    companyId,
    status,
    page,
    limit,
    sortBy,
    sortOrder,
  } = validationResult.data;

  const offset = (page - 1) * limit;
  const queryParams: any[] = [];
  let paramIndex = 1;

  let baseQuery = `
    SELECT
      j.id, j.title, j.location, j.job_type, j.experience_level,
      j.salary_min, j.salary_max, j.salary_currency, j.salary_period,
      j.published_at, j.description, j.status, j.created_at,
      c.name as company_name, c.logo_url as company_logo_url,
      STRING_AGG(DISTINCT s.name, ', ') WITHIN GROUP (ORDER BY s.name) as skills_list
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
    LEFT JOIN job_skills_link jsl ON j.id = jsl.job_id
    LEFT JOIN skills s ON jsl.skill_id = s.id
  `;

  let countQuery = `
    SELECT COUNT(DISTINCT j.id) as total_items
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
  `;

  // For skill filtering, we might need to add joins to the count query as well
  let skillFilterSubQuery = "";
  const skillsArray = skillsString?.split(',').map(s => s.trim()).filter(s => s.length > 0);

  if (skillsArray && skillsArray.length > 0) {
    queryParams.push(skillsArray);
    const skillParamPlaceholder = `$${paramIndex++}`;
    // This subquery ensures that only jobs matching ALL specified skills are returned
    skillFilterSubQuery = `
      j.id IN (
        SELECT jsl_filter.job_id
        FROM job_skills_link jsl_filter
        JOIN skills s_filter ON jsl_filter.skill_id = s_filter.id
        WHERE s_filter.name = ANY(${skillParamPlaceholder})
        GROUP BY jsl_filter.job_id
        HAVING COUNT(DISTINCT s_filter.name) = array_length(${skillParamPlaceholder}, 1)
      )
    `;
    // Add necessary joins for skill filtering in countQuery if not already present
    // For this structure, skills are not directly joined in countQuery base, so we add a WHERE EXISTS clause for count
     countQuery += `
       WHERE EXISTS (
         SELECT 1
         FROM job_skills_link jsl_filter
         JOIN skills s_filter ON jsl_filter.skill_id = s_filter.id
         WHERE jsl_filter.job_id = j.id AND s_filter.name = ANY(${skillParamPlaceholder})
         GROUP BY jsl_filter.job_id
         HAVING COUNT(DISTINCT s_filter.name) = array_length(${skillParamPlaceholder}, 1)
       )
     `;
  }


  const whereClauses: string[] = [];

  if (status) {
    whereClauses.push(`j.status = $${paramIndex++}`);
    queryParams.push(status);
  }
  if (searchTerm) {
    const searchTermParam = `%${searchTerm}%`;
    whereClauses.push(`(j.title ILIKE $${paramIndex} OR j.description ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`);
    queryParams.push(searchTermParam);
    paramIndex++;
  }
  if (jobType) {
    whereClauses.push(`j.job_type = $${paramIndex++}`);
    queryParams.push(jobType);
  }
  if (experienceLevel) {
    whereClauses.push(`j.experience_level = $${paramIndex++}`);
    queryParams.push(experienceLevel);
  }
  if (location) {
    whereClauses.push(`j.location ILIKE $${paramIndex++}`);
    queryParams.push(`%${location}%`);
  }
  if (companyId) {
    whereClauses.push(`j.company_id = $${paramIndex++}`);
    queryParams.push(companyId);
  }

  if (skillFilterSubQuery) {
      // For baseQuery (data query), skillFilterSubQuery is added to WHERE
      // For countQuery, it's handled differently (as shown above) or needs to be integrated carefully
      // If skillFilterSubQuery was added to countQuery using WHERE EXISTS, this ensures it's part of the main query's WHERE as well
      whereClauses.push(skillFilterSubQuery);
  }

  // Consolidate WHERE clauses for countQuery
  // If skillFilterSubQuery modified countQuery's WHERE, start with 'AND', else 'WHERE'
  const countWherePrefix = countQuery.includes("WHERE") ? "AND" : "WHERE";
  if (whereClauses.length > 0) {
    // Filter out skillFilterSubQuery from whereClauses for count if it was handled by WHERE EXISTS
    const countSpecificWhereClauses = whereClauses.filter(clause => clause !== skillFilterSubQuery);
    if (countSpecificWhereClauses.length > 0) {
         countQuery += ` ${countWherePrefix} ${countSpecificWhereClauses.join(' AND ')}`;
    }
  }


  if (whereClauses.length > 0) {
    baseQuery += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  baseQuery += ` GROUP BY j.id, c.id, c.name, c.logo_url`; // Group by all non-aggregated selected columns from jobs and companies

  // ORDER BY clause - ensure sortBy is a valid column name
  const allowedSortBy = ['published_at', 'title', 'salary_min', 'created_at', 'company_name'];
  const safeSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'published_at'; // Default to 'published_at' if invalid
  // For columns from 'c' table, we need to use the alias, or actual table.column
  const sortColumn = safeSortBy === 'company_name' ? 'c.name' : `j.${safeSortBy}`;

  baseQuery += ` ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}`;
  baseQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryParams.push(limit, offset);


  // Create a separate parameter list for count query, as it might not use all params (like limit, offset, sort)
  // and skill filtering parameter placeholder might be different if not using $1 for skillsArray in both.
  // For simplicity, we'll re-evaluate params for count query carefully.
  const countQueryParams: any[] = [];
  let countParamIndex = 1;
  if (skillsArray && skillsArray.length > 0) {
    countQueryParams.push(skillsArray); // $1 for skillsArray
    countParamIndex++;
  }
  if (status) {
    countQueryParams.push(status); // $2 (or next available) for status
    countParamIndex++;
  }
  if (searchTerm) {
    countQueryParams.push(`%${searchTerm}%`); // $3 for searchTerm
    countParamIndex++;
  }
  if (jobType) {
    countQueryParams.push(jobType);
    countParamIndex++;
  }
  if (experienceLevel) {
    countQueryParams.push(experienceLevel);
    countParamIndex++;
  }
  if (location) {
    countQueryParams.push(`%${location}%`);
    countParamIndex++;
  }
  if (companyId) {
    countQueryParams.push(companyId);
    countParamIndex++;
  }


  try {
    const jobsResult = await query(baseQuery, queryParams);
    const countResult = await query(countQuery, countQueryParams);

    const totalItems = parseInt(countResult.rows[0].total_items, 10);
    const totalPages = Math.ceil(totalItems / limit);

    const jobsWithSkills = jobsResult.rows.map(job => ({
      ...job,
      description: job.description?.substring(0, 200) + (job.description?.length > 200 ? '...' : ''), // Truncate description
      skills_list: job.skills_list ? job.skills_list.split(', ') : [],
    }));

    return NextResponse.json({
      data: jobsWithSkills,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });

  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch job postings. ' + (error.message || 'Unknown error'),
    }, { status: 500 });
  }
}
