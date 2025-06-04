import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { randomBytes, createHash } from 'crypto';
import nodemailer from 'nodemailer';

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

      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/reset-password?token=${plaintextToken}`;

      // Create a Nodemailer test account for Ethereal
      try {
        const testAccount = await nodemailer.createTestAccount();

        const transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        const mailOptions = {
          from: '"Your App Name - Dev" <noreply@example.com>', // Sender address - Ethereal will rewrite this
          to: email, // User's email
          subject: 'Password Reset Request',
          text: `You requested a password reset. Click here: ${resetUrl}`,
          html: `<p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a><p>This link will expire in 1 hour.</p>`,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Password reset email sent (via Ethereal).');
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // URL to view the email on Ethereal
        console.log(`Direct Reset URL (for testing): ${resetUrl}`); // Still log direct URL for convenience

      } catch (emailError) {
        console.error('Error sending password reset email with Nodemailer/Ethereal:', emailError);
        // Log the direct reset URL as a fallback if email sending fails
        console.log(`Password Reset URL (email failed, for user ${email}): ${resetUrl}`);
        console.log(`Plaintext token (for testing only, email failed): ${plaintextToken}`);
        // Decide if you want to inform the client about email failure.
        // For now, the generic message is still returned to client to prevent info leak.
      }
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
