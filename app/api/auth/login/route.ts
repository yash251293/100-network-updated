import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let body
  try {
    body = await request.json()
  } catch (error) {
    console.error("Failed to parse request body:", error)
    return NextResponse.json({ success: false, message: 'Invalid request body. Ensure it is valid JSON.' }, { status: 400 })
  }

  console.log('Login API request body:', body)

  const { email, password } = body

  // In a real application, you would:
  // 1. Validate the data
  // 2. Find the user by email in the database
  // 3. Compare the provided password with the stored hashed password
  // 4. If credentials are valid, generate a session token (e.g., JWT)

  if (email && password && typeof email === 'string' && typeof password === 'string' && password.length > 0) {
    // Simulate successful login for any non-empty email/password
    // For testing, you might check for a specific dummy user:
    // if (email === "test@example.com" && password === "password123") {
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful!',
        token: 'fake-jwt-token-for-testing', // Send a dummy token
        user: { // Optionally send some user data
          email: email,
          name: "Test User" // Example user name
        }
      },
      { status: 200 }
    )
    // }
  }

  // If credentials are not valid (or don't match the dummy user)
  return NextResponse.json(
    { success: false, message: 'Invalid credentials. Please provide valid email and password.' },
    { status: 401 }
  )
}
