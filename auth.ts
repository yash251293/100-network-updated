// auth.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config'; // Ensure this path is correct

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
