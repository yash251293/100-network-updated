import { POST as jobsPostHandler } from '@/app/api/jobs/route'; // Adjust if your actual path is different
import { query } from '@/lib/db';
import { verifyAuthToken } from '@/lib/authUtils';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/db', () => ({
  query: jest.fn(),
}));

jest.mock('@/lib/authUtils', () => ({
  __esModule: true,
  verifyAuthToken: jest.fn(),
  AuthError: class MockedAuthError extends Error { // Basic mock for AuthError
      public status: number;
      constructor(message: string, status = 401) {
          super(message);
          this.name = 'AuthError';
          this.status = status;
      }
  }
}));

const mockQuery = query as jest.Mock;
const mockVerifyAuthToken = verifyAuthToken as jest.Mock;

describe('API Route: POST /api/jobs', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockQuery.mockReset();
    mockVerifyAuthToken.mockReset();
  });

  it('should create a job successfully with one new skill', async () => {
    // Arrange: Mock verifyAuthToken to simulate successful authentication
    mockVerifyAuthToken.mockResolvedValue({ userId: 'test-user-id-123' });

    // Arrange: Mock database query responses
    // 1. BEGIN transaction
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // BEGIN
    // 2. INSERT into jobs table
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'new-job-id-456' }], rowCount: 1 }); // Job Insert
    // 3. SELECT skill (skill does not exist)
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Skill Select (not found)
    // 4. INSERT new skill
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'skill-id-789' }], rowCount: 1 }); // Skill Insert
    // 5. INSERT into job_skills_link
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // job_skills_link Insert
    // 6. COMMIT transaction
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

    // Arrange: Mock NextRequest object
    const jobPayload = {
      title: 'Software Engineer (Test)',
      description: 'Develop amazing things with TypeScript.',
      companyId: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID
      jobType: 'Full-time',
      status: 'Draft', // Default status from schema
      skills: ['TypeScript'], // One skill that is new
      salaryMin: 70000,
      salaryPeriod: 'Annual'
    };

    const mockRequest = new NextRequest('http://localhost/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
      body: JSON.stringify(jobPayload),
    });

    // Act: Call the API route handler
    const response = await jobsPostHandler(mockRequest);
    const body = await response.json();

    // Assert: Check the response
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.jobId).toBe('new-job-id-456');
    expect(body.message).toBe('Job created successfully');

    // Assert: Check database interactions
    expect(mockQuery).toHaveBeenCalledTimes(6); // BEGIN, INSERT job, SELECT skill, INSERT skill, INSERT link, COMMIT
    expect(mockQuery.mock.calls[0][0]).toBe('BEGIN');
    expect(mockQuery.mock.calls[1][0]).toContain('INSERT INTO jobs');
    expect(mockQuery.mock.calls[1][1]).toEqual(expect.arrayContaining([
      jobPayload.companyId, 'test-user-id-123', jobPayload.title, jobPayload.description,
      undefined, undefined, undefined, undefined, // responsibilities, requirements, benefits, location (optional)
      jobPayload.jobType, undefined, // experienceLevel (optional)
      jobPayload.salaryMin, undefined, 'USD', jobPayload.salaryPeriod, // salaryMax, salaryCurrency (default USD)
      null, jobPayload.status // applicationDeadline (null if not provided), status
    ]));
    expect(mockQuery.mock.calls[2][0]).toContain('SELECT id FROM skills WHERE LOWER(name) = LOWER($1)');
    expect(mockQuery.mock.calls[2][1]).toEqual(['TypeScript']);
    expect(mockQuery.mock.calls[3][0]).toContain('INSERT INTO skills (name) VALUES ($1) RETURNING id');
    expect(mockQuery.mock.calls[3][1]).toEqual(['TypeScript']);
    expect(mockQuery.mock.calls[4][0]).toContain('INSERT INTO job_skills_link (job_id, skill_id)');
    expect(mockQuery.mock.calls[4][1]).toEqual(['new-job-id-456', 'skill-id-789']);
    expect(mockQuery.mock.calls[5][0]).toBe('COMMIT');
  });

  it('should return 400 for invalid input data (e.g., missing title)', async () => {
    // Arrange: Mock verifyAuthToken
    mockVerifyAuthToken.mockResolvedValue({ userId: 'test-user-id-123' });

    // Arrange: Invalid payload (missing title)
    const jobPayload = {
      // title: 'Missing Title Test', // Title is missing
      description: 'This payload is invalid.',
      companyId: 'company-uuid-for-validation-test',
      jobType: 'Part-time',
      skills: ['Problem Solving']
    };
    const mockRequest = new NextRequest('http://localhost/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
      body: JSON.stringify(jobPayload),
    });

    // Act
    const response = await jobsPostHandler(mockRequest);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Invalid input');
    expect(body.errors.title).toBeDefined(); // Check if title error is present
    expect(mockQuery).not.toHaveBeenCalled(); // Database should not be called
  });

  it('should return 401 if user is not authenticated', async () => {
    // Arrange: Mock verifyAuthToken to throw an instance of the mocked AuthError
    mockVerifyAuthToken.mockImplementation(() => {
      // Get the AuthError class from the mocked module itself
      const MockedAuthError = jest.requireMock('@/lib/authUtils').AuthError;
      throw new MockedAuthError('User not authenticated', 401);
    });

    const mockRequest = new NextRequest('http://localhost/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // No Authorization header or invalid token
      body: JSON.stringify({ title: 'Test', description: 'Test', companyId: '123', jobType: 'Full-time' }),
    });

    // Act
    const response = await jobsPostHandler(mockRequest);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.message).toBe('User not authenticated');
    expect(mockQuery).not.toHaveBeenCalled();
  });

});
