// auth.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config'; // Ensure this path is correct

// Initialize NextAuth.js with the configuration
// The `handlers` object will contain GET and POST methods for the API route.
// `auth` can be used as a helper to get the current session in Server Components or Server Actions.
// `signIn` and `signOut` can be used in Server Actions or client-side if not using the `next-auth/react` methods.
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Note: If using the Prisma adapter and a 'database' session strategy,
// ensure your database is set up correctly and migrations have run.
// The adapter handles session storage, user account linking for OAuth, etc.
// For Credentials-only with JWT sessions, the adapter is less critical for basic login
// but becomes important if you want automatic user/account creation for OAuth providers.
// Since we are handling user creation manually in `/api/auth/register` for Credentials,
// the adapter's role here is primarily for potential OAuth integration later or database session strategy.
// For now, authConfig doesn't have adapter enabled.
