// app/api/users/[userId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjusted path to Prisma client
import type { User } from '@/lib/types'; // Still useful for request body typing, Prisma types used for DB.
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log(`Prisma: Fetching profile for userId: ${userId}`);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      // include: { // Example if you want to eager load related data
      //   experience: true,
      //   education: true,
      // }
    });

    if (!user) {
      console.log(`Prisma: User not found: ${userId}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // IMPORTANT: Do not send password to client
    const { password, ...userProfile } = user;
    console.log(`Prisma: Returning profile for userId: ${userId}`);
    return NextResponse.json(userProfile);

  } catch (error) {
    console.error(`Prisma: Error fetching user ${params.userId}:`, error);
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

    if (!session || !session.user || (session.user as any).id !== userIdFromParams) {
      console.log('Prisma: Unauthorized attempt to update profile for userId:', userIdFromParams, 'Session user:', session?.user);
      return NextResponse.json({ error: 'Unauthorized: You can only update your own profile.' }, { status: 401 });
    }

    const body = await request.json() as Partial<User>; // Type assertion for request body

    if (Object.keys(body).length === 0) {
        return NextResponse.json({ error: 'Request body cannot be empty.' }, { status: 400 });
    }

    // Destructure allowed fields from body to prevent mass assignment of sensitive fields
    // and to ensure type safety with what Prisma expects for `data`
    const {
      name, headline, summary, location, profilePictureUrl,
      linkedInProfileUrl, githubProfileUrl, personalWebsiteUrl, skills
    } = body;

    const allowedUpdates: any = {}; // Prisma's update data type is flexible
    if (name !== undefined) allowedUpdates.name = name;
    if (headline !== undefined) allowedUpdates.headline = headline;
    if (summary !== undefined) allowedUpdates.summary = summary;
    if (location !== undefined) allowedUpdates.location = location;
    if (profilePictureUrl !== undefined) allowedUpdates.profilePictureUrl = profilePictureUrl;
    if (linkedInProfileUrl !== undefined) allowedUpdates.linkedInProfileUrl = linkedInProfileUrl;
    if (githubProfileUrl !== undefined) allowedUpdates.githubProfileUrl = githubProfileUrl;
    if (personalWebsiteUrl !== undefined) allowedUpdates.personalWebsiteUrl = personalWebsiteUrl;
    // For JSON fields like 'skills', ensure it's an array or proper JSON structure
    // Prisma expects `JsonNull` or `JsonArray` or `JsonObject` for Json fields if using strict types.
    // If skills is simply an array of strings, it should be fine.
    if (skills !== undefined) allowedUpdates.skills = skills;

    if (Object.keys(allowedUpdates).length === 0) {
        return NextResponse.json({ error: 'No valid fields provided for update.' }, { status: 400 });
    }

    console.log(`Prisma: Attempting to update profile for userId: ${userIdFromParams}`, allowedUpdates);
    const updatedUser = await prisma.user.update({
      where: { id: userIdFromParams },
      data: allowedUpdates,
    });

    // No need to check !updatedUser here as Prisma throws an error if record to update is not found.

    const { password, ...userProfile } = updatedUser;
    console.log(`Prisma: Profile updated successfully for userId: ${userIdFromParams}`);
    return NextResponse.json(userProfile);

  } catch (error: any) {
    console.error(`Prisma: Error updating user ${params.userId}:`, error);
    if (error.message.includes("JSON")) {
        return NextResponse.json({ error: "Invalid JSON payload provided." }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
}
