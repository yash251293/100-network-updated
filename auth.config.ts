// auth.config.ts
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import { PrismaAdapter } from "@auth/prisma-adapter";

export const authConfig = {
  adapter: PrismaAdapter(prisma),
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

        // console.log("Auth.js: Attempting to authorize user:", email); // Optional: for debugging

        const user = await prisma.user.findUnique({
          where: { email: email },
        });

        if (!user || !user.password) {
          // console.log("Auth.js: User not found or user has no password for email:", email); // Optional: for debugging
          return null;
        }

        const isValidPassword = await bcryptjs.compare(password, user.password);

        if (isValidPassword) {
          // console.log("Auth.js: Password validated for user:", email); // Optional: for debugging
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.profilePictureUrl
          };
        }

        // console.log("Auth.js: Invalid password for user:", email); // Optional: for debugging
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  // Ensure AUTH_SECRET is set in your .env file for production.
  // secret: process.env.AUTH_SECRET,
  // trustHost: true, // Recommended for some deployments
} satisfies NextAuthConfig;
