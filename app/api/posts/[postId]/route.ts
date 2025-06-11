// app/api/posts/[postId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust path as needed

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = params.postId;

    if (!postId || typeof postId !== 'string') {
      return NextResponse.json({ error: 'Post ID is required and must be a string.' }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      // The Post model in Prisma schema already includes denormalized authorName and authorProfilePictureUrl.
      // If more detailed or always-current author information were needed, an include would be used:
      // include: {
      //   author: {
      //     select: {
      //       id: true,
      //       name: true,
      //       profilePictureUrl: true, // or your User model's field for avatar
      //       headline: true,
      //     },
      //   },
      // },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    }

    return NextResponse.json(post);

  } catch (error: any) {
    console.error(`Error fetching post ${params.postId}:`, error);
    // Handle known Prisma errors, e.g., if the ID format is incorrect for the database (though CUIDs are generally robust)
    if (error.code === 'P2023' || error.message?.includes('Malformed ObjectID')) { // P2023 for invalid ID format (depends on DB)
      return NextResponse.json({ error: 'Invalid Post ID format.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch post. Please try again later.', details: error.message }, { status: 500 });
  }
}

// Import User type for session user casting
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path as needed
import type { User } from '@/lib/types'; // Adjust path as needed

export async function PUT(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized: User not logged in.' }, { status: 401 });
    }
    // Ensure 'id' is part of your session user type
    const currentUser = session.user as User & { id: string };
    const postId = params.postId;

    if (!postId || typeof postId !== 'string') {
      return NextResponse.json({ error: 'Post ID is required and must be a string.' }, { status: 400 });
    }

    const body = await request.json();
    const { content, imageUrl, videoUrl, linkUrl /* other editable fields */ } = body;

    // Validate content if provided
    if (content !== undefined && (typeof content !== 'string' || content.trim() === '')) {
      return NextResponse.json({ error: 'Post content cannot be empty if provided for update.' }, { status: 400 });
    }

    // Basic URL validation for any provided URL fields
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (imageUrl !== undefined && imageUrl !== null && (typeof imageUrl !== 'string' || !urlRegex.test(imageUrl))) {
         return NextResponse.json({ error: 'Invalid Image URL format.' }, { status: 400 });
    }
    if (videoUrl !== undefined && videoUrl !== null && (typeof videoUrl !== 'string' || !urlRegex.test(videoUrl))) {
        return NextResponse.json({ error: 'Invalid Video URL format.' }, { status: 400 });
    }
    if (linkUrl !== undefined && linkUrl !== null && (typeof linkUrl !== 'string' || !urlRegex.test(linkUrl))) {
        return NextResponse.json({ error: 'Invalid Link URL format.' }, { status: 400 });
    }

    const postToUpdate = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!postToUpdate) {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    }

    if (postToUpdate.authorId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden: You can only update your own posts.' }, { status: 403 });
    }

    // Construct data object with only provided and valid fields
    const dataToUpdate: {
      content?: string;
      imageUrl?: string | null;
      videoUrl?: string | null;
      linkUrl?: string | null;
      updatedAt: Date; // Always update the updatedAt timestamp
    } = { updatedAt: new Date() };

    if (content !== undefined) dataToUpdate.content = content.trim();
    // Allow unsetting URLs by passing null
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl;
    if (videoUrl !== undefined) dataToUpdate.videoUrl = videoUrl;
    if (linkUrl !== undefined) dataToUpdate.linkUrl = linkUrl;

    // Ensure at least one field is being updated beyond just 'updatedAt'
    // Though Prisma might handle empty data object gracefully, it's good practice.
    if (Object.keys(dataToUpdate).length <= 1 && content === undefined && imageUrl === undefined && videoUrl === undefined && linkUrl === undefined) {
        return NextResponse.json({ error: 'No valid fields provided for update.' }, { status: 400 });
    }


    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: dataToUpdate,
      include: { // Return the updated post with author details
        author: {
          select: { id: true, name: true, profilePictureUrl: true, headline: true }
        }
      }
    });

    return NextResponse.json(updatedPost);

  } catch (error: any) {
    console.error(`Error updating post ${params.postId}:`, error);
    if (error.code === 'P2025') { // Prisma: Record to update not found
        return NextResponse.json({ error: 'Post not found or could not be updated.' }, { status: 404 });
    }
    if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
        return NextResponse.json({ error: 'Session token error.' }, { status: 401 });
    }
    if (error.message.includes("JSON")) {
        return NextResponse.json({ error: "Invalid JSON payload provided." }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update post. Please try again later.', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized: User not logged in.' }, { status: 401 });
    }
    // Ensure 'id' is part of your session user type
    const currentUser = session.user as User & { id: string };
    const postId = params.postId;

    if (!postId || typeof postId !== 'string') {
      return NextResponse.json({ error: 'Post ID is required and must be a string.' }, { status: 400 });
    }

    const postToDelete = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!postToDelete) {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    }

    // Authorization check: Only the author of the post (or an admin in a future iteration) can delete it.
    if (postToDelete.authorId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own posts.' }, { status: 403 });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    // Return a 200 OK with a success message, or a 204 No Content.
    // 200 with message is often better for client-side feedback.
    return NextResponse.json({ message: 'Post deleted successfully.' }, { status: 200 });

  } catch (error: any) {
    console.error(`Error deleting post ${params.postId}:`, error);
    if (error.code === 'P2025') { // Prisma: Record to delete not found
        return NextResponse.json({ error: 'Post not found or could not be deleted.' }, { status: 404 });
    }
    if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
        return NextResponse.json({ error: 'Session token error.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete post. Please try again later.', details: error.message }, { status: 500 });
  }
}
