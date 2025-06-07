import { GET as companiesGetHandler, POST as companiesPostHandler } from '@/app/api/companies/route';
import { query } from '@/lib/db';
import { verifyAuthToken } from '@/lib/authUtils';
import { NextRequest } from 'next/server';
import { ZodError } from 'zod'; // For checking Zod errors if needed, though response structure is primary

// Mock dependencies
jest.mock('@/lib/db', () => ({
  query: jest.fn(),
}));
jest.mock('@/lib/authUtils', () => ({
  __esModule: true,
  verifyAuthToken: jest.fn(),
}));

const mockQuery = query as jest.Mock;
const mockVerifyAuthToken = verifyAuthToken as jest.Mock;

describe('API Route: /api/companies', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // --- GET /api/companies Tests ---
  describe('GET /api/companies', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockVerifyAuthToken.mockReturnValue(null);
      const mockRequest = new NextRequest('http://localhost/api/companies');

      const response = await companiesGetHandler(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Authentication failed: Invalid or missing token');
    });

    it('should return a list of companies (default limit, no search)', async () => {
      mockVerifyAuthToken.mockReturnValue({ userId: 'test-user-1' });
      const mockCompanies = [
        { id: 'comp-1', name: 'Alpha Corp', logo_url: 'logo1.png' },
        { id: 'comp-2', name: 'Beta LLC', logo_url: 'logo2.png' },
      ];
      mockQuery.mockResolvedValueOnce({ rows: mockCompanies, rowCount: 2 });

      const mockRequest = new NextRequest('http://localhost/api/companies?limit=5');

      const response = await companiesGetHandler(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockCompanies);
      const expectedListQuery = `
        SELECT id, name, logo_url
        FROM companies
        ORDER BY name ASC
        LIMIT $1;
      `;
      expect(mockQuery).toHaveBeenCalledWith(expectedListQuery, [5]);
    });

    it('should return searched companies', async () => {
      mockVerifyAuthToken.mockReturnValue({ userId: 'test-user-2' });
      const mockSearchedCompanies = [{ id: 'comp-3', name: 'TestCo Inc.', logo_url: 'logo3.png' }];
      mockQuery.mockResolvedValueOnce({ rows: mockSearchedCompanies, rowCount: 1 });

      const mockRequest = new NextRequest('http://localhost/api/companies?search=TestCo&limit=5');

      const response = await companiesGetHandler(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockSearchedCompanies);
      const expectedSearchQuery = `
        SELECT id, name, logo_url
        FROM companies
        WHERE name ILIKE $1
        ORDER BY name ASC
        LIMIT $2;
      `;
      expect(mockQuery).toHaveBeenCalledWith(expectedSearchQuery, ['%TestCo%', 5]);
    });

    it('should return 400 for invalid limit parameter', async () => {
      mockVerifyAuthToken.mockReturnValue({ userId: 'test-user-3' });
      // Zod schema will handle parsing 'abc' to NaN for limit
      const mockRequest = new NextRequest('http://localhost/api/companies?limit=abc');

      const response = await companiesGetHandler(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Invalid query parameters');
      expect(body.errors.limit).toBeDefined();
    });
  });

  // --- POST /api/companies Tests ---
  describe('POST /api/companies', () => {
    const validCompanyPayload = {
      name: 'New Test Company',
      description: 'A great company to work for.',
      websiteUrl: 'https://newtestco.com',
      logoUrl: 'https://newtestco.com/logo.png',
      industry: 'Tech',
    };

    it('should return 401 if user is not authenticated', async () => {
      mockVerifyAuthToken.mockReturnValue(null);
      const mockRequest = new NextRequest('http://localhost/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCompanyPayload),
      });

      const response = await companiesPostHandler(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Authentication failed: Invalid or missing token');
    });

    it('should create a company successfully', async () => {
      const testUserId = 'user-creator-id';
      mockVerifyAuthToken.mockReturnValue({ userId: testUserId });

      // Mock for duplicate check (no duplicate found)
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      // Mock for INSERT operation
      const newCompanyData = { id: 'new-comp-id', created_by_user_id: testUserId, ...validCompanyPayload, created_at: new Date().toISOString() };
      mockQuery.mockResolvedValueOnce({ rows: [newCompanyData], rowCount: 1 });

      const mockRequest = new NextRequest('http://localhost/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
        body: JSON.stringify(validCompanyPayload),
      });

      const response = await companiesPostHandler(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.message).toBe('Company created successfully');
      expect(body.data.id).toBe('new-comp-id');
      expect(body.data.name).toBe(validCompanyPayload.name);
      expect(body.data.created_by_user_id).toBe(testUserId);

      // Check query calls
      expect(mockQuery).toHaveBeenCalledTimes(2);
      // Check duplicate call
      expect(mockQuery.mock.calls[0][0]).toContain('SELECT id FROM companies WHERE LOWER(name) = LOWER($1)');
      expect(mockQuery.mock.calls[0][1]).toEqual([validCompanyPayload.name]);
      // Check insert call
      expect(mockQuery.mock.calls[1][0]).toContain('INSERT INTO companies');
      expect(mockQuery.mock.calls[1][1]).toEqual(expect.arrayContaining([
        validCompanyPayload.name,
        validCompanyPayload.description,
        validCompanyPayload.logoUrl,
        validCompanyPayload.websiteUrl,
        validCompanyPayload.industry,
        undefined, // companySize
        undefined, // hqLocation
        testUserId,
      ]));
    });

    it('should return 400 for invalid payload (e.g., missing name)', async () => {
      mockVerifyAuthToken.mockReturnValue({ userId: 'test-user-valid' });
      const invalidPayload = { ...validCompanyPayload, name: '' }; // Missing name

      const mockRequest = new NextRequest('http://localhost/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
        body: JSON.stringify(invalidPayload),
      });

      const response = await companiesPostHandler(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Invalid request body');
      expect(body.errors.name).toBeDefined();
    });

    it('should return 409 if company name already exists', async () => {
      mockVerifyAuthToken.mockReturnValue({ userId: 'test-user-conflict' });
      // Mock for duplicate check (duplicate found)
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'existing-comp-id' }], rowCount: 1 });

      const mockRequest = new NextRequest('http://localhost/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
        body: JSON.stringify(validCompanyPayload), // Using valid payload but DB mock says it exists
      });

      const response = await companiesPostHandler(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(409);
      expect(body.success).toBe(false);
      expect(body.message).toBe('A company with this name already exists.');
      expect(mockQuery).toHaveBeenCalledTimes(1); // Only duplicate check should be called
    });
  });
});
