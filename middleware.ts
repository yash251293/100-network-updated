// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  // For local development, ensure NEXTAUTH_SECRET in .env.local matches the one in [...nextauth].ts
  // If process.env.NEXTAUTH_SECRET is undefined here, getToken will likely return null.
  const secret = process.env.NEXTAUTH_SECRET || 'default-super-secret-key-for-development-only';
  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  // Output for debugging purposes (optional, remove for production)
  // console.log(`Middleware: Pathname: ${pathname}, Token: ${token ? 'Exists' : 'None'}`);

  // Define protected routes.
  // Order can matter if you have overlapping path definitions, but startsWith should handle most cases.
  const protectedPaths = [
    '/feed',
    '/profile', // This will cover /profile/[userId] and /profile/edit due to startsWith
    '/explore', // Explore page is now protected
    '/jobs/freelance/my-applications',
    '/jobs/freelance/my-projects',
    '/jobs/freelance/post', // Assuming posting a freelance job requires auth
    '/hire-freelancer',     // Assuming hiring a freelancer requires auth
    '/inbox',
    '/settings',
    '/billing',
    '/career-interests',
    '/notifications',
    '/company-dashboard', // Example of a company-specific page
    '/company-profile',   // If editing company profile requires auth
    '/company-jobs/post', // Posting company jobs
    // Add other paths that should be protected
  ];

  // Check if the current path is one of the protected paths
  // Using startsWith to cover sub-paths like /profile/some-user-id
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  // If trying to access a protected path without a token (not authenticated)
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/auth/login', req.url);
    // Preserve the original path and query parameters for redirection after login
    loginUrl.searchParams.set('callbackUrl', pathname + req.nextUrl.search);
    // console.log(`Middleware: Unauthenticated access to ${pathname}. Redirecting to login: ${loginUrl.toString()}`);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and trying to access login or signup pages
  if (token && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    const defaultAuthenticatedUrl = new URL('/feed', req.url); // Or '/explore', or user dashboard
    // console.log(`Middleware: Authenticated user accessing ${pathname}. Redirecting to ${defaultAuthenticatedUrl.toString()}`);
    return NextResponse.redirect(defaultAuthenticatedUrl);
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which paths the middleware should run on:
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets in public folder (e.g., images, svgs).
     *   This regex attempts to exclude common image file extensions.
     *   Adjust if you have other static asset types in /public that need to be excluded.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
