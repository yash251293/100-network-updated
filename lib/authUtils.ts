// lib/authUtils.ts
import jwt from 'jsonwebtoken';

// This utility relies on the JWT_SECRET environment variable being set.
// Ensure process.env.JWT_SECRET is available in your server environment.

/**
 * Verifies an Authorization header token and extracts the userId.
 *
 * @param authHeader The Authorization header string (e.g., "Bearer <token>").
 * @returns An object containing the userId if the token is valid, otherwise null.
 */
export function verifyAuthToken(
  authHeader: string | undefined | null
): { userId: string } | null {
  if (!authHeader) {
    console.log('[verifyAuthToken] No Authorization header provided.'); // Existing log
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    // Log a snippet of the header and its length for debugging, avoiding logging the full token if it's long
    console.log(`[verifyAuthToken] Authorization header format issue. Expected "Bearer <token>", got header (first 30 chars): "${authHeader.substring(0, 30)}${authHeader.length > 30 ? '...' : ''}". Full header length: ${authHeader.length}.`);
    return null;
  }

  const token = parts[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error('[verifyAuthToken] JWT_SECRET is not defined. This is a critical server configuration issue.'); // Emphasized existing log
    return null;
  }

  try {
    // Log token length before verification attempt
    console.log(`[verifyAuthToken] Attempting to verify token. Token length: ${token.length}`);
    const decoded = jwt.verify(token, jwtSecret);

    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && typeof decoded.userId === 'string') {
      // Log successful verification and userId
      console.log(`[verifyAuthToken] Token verified successfully. UserId: ${decoded.userId}`);
      return { userId: decoded.userId };
    } else {
      // Log if structure of decoded token is not as expected
      console.log('[verifyAuthToken] Token decoded, but userId is missing, not a string, or payload structure is unexpected. Decoded payload:', decoded);
      return null;
    }
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      // Log more details for token expiration
      console.log(`[verifyAuthToken] Token expired. Message: ${err.message}. Expired at: ${err.expiredAt}`);
    } else if (err instanceof jwt.JsonWebTokenError) {
      // Log specific JsonWebTokenError message and error name
      console.log(`[verifyAuthToken] Invalid token. Type: ${err.name}, Message: ${err.message}.`);
    } else {
      // Log any other unexpected errors during verification
      console.error('[verifyAuthToken] Unknown error during token verification:', err);
    }
    return null;
  }
}
