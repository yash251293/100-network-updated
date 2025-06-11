// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { users, findUserByEmail, UserRecord } from '@/lib/inMemoryStore'; // Adjust path if necessary

// THIS IS A TEMPORARY IN-MEMORY STORE FOR USERS VIA CredentialsProvider
// DO NOT USE IN PRODUCTION WITHOUT A PROPER DATABASE AND SECURE PASSWORD HASHING.

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
          console.log("No credentials provided");
          return null;
        }

        console.log("Attempting authorization for email:", credentials.email);
        const user = findUserByEmail(credentials.email);

        if (user) {
          console.log("User found in store:", user.email);
          // !!IMPORTANT!!: In a real app, HASH passwords during registration
          // and COMPARE HASHED PASSWORDS here.
          // Storing plain text passwords as done in this demo is a major security risk.
          if (user.password === credentials.password) { // PLAIN TEXT PASSWORD COMPARISON (BAD PRACTICE)
            console.log("Password match for user:", user.email);
            // Return the user object expected by NextAuth
            return { id: user.id, name: user.name, email: user.email };
          } else {
            console.log("Password mismatch for user:", user.email);
            return null;
          }
        } else {
          console.log("User not found in store:", credentials.email);
          return null;
        }
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
