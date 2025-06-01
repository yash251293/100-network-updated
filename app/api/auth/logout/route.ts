import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // For a stateless JWT approach, logout is primarily a client-side operation
  // (clearing the token from localStorage or cookies).
  // This endpoint can be used to clear an httpOnly cookie if set.

  const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });

  // If you were using httpOnly cookies, you would clear it here:
  // response.cookies.set('authToken', '', { httpOnly: true, expires: new Date(0), path: '/' });

  return response;
}
