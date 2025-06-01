import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let body
  try {
    body = await request.json()
  } catch (error) {
    console.error("Failed to parse request body:", error)
    return NextResponse.json({ success: false, message: 'Invalid request body. Ensure it is valid JSON.' }, { status: 400 })
  }

  console.log('Signup API request body:', body)

  // In a real application, you would:
  // 1. Validate the data (e.g., using Zod)
  // 2. Check if the user already exists in the database
  // 3. Hash the password
  // 4. Save the new user to the database
  // 5. Send a verification email

  // For this example, we'll assume success.
  // The actual password should not be part of the request body sent from client for signup ideally,
  // but rather the client should send the necessary fields (firstName, lastName, email, password).
  // The current client-side code sends: firstName, lastName, email, password.

  const { email, password, firstName, lastName } = body

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ success: false, message: 'Missing required fields (email, password, firstName, lastName).' }, { status: 400 })
  }


  // Simulate successful signup
  return NextResponse.json(
    {
      success: true,
      message: 'Signup successful! Please check your email for verification.',
      // In a real app, you might return some user info (excluding password) or a session token if auto-logging in.
    },
    { status: 201 }
  )
}
