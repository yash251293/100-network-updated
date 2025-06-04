# lib/ Directory Summary

This document summarizes the purpose, key functions/classes, and contributions of the files found in the `lib/` directory.

## `lib/authClient.ts`

*   **Purpose**:
    Manages client-side authentication state using the browser's `localStorage`. It provides a basic framework for handling user sessions based on a token (presumably a JWT).

*   **Key Functions**:
    *   `login(token: string): void`: Stores the provided authentication token in `localStorage` under the key `fake_jwt_token`. It also dispatches a custom event named `authChange` on the `window` object, allowing other parts of the application to react to login events.
    *   `logout(): void`: Removes the authentication token from `localStorage`. Similar to `login`, it dispatches an `authChange` event.
    *   `getToken(): string | null`: Retrieves the authentication token from `localStorage`. Returns `null` if the token is not found or if not in a browser environment.
    *   `isAuthenticated(): boolean`: Checks if an authentication token exists in `localStorage`, effectively determining if a user is considered logged in. Returns `false` if no token is found.

*   **Contribution to Project**:
    This file provides the core client-side logic for user authentication. It enables the application to:
    *   Persist user sessions across page loads (within the same browser tab/window context).
    *   Update the UI or application state dynamically when authentication status changes (login/logout) via the `authChange` event.
    *   Protect routes or display user-specific content by checking `isAuthenticated()`.

## `lib/db.ts`

*   **Purpose**:
    Handles database connectivity to a PostgreSQL server. It sets up a connection pool for efficient query execution and provides a utility function for sending queries.

*   **Key Components**:
    *   `pool: Pool`: A lazily initialized instance of `pg.Pool` (from the `pg` library) that manages multiple client connections.
    *   `getPool()`: A function that initializes the `pool` if it doesn't exist. It uses the `POSTGRES_URL` environment variable for the connection string, falling back to a default local connection string (`postgresql://flexbone_user:flexbone_password@localhost:5432/flexbone_db`). It issues a console warning if the default string is used in a non-production environment without `POSTGRES_URL` being set. It also sets up an error handler for idle clients in the pool.
    *   `query(text: string, params?: any[]): Promise<QueryResult<any>>`: An asynchronous function that executes a given SQL query string with optional parameters. It uses the `getPool()` function to obtain a connection. It logs the executed query (first 100 characters), the time taken for execution, and the number of rows returned.
    *   `testConnection(): Promise<boolean>`: An optional utility function to test the database connection by executing `SELECT NOW()`. It logs success or failure messages.
    *   Commented-out graceful shutdown logic (`process.on('SIGINT', ...)` and `process.on('SIGTERM', ...)`): Suggests considerations for resource cleanup, though notes it's more relevant for standalone Node.js apps than Next.js.

*   **Contribution to Project**:
    This file is crucial for backend data operations. It provides:
    *   A centralized and efficient way to manage database connections.
    *   A simple interface (`query` function) for performing database operations throughout the application's backend services or API routes.
    *   Basic logging and error handling for database interactions.
    *   Configuration flexibility through environment variables for different deployment environments.

## `lib/utils.ts`

*   **Purpose**:
    Provides general utility functions for the project. Currently, its primary utility is for constructing and merging CSS class names, particularly useful when working with Tailwind CSS.

*   **Key Functions**:
    *   `cn(...inputs: ClassValue[]): string`: This function takes multiple arguments, each of which can be a string, an array of strings, or an object with boolean values (common patterns for conditional class names). It uses:
        *   `clsx`: A utility to conditionally construct class name strings.
        *   `tailwind-merge`: A utility to intelligently merge Tailwind CSS classes, resolving conflicts (e.g., merging `p-2` and `p-4` into just `p-4`).

*   **Contribution to Project**:
    This utility helps in maintaining clean and readable component code when dealing with dynamic or conditional styling.
    *   Simplifies the application of conditional CSS classes in React components (or other TSX/JSX contexts).
    *   Prevents redundant or conflicting Tailwind CSS classes, ensuring predictable styling.
    *   Promotes a consistent way of handling class name generation across the project.
