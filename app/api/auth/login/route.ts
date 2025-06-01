import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/verifyPassword';
import { generateToken } from '@/lib/auth/generateToken';
import { loginSchema } from '@/lib/schemas/authSchemas';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken({ id: user.id, email: user.email });

    const response = NextResponse.json({
      message: 'Login successful',
      token,
      userId: user.id, // Optionally return userId
      email: user.email // Optionally return email
    }, { status: 200 });

    // Set cookie (optional)
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
    console.error('Login Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
