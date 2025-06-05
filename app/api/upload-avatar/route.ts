import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { stat, mkdir } from 'fs/promises'; // For checking/creating directory
import { randomUUID } from 'crypto'; // For unique filenames

export async function POST(request: NextRequest) {
  // IMPORTANT: This local file storage is for DEVELOPMENT ONLY.
  // For production, use a cloud storage service (AWS S3, Cloudinary, Vercel Blob, etc.).
  // Serverless environments (like Vercel) have ephemeral file systems.

  const formData = await request.formData();
  const file = formData.get('avatar') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  // Basic validation for image type (optional but recommended)
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
  }

  // Basic validation for file size (e.g., 5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: `File too large. Max size is ${maxSize / (1024*1024)}MB.` }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate a unique filename
  const fileExtension = file.name.split('.').pop() || 'tmp';
  const uniqueFilename = `${randomUUID()}.${fileExtension}`;

  // Define the path for saving. Relative to the project root.
  // Files in `public` directory are served statically by Next.js.
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
  // const relativePath = join('/uploads/avatars', uniqueFilename); // Path to be returned to client
  const absolutePath = join(uploadDir, uniqueFilename);

  let fileUrl = `/uploads/avatars/${uniqueFilename}`;
  fileUrl = fileUrl.replace(/\\/g, '/');

  try {
    // Check if upload directory exists, create if not
    try {
      await stat(uploadDir);
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        await mkdir(uploadDir, { recursive: true });
        console.log(`Created directory: ${uploadDir}`);
      } else {
        throw e; // Re-throw other errors
      }
    }

    await writeFile(absolutePath, buffer);
    console.log(`File saved to ${absolutePath}`);

    return NextResponse.json({
      success: true, // Adding success field for consistency
      message: 'File uploaded successfully.',
      url: fileUrl
    });
  } catch (error) {
    console.error('Failed to save file:', error);
    return NextResponse.json({ error: 'Failed to save file.' }, { status: 500 });
  }
}
