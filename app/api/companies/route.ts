// app/api/companies/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjusted path
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path
import type { Company } from '@prisma/client'; // Using Prisma's generated Company type

export async function GET(request: Request) {
  try {
    const companies = await prisma.company.findMany({
      orderBy: {
        createdAt: 'desc', // Example: order by creation date
      },
    });
    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized: Must be logged in to create a company' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      industry,
      logoUrl,
      size,
      location,
      founded,
      website,
      description,
      mission,
      vision,
      values, // Expecting this as a JSON-compatible array of strings
      culture,
      verified, // boolean
      companyType,
      contactEmail,
      contactPhone
    } = body as Partial<Company>; // Use Partial<Company> for type safety on expected fields

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    // Basic validation for other fields can be added here if necessary

    const newCompany = await prisma.company.create({
      data: {
        name,
        industry,
        logoUrl,
        size,
        location,
        founded,
        website,
        description,
        mission,
        vision,
        values: values || [], // Ensure 'values' is an array or Prisma's JsonNull if appropriate
        culture,
        verified: verified || false,
        companyType,
        contactEmail,
        contactPhone,
        // createdById: (session.user as any).id, // If you add a relation to User model
      },
    });
    return NextResponse.json(newCompany, { status: 201 });
  } catch (error: any) {
    console.error('Error creating company:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) { // Example for unique constraint on name
      return NextResponse.json({ error: 'A company with this name already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create company', details: error.message }, { status: 500 });
  }
}
