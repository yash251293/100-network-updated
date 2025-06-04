import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { randomBytes, createHash } from 'crypto';

// REQUIRED SCHEMA CHANGE for users table:
// ALTER TABLE users ADD COLUMN reset_token_hash VARCHAR(255) NULL;
// ALTER TABLE users ADD COLUMN reset_token_expires_at TIMESTAMPTZ NULL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    // Find user by email
    const userResult = await query('SELECT id FROM users WHERE email = $1', [email]);

    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;

      // Generate a unique plaintext token
      const plaintextToken = randomBytes(32).toString('hex');
      // Hash the token for storage
      const tokenHash = createHash('sha256').update(plaintextToken).digest('hex');

      // Set expiry time (e.g., 1 hour from now)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store hashed token and expiry in the users table
      // Assumes 'reset_token_hash' and 'reset_token_expires_at' columns exist
      await query(
        'UPDATE users SET reset_token_hash = $1, reset_token_expires_at = $2 WHERE id = $3',
        [tokenHash, expiresAt, userId]
      );

      // IMPORTANT: Simulate email sending for now
      // In a real app, you would use an email service here.
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/reset-password?token=${plaintextToken}`;
      console.log(`Password Reset URL (for user ${email}): ${resetUrl}`);
      console.log(`Plaintext token (for testing only, not for production logs): ${plaintextToken}`);
      // Note: Logging plaintextToken is a security risk in production logs.
    }

    // Always return a generic message to prevent email enumeration
    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been processed.'
    });

  } catch (error) {
    console.error('Error in request-password-reset:', error);
    // Generic error for client, specific error logged on server
    return NextResponse.json({ message: 'An error occurred. Please try again later.' }, { status: 500 });
  }
}
