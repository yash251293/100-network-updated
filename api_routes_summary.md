# API Routes Analysis

This document provides a detailed analysis of the API routes found in `app/api/`, covering their purpose, functionality, database interactions, security considerations, and potential areas for improvement.

## Identified API Endpoints:

*   **`POST /api/auth/login`**: Handles user login. (Mapped from `app/api/auth/login/route.ts`)
*   **`POST /api/auth/signup`**: Handles user registration. (Mapped from `app/api/auth/signup/route.ts`)
*   **`GET /api/profile`**: Fetches user profile data. (Mapped from `app/api/profile/route.ts`)
*   **`POST /api/profile`**: Updates user profile data. (Mapped from `app/api/profile/route.ts`)

---

## `app/api/auth/login/route.ts` (`POST /api/auth/login`)

*   **Purpose**:
    Authenticates a user based on their email and password.

*   **HTTP Method**: `POST`

*   **Request Processing**:
    *   Expects a JSON body with `email` and `password`.
    *   Includes basic error handling for invalid JSON parsing.

*   **Database Interaction**:
    *   Uses `query` from `@/lib/db`.
    *   Retrieves user data (id, email, password_hash) from the `users` table based on the provided email.
    *   If a user is found, it uses `bcryptjs.compare` to compare the provided password with the stored `password_hash`.

*   **Response Structure**:
    *   **Success (200)**: `NextResponse.json({ success: true, message: 'Login successful!', token: 'fake-jwt-token-for-testing', user: { id, email } })`.
    *   **Error - Invalid JSON (400)**: `NextResponse.json({ success: false, message: 'Invalid request body...' })`.
    *   **Error - Invalid Credentials (401)**: `NextResponse.json({ success: false, message: 'Invalid credentials...' })` or `NextResponse.json({ success: false, message: 'Invalid email or password.' })`.
    *   **Error - Server Error (500)**: `NextResponse.json({ success: false, message: 'An error occurred...' })`.

*   **Validation, Error Handling & Security**:
    *   **Validation**: Basic check for the presence and string type of `email` and `password`.
    *   **Error Handling**: Catches errors during JSON parsing and database operations, returning appropriate status codes and messages.
    *   **Security**:
        *   Uses `bcryptjs.compare` for secure password verification, preventing timing attacks.
        *   Returns a generic "Invalid email or password" message for non-existent users or incorrect passwords, which is good practice to avoid revealing whether an email is registered.
        *   **CRITICAL**: Returns a hardcoded `fake-jwt-token-for-testing`. In a real application, a cryptographically secure JWT must be generated here.

*   **Potential Improvements**:
    *   **Real JWT Implementation**: Replace the fake token with a proper JWT generated using a library like `jsonwebtoken` or `jose`, including user ID and an expiration date in the payload, signed with a secret key.
    *   **Input Validation**: Implement more robust input validation (e.g., using Zod) for email format and password complexity (though password complexity might be better enforced at signup).
    *   **Rate Limiting**: Consider adding rate limiting to prevent brute-force attacks.
    *   **Logging**: Enhance logging for security auditing (e.g., failed login attempts, without logging sensitive data like passwords).

---

## `app/api/auth/signup/route.ts` (`POST /api/auth/signup`)

*   **Purpose**:
    Registers a new user with their email, password, first name, and last name.

*   **HTTP Method**: `POST`

*   **Request Processing**:
    *   Expects a JSON body with `email`, `password`, `firstName`, and `lastName`.
    *   Basic error handling for invalid JSON.

*   **Database Interaction**:
    *   Uses `query` from `@/lib/db`.
    *   Checks if a user with the given email already exists in the `users` table.
    *   Uses `bcryptjs.hash` to securely hash the provided password before storage.
    *   Inserts the new user into the `users` table (email, password_hash), returning the new `id`.
    *   Inserts the associated profile information into the `profiles` table (id, first_name, last_name).

*   **Response Structure**:
    *   **Success (201)**: `NextResponse.json({ success: true, message: 'Signup successful! Please login.', userId })`.
    *   **Error - Invalid JSON (400)**: `NextResponse.json({ success: false, message: 'Invalid request body...' })`.
    *   **Error - Missing Fields (400)**: `NextResponse.json({ success: false, message: 'Missing required fields...' })`.
    *   **Error - Password Too Short (400)**: `NextResponse.json({ success: false, message: 'Password must be at least 8 characters long.' })`.
    *   **Error - User Exists (409 Conflict)**: `NextResponse.json({ success: false, message: 'User with this email already exists.' })`.
    *   **Error - Server Error (500)**: `NextResponse.json({ success: false, message: 'An error occurred...' })`.

*   **Validation, Error Handling & Security**:
    *   **Validation**: Checks for the presence of required fields (`email`, `password`, `firstName`, `lastName`) and enforces a minimum password length (8 characters).
    *   **Error Handling**: Catches errors for JSON parsing, database operations, and specific conditions like existing users.
    *   **Security**: Uses `bcryptjs.hash` for secure password storage.

*   **Potential Improvements**:
    *   **Input Validation**: Use a validation library (e.g., Zod) for more comprehensive validation of email format, password complexity, and string lengths for names.
    *   **Transactional Operations**: The creation of a user in `users` and their profile in `profiles` should ideally be wrapped in a database transaction to ensure atomicity. If profile creation fails, user creation should be rolled back.
    *   **Return User Object/Token**: Instead of just `userId`, consider returning the created user object (excluding sensitive fields) or even automatically logging the user in by returning a JWT (similar to the login endpoint).
    *   **Password Strength**: The 8-character minimum is basic. Consider more advanced password strength requirements.

---

## `app/api/profile/route.ts` (`GET /api/profile`, `POST /api/profile`)

*   **Purpose**:
    *   `GET`: Fetches the consolidated profile information for the authenticated user.
    *   `POST`: Updates (or creates) the profile information for the authenticated user.

*   **HTTP Method(s)**: `GET`, `POST`

*   **Authentication (Placeholder)**:
    *   Both methods use a helper function `getUserIdFromRequest(request)`.
    *   **CRITICAL SECURITY GAP**: This function is explicitly stated as a placeholder and insecure. It attempts to return a hardcoded or the first user's ID, which is not suitable for a real application. Proper server-side authentication (e.g., validating a JWT from the `Authorization` header) is required.

---

### `GET /api/profile`

*   **Request Processing**:
    *   Relies on `getUserIdFromRequest` to identify the user.

*   **Database Interaction**:
    *   If `userId` is obtained:
        *   Fetches basic profile data from the `profiles` table.
        *   Fetches associated skills from `user_skills` and `skills` tables.
        *   Fetches work experience from `user_experience` table.
        *   Fetches education history from `user_education` table.
    *   Data is then consolidated into a single JSON object.
    *   Includes a `formatDateToYearMonth` helper to format date strings (e.g., `start_date`, `end_date`) to `YYYY-MM` format. Also maps `company_name` to `company` and `school_name` to `school`.

*   **Response Structure**:
    *   **Success (200)**: `NextResponse.json(consolidatedProfile)` containing all user profile details.
    *   **Error - Authentication Required (401)**: `NextResponse.json({ error: 'Authentication required. User not found.' })` if `userId` is not found.
    *   **Error - Server Error (500)**: `NextResponse.json({ error: 'Failed to fetch profile data', details: ... })`.

*   **Validation, Error Handling & Security**:
    *   **Validation**: No explicit input validation for the GET request itself.
    *   **Error Handling**: Catches errors during database operations. The `formatDateToYearMonth` helper has its own try-catch for date parsing issues.
    *   **Security**: The primary security issue is the placeholder authentication.

*   **Potential Improvements**:
    *   **Implement Real Authentication**: This is the most critical fix. The server must validate a token (e.g., JWT) sent in the request headers to securely identify the user.
    *   **Data Transformation Layer**: The mapping of DB field names (e.g., `company_name`) to frontend names (`company`) and date formatting is done directly in the route. For more complex applications, this transformation could be handled by a dedicated data transformation layer or service.
    *   **Error in Date Formatting**: The `formatDateToYearMonth` function logs a warning for invalid date strings but returns `null`. Depending on frontend expectations, this might be fine, or more specific error handling/defaulting might be needed.
    *   **Selective Fields**: Consider allowing clients to request specific parts of the profile if the entire consolidated profile is very large and not always needed (e.g., using query parameters).

---

### `POST /api/profile`

*   **Request Processing**:
    *   Relies on `getUserIdFromRequest` for user identification.
    *   Expects a JSON body (`profileData`) containing various profile fields, skills, experience, and education arrays.

*   **Database Interaction**:
    *   Uses `query` from `@/lib/db`.
    *   **Transactions**: Wraps database operations in a transaction (`BEGIN`, `COMMIT`, `ROLLBACK`).
    *   **Profiles Table**: Performs an UPSERT (INSERT ON CONFLICT DO UPDATE) into the `profiles` table with data like bio, location, website, avatar, phone, job preferences, and stringified `preferred_industries`.
    *   **Skills**:
        *   Deletes all existing skills for the user from `user_skills`.
        *   Iterates through the provided `skills` array (assumed to be skill names).
        *   For each skill name, it checks if the skill exists in the `skills` table. If not, it inserts the new skill.
        *   Inserts the skill association into `user_skills`.
    *   **Experience & Education**:
        *   Deletes all existing experience/education records for the user.
        *   Iterates through the provided `experience`/`education` arrays and inserts new records.
        *   Basic validation to skip items if essential fields (title/company for experience, school for education) are missing.
        *   Processes date strings from `YYYY-MM` to `YYYY-MM-01` before insertion.

*   **Response Structure**:
    *   **Success (200)**: `NextResponse.json({ message: 'Profile updated successfully' })`.
    *   **Error - Authentication Required (401)**: `NextResponse.json({ error: 'Authentication required. User not found.' })`.
    *   **Error - Server Error (500)**: `NextResponse.json({ error: 'Failed to update profile data', details: ... })`. Includes a `ROLLBACK` in case of error.

*   **Validation, Error Handling & Security**:
    *   **Validation**:
        *   Basic checks within loops for skills, experience, and education (e.g., `skillName.trim() === ''`, `!exp.title || !exp.company`).
        *   `preferred_industries` is stringified; assumes the frontend sends an array.
    *   **Error Handling**: Uses transactions to ensure data consistency. Catches errors during database operations.
    *   **Security**: Same critical authentication issue as the GET route. The delete-then-insert pattern for related entities is a form of data modification that needs to be authorized correctly.

*   **Potential Improvements**:
    *   **Implement Real Authentication**: Critical.
    *   **Input Validation (Zod)**: Thoroughly validate the entire `profileData` payload using Zod, including array structures, types, formats (e.g., for `website_url`, `phone`), and required fields. This is crucial before performing database operations.
    *   **Partial Updates (PATCH)**: The current `POST` handler replaces entire collections (skills, experience, education). For partial updates (e.g., adding a single skill, editing one job experience), a `PATCH` method with more granular logic would be more appropriate and efficient. The current approach is effectively a "full replace" for these sections.
    *   **Data Sanitization**: Ensure all string inputs are properly sanitized if they are ever rendered as HTML without escaping (though this is more of a frontend concern, defense in depth is good).
    *   **Efficiency**: For skills, inserting one by one inside a loop can be less efficient than bulk operations if the DB driver supports it, though for typical profile updates, this might be acceptable.
    *   **Error Reporting**: More granular error messages could be provided to the client if specific parts of the update fail (e.g., "Invalid skill format" instead of a generic "Failed to update").
    *   **Concurrency**: Consider potential race conditions if multiple updates are attempted simultaneously, though transactions help.

This detailed analysis should provide a good foundation for understanding the API's current state and identifying key areas for enhancement.
