import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { query } from '@/lib/db' // Adjusted path
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  let body
  try {
    body = await request.json()
  } catch (error) {
    console.error("Failed to parse request body:", error)
    return NextResponse.json({ success: false, message: 'Invalid request body. Ensure it is valid JSON.' }, { status: 400 })
  }

  const { email, password } = body
  // console.log('Login API request body:', body); // Optional: Keep for debugging

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string' || password.length === 0) {
    return NextResponse.json({ success: false, message: 'Invalid credentials. Please provide email and password.' }, { status: 401 })
  }

  try {
    // Retrieve user by email
    const result = await query('SELECT id, email, password_hash FROM users WHERE email = $1', [email])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid email or password.' }, { status: 401 })
    }

    const user = result.rows[0]

    // Compare passwords
    const passwordsMatch = await compare(password, user.password_hash)

    if (!passwordsMatch) {
      return NextResponse.json({ success: false, message: 'Invalid email or password.' }, { status: 401 })
    }

    // If passwords match, generate JWT and return success response
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
    console.error('Login database/bcrypt/jwt error:', error)
    return NextResponse.json({ success: false, message: 'An error occurred during login. Please try again.' }, { status: 500 })
  }
}
