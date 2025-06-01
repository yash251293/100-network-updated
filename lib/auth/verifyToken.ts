import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
  // Ensure this matches the payload structure in generateToken
}

export function verifyToken(token: string): UserPayload | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not defined in environment variables');
    return null;
  }
  try {
    const decoded = jwt.verify(token, secret) as UserPayload;
    return decoded;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}
