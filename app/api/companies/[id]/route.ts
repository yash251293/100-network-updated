// app/api/companies/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjusted path
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path
import type { Company } from '@prisma/client'; // Using Prisma's generated Company type

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const companyId = params.id;
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      // include: { jobs: true } // Optionally include related jobs
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    return NextResponse.json(company);
  } catch (error) {
    console.error(`Error fetching company ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const companyId = params.id;

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized: Must be logged in to update a company' }, { status: 401 });
    }
    // TODO: Implement more granular authorization (e.g., only company admin/owner can update).
    // For now, any authenticated user can update any company. This is a simplification.

    const body = await request.json();
    const {
      name, industry, logoUrl, size, location, founded,
      website, description, mission, vision, values, culture,
      verified, companyType, contactEmail, contactPhone
    } = body as Partial<Company>;

    // Construct an object with only the fields that are actually provided in the request body
    const companyDataToUpdate: { [key: string]: any } = {};
    if (name !== undefined) companyDataToUpdate.name = name;
    if (industry !== undefined) companyDataToUpdate.industry = industry;
    if (logoUrl !== undefined) companyDataToUpdate.logoUrl = logoUrl;
    if (size !== undefined) companyDataToUpdate.size = size;
    if (location !== undefined) companyDataToUpdate.location = location;
    if (founded !== undefined) companyDataToUpdate.founded = founded;
    if (website !== undefined) companyDataToUpdate.website = website;
    if (description !== undefined) companyDataToUpdate.description = description;
    if (mission !== undefined) companyDataToUpdate.mission = mission;
    if (vision !== undefined) companyDataToUpdate.vision = vision;
    if (values !== undefined) companyDataToUpdate.values = values; // Assumes 'values' is a JSON-compatible array
    if (culture !== undefined) companyDataToUpdate.culture = culture;
    if (verified !== undefined) companyDataToUpdate.verified = verified;
    if (companyType !== undefined) companyDataToUpdate.companyType = companyType;
    if (contactEmail !== undefined) companyDataToUpdate.contactEmail = contactEmail;
    if (contactPhone !== undefined) companyDataToUpdate.contactPhone = contactPhone;

    if (Object.keys(companyDataToUpdate).length === 0) {
      return NextResponse.json({ error: 'No fields provided for update' }, { status: 400 });
    }

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: companyDataToUpdate,
    });

    return NextResponse.json(updatedCompany);
  } catch (error: any) {
    console.error(`Error updating company ${params.id}:`, error);
    if (error.code === 'P2025') { // Prisma error code for record not found during update
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    if (error.message.includes("JSON")) { // Check if it's a JSON parsing error
        return NextResponse.json({ error: "Invalid JSON payload provided." }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update company', details: error.message }, { status: 500 });
  }
}
