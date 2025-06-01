import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { query } from '@/lib/db' // Adjusted path

export async function POST(request: Request) {
  let body
  try {
    body = await request.json()
  } catch (error) {
    console.error("Failed to parse request body:", error)
    return NextResponse.json({ success: false, message: 'Invalid request body. Ensure it is valid JSON.' }, { status: 400 })
  }

  const { email, password, firstName, lastName } = body
  // console.log('Signup API request body:', body); // Optional: Keep for debugging if needed

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ success: false, message: 'Missing required fields (email, password, firstName, lastName).' }, { status: 400 })
  }

  // Basic password validation (consider moving to client-side or shared validation logic)
  if (password.length < 8) {
    return NextResponse.json({ success: false, message: 'Password must be at least 8 characters long.' }, { status: 400 });
  }

  try {
    // Check if user already exists
    const existingUserResult = await query('SELECT * FROM users WHERE email = $1', [email])
    if (existingUserResult.rows.length > 0) {
      return NextResponse.json({ success: false, message: 'User with this email already exists.' }, { status: 409 }) // 409 Conflict
    }

    // Hash the password
    const hashedPassword = await hash(password, 10)

    // Insert new user
    const newUserResult = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [email, hashedPassword]
    )
    const userId = newUserResult.rows[0].id

    if (!userId) {
        // This case should ideally not happen if the previous query was successful and RETURNING id worked
        console.error('User ID not returned after insert.');
        return NextResponse.json({ success: false, message: 'An error occurred during user creation.' }, { status: 500 });
    }

    // Insert new profile
    await query(
      'INSERT INTO profiles (id, first_name, last_name) VALUES ($1, $2, $3)',
      [userId, firstName, lastName]
    )

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Signup successful! Please login.', // Updated message
        userId: userId // Optionally return the userId or user object
      },
      { status: 201 }
    )
  } catch (dbError) {
    console.error('Signup database error:', dbError)
    return NextResponse.json({ success: false, message: 'An error occurred during signup. Please try again.' }, { status: 500 })
  }
}
