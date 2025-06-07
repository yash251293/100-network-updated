import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { z } from 'zod'; // Added

const loginSchema = z.object({ // Added
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." })
  // Add password length constraints if desired, e.g., .min(8, "Password must be at least 8 characters.")
});

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Failed to parse request body:", error);
    return NextResponse.json({ success: false, message: 'Invalid request body. Ensure it is valid JSON.' }, { status: 400 });
  }

  const validationResult = loginSchema.safeParse(body); // Added Zod validation

  if (!validationResult.success) { // Added Zod error handling
    return NextResponse.json({
      success: false,
      message: "Validation failed.",
      errors: validationResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { email, password } = validationResult.data; // Use validated data

  try {
    // Retrieve user by email
    const result = await query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      // Return a generic message for security reasons, even though Zod validated email format
      return NextResponse.json({ success: false, message: 'Invalid email or password.' }, { status: 401 });
    }

    const user = result.rows[0];
    const passwordsMatch = await compare(password, user.password_hash);

    if (!passwordsMatch) {
      return NextResponse.json({ success: false, message: 'Invalid email or password.' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('Server configuration error: JWT_SECRET is not set.');
      return NextResponse.json({ success: false, message: 'Server configuration error: JWT secret not set.' }, { status: 500 });
    }

    const payload = { userId: user.id };
    const options = { expiresIn: '1h' }; // Token expires in 1 hour
    const token = jwt.sign(payload, jwtSecret, options);

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful!',
        token: token,
        user: {
          id: user.id,
          email: user.email,
          // Add other non-sensitive user details you might want to return
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login database/bcrypt/jwt error:', error);
    return NextResponse.json({ success: false, message: 'An error occurred during login. Please try again.' }, { status: 500 });
  }
}
