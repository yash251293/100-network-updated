// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjusted path to the new prisma client instance
import bcryptjs from 'bcryptjs';
// User type from lib/types might still be useful for request body, but Prisma types will be primary for DB interaction.
// import type { User } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields: name, email, and password are required.' }, { status: 400 });
    }

    // Validate email format (basic)
    if (!/\S+@\S+\.\S+/.test(email)) {
        return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }

    // Validate password length (basic)
    if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      console.log("Registration attempt for existing email:", email);
      return NextResponse.json({ error: 'User already exists with this email.' }, { status: 409 }); // 409 Conflict
    }

    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        headline: '', // Default empty string
        summary: '',  // Default empty string
        location: '', // Default empty string
        profilePictureUrl: null,
        linkedInProfileUrl: null,
        githubProfileUrl: null,
        personalWebsiteUrl: null,
        skills: [], // Prisma handles Json for SQLite, which can store arrays
        // Experience and Education are separate related models, so they are empty by default.
      },
    });

    console.log('User registered with Prisma:', { id: newUser.id, name: newUser.name, email: newUser.email });

    // Do not return the password in the response
    return NextResponse.json({
        message: 'User registered successfully.',
        userId: newUser.id // Return userId, name, and email if desired
        // user: { id: newUser.id, name: newUser.name, email: newUser.email }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    let errorMessage = 'Failed to register user.';
    // Check if it's a Prisma known error
    if (error instanceof Error && 'code' in error && (error as any).code?.startsWith('P')) {
      errorMessage = `Database error: ${(error as any).code}`; // More specific DB error
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    // Check for specific error types if needed, e.g., JSON parsing errors
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
        errorMessage = "Invalid JSON payload provided.";
        return NextResponse.json({ error: errorMessage }, { status: 400 }); // Bad Request
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 }); // Internal Server Error
  }
}
