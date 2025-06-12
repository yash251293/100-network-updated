// auth.config.ts
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import { PrismaAdapter } from "@auth/prisma-adapter"; // Direct import for PrismaAdapter

export const authConfig = {
  adapter: PrismaAdapter(prisma), // Using PrismaAdapter
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          console.error("Auth.js: Missing email or password in credentials");
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        console.log("Auth.js: Attempting to authorize user:", email);

        const user = await prisma.user.findUnique({
          where: { email: email },
        });

        if (!user || !user.password) {
          console.log("Auth.js: User not found or user has no password (should not happen):", email);
          return null;
        }

        const isValidPassword = await bcryptjs.compare(password, user.password);

        if (isValidPassword) {
          console.log("Auth.js: Password validated for user:", email);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.profilePictureUrl // Ensure this matches Prisma model
          };
        }

        console.log("Auth.js: Invalid password for user:", email);
        return null;
      },
    }),
    // Add other providers like Google, GitHub here later
  ],
  session: {
    // strategy: 'jwt', // When using an adapter like Prisma, 'database' strategy is often preferred for session persistence.
                       // However, JWT can still be used for the session token itself, while adapter handles user/account linking.
                       // For simplicity with Credentials, JWT is fine. If OAuth added, 'database' might be more robust.
                       // Let's keep JWT for now as it's simpler for Credentials-only.
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Persist user id to the token
        // token.picture = user.image; // Persist user image if needed (default is user.image)
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id as string; // Persist user id to the session
      }
      // if (session.user && token.picture) { // If you added picture to token
      //  session.user.image = token.picture as string;
      // }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login', // Your custom login page
    // signOut: '/auth/logout', // Default is fine
    // error: '/auth/error', // Default is fine
    // verifyRequest: '/auth/verify-request', // For email based verification
    // newUser: null // Redirect new users to this page (or null to not redirect)
  },
  // secret: process.env.AUTH_SECRET, // Recommended: Set in .env. AUTH_SECRET for v5
  // trustHost: true, // Recommended for Vercel deployments
} satisfies NextAuthConfig;

// Note on adapter dynamic import:
// The dynamic import `(await import('@auth/prisma-adapter')).PrismaAdapter(prisma)` was mentioned.
// For now, trying with direct import. If build/runtime issues occur, this might need to be switched.
// Make sure `@auth/prisma-adapter` is installed.

// To use the Prisma adapter, uncomment the adapter line and ensure the import is correct.
// You might also need to adjust session strategy to 'database' when using an adapter for session persistence,
// though JWT can still be used for the session token itself.
// import { PrismaAdapter } from '@auth/prisma-adapter'; // Example direct import
