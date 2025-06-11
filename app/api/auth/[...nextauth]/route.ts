// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma'; // Adjusted path
import bcryptjs from 'bcryptjs';
// UserRecord is no longer needed from inMemoryStore

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john.doe@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req): Promise<NextAuthUser | null> {
        if (!credentials) {
          console.log("NextAuth: No credentials provided");
          return null;
        }

        console.log("NextAuth: Attempting authorization for email:", credentials.email);

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log("NextAuth: User not found in database:", credentials.email);
          return null;
        }

        // Ensure user.password is not null (it's not optional in Prisma schema for User)
        // const isValidPassword = await bcryptjs.compare(credentials.password, user.password);
        // console.log(`NextAuth: Password validation result for ${user.email}: ${isValidPassword}`);

        // if (isValidPassword) {
        // Temporary check without bcrypt until it can be installed and tested
        if (user.password && credentials.password === user.password && process.env.TEMPORARY_PASSWORD_CHECK === 'true') {
            console.warn(`NextAuth: TEMPORARY PLAIN TEXT PASSWORD CHECK FOR ${user.email}. Bcrypt comparison skipped.`);
            const isValidPassword = true; // Assuming plain text match for now
             if (isValidPassword) { // This will be true if above temporary check passes
                console.log("NextAuth: Password match for user:", user.email);
                return { id: user.id, name: user.name, email: user.email }; // Return necessary fields
             }
        } else if (user.password) {
            // This is the actual bcryptjs comparison block
            const isValidPassword = await bcryptjs.compare(credentials.password, user.password);
            console.log(`NextAuth: Password validation result for ${user.email}: ${isValidPassword}`);
            if (isValidPassword) {
                console.log("NextAuth: Password match for user (hashed):", user.email);
                return { id: user.id, name: user.name, email: user.email };
            }
        }

        // If password validation fails or user.password was unexpectedly null
        console.log("NextAuth: Password mismatch or missing stored password for user:", user.email);
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt', // Using JWT strategy
  },
  callbacks: {
    async jwt({ token, user }) {
      // When a user signs in, the user object is passed here.
      // We can add properties to the token from the user object.
      if (user) {
        token.id = user.id; // Add user ID to the token
        // token.name = user.name; // Already included by default if name is in user object
        // token.email = user.email; // Already included
      }
      return token;
    },
    async session({ session, token }) {
      // The session callback is called whenever a session is checked.
      // We can add properties to the session from the token.
      if (session.user) {
        (session.user as any).id = token.id; // Add user ID to the session's user object
        // session.user.name = token.name; // If you added it to token
        // session.user.email = token.email; // If you added it to token
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login', // Custom login page
    // signOut: '/auth/signout', // Default signout page is fine
    // error: '/auth/error', // Default error page is fine
    // verifyRequest: '/auth/verify-request', // For email provider, not used here
    // newUser: '/auth/new-user' // Redirect new users to a specific page (optional)
  },
  // The secret is used to sign and encrypt tokens.
  // In production, this MUST be set as an environment variable.
  // Generate a strong secret using: `openssl rand -base64 32`
  secret: process.env.NEXTAUTH_SECRET || 'default-super-secret-key-for-development-only',
  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
