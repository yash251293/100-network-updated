import jwt from 'jsonwebtoken';
import type { SignOptions, VerifyOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable. Please set it in your .env.local file.');
}

interface TokenPayload {
  userId: string;
  email: string;
  // Add other relevant user information here, but keep payload small
  // e.g., role: string;
}

/**
 * Generates a JSON Web Token.
 * @param payload - The payload to include in the token.
 * @param options - Optional JWT signing options.
 * @returns The generated JWT.
 */
export function generateToken(payload: TokenPayload, options?: SignOptions): string {
  const defaultOptions: SignOptions = {
    expiresIn: '1h', // Default expiration time
    ...options,
  };
  return jwt.sign(payload, JWT_SECRET, defaultOptions);
}

/**
 * Verifies a JSON Web Token.
 * @param token - The JWT to verify.
 * @param options - Optional JWT verification options.
 * @returns The decoded token payload if verification is successful.
 * @throws Error if verification fails (e.g., token expired, invalid signature).
 */
export function verifyToken<T = TokenPayload>(token: string, options?: VerifyOptions): T {
  try {
    return jwt.verify(token, JWT_SECRET, options) as T;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    // Re-throw or handle specific errors as needed
    // For example, differentiate between TokenExpiredError, JsonWebTokenError, etc.
    throw new Error('Invalid or expired token.');
  }
}

/**
 * Example of how to extend the NextApiRequest type to include user information
 * if you were to use a middleware to verify tokens for API routes.
 * Not directly used in this step but good for future reference.
 */
/*
import type { NextApiRequest } from 'next';

export interface NextApiRequestWithUser extends NextApiRequest {
  user?: TokenPayload; // Add user property
}
*/

// You could also add functions here to handle token refresh logic if needed.

/**
 * Extracts and verifies JWT from an Authorization header.
 * @param request - The Next.js Request object or a Headers object.
 * @returns The decoded token payload (TokenPayload) if successful, otherwise null.
 */
export function getAuthUserFromRequest(request: Request): TokenPayload | null {
  const authorizationHeader = request.headers.get('Authorization');
  if (!authorizationHeader) {
    // console.warn('No Authorization header found');
    return null;
  }

  const parts = authorizationHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    // console.warn('Authorization header format is not Bearer token');
    return null;
  }

  const token = parts[1];
  try {
    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    // console.warn('Token verification failed in getAuthUserFromRequest:', error);
    return null;
  }
}
