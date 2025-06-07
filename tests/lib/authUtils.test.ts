// tests/lib/authUtils.test.ts
import jwt from 'jsonwebtoken';
import { verifyAuthToken } from '../../lib/authUtils';

const TEST_USER_ID = 'test-user-123';
const JWT_SECRET = 'test-secret'; // Use a fixed secret for testing

describe('verifyAuthToken', () => {
  let originalProcessEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalProcessEnv = { ...process.env };
    process.env.JWT_SECRET = JWT_SECRET;
    // Mock console methods to suppress logs during tests and allow assertions
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalProcessEnv;
    jest.restoreAllMocks();
  });

  it('should return userId for a valid token', () => {
    const token = jwt.sign({ userId: TEST_USER_ID }, JWT_SECRET, { expiresIn: '1h' });
    const authHeader = `Bearer ${token}`;
    const result = verifyAuthToken(authHeader);
    expect(result).toEqual({ userId: TEST_USER_ID });
  });

  it('should return null for an invalid token (wrong secret)', () => {
    const token = jwt.sign({ userId: TEST_USER_ID }, 'wrong-secret', { expiresIn: '1h' });
    const authHeader = `Bearer ${token}`;
    const result = verifyAuthToken(authHeader);
    expect(result).toBeNull();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Invalid token. Type: JsonWebTokenError, Message: invalid signature'));
  });

  it('should return null for a malformed token', () => {
    const authHeader = 'Bearer malformedtoken';
    const result = verifyAuthToken(authHeader);
    expect(result).toBeNull();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Invalid token. Type: JsonWebTokenError, Message: jwt malformed'));
  });

  it('should return null for an expired token', () => {
    const token = jwt.sign({ userId: TEST_USER_ID }, JWT_SECRET, { expiresIn: '0s' });
    // Wait for 1 second to ensure token is expired
    return new Promise(resolve => {
      setTimeout(() => {
        const authHeader = `Bearer ${token}`;
        const result = verifyAuthToken(authHeader);
        expect(result).toBeNull();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Token expired. Message: jwt expired'));
        resolve(null);
      }, 1000);
    });
  });

  it('should return null if Authorization header is missing', () => {
    const result = verifyAuthToken(undefined);
    expect(result).toBeNull();
    expect(console.log).toHaveBeenCalledWith('[verifyAuthToken] No Authorization header provided.');
  });

  it('should return null if Authorization header is null', () => {
    const result = verifyAuthToken(null);
    expect(result).toBeNull();
    expect(console.log).toHaveBeenCalledWith('[verifyAuthToken] No Authorization header provided.');
  });

  it('should return null for incorrectly formatted Authorization header (no Bearer prefix)', () => {
    const token = jwt.sign({ userId: TEST_USER_ID }, JWT_SECRET, { expiresIn: '1h' });
    const authHeader = token; // Missing "Bearer "
    const result = verifyAuthToken(authHeader);
    expect(result).toBeNull();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Authorization header format issue.'));
  });

  it('should return null for incorrectly formatted Authorization header (too many parts)', () => {
    const token = jwt.sign({ userId: TEST_USER_ID }, JWT_SECRET, { expiresIn: '1h' });
    const authHeader = `Bearer ${token} extrapart`;
    const result = verifyAuthToken(authHeader);
    expect(result).toBeNull();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Authorization header format issue.'));
  });

  it('should return null if JWT_SECRET is not defined', () => {
    delete process.env.JWT_SECRET;
    const token = jwt.sign({ userId: TEST_USER_ID }, JWT_SECRET, { expiresIn: '1h' });
    const authHeader = `Bearer ${token}`;
    const result = verifyAuthToken(authHeader);
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('[verifyAuthToken] JWT_SECRET is not defined. This is a critical server configuration issue.');
  });

  it('should return null if token payload does not contain userId', () => {
    const token = jwt.sign({ notUserId: 'some-value' }, JWT_SECRET, { expiresIn: '1h' });
    const authHeader = `Bearer ${token}`;
    const result = verifyAuthToken(authHeader);
    expect(result).toBeNull();
    expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/^\[verifyAuthToken\] Token decoded, but userId is missing, not a string, or payload structure is unexpected\./), expect.anything());
  });

  it('should return null if userId in token payload is not a string', () => {
    const token = jwt.sign({ userId: 12345 }, JWT_SECRET, { expiresIn: '1h' });
    const authHeader = `Bearer ${token}`;
    const result = verifyAuthToken(authHeader);
    expect(result).toBeNull();
    expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/^\[verifyAuthToken\] Token decoded, but userId is missing, not a string, or payload structure is unexpected\./), expect.anything());
  });
});
