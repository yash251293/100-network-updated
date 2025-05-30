import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db';
import { generateToken } from '@/lib/auth_utils';
import { LoginSchema, formatZodError } from '@/lib/validation_schemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // --- Input Validation with Zod ---
    const validationResult = LoginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input.',
          details: formatZodError(validationResult.error),
        },
        { status: 400 }
      );
    }
    const { email, password } = validationResult.data;

    // --- Retrieve User ---
    const result = await pool.query(
      'SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = $1 AND is_active = TRUE',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 } // Unauthorized
      );
    }

    const user = result.rows[0];

    // --- Compare Password ---
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 } // Unauthorized
      );
    }

    // --- Generate JWT ---
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      // role: user.role, // Optionally include role or other relevant info
      // firstName: user.first_name,
      // lastName: user.last_name,
    };
    const token = generateToken(tokenPayload);

    // --- Update Last Login Time (Optional) ---
    // Consider doing this asynchronously or if it's critical for your app.
    // await pool.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful!',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
