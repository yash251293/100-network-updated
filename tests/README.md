# API Testing Strategy

## Database Setup for Tests

These API tests are designed to interact with a PostgreSQL database. To ensure reliable and non-destructive testing, it is **highly recommended to use a separate, dedicated test database.**

**1. Create a Test Database:**
   - Use the `setup_postgres_dev.sh` script (modified if necessary for different DB name/user) or manual SQL commands to create a new PostgreSQL database specifically for testing (e.g., `app_test_db`).
   - Ensure this test database has the same schema as your development/production database. You can apply `schema.sql` to your test database.

**2. Configure Connection:**
   - The API tests will use the database connection configured via the `POSTGRES_URL` environment variable (as defined in `.env.local` or your CI environment).
   - **Before running tests, ensure `POSTGRES_URL` points to your dedicated test database.**
     Example for your `.env.local` when running tests:
     ```
     POSTGRES_URL="postgresql://your_test_user:your_test_password@localhost:5432/app_test_db"
     JWT_SECRET="your_jwt_secret_for_testing" # Can be the same as dev or a specific test secret
     ```

## Running Tests

- Use `pnpm test` to run tests in the console.
- Use `pnpm test:ui` to run tests with the Vitest UI.

## Test Data Management

- **Data Isolation:** Tests should aim to be independent. Where possible, tests will clean up data they create (e.g., deleting test users in `afterEach` or `afterAll` hooks).
- **Schema Migrations:** Ensure your test database schema is up-to-date with `schema.sql` before running tests.
- **No Mocking of Database Layer (Currently):** These tests are integration tests that hit a real database. Mocking the DB layer (`lib/db.ts`) could be an alternative for unit testing API route logic without DB dependency, but that's not the current approach for these specific tests.

**Important Considerations:**
- Running tests against your development database is risky and can lead to data corruption or test failures due to existing data. **Always prefer a dedicated test database.**
- Ensure your test database user has the necessary permissions to create, read, update, and delete data as required by the tests.
- For CI/CD environments, ensure the `POSTGRES_URL` and `JWT_SECRET` environment variables are securely configured to point to a test database instance.

This strategy aims for a balance between realistic integration testing and maintaining a clean test environment. More sophisticated data management techniques (e.g., full database resets, transaction rollbacks per test, test data factories) can be implemented as the test suite grows.
