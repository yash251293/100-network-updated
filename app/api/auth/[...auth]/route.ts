// app/api/auth/[...auth]/route.ts

// This file exports the handlers from your auth.ts setup.
// NextAuth.js (Auth.js) will use these handlers to manage authentication requests
// at the /api/auth/* path (e.g., /api/auth/signin, /api/auth/callback, etc.).

export { handlers as GET, handlers as POST } from '@/auth'; // Adjust path if auth.ts is not in the root
