import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/hashPassword';
import { generateToken } from '@/lib/auth/generateToken';
import { signupSchema } from '@/lib/schemas/authSchemas';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = signupSchema.parse(body);

    const { email, password } = validatedData;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Create an empty profile for the user upon signup
    await prisma.profile.create({
      data: {
        userId: user.id,
        // Initialize with empty or default values if needed
        firstName: '',
        lastName: '',
        bio: '',
        avatarUrl: '',
      }
    });

    const token = generateToken({ id: user.id, email: user.email });

    const response = NextResponse.json({
      message: 'User created successfully',
      token,
      userId: user.id, // Optionally return userId
      email: user.email // Optionally return email
    }, { status: 201 });

    // Set cookie (optional, alternative to localStorage)
    // response.cookies.set('authToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', sameSite: 'lax' });

    return response;

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      console.error('JWT Secret Error:', error);
      return NextResponse.json({ message: 'Internal server error: JWT configuration issue' }, { status: 500 });
    }
    console.error('Signup Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
