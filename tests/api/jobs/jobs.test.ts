import { GET as jobsGetHandler, POST as jobsPostHandler } from '@/app/api/jobs/route'; // Adjust if your actual path is different
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
  // AuthError is no longer explicitly mocked here as the new pattern doesn't rely on throwing it from the mock
}));

// Helper to create mock NextRequest
function createMockRequest(method: 'GET' | 'POST' = 'GET', body?: any, headers?: any, urlParams?: Record<string, string>) {
  const url = `http://localhost/api/jobs${urlParams ? '?' + new URLSearchParams(urlParams) : ''}`;
  const request = new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return request;
}


const mockQuery = query as jest.Mock;
const mockVerifyAuthToken = verifyAuthToken as jest.Mock;

describe('API Route: POST /api/jobs', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockQuery.mockReset();
    mockVerifyAuthToken.mockReset();
  });

  it('should create a job successfully with one new skill', async () => {
    // Arrange: Mock verifyAuthToken to simulate successful authentication (synchronous)
    mockVerifyAuthToken.mockReturnValue({ userId: 'test-user-id-123' });

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
    // Arrange: Mock verifyAuthToken (synchronous)
    mockVerifyAuthToken.mockReturnValue({ userId: 'test-user-id-123' });

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
    // Arrange: Mock verifyAuthToken to return null, simulating authentication failure
    mockVerifyAuthToken.mockReturnValue(null);

    const mockRequest = new NextRequest('http://localhost/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // No Authorization header or invalid token
      // Body content doesn't strictly matter as auth should fail first, but providing a minimal valid one
      body: JSON.stringify({
        title: 'Test Auth Fail',
        description: 'Test Auth Fail Desc',
        companyId: '123e4567-e89b-12d3-a456-426614174000',
        jobType: 'Full-time'
      }),
    });

    // Act
    const response = await jobsPostHandler(mockRequest);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Authentication failed: Invalid or missing token');
    expect(mockQuery).not.toHaveBeenCalled();
  });

});

describe('API Route: GET /api/jobs', () => {
  beforeEach(() => {
    mockQuery.mockReset();
    // No auth check for GET jobs in the current implementation, so no need to mock verifyAuthToken here
  });

  it('should return jobs with skills as an array and handle jobs with no skills', async () => {
    const mockJobsData = [
      {
        id: 'job-id-1',
        title: 'Software Engineer',
        description: 'Develop cool stuff.',
        company_id: 'comp-1',
        company_name: 'Tech Corp',
        company_logo_url: 'logo.png',
        // other job fields...
        skills: ['React', 'Node.js'] //ARRAY_AGG result from DB
      },
      {
        id: 'job-id-2',
        title: 'UX Designer',
        description: 'Design beautiful interfaces.',
        company_id: 'comp-2',
        company_name: 'Design Studio',
        company_logo_url: null,
        // other job fields...
        skills: [] // Job with no skills, DB returns empty array
      },
      {
        id: 'job-id-3',
        title: 'Data Scientist',
        description: 'Analyze data.',
        company_id: 'comp-3',
        company_name: 'Data Inc.',
        company_logo_url: 'logo3.png',
        // other job fields...
        skills: ['Python', 'SQL', 'Machine Learning'] // Job with multiple skills
      }
    ];

    mockQuery
      .mockResolvedValueOnce({ // For count query
        rows: [{ total_items: mockJobsData.length.toString() }],
        rowCount: 1,
      })
      .mockResolvedValueOnce({ // For jobs data query
        rows: mockJobsData,
        rowCount: mockJobsData.length,
      });

    const req = createMockRequest('GET', undefined, undefined, { page: '1', limit: '10' });
    const response = await jobsGetHandler(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(mockJobsData.length);

    // Check job 1 (with skills)
    const job1 = body.data.find((j: any) => j.id === 'job-id-1');
    expect(job1).toBeDefined();
    expect(job1.skills).toEqual(['React', 'Node.js']);
    expect(Array.isArray(job1.skills)).toBe(true);

    // Check job 2 (no skills)
    const job2 = body.data.find((j: any) => j.id === 'job-id-2');
    expect(job2).toBeDefined();
    expect(job2.skills).toEqual([]);
    expect(Array.isArray(job2.skills)).toBe(true);

    // Check job 3 (multiple skills)
    const job3 = body.data.find((j: any) => j.id === 'job-id-3');
    expect(job3).toBeDefined();
    expect(job3.skills).toEqual(['Python', 'SQL', 'Machine Learning']);
    expect(Array.isArray(job3.skills)).toBe(true);

    // Verify the transformation in the route handler is correctly mapping fields
    expect(job1.company.name).toBe('Tech Corp');
    expect(job1.description.length).toBeLessThanOrEqual(153); // 150 + '...'
  });

  it('should return empty array if no jobs found', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ total_items: '0' }], rowCount: 1 }) // Count query
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Jobs data query

    const req = createMockRequest('GET');
    const response = await jobsGetHandler(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.pagination.totalItems).toBe(0);
  });

  it('should handle invalid query parameters gracefully', async () => {
    // No need to mock query, as validation should happen first
    const req = createMockRequest('GET', undefined, undefined, { page: 'invalidPage', limit: '-5' });
    const response = await jobsGetHandler(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Invalid query parameters');
    expect(body.errors.page).toBeDefined();
    expect(body.errors.limit).toBeDefined();
  });

});
