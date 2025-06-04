import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyAuthToken } from '@/lib/authUtils';

// Zod Schema for GET query parameters
const getCompaniesQuerySchema = z.object({
  search: z.string().optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
});

// Zod Schema for POST request body
const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required."),
  description: z.string().optional().nullable(),
  logoUrl: z.string().url("Invalid logo URL format.").optional().nullable(),
  websiteUrl: z.string().url("Invalid website URL format.").optional().nullable(),
  industry: z.string().optional().nullable(),
  companySize: z.string().optional().nullable(), // E.g., "1-10 employees", "11-50 employees", etc.
  hqLocation: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const authPayload = verifyAuthToken(authHeader);

  if (!authPayload) {
    return NextResponse.json({ success: false, message: 'Authentication failed: Invalid or missing token' }, { status: 401 });
  }
  // const { userId } = authPayload; // userId not directly used in GET logic for now, but auth is required

  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validationResult = getCompaniesQuerySchema.safeParse(params);

  if (!validationResult.success) {
    return NextResponse.json({
      success: false,
      message: 'Invalid query parameters',
      errors: validationResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { search, limit } = validationResult.data;

  try {
    let companies;
    if (search) {
      const searchQuery = `
        SELECT id, name, logo_url
        FROM companies
        WHERE name ILIKE $1
        ORDER BY name ASC
        LIMIT $2;
      `;
      companies = await query(searchQuery, [`%${search}%`, limit]);
    } else {
      const listQuery = `
        SELECT id, name, logo_url
        FROM companies
        ORDER BY name ASC
        LIMIT $1;
      `;
      companies = await query(listQuery, [limit]);
    }

    return NextResponse.json({ success: true, data: companies.rows });
  } catch (error: any) {
    console.error('Error in GET /api/companies:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

  const validationResult = createCompanySchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json({
      success: false,
      message: 'Invalid request body',
      errors: validationResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const {
    name, description, logoUrl, websiteUrl, industry, companySize, hqLocation,
  } = validationResult.data;

  try {
    // Check for duplicate company name (case-insensitive)
    const duplicateCheck = await query('SELECT id FROM companies WHERE LOWER(name) = LOWER($1)', [name]);
    if (duplicateCheck.rows.length > 0) {
      return NextResponse.json({ success: false, message: 'A company with this name already exists.' }, { status: 409 });
    }

    const insertQuery = `
      INSERT INTO companies (
        name, description, logo_url, website_url, industry,
        company_size, hq_location, created_by_user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, description, logo_url, website_url, industry, company_size, hq_location, created_at, created_by_user_id;
    `;
    const insertParams = [
      name, description, logoUrl, websiteUrl, industry,
      companySize, hqLocation, userId,
    ];

    const result = await query(insertQuery, insertParams);
    const newCompany = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Company created successfully',
      data: newCompany,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST /api/companies:', error);
    // Check for ZodError (though usually caught by validationResult.success)
     if (error instanceof z.ZodError) {
        return NextResponse.json({ success: false, message: 'Validation error (unexpected)', errors: error.errors }, { status: 400 });
    }
    // Other potential database errors (e.g., constraint violations not caught by duplicate check)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
