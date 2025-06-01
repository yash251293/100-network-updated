import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth/verifyToken';
import { profileUpdateSchema } from '@/lib/schemas/profileSchemas';
import { ZodError } from 'zod';

// Helper function to get Authorization header
function getAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove "Bearer " prefix
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json({ message: 'Authentication token is missing' }, { status: 401 });
    }

    const decodedToken = verifyToken(token);
    if (!decodedToken || !decodedToken.id) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = decodedToken.id;

    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            bio: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        userSkills: {
          select: {
            id: true, // UserSkill entry ID
            level: true,
            skill: {
              select: {
                id: true, // Master Skill ID
                name: true,
              },
            },
            createdAt: true, // UserSkill createdAt
          },
          orderBy: {
            skill: {
              name: 'asc' // Order skills by name
            }
          }
        },
      },
    });

    if (!userProfile) {
      return NextResponse.json({ message: 'User profile not found' }, { status: 404 });
    }

    // Structure the response a bit more cleanly
    const responsePayload = {
      userId: userProfile.id,
      email: userProfile.email,
      profile: userProfile.profile,
      skills: userProfile.userSkills.map(us => ({
        userSkillId: us.id,
        skillId: us.skill.id,
        name: us.skill.name,
        level: us.level,
        addedAt: us.createdAt,
      })),
    };

    return NextResponse.json(responsePayload, { status: 200 });

  } catch (error) {
    console.error('GET Profile Error:', error);
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
        return NextResponse.json({ message: 'Internal server error: JWT configuration issue' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal server error while fetching profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json({ message: 'Authentication token is missing' }, { status: 401 });
    }

    const decodedToken = verifyToken(token);
    if (!decodedToken || !decodedToken.id) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = decodedToken.id;
    const body = await req.json();

    // Validate only the fields that are present in the body
    const validatedData = profileUpdateSchema.parse(body);

    // Ensure there's at least one field to update
    if (Object.keys(validatedData).length === 0) {
        return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId: userId },
      data: {
        // Only include fields in  if they are actually provided in
        ...(validatedData.firstName !== undefined && { firstName: validatedData.firstName }),
        ...(validatedData.lastName !== undefined && { lastName: validatedData.lastName }),
        ...(validatedData.bio !== undefined && { bio: validatedData.bio }),
        ...(validatedData.avatarUrl !== undefined && { avatarUrl: validatedData.avatarUrl }),
      },
      select: { // Select the fields to return
        firstName: true,
        lastName: true,
        bio: true,
        avatarUrl: true,
        updatedAt: true,
      }
    });

    if (!updatedProfile) {
      // This case should ideally not be reached if the user and profile were created at signup
      return NextResponse.json({ message: 'Profile not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated successfully', profile: updatedProfile }, { status: 200 });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error('PUT Profile Error:', error);
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
        return NextResponse.json({ message: 'Internal server error: JWT configuration issue' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal server error while updating profile' }, { status: 500 });
  }
}
