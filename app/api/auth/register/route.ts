// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { users, addUser, findUserByEmail } from '@/lib/inMemoryStore'; // Adjust path if necessary
import type { User } from '@/lib/types'; // Import User type

// THIS IS A TEMPORARY IN-MEMORY REGISTRATION PROCESS.
// DO NOT USE IN PRODUCTION WITHOUT A PROPER DATABASE AND SECURE PASSWORD HASHING.

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields: name, email, and password are required.' }, { status: 400 });
    }

    // Validate email format (basic)
    if (!/\S+@\S+\.\S+/.test(email)) {
        return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }

    // Validate password length (basic)
    if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const existingUser = findUserByEmail(email);
    if (existingUser) {
      console.log("Registration attempt for existing email:", email);
      return NextResponse.json({ error: 'User already exists with this email.' }, { status: 409 }); // 409 Conflict
    }

    // !!IMPORTANT!!: In a real application, you MUST hash the password here before saving.
    // Storing plain text passwords is a major security vulnerability.
    // Example using a hypothetical hashing function:
    // const hashedPassword = await hashPassword(password);
    // For this demo, password is NOT hashed.

    const newUserCredentials: Pick<User, 'id' | 'name' | 'email' | 'password'> = {
      id: Date.now().toString(), // Simple unique ID
      name,
      email,
      password: password, // Storing plain text password (BAD PRACTICE for production)
    };

    // Using the addUser function from inMemoryStore which includes a check, though redundant here as we checked above.
    // In a real scenario, addUser would handle the DB insertion.
    let registeredUser: User;
    try {
        registeredUser = addUser(newUserCredentials); // This will use the users array imported from inMemoryStore
    } catch (e: any) {
        // This catch is mainly if addUser itself could throw an error (e.g., DB error)
        // or if the redundant check within addUser (if kept) finds a user.
        return NextResponse.json({ error: e.message || 'Failed to add user to store.' }, { status: 409 });
    }

    console.log('User registered:', { id: registeredUser.id, name: registeredUser.name, email: registeredUser.email }); // Don't log password
    console.log('Total users in store:', users.length);


    // Do not return the password in the response
    return NextResponse.json({
        message: 'User registered successfully.',
        user: { id: registeredUser.id, name: registeredUser.name, email: registeredUser.email }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    let errorMessage = 'Failed to register user.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    // Check for specific error types if needed, e.g., JSON parsing errors
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
        errorMessage = "Invalid JSON payload provided.";
        return NextResponse.json({ error: errorMessage }, { status: 400 }); // Bad Request
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 }); // Internal Server Error
  }
}
