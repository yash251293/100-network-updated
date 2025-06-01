import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
  // Add any other user-specific data you want in the token
}

export function generateToken(payload: UserPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  // Consider setting an expiration time for the token
  const token = jwt.sign(payload, secret, { expiresIn: '1d' }); // Example: token expires in 1 day
  return token;
}
