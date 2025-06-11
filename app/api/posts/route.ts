// app/api/posts/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust path as needed
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path as needed
import type { User } from '@/lib/types'; // Adjust path as needed - for casting session.user

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized: User not logged in.' }, { status: 401 });
    }

    // Cast session.user to your User type to access custom fields like id and profilePictureUrl
    // Ensure these fields are correctly populated in your NextAuth.js session callback
    const currentUser = session.user as User & { id: string }; // Ensure 'id' is definitely part of the session user type

    if (!currentUser.id) {
        // This case should ideally not happen if session handling is correct
        return NextResponse.json({ error: 'Unauthorized: User ID missing from session.' }, { status: 401 });
    }

    const body = await request.json();
    const { content, imageUrl, videoUrl, linkUrl /*, linkPreview data if we handle it */ } = body;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ error: 'Post content cannot be empty and must be a string.' }, { status: 400 });
    }

    // Optional: Validate URLs if provided
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (imageUrl && (typeof imageUrl !== 'string' || !urlPattern.test(imageUrl))) {
        return NextResponse.json({ error: 'Invalid Image URL format.' }, { status: 400 });
    }
    if (videoUrl && (typeof videoUrl !== 'string' || !urlPattern.test(videoUrl))) {
        return NextResponse.json({ error: 'Invalid Video URL format.' }, { status: 400 });
    }
    if (linkUrl && (typeof linkUrl !== 'string' || !urlPattern.test(linkUrl))) {
        return NextResponse.json({ error: 'Invalid Link URL format.' }, { status: 400 });
    }

    const newPost = await prisma.post.create({
      data: {
        content: content.trim(),
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        linkUrl: linkUrl || null,
        // linkPreview fields can be added here if parsed from linkUrl,
        // or handled by a separate service/function when creating post if URL exists
        authorId: currentUser.id, // This comes from the session
        // Denormalized fields from the User model:
        authorName: currentUser.name || 'Anonymous User', // Fallback, though name should exist from session
        authorProfilePictureUrl: currentUser.profilePictureUrl || null, // Fallback, needs to be in session
        // likesCount and commentsCount default to 0 in schema
      },
      // Optionally include author details if needed in the response immediately
      include: {
        author: {
          select: { id: true, name: true, profilePictureUrl: true, headline: true } // Select specific fields from author
        }
      }
    });

    return NextResponse.json(newPost, { status: 201 });

  } catch (error: any) {
    console.error('Error creating post:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
        return NextResponse.json({ error: 'Session token error.' }, { status: 401 });
    }
    // Add more specific error handling for Prisma errors if needed
    // e.g., error.code === 'P2002' for unique constraint violations (if any on Post model)
    return NextResponse.json({ error: 'Failed to create post. Please try again later.', details: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // Optional: Implement pagination later if needed
    // const { searchParams } = new URL(request.url);
    // const page = parseInt(searchParams.get('page') || '1', 10);
    // const limit = parseInt(searchParams.get('limit') || '10', 10); // Default to 10 posts per page
    // const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc', // Newest posts first
      },
      // The Post model in Prisma schema already includes authorName and authorProfilePictureUrl
      // so we don't strictly need to include author here if those denormalized fields are sufficient.
      // However, if we want to ensure we always get the LATEST author details (e.g., if name changes),
      // or want other author fields, then including is better.
      // For this iteration, we rely on the denormalized fields from post creation.
      // If live author data is preferred for the feed:
      // include: {
      //   author: {
      //     select: {
      //       id: true,
      //       name: true,
      //       profilePictureUrl: true, // or avatarUrl if that's the field name in User model
      //       headline: true,
      //     },
      //   },
      // },
      // skip: skip,
      // take: limit,
    });

    // Optional: Get total count for pagination headers if implementing pagination
    // const totalPosts = await prisma.post.count();
    // const responseHeaders = { 'X-Total-Count': totalPosts.toString() };
    // return NextResponse.json(posts, { headers: responseHeaders });

    return NextResponse.json(posts);

  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
