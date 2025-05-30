import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db';
import { SignupSchema, formatZodError } from '@/lib/validation_schemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // --- Input Validation with Zod ---
    const validationResult = SignupSchema.safeParse(body);
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

    const { email, password, firstName, lastName } = validationResult.data;

    // --- Check if user already exists ---
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists.' },
        { status: 409 } // 409 Conflict
      );
    }

    // --- Hash Password ---
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // --- Store New User ---
    // Default role is 'user' as per schema, so not explicitly set here unless needed otherwise
    const newUserQuery = `
      INSERT INTO users (email, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, first_name, last_name, created_at;
    `;
    // Provide null for firstName/lastName if they are empty strings (Zod schema allows optional or empty string)
    const newUser = await pool.query(newUserQuery, [
      email,
      passwordHash,
      firstName || null, // Store empty string as null
      lastName || null,  // Store empty string as null
    ]);

    // --- Create User Profile (Optional - default values in DB schema are preferred) ---
    // A user_profiles row will be created by default if using the schema with default values or by PUT /api/profile
    // If you need to ensure it here:
    // await pool.query('INSERT INTO user_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [newUser.rows[0].id]);


    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully!',
        user: {
          id: newUser.rows[0].id,
          email: newUser.rows[0].email,
          firstName: newUser.rows[0].first_name,
          lastName: newUser.rows[0].last_name,
          createdAt: newUser.rows[0].created_at,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup API Error:', error);
    // Check for specific database errors if needed
    if (error instanceof Error && (error as any).code === '23505' && (error as any).constraint === 'users_email_key') {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
