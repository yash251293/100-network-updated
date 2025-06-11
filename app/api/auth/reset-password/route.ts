// app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjusted path
import bcryptjs from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    // Basic password complexity validation (align with registration if possible)
    if (newPassword.length < 6) { // Assuming min 6 characters from previous setup
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Strategy for token validation:
    // Since the raw token is sent by the client, but we store hashed tokens,
    // we must iterate over potentially valid (non-expired) tokens and compare.
    // This is acceptable for a small number of active tokens.
    // For very high load, a more optimized lookup (e.g., indexing a part of the token) might be needed.

    const potentialTokens = await prisma.passwordResetToken.findMany({
      where: {
        expiresAt: {
          gte: new Date(), // Token must not be expired
        },
      },
    });

    let dbTokenRecord = null;
    for (const record of potentialTokens) {
      // Compare the client's raw token with the hashed token from the database
      const isValidToken = await bcryptjs.compare(token, record.token);
      if (isValidToken) {
        dbTokenRecord = record;
        break; // Found a valid matching token
      }
    }

    if (!dbTokenRecord) {
      console.log("Reset Password: Invalid or expired token provided.");
      return NextResponse.json({ error: 'Invalid or expired token. Please request a new reset link.' }, { status: 400 });
    }

    // If token is valid and found:
    // 1. Hash the new password
    const saltRounds = 10; // Must be consistent with registration hashing
    const hashedPassword = await bcryptjs.hash(newPassword, saltRounds);

    // 2. Update the user's password in the User table
    await prisma.user.update({
      where: { id: dbTokenRecord.userId },
      data: { password: hashedPassword },
    });

    // 3. Invalidate (delete) the used PasswordResetToken to prevent reuse
    await prisma.passwordResetToken.delete({
      where: { id: dbTokenRecord.id },
    });

    console.log(`Password successfully reset for user ID: ${dbTokenRecord.userId}`);
    return NextResponse.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });

  } catch (error) {
    console.error('Reset password error:', error);
    // Avoid leaking too much detail in error messages
    return NextResponse.json({ error: 'Failed to reset password. Please try again.' }, { status: 500 });
  }
}
