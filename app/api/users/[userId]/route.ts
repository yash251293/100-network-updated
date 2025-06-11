// app/api/users/[userId]/route.ts
import { NextResponse } from 'next/server';
import { findUserById, updateUserProfile } from '@/lib/inMemoryStore'; // Adjust path if necessary
import type { User } from '@/lib/types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log(`Fetching profile for userId: ${userId}`);
    const user = findUserById(userId);

    if (!user) {
      console.log(`User not found: ${userId}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // IMPORTANT: Do not send password (or other sensitive data not meant for client) to client
    const { password, ...userProfile } = user;
    console.log(`Returning profile for userId: ${userId}`, userProfile);
    return NextResponse.json(userProfile);

  } catch (error) {
    console.error(`Error fetching user ${params.userId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { userId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const userIdFromParams = params.userId;

    if (!userIdFromParams) {
      return NextResponse.json({ error: 'User ID is required in path' }, { status: 400 });
    }

    // Check if user is authenticated and is the owner of the profile
    if (!session || !session.user || (session.user as any).id !== userIdFromParams) {
      console.log('Unauthorized attempt to update profile for userId:', userIdFromParams, 'Session user:', session?.user);
      return NextResponse.json({ error: 'Unauthorized: You can only update your own profile.' }, { status: 401 });
    }

    const body = await request.json();

    // Basic validation: ensure body is not empty
    if (Object.keys(body).length === 0) {
        return NextResponse.json({ error: 'Request body cannot be empty.' }, { status: 400 });
    }

    // Fields like email, id, password should not be updatable this way.
    // The updateUserProfile function in inMemoryStore already prevents id, email, password changes.
    // We can add more specific validation here if needed (e.g., for data types, formats).
    // For example, ensuring `experience` is an array if provided.

    console.log(`Attempting to update profile for userId: ${userIdFromParams}`, body);
    const updatedUser = updateUserProfile(userIdFromParams, body as Partial<Omit<User, 'id' | 'email' | 'password'>>);

    if (!updatedUser) {
      console.log(`User not found or update failed for userId: ${userIdFromParams}`);
      return NextResponse.json({ error: 'User not found or update failed' }, { status: 404 });
    }

    // IMPORTANT: The updateUserProfile function already returns the user without the password.
    // If it didn't, we would destructure it here: const { password, ...userProfile } = updatedUser;
    console.log(`Profile updated successfully for userId: ${userIdFromParams}`, updatedUser);
    return NextResponse.json(updatedUser); // updatedUser is already without password

  } catch (error: any) {
    console.error(`Error updating user ${params.userId}:`, error);
    if (error.message.includes("JSON")) {
        return NextResponse.json({ error: "Invalid JSON payload provided." }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
}
