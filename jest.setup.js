// jest.setup.js
import '@testing-library/jest-dom'; // Example if you were doing DOM tests
// Add any other global setup here, like environment variable mocks if needed for tests

// You can mock global fetch if your API client uses it, or specific modules
// For example, to mock nodemailer for all tests if it's imported widely and not always specifically mocked:
/*
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mocked-message-id' }),
  }),
}));
*/
