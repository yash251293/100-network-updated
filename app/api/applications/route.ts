import { NextResponse } from 'next/server';
import type { JobApplication } from '@/lib/types'; // Used for reference, request body might be simpler

// In-memory store for applications (temporary for demonstration)
let applications: any[] = [];

export async function POST(request: Request) {
  try {
    const applicationData = await request.json();

    // Basic validation
    if (!applicationData.jobId || !applicationData.applicantName || !applicationData.applicantEmail) {
      return NextResponse.json({ error: 'Missing required fields: jobId, applicantName, applicantEmail are required.' }, { status: 400 });
    }

    const newApplication = {
      id: Date.now().toString(), // Simple unique ID
      jobId: applicationData.jobId,
      applicantName: applicationData.applicantName,
      applicantEmail: applicationData.applicantEmail,
      coverLetter: applicationData.coverLetter || '',
      resumeUrl: applicationData.resumeUrl || '', // Assuming URL is sent directly for now
      portfolioUrl: applicationData.portfolioUrl || '',
      expectedSalary: applicationData.expectedSalary || '',
      availableStartDate: applicationData.availableStartDate || '',
      appliedDate: new Date().toISOString(),
      status: 'submitted',
    };

    applications.push(newApplication);

    // For server-side logging to see what's happening
    console.log('New application received:', newApplication);
    console.log('All applications stored:', applications.length);

    return NextResponse.json(newApplication, { status: 201 });
  } catch (error) {
    console.error('Error processing application:', error);
    let errorMessage = 'Failed to process application';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
