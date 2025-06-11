// app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjusted path
import crypto from 'node:crypto';
import bcryptjs from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // IMPORTANT: For security, always return a generic success message
    // whether the user was found or not. This prevents email enumeration.
    // The actual email sending logic (and token generation/storage) should only execute if the user exists.
    if (!user) {
      console.log(`Password reset requested for email (user not found, generic response sent): ${email}`);
      return NextResponse.json({ message: 'If your email is registered, you will receive a password reset link.' });
    }

    // Generate a secure, URL-friendly reset token (unhashed version)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing it in the database
    const saltRounds = 10; // Consistent with user password hashing
    const hashedToken = await bcryptjs.hash(resetToken, saltRounds);

    const expiresAt = new Date(Date.now() + 3600000); // Token expires in 1 hour (3600000 milliseconds)

    // Invalidate any existing tokens for this user by deleting them
    // This ensures only the latest reset link is active.
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Store the new hashed token, linked to the user
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken, // Store the HASHED token
        email: user.email,   // Storing email for potential audit/verification, though userId is primary link
        expiresAt,
      },
    });

    // Construct the reset URL. Use NEXTAUTH_URL or a specific app URL from environment variables.
    const appBaseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${appBaseUrl}/auth/reset-password?token=${resetToken}`; // Send UNHASHED token in URL

    // Simulate sending email with the UNHASHED token.
    // In a real application, use a robust email sending service (e.g., Nodemailer with an SMTP provider, or a transactional email API like SendGrid, Postmark).
    console.log('--------------------------------------------------------------------');
    console.log('SIMULATED EMAIL FOR PASSWORD RESET:');
    console.log(`To: ${email}`);
    console.log(`Subject: Reset Your Password for 100 Networks`);
    console.log(`Please click the following link to reset your password:`);
    console.log(resetUrl);
    console.log(`This link will expire in 1 hour.`);
    console.log(`If you did not request a password reset, please ignore this email.`);
    console.log(`(This is a simulated email. Raw Token for testing: ${resetToken})`);
    console.log('--------------------------------------------------------------------');

    return NextResponse.json({ message: 'If your email is registered, you will receive a password reset link.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    // Return a generic error message to the client for security.
    return NextResponse.json({ error: 'Failed to process password reset request. Please try again later.' }, { status: 500 });
  }
}
