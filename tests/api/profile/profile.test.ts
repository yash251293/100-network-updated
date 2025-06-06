// tests/api/profile/profile.test.ts
import { GET, POST } from '@/app/api/profile/route';
import { query } from '@/lib/db';
import { verifyAuthToken } from '@/lib/authUtils';
import { NextRequest } from 'next/server';
import { createMocks, RequestMethod } from 'node-mocks-http'; // Using node-mocks-http

jest.mock('@/lib/db');
jest.mock('@/lib/authUtils');

const mockQuery = query as jest.Mock;
const mockVerifyAuthToken = verifyAuthToken as jest.Mock;

// Helper to create mock NextRequest
function createMockRequest(method: RequestMethod = 'GET', body?: any, headers?: any, urlParams?: Record<string, string>) {
  const { req } = createMocks({
    method,
    body,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    url: `/api/profile${urlParams ? '?' + new URLSearchParams(urlParams) : ''}`,
  });
  // Cast to NextRequest. This is a common pattern but might need adjustments
  // depending on specific NextRequest features used by the route.
  return req as unknown as NextRequest;
}

const MOCK_USER_ID = 'test-user-id-123';

describe('/api/profile GET', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    mockVerifyAuthToken.mockReturnValue(null);
    const req = createMockRequest('GET');
    const response = await GET(req);
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe('Authentication failed');
  });

  it('should return profile data for an authenticated user', async () => {
    mockVerifyAuthToken.mockReturnValue({ userId: MOCK_USER_ID });

    mockQuery
      .mockResolvedValueOnce({ // Profile query
        rows: [{
          id: MOCK_USER_ID, first_name: 'Test', last_name: 'User', preferred_industries: '["Tech","Finance"]',
          // Add other profile fields as returned by DB
        }],
        rowCount: 1
      })
      .mockResolvedValueOnce({ rows: [{ id: 1, name: 'JavaScript' }], rowCount: 1 }) // Skills query
      .mockResolvedValueOnce({ // Experience query
        rows: [{
          id: 'exp1', user_id: MOCK_USER_ID, title: 'Dev', company_name: 'Comp',
          start_date: new Date('2022-01-01T00:00:00.000Z'), end_date: new Date('2022-12-01T00:00:00.000Z')
        }],
        rowCount: 1
      })
      .mockResolvedValueOnce({ // Education query
        rows: [{
          id: 'edu1', user_id: MOCK_USER_ID, school_name: 'Univ',
          start_date: new Date('2020-01-01T00:00:00.000Z'), end_date: new Date('2021-12-01T00:00:00.000Z')
        }],
        rowCount: 1
      })
      .mockResolvedValueOnce({ rows: [{ email: 'test@example.com' }], rowCount: 1 }); // Email query

    const req = createMockRequest('GET');
    const response = await GET(req);
    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json.id).toBe(MOCK_USER_ID);
    expect(json.first_name).toBe('Test');
    expect(json.skills).toEqual([{ id: 1, name: 'JavaScript' }]); // Assuming skills are returned as is by API
    expect(json.experience[0].title).toBe('Dev');
    expect(json.experience[0].start_date).toBe('2022-01-01'); // Check YYYY-MM-DD format
    expect(json.experience[0].end_date).toBe('2022-12-01');
    expect(json.education[0].school_name).toBe('Univ');
    expect(json.education[0].start_date).toBe('2020-01-01');
    expect(json.education[0].end_date).toBe('2021-12-01');
    expect(json.preferred_industries).toEqual(['Tech', 'Finance']);
    expect(json.email).toBe('test@example.com');
  });

  it('should return empty arrays/defaults if parts of profile are missing', async () => {
    mockVerifyAuthToken.mockReturnValue({ userId: MOCK_USER_ID });
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: MOCK_USER_ID, first_name: 'Test' }], rowCount: 1 }) // Profile
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // Skills
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // Experience
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // Education
      .mockResolvedValueOnce({ rows: [{ email: 'test@example.com' }], rowCount: 1 }); // Email

    const req = createMockRequest('GET');
    const response = await GET(req);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.skills).toEqual([]);
    expect(json.experience).toEqual([]);
    expect(json.education).toEqual([]);
    expect(json.preferred_industries).toEqual([]); // API defaults to [] if null/empty from DB
  });
});

describe('/api/profile POST', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Default successful transaction for most tests
    mockQuery.mockImplementation(async (sql: string) => {
      if (sql.toUpperCase().startsWith('BEGIN')) return { rows: [], rowCount: 0 };
      if (sql.toUpperCase().startsWith('COMMIT')) return { rows: [], rowCount: 0 };
      if (sql.toUpperCase().startsWith('ROLLBACK')) return { rows: [], rowCount: 0 };
      if (sql.toUpperCase().startsWith('SELECT * FROM user_experience')) return { rows: [], rowCount: 0 };
      if (sql.toUpperCase().startsWith('SELECT * FROM user_education')) return { rows: [], rowCount: 0 };
      if (sql.toUpperCase().startsWith('SELECT id FROM skills')) return { rows: [{id: 1}], rowCount: 1}; // Assume skill exists
      if (sql.toUpperCase().startsWith('INSERT INTO skills')) return { rows: [{id: 1}], rowCount: 1};
      return { rows: [], rowCount: 0 }; // Default for other queries like INSERT/UPDATE/DELETE user_skills
    });
  });

  it('should return 401 if not authenticated', async () => {
    mockVerifyAuthToken.mockReturnValue(null);
    const req = createMockRequest('POST', { firstName: 'Test' });
    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it('should update basic profile data and manage skills', async () => {
    mockVerifyAuthToken.mockReturnValue({ userId: MOCK_USER_ID });
    const profilePayload = {
      firstName: 'UpdatedFirst',
      lastName: 'UpdatedLast',
      bio: 'Updated Bio',
      skills: ['React', 'Node.js'],
      preferredIndustries: ['SaaS', 'Healthcare'],
    };
    const req = createMockRequest('POST', profilePayload);
    const response = await POST(req);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);

    expect(mockQuery).toHaveBeenCalledWith('BEGIN');
    // Check profile upsert query
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO profiles'),
      expect.arrayContaining([
        MOCK_USER_ID,
        profilePayload.firstName,
        profilePayload.lastName,
        profilePayload.bio,
        JSON.stringify(profilePayload.preferredIndustries), // Verify stringification
      ])
    );
    // Check skills deletion and insertion
    expect(mockQuery).toHaveBeenCalledWith('DELETE FROM user_skills WHERE user_id = $1', [MOCK_USER_ID]);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO user_skills'), expect.arrayContaining([MOCK_USER_ID, expect.any(Number)])); // For React
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO user_skills'), expect.arrayContaining([MOCK_USER_ID, expect.any(Number)])); // For Node.js
    expect(mockQuery).toHaveBeenCalledWith('COMMIT');
  });

  // --- Experience Diffing Tests ---
  it('should add new experiences', async () => {
    mockVerifyAuthToken.mockReturnValue({ userId: MOCK_USER_ID });
    const newExperiences = [
      { title: 'Dev New', company: 'NewCo', startDate: '2023-01-01', endDate: null, current: true, description: 'New dev role' },
    ];
    const req = createMockRequest('POST', { experience: newExperiences });

    // Mock DB state: No existing experiences
    mockQuery.mockImplementation(async (sql: string) => {
      if (sql.toUpperCase().startsWith('SELECT * FROM user_experience')) return { rows: [], rowCount: 0 };
      if (sql.toUpperCase().startsWith('INSERT INTO user_experience')) return { rows: [{id: 'new-exp-id'}], rowCount: 1};
      return { rows: [], rowCount: 0 }; // Default for BEGIN, COMMIT, etc.
    });

    await POST(req);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO user_experience'),
      expect.arrayContaining([MOCK_USER_ID, 'Dev New', 'NewCo', null, '2023-01-01', null, true, 'New dev role'])
    );
    expect(mockQuery).toHaveBeenCalledWith('COMMIT');
  });

  it('should update existing experiences', async () => {
    mockVerifyAuthToken.mockReturnValue({ userId: MOCK_USER_ID });
    const existingDbExp = { id: 'exp1-uuid', user_id: MOCK_USER_ID, title: 'Old Title', company_name: 'Old Company', location: 'Old Loc', start_date: new Date('2022-01-01'), end_date: null, current_job: true, description: 'Old Desc' };

    mockQuery.mockImplementation(async (sql: string) => {
      if (sql.toUpperCase().startsWith('SELECT * FROM user_experience')) return { rows: [existingDbExp], rowCount: 1 };
      if (sql.toUpperCase().startsWith('UPDATE user_experience')) return { rows: [], rowCount: 1};
      return { rows: [], rowCount: 0 };
    });

    const experiencesToUpdate = [
      { id: 'exp1-uuid', title: 'Updated Title', company: 'Updated Company', startDate: '2022-01-01', current: true, description: 'Updated Desc' },
    ];
    const req = createMockRequest('POST', { experience: experiencesToUpdate });
    await POST(req);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE user_experience SET title = $1'),
      expect.arrayContaining(['Updated Title', 'Updated Company', null, '2022-01-01', null, true, 'Updated Desc', 'exp1-uuid', MOCK_USER_ID])
    );
    expect(mockQuery).toHaveBeenCalledWith('COMMIT');
  });

  it('should delete experiences not present in payload', async () => {
    mockVerifyAuthToken.mockReturnValue({ userId: MOCK_USER_ID });
    const dbExperiences = [
      { id: 'exp1-to-keep-uuid', user_id: MOCK_USER_ID, title: 'Kept Title', company_name: 'Kept Co', start_date: new Date('2022-01-01'), current_job: true },
      { id: 'exp2-to-delete-uuid', user_id: MOCK_USER_ID, title: 'Deleted Title', company_name: 'Deleted Co', start_date: new Date('2021-01-01'), current_job: false },
    ];
    mockQuery.mockImplementation(async (sql: string) => {
      if (sql.toUpperCase().startsWith('SELECT * FROM user_experience')) return { rows: dbExperiences, rowCount: dbExperiences.length };
      if (sql.toUpperCase().startsWith('DELETE FROM user_experience')) return { rows: [], rowCount: 1};
      if (sql.toUpperCase().startsWith('UPDATE user_experience')) return { rows: [], rowCount: 1}; // For the kept one
      return { rows: [], rowCount: 0 };
    });

    const payloadExperiences = [ // Only sending the one to keep (potentially updated)
      { id: 'exp1-to-keep-uuid', title: 'Kept Title Updated', company: 'Kept Co', startDate: '2022-01-01', current: true },
    ];
    const req = createMockRequest('POST', { experience: payloadExperiences });
    await POST(req);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM user_experience WHERE user_id = $1 AND id = ANY($2::uuid[])'),
      [MOCK_USER_ID, ['exp2-to-delete-uuid']]
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE user_experience'), // For the update
      expect.arrayContaining(['Kept Title Updated', 'Kept Co', 'exp1-to-keep-uuid'])
    );
    expect(mockQuery).toHaveBeenCalledWith('COMMIT');
  });

  // --- Education Diffing Tests ---
  it('should add new education entries', async () => {
    mockVerifyAuthToken.mockReturnValue({ userId: MOCK_USER_ID });
    const newEducation = [
      { school: 'New Uni', degree: 'New Degree', field: 'New Field', startDate: '2024-01-01', endDate: null, current: true, description: 'Studying new things' },
    ];
    const req = createMockRequest('POST', { education: newEducation });

    mockQuery.mockImplementation(async (sql: string) => {
      if (sql.toUpperCase().startsWith('SELECT * FROM user_education')) return { rows: [], rowCount: 0 };
      if (sql.toUpperCase().startsWith('INSERT INTO user_education')) return { rows: [{id: 'new-edu-id'}], rowCount: 1};
      return { rows: [], rowCount: 0 }; // Default for BEGIN, COMMIT, etc.
    });

    await POST(req);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO user_education'),
      expect.arrayContaining([MOCK_USER_ID, 'New Uni', 'New Degree', 'New Field', '2024-01-01', null, true, 'Studying new things'])
    );
    expect(mockQuery).toHaveBeenCalledWith('COMMIT');
  });

  it('should update existing education entries', async () => {
    mockVerifyAuthToken.mockReturnValue({ userId: MOCK_USER_ID });
    const existingDbEdu = { id: 'edu1-uuid', user_id: MOCK_USER_ID, school_name: 'Old School', degree: 'Old Degree', field_of_study: 'Old Field', start_date: new Date('2020-01-01'), end_date: null, current_student: true, description: 'Old Desc' };

    mockQuery.mockImplementation(async (sql: string) => {
      if (sql.toUpperCase().startsWith('SELECT * FROM user_education')) return { rows: [existingDbEdu], rowCount: 1 };
      if (sql.toUpperCase().startsWith('UPDATE user_education')) return { rows: [], rowCount: 1};
      return { rows: [], rowCount: 0 };
    });

    const educationToUpdate = [
      { id: 'edu1-uuid', school: 'Updated School', degree: 'Updated Degree', field: 'Updated Field', startDate: '2020-01-01', current: true, description: 'Updated Desc' },
    ];
    const req = createMockRequest('POST', { education: educationToUpdate });
    await POST(req);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE user_education SET school_name = $1'),
      expect.arrayContaining(['Updated School', 'Updated Degree', 'Updated Field', '2020-01-01', null, true, 'Updated Desc', 'edu1-uuid', MOCK_USER_ID])
    );
    expect(mockQuery).toHaveBeenCalledWith('COMMIT');
  });

  it('should delete education entries not present in payload', async () => {
    mockVerifyAuthToken.mockReturnValue({ userId: MOCK_USER_ID });
    const dbEducation = [
      { id: 'edu1-to-keep-uuid', user_id: MOCK_USER_ID, school_name: 'Kept School', degree: 'Kept Degree', start_date: new Date('2020-01-01'), current_student: true },
      { id: 'edu2-to-delete-uuid', user_id: MOCK_USER_ID, school_name: 'Deleted School', degree: 'Deleted Degree', start_date: new Date('2019-01-01'), current_student: false },
    ];
     mockQuery.mockImplementation(async (sql: string) => {
      if (sql.toUpperCase().startsWith('SELECT * FROM user_education')) return { rows: dbEducation, rowCount: dbEducation.length };
      if (sql.toUpperCase().startsWith('DELETE FROM user_education')) return { rows: [], rowCount: 1};
      if (sql.toUpperCase().startsWith('UPDATE user_education')) return { rows: [], rowCount: 1}; // For the kept one
      return { rows: [], rowCount: 0 };
    });

    const payloadEducation = [ // Only sending the one to keep (potentially updated)
      { id: 'edu1-to-keep-uuid', school: 'Kept School Updated', degree: 'Kept Degree', startDate: '2020-01-01', current: true },
    ];
    const req = createMockRequest('POST', { education: payloadEducation });
    await POST(req);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM user_education WHERE user_id = $1 AND id = ANY($2::uuid[])'),
      [MOCK_USER_ID, ['edu2-to-delete-uuid']]
    );
     expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE user_education'),
      expect.arrayContaining(['Kept School Updated', 'Kept Degree', 'edu1-to-keep-uuid'])
    );
    expect(mockQuery).toHaveBeenCalledWith('COMMIT');
  });

  it('should handle validation errors for invalid data', async () => {
    mockVerifyAuthToken.mockReturnValue({ userId: MOCK_USER_ID });
    const invalidPayload = {
      firstName: "", // Assuming minLength(1)
      websiteUrl: "not-a-url",
      experience: [{ title: "Job", company: "Co", startDate: "2023/01" }] // Invalid date format
    };
    const req = createMockRequest('POST', invalidPayload);
    const response = await POST(req);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.errors.firstName).toBeDefined();
    expect(json.errors.websiteUrl).toBeDefined();
    expect(json.errors['experience.0.startDate']).toBeDefined(); // Or however Zod flattens array errors
  });

  it('should rollback transaction on database error', async () => {
    mockVerifyAuthToken.mockReturnValue({ userId: MOCK_USER_ID });
    mockQuery.mockImplementation(async (sql: string) => {
      if (sql.toUpperCase().startsWith('BEGIN')) return { rows: [], rowCount: 0 };
      if (sql.toUpperCase().includes('INSERT INTO profiles')) throw new Error("DB error on profile insert");
      return { rows: [], rowCount: 0 };
    });

    const req = createMockRequest('POST', { firstName: 'Test', lastName: 'User' });
    const response = await POST(req);

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.message).toContain('Failed to update profile data');
    expect(mockQuery).toHaveBeenCalledWith('BEGIN');
    expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    expect(mockQuery).not.toHaveBeenCalledWith('COMMIT');
  });
});

// TODO: Add more specific tests for education diffing, null/undefined experience/education arrays, etc.
// TODO: Test all profile fields for update
// TODO: Test edge cases for date parsing/formatting if any complex logic remains (should be simplified now)
