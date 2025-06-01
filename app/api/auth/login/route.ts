import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { query } from '@/lib/db' // Adjusted path

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

    // If passwords match, return success response with a fake token
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful!',
        token: 'fake-jwt-token-for-testing', // In a real app, generate a real JWT
        user: {
          id: user.id,
          email: user.email,
          // Add other non-sensitive user details you might want to return
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login database/bcrypt error:', error)
    return NextResponse.json({ success: false, message: 'An error occurred during login. Please try again.' }, { status: 500 })
  }
}
