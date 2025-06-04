import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createHash } from 'crypto';
import { hash } from 'bcryptjs'; // For hashing the new password

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token: plaintextToken, newPassword } = body;

    if (!plaintextToken || typeof plaintextToken !== 'string') {
      return NextResponse.json({ message: 'Reset token is required.' }, { status: 400 });
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json({ message: 'New password must be at least 8 characters long.' }, { status: 400 });
    }

    // Hash the plaintext token received from the client to compare with the stored hash
    const tokenHash = createHash('sha256').update(plaintextToken).digest('hex');

    // Find user by the hashed token and check expiry
    const userResult = await query(
      'SELECT id FROM users WHERE reset_token_hash = $1 AND reset_token_expires_at > NOW()',
      [tokenHash]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: 'Invalid or expired password reset token.' }, { status: 400 });
    }

    const userId = userResult.rows[0].id;

    // Hash the new password for storage
    const newPasswordHash = await hash(newPassword, 10); // Salt rounds = 10

    // Update user's password and invalidate the reset token
    await query(
      'UPDATE users SET password_hash = $1, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = $2',
      [newPasswordHash, userId]
    );

    return NextResponse.json({ message: 'Password has been reset successfully.' });

  } catch (error) {
    console.error('Error in reset-password:', error);
    return NextResponse.json({ message: 'An error occurred. Please try again later.' }, { status: 500 });
  }
}
