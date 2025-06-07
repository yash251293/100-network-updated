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
    await query('BEGIN'); // START TRANSACTION

    try {
      // Check if user already exists
      const existingUserResult = await query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUserResult.rows.length > 0) {
        await query('ROLLBACK'); // Rollback before exiting
        return NextResponse.json({ success: false, message: 'User with this email already exists.' }, { status: 409 }); // 409 Conflict
      }

      // Hash the password
      const hashedPassword = await hash(password, 10);

      // Insert new user
      const newUserResult = await query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
        [email, hashedPassword]
      );
      const userId = newUserResult.rows[0]?.id; // Safely access id

      if (!userId) {
        await query('ROLLBACK'); // Rollback if userId is not returned
        console.error('User ID not returned after insert.');
        // It's good practice to not expose 'no ID returned' to client, keep generic error
        return NextResponse.json({ success: false, message: 'An error occurred during user creation.' }, { status: 500 });
      }

      // Insert new profile
      await query(
        'INSERT INTO profiles (id, first_name, last_name) VALUES ($1, $2, $3)',
        [userId, firstName, lastName]
      );

      await query('COMMIT'); // COMMIT TRANSACTION

      // Return success response
      return NextResponse.json(
        {
          success: true,
          message: 'Signup successful! Please login.',
          userId: userId
        },
        { status: 201 }
      );

    } catch (transactionError) {
      await query('ROLLBACK'); // Rollback on any error during transaction
      console.error('Error during signup transaction:', transactionError);
      // Re-throw to be caught by the outer catch, which returns a generic error to the client
      throw transactionError;
    }

  } catch (dbError) {
    // This outer catch handles errors from BEGIN, COMMIT, ROLLBACK, or re-thrown transaction errors
    console.error('Signup database/transaction management error:', dbError);
    return NextResponse.json({ success: false, message: 'An error occurred during signup. Please try again.' }, { status: 500 });
  }
}
