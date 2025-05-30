import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import pool from '@/lib/db'; // To clean up the database

// Base URL of the running Next.js development server
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

describe('Profile API Endpoint (/api/profile)', () => {
  let authToken = '';
  let testUserId = '';

  const testUser = {
    email: `profiletest_${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'Profile',
    lastName: 'User',
  };

  beforeAll(async () => {
    // 1. Create a user
    const signupResponse = await request(BASE_URL)
      .post('/api/auth/signup')
      .send(testUser);

    if (signupResponse.status !== 201 || !signupResponse.body.user || !signupResponse.body.user.id) {
      console.error('Failed to create user for profile tests:', signupResponse.body);
      throw new Error('Prerequisite for profile tests failed: User signup.');
    }
    testUserId = signupResponse.body.user.id;

    // 2. Log in to get a token
    const loginResponse = await request(BASE_URL)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    if (loginResponse.status !== 200 || !loginResponse.body.token) {
      console.error('Failed to log in user for profile tests:', loginResponse.body);
      // Attempt to clean up created user if login fails
      if (testUserId) await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
      throw new Error('Prerequisite for profile tests failed: User login.');
    }
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up the created user
    if (testUserId) {
      try {
        await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
      } catch (dbError) {
        console.error('Error cleaning up profile test user:', dbError);
      }
    }
    // Optionally close the pool if this is the absolute end of all tests
    // await pool.end();
  });

  describe('GET /api/profile', () => {
    it('should retrieve the profile for the authenticated user', async () => {
      const response = await request(BASE_URL)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.user_id).toBe(testUserId);
      expect(response.body.data.email).toBe(testUser.email);
      // Default profile fields might be null initially
      expect(response.body.data.headline).toBeNull(); // Or whatever your schema default is
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(BASE_URL).get('/api/profile');
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Authentication required.');
    });

     it('should return 401 if token is invalid/malformed', async () => {
      const response = await request(BASE_URL)
        .get('/api/profile')
        .set('Authorization', `Bearer invalidtoken123`);

      expect(response.status).toBe(401);
      // The actual error message might come from your verifyToken function
      // For this test, we'll check the generic auth required or a specific token error
      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/Authentication required|Invalid or expired token/);
    });
  });

  describe('PUT /api/profile', () => {
    const profileUpdateData = {
      firstName: 'UpdatedFirst',
      lastName: 'UpdatedLast',
      headline: 'Senior Test Engineer',
      bio: 'This is my updated bio.',
      location: 'Testville, USA',
      phoneNumber: '123-456-7890',
      websiteUrl: 'https://updated.example.com',
      linkedinUrl: 'https://linkedin.com/in/updated',
      githubUrl: 'https://github.com/updated',
      avatarUrl: 'https://example.com/new_avatar.png',
      coverPhotoUrl: 'https://example.com/new_cover.png'
    };

    it('should update the profile for the authenticated user', async () => {
      const response = await request(BASE_URL)
        .put('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileUpdateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Profile updated successfully.');

      // Verify the update by fetching the profile again
      const getResponse = await request(BASE_URL)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data.first_name).toBe(profileUpdateData.firstName);
      expect(getResponse.body.data.last_name).toBe(profileUpdateData.lastName);
      expect(getResponse.body.data.headline).toBe(profileUpdateData.headline);
      expect(getResponse.body.data.bio).toBe(profileUpdateData.bio);
      expect(getResponse.body.data.location).toBe(profileUpdateData.location);
      expect(getResponse.body.data.phone_number).toBe(profileUpdateData.phoneNumber);
      expect(getResponse.body.data.website_url).toBe(profileUpdateData.websiteUrl);
      expect(getResponse.body.data.linkedin_url).toBe(profileUpdateData.linkedinUrl);
      expect(getResponse.body.data.github_url).toBe(profileUpdateData.githubUrl);
      expect(getResponse.body.data.avatar_url).toBe(profileUpdateData.avatarUrl);
      expect(getResponse.body.data.cover_photo_url).toBe(profileUpdateData.coverPhotoUrl);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(BASE_URL)
        .put('/api/profile')
        .send(profileUpdateData);
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Authentication required.');
    });

    it('should return 400 for invalid data (e.g., invalid URL)', async () => {
      const invalidUpdate = { ...profileUpdateData, websiteUrl: 'not-a-url' };
      const response = await request(BASE_URL)
        .put('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdate);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid input.');
      expect(response.body.details).toEqual(expect.arrayContaining(['websiteUrl: Invalid URL format for website.']));
    });

     it('should allow partial updates (e.g., only headline)', async () => {
      const partialUpdate = { headline: 'Only updating the headline' };
      const response = await request(BASE_URL)
        .put('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(partialUpdate);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Profile updated successfully.');

      const getResponse = await request(BASE_URL)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`);
      expect(getResponse.body.data.headline).toBe(partialUpdate.headline);
      // Other fields should remain as they were from the previous full update or initial state.
      expect(getResponse.body.data.bio).toBe(profileUpdateData.bio);
    });
  });
});
