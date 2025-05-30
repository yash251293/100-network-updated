import { describe, it, expect, afterEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import pool from '@/lib/db'; // To clean up the database

// Base URL of the running Next.js development server
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

// Ensure JWT_SECRET is set for token generation in login tests
// Tests will use the JWT_SECRET from the environment (e.g., .env.local)
if (!process.env.JWT_SECRET) {
  console.warn(
    'JWT_SECRET is not set in the environment. Login tests requiring token generation might behave unexpectedly if the API relies on it internally for other checks, though these tests primarily check token presence.'
  );
  // For local testing, ensure .env.local has JWT_SECRET.
  // For CI, ensure it's set in the CI environment.
}


describe('Auth API Endpoints', () => {
  const testUser = {
    email: `testuser_${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
  };
  let createdUserId: string | null = null;

  // Cleanup function to delete the test user
  const cleanupUser = async () => {
    if (createdUserId) {
      try {
        await pool.query('DELETE FROM users WHERE id = $1', [createdUserId]);
      } catch (dbError) {
        console.error('Error cleaning up user:', dbError);
      }
      createdUserId = null;
    } else {
        // Fallback if ID not captured, try to delete by email
         try {
            await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
        } catch (dbError) {
            // console.error('Error cleaning up user by email:', dbError);
        }
    }
  };

  // Run cleanup after each test to ensure isolation for user creation tests
  afterEach(async () => {
    await cleanupUser();
  });

  // Additional cleanup for any user with the static testUser.email that might have been missed
  // or if a test failed before cleanup.
  afterAll(async () => {
    await cleanupUser(); // Final attempt to cleanup
    // Close the pool if it's the end of all tests (might be better in a global setup/teardown)
    // await pool.end();
  });


  describe('POST /api/auth/signup', () => {
    it('should successfully sign up a new user', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/signup')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully!');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.id).toBeDefined();
      createdUserId = response.body.user.id; // Save for cleanup
    });

    it('should return 409 if email already exists', async () => {
      // First, create the user
      const initialResponse = await request(BASE_URL)
        .post('/api/auth/signup')
        .send(testUser);
      expect(initialResponse.status).toBe(201);
      createdUserId = initialResponse.body.user.id; // Save for cleanup

      // Then, try to create the same user again
      const response = await request(BASE_URL)
        .post('/api/auth/signup')
        .send(testUser);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User with this email already exists.');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/signup')
        .send({ ...testUser, email: 'invalidemail' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid input.');
      expect(response.body.details).toEqual(expect.arrayContaining(['email: Invalid email format.']));
    });

    it('should return 400 for password too short', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/signup')
        .send({ ...testUser, password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid input.');
      expect(response.body.details).toEqual(expect.arrayContaining(['password: Password must be at least 8 characters long.']));
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      // Ensure a user exists to test login
      // Cleanup any previous test user first, just in case
      await cleanupUser();
      const signupResponse = await request(BASE_URL)
        .post('/api/auth/signup')
        .send(testUser);
      if (signupResponse.status !== 201) {
        console.error("Failed to create user for login tests:", signupResponse.body);
        throw new Error('Prerequisite for login tests failed: User signup.');
      }
      createdUserId = signupResponse.body.user.id;
    });

    it('should successfully log in an existing user and return a JWT', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful!');
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password.');
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password.');
    });

    it('should return 400 for invalid email format on login', async () => {
        const response = await request(BASE_URL)
          .post('/api/auth/login')
          .send({ email: 'invalidloginemail', password: 'password123' });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Invalid input.');
        expect(response.body.details).toEqual(expect.arrayContaining(['email: Invalid email format.']));
      });
  });
});
