# API Routes Analysis

This document provides a detailed analysis of the API routes found in `app/api/`, covering their purpose, functionality, database interactions, security considerations, and potential areas for improvement.

## Identified API Endpoints:

*   **`POST /api/auth/login`**: Handles user login.
*   **`POST /api/auth/signup`**: Handles user registration.
*   **`POST /api/auth/request-password-reset`**: Initiates the password reset process.
*   **`POST /api/auth/reset-password`**: Completes the password reset process.
*   **`GET /api/profile`**: Fetches user profile data.
*   **`POST /api/profile`**: Updates user profile data.
*   **`POST /api/upload-avatar`**: Handles user avatar image uploads (development only).

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
    *   **Success (200)**: `NextResponse.json({ success: true, message: 'Login successful!', token: generatedJwtToken, user: { id, email } })`. The `token` is a JSON Web Token.
    *   **Error - Invalid JSON (400)**: `NextResponse.json({ success: false, message: 'Invalid request body...' })`.
    *   **Error - Invalid Credentials (401)**: `NextResponse.json({ success: false, message: 'Invalid credentials...' })` or `NextResponse.json({ success: false, message: 'Invalid email or password.' })`.
    *   **Error - Server Error (500)**: `NextResponse.json({ success: false, message: 'An error occurred...' })`.

*   **Validation, Error Handling & Security**:
    *   **Validation**: Basic check for the presence and string type of `email` and `password`.
    *   **Error Handling**: Catches errors during JSON parsing and database operations, returning appropriate status codes and messages.
    *   **Security**:
        *   Uses `bcryptjs.compare` for secure password verification.
        *   Returns a generic "Invalid email or password" message to avoid revealing registered emails.
        *   Generates a JWT using `jsonwebtoken` library, signing with `process.env.JWT_SECRET`.
        *   JWT payload is `{ userId: user.id }`.
        *   JWT expiration is set to `1h` (1 hour).

*   **Potential Improvements**:
    *   **Input Validation**: Implement more robust input validation (e.g., using Zod) for email format.
    *   **Rate Limiting**: Consider adding rate limiting to prevent brute-force attacks.
    *   **Logging**: Enhance logging for security auditing.

---

## `app/api/auth/signup/route.ts` (`POST /api/auth/signup`)

*   **Purpose**:
    Registers a new user with their email, password, first name, and last name.

*   **HTTP Method**: `POST`

*   **Request Body**:
    *   `email` (string, required)
    *   `password` (string, required, min 8 characters)
    *   `firstName` (string, required)
    *   `lastName` (string, required)

*   **Database Interaction**:
    *   Uses `query` from `@/lib/db`.
    *   Checks if a user with the given email already exists in the `users` table.
    *   Uses `bcryptjs.hash` (with a salt round of 10) to securely hash the provided password.
    *   Inserts the new user into the `users` table (email, password_hash), returning the new `id`.
    *   Inserts the associated profile information into the `profiles` table (user_id, first_name, last_name).

*   **Response Structure**:
    *   **Success (201)**: `NextResponse.json({ success: true, message: 'Signup successful! Please check your email to verify your account.', userId })` (Note: Email verification is mentioned but not implemented in this route directly).
    *   **Error - Invalid JSON (400)**: `NextResponse.json({ success: false, message: 'Invalid request body...' })`.
    *   **Error - Missing Fields (400)**: `NextResponse.json({ success: false, message: 'Missing required fields...' })`.
    *   **Error - Password Too Short (400)**: `NextResponse.json({ success: false, message: 'Password must be at least 8 characters long.' })`.
    *   **Error - User Exists (409 Conflict)**: `NextResponse.json({ success: false, message: 'User with this email already exists.' })`.
    *   **Error - Server Error (500)**: `NextResponse.json({ success: false, message: 'An error occurred...' })`.

*   **Validation, Error Handling & Security**:
    *   **Validation**: Checks for presence of required fields and enforces a minimum password length of 8 characters.
    *   **Error Handling**: Catches errors for JSON parsing, database operations, and specific conditions.
    *   **Security**: Uses `bcryptjs.hash` for secure password storage.

*   **Potential Improvements/Notes**:
    *   **Input Validation (Zod)**: Use Zod for comprehensive validation (email format, password complexity, name lengths).
    *   **Transactional Operations**: **Crucial**: The creation of a user in `users` and their profile in `profiles` **should be wrapped in a database transaction** to ensure atomicity. If profile creation fails, user creation should be rolled back. This is a suggested improvement and not currently implemented.
    *   **Password Strength**: Enhance password strength requirements beyond the 8-character minimum.
    *   **Email Verification Flow**: Implement the actual email verification logic (e.g., sending a tokenized link via email).

---

## `app/api/profile/route.ts` (`GET /api/profile`, `POST /api/profile`)

*   **Purpose**:
    *   `GET`: Fetches the consolidated profile information for the authenticated user.
    *   `POST`: Updates (or creates) the profile information for the authenticated user.

*   **HTTP Method(s)**: `GET`, `POST`

*   **Authentication**:
    *   Both `GET` and `POST` methods now use the `verifyAuthToken` utility from `lib/authUtils.ts`.
    *   This utility is expected to verify a JWT passed in the `Authorization: Bearer <token>` header of the request.
    *   If the token is valid, it returns the `userId`; otherwise, it throws an error or returns null, leading to a 401/403 response.

---

### `GET /api/profile`

*   **Request Processing**:
    *   Relies on `verifyAuthToken` to extract `userId` from the JWT.

*   **Database Interaction**:
    *   If `userId` is obtained:
        *   Fetches basic user data (email) from the `users` table.
        *   Fetches profile data from the `profiles` table (bio, location, website, avatar_url, phone, job_type, experience_level, remote_work_preference, preferred_industries).
        *   Fetches associated skills by joining `user_skills` and `skills` tables.
        *   Fetches work experience from `user_experience` table (title, company_name, location, start_date, end_date, current, description).
        *   Fetches education history from `user_education` table (school_name, degree, field_of_study, start_date, end_date, current).
    *   Data is then consolidated into a single JSON object.
    *   Field name mapping occurs (e.g., `company_name` to `company`, `school_name` to `school`, `avatar_url` to `profilePicture`, `website_url` to `website`).
    *   Dates (start_date, end_date) are formatted to `YYYY-MM` using `formatDateToYearMonth` helper.

*   **Response Structure**:
    *   **Success (200)**: `NextResponse.json(consolidatedProfile)` containing all user profile details.
    *   **Error - Authentication Failed (401/403)**: `NextResponse.json({ error: 'Authentication failed' })` or similar, if token is invalid or missing.
    *   **Error - Profile Not Found (404)**: If user/profile data isn't found for a valid `userId`.
    *   **Error - Server Error (500)**: `NextResponse.json({ error: 'Failed to fetch profile data', details: ... })`.

*   **Validation, Error Handling & Security**:
    *   **Validation**: No explicit input validation for the GET request itself beyond token validation.
    *   **Error Handling**: Catches errors during database operations. Date formatting helper has its own error handling.
    *   **Security**: Relies on JWT validation.

*   **Potential Improvements/Notes**:
    *   **Data Transformation Layer**: Consider a more formal data transformation layer for complex applications.
    *   **Selective Fields**: Allow clients to request specific parts of the profile (e.g., via query parameters) to reduce payload size if needed.

---

### `POST /api/profile`

*   **Request Processing**:
    *   Relies on `verifyAuthToken` to extract `userId` from the JWT.
    *   Expects a JSON body (`profileData`) containing various profile fields, and arrays for `skills`, `experience`, and `education`.

*   **Database Interaction**:
    *   Uses `query` from `@/lib/db`.
    *   **Transactions**: All database modifications are wrapped in a transaction (`BEGIN`, `COMMIT`, `ROLLBACK`).
    *   **Profiles Table**: Performs an UPSERT (INSERT ... ON CONFLICT ... DO UPDATE) into the `profiles` table. Handles fields like `bio`, `location`, `website_url`, `avatar_url`, `phone`, `job_type`, `experience_level`, `remote_work_preference`, `preferred_industries`.
    *   **Skills**:
        *   Deletes all existing skills for the user from `user_skills`.
        *   Iterates through the provided `skills` array (assumed to be skill names).
        *   For each skill name, it finds an existing skill in the `skills` table or creates a new one (INSERT ... ON CONFLICT ... DO NOTHING).
        *   Inserts the skill association into `user_skills`.
    *   **Experience & Education**:
        *   Deletes all existing experience/education records for the user from `user_experience` / `user_education`.
        *   Iterates through the provided `experience`/`education` arrays and inserts new records.
        *   Validates essential fields (e.g., `title` & `company` for experience; `school` for education) before insertion.
        *   Dates are processed: `YYYY-MM` from input is converted to `YYYY-MM-01` for database storage. Handles `current` flag for dates.

*   **Response Structure**:
    *   **Success (200)**: `NextResponse.json({ message: 'Profile updated successfully' })`.
    *   **Error - Authentication Failed (401/403)**: `NextResponse.json({ error: 'Authentication failed' })`.
    *   **Error - Invalid Request Body (400)**: If JSON parsing fails or essential data is malformed.
    *   **Error - Server Error (500)**: `NextResponse.json({ error: 'Failed to update profile data', details: ... })`. Includes a `ROLLBACK` in case of error.

*   **Validation, Error Handling & Security**:
    *   **Validation**:
        *   Basic checks for presence of key fields within loops for skills, experience, and education.
        *   Relies on the database for some implicit validation (e.g., foreign key constraints).
    *   **Error Handling**: Uses transactions. Catches errors during database operations.
    *   **Security**: Relies on JWT validation. Delete-then-insert pattern for related entities is authorized.

*   **Potential Improvements/Notes**:
    *   **Input Validation (Zod)**: **Crucial**: Implement thorough validation of the entire `profileData` payload using a library like Zod before database operations.
    *   **Partial Updates (PATCH)**: Consider a `PATCH` method for more granular updates to avoid replacing entire collections like skills, experience, or education if only small changes are needed.
    *   **Data Sanitization**: Ensure inputs are sanitized if directly used in dynamic queries (though parameterized queries are generally safe).
    *   **Error Reporting**: More granular error messages for specific validation failures.

---

## `app/api/auth/request-password-reset/route.ts` (`POST /api/auth/request-password-reset`)

*   **Purpose**:
    Initiates the password reset process for a user by generating a unique, time-limited token and sending it to their registered email address.

*   **HTTP Method**: `POST`

*   **Request Body**:
    *   `email` (string, required): The email address of the user requesting a password reset.

*   **Functionality**:
    1.  **Find User**: Retrieves the user from the `users` table based on the provided email.
    2.  **Token Generation**:
        *   Generates a cryptographically secure random token (e.g., 32 bytes, hex encoded) using `crypto.randomBytes`. This is the plaintext token.
        *   Hashes this plaintext token using `crypto.createHash('sha256')` for storage in the database.
    3.  **Store Token**:
        *   Updates the user's record in the `users` table, storing the `reset_token_hash` (the hashed version of the token) and `reset_token_expires_at` (typically 1 hour from the current time).
        *   **Database Schema Change**: Requires `users` table to have `reset_token_hash` (TEXT or VARCHAR) and `reset_token_expires_at` (TIMESTAMP WITH TIME ZONE) columns.
    4.  **Email Construction**:
        *   Constructs a password reset URL including the plaintext token (e.g., `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${plaintextToken}`).
    5.  **Send Email**:
        *   Uses `nodemailer` to send an email to the user.
        *   For development, uses Ethereal Email (or a similar service like Mailtrap) for testing email sending.
        *   The email contains the password reset link.
    6.  **Response**: Returns a generic success message to the client, regardless of whether the email exists or not, to prevent email enumeration.

*   **Response Structure**:
    *   **Success (200)**: `NextResponse.json({ message: "If your email is in our system, you will receive a password reset link shortly." })`
    *   **Error - Invalid Request (400)**: If email is missing or malformed.
    *   **Error - Server Error (500)**: `NextResponse.json({ error: "An internal error occurred." })` (e.g., email sending failure, database error).

*   **Validation, Error Handling & Security**:
    *   **Input Validation**: Validate email format.
    *   **Security**:
        *   **Email Enumeration Prevention**: Always returns a generic success message.
        *   **Secure Token**: Uses `crypto.randomBytes` for strong token generation.
        *   **Token Hashing**: Stores only the hash of the reset token in the database.
        *   **Time-Limited Tokens**: Tokens expire to reduce the window of opportunity for misuse.
    *   **Error Handling**: Catches errors during database operations or email sending.

*   **Potential Improvements/Notes**:
    *   **Production Email Service**: For production, configure `nodemailer` with a robust email sending service (e.g., SendGrid, AWS SES, Postmark).
    *   **Rate Limiting**: Implement rate limiting on this endpoint to prevent abuse (e.g., flooding users with reset emails).
    *   **User Feedback**: Consider more specific (but still secure) feedback if possible, or detailed logging for admins.
    *   **Database Schema**: Ensure `users` table has `reset_token_hash` and `reset_token_expires_at` columns.

---

## `app/api/auth/reset-password/route.ts` (`POST /api/auth/reset-password`)

*   **Purpose**:
    Allows a user to set a new password using a valid, non-expired reset token.

*   **HTTP Method**: `POST`

*   **Request Body**:
    *   `token` (string, required): The plaintext password reset token received by the user (typically from the URL).
    *   `newPassword` (string, required, min 8 characters): The user's desired new password.

*   **Functionality**:
    1.  **Validate Input**: Checks if `token` and `newPassword` are provided and if `newPassword` meets length requirements (min 8 characters).
    2.  **Hash Incoming Token**: Hashes the provided plaintext `token` using the same algorithm as during generation (e.g., `crypto.createHash('sha256')`) to compare with the stored hash.
    3.  **Find User by Token**:
        *   Queries the `users` table for a user whose `reset_token_hash` matches the hashed incoming token.
        *   Crucially, also checks that `reset_token_expires_at` is greater than the current time (`NOW()`).
    4.  **Verify User and Token**: If no user is found, or the token is expired, the request is invalid.
    5.  **Update Password**:
        *   Hashes the `newPassword` using `bcryptjs.hash`.
        *   Updates the user's `password_hash` in the `users` table with the new hashed password.
        *   Nullifies `reset_token_hash` and `reset_token_expires_at` to ensure the token cannot be reused.
    6.  **Response**: Returns a success message.

*   **Response Structure**:
    *   **Success (200)**: `NextResponse.json({ message: "Password has been reset successfully." })`
    *   **Error - Invalid/Expired Token (400)**: `NextResponse.json({ error: "Invalid or expired password reset token." })`
    *   **Error - Missing Fields (400)**: `NextResponse.json({ error: "Token and new password are required." })`
    *   **Error - Password Too Short (400)**: `NextResponse.json({ error: "Password must be at least 8 characters long." })`
    *   **Error - Server Error (500)**: `NextResponse.json({ error: "An internal error occurred." })`

*   **Validation, Error Handling & Security**:
    *   **Input Validation**: Validates presence of token and new password, and new password length.
    *   **Security**:
        *   **Token Verification**: Compares the hash of the incoming token with the stored hash.
        *   **Token Expiry Check**: Ensures the token is not expired.
        *   **Token Invalidation**: Clears the reset token fields after successful password reset to prevent reuse.
        *   **Secure Password Hashing**: Uses `bcryptjs.hash` for the new password.

*   **Potential Improvements/Notes**:
    *   **Password Strength Rules**: Enforce stronger password complexity rules beyond minimum length.
    *   **Inform User of Success**: Optionally, send an email notification to the user that their password has been changed.
    *   **Rate Limiting**: Consider rate limiting on attempts to prevent guessing tokens (though tokens should be long and random enough to make this infeasible).

---

## `app/api/upload-avatar/route.ts` (`POST /api/upload-avatar`)

*   **Purpose**:
    Handles uploading of user avatar images. **This implementation is intended for DEVELOPMENT ONLY.**

*   **HTTP Method**: `POST`

*   **Request Body**:
    *   `FormData` containing a file field named `avatar`.

*   **Functionality**:
    1.  **Authentication (Implied)**: While not explicitly detailed in the provided snippets for this specific route, any route handling user-specific data like an avatar *must* be authenticated. It should use `verifyAuthToken` or similar to identify the user.
    2.  **File Handling**:
        *   Retrieves the uploaded file from the `FormData`.
        *   Validates file presence (is a file uploaded?).
        *   Validates file type (e.g., `image/jpeg`, `image/png`, `image/gif`).
        *   Validates file size (e.g., max 5MB).
    3.  **File Storage (Local Filesystem - DEV ONLY)**:
        *   Generates a unique filename (e.g., using a timestamp or UUID + original extension).
        *   Saves the file to a publicly accessible directory on the local filesystem (e.g., `public/uploads/avatars/[uniqueFilename]`).
        *   The `public` directory in Next.js allows direct access to its contents.
    4.  **Response**: Returns the relative URL path to the uploaded image.

*   **Response Structure**:
    *   **Success (200)**: `NextResponse.json({ message: "Avatar uploaded successfully", url: "/uploads/avatars/[uniqueFilename]" })`
    *   **Error - No File (400)**: `NextResponse.json({ error: "No avatar file provided." })`
    *   **Error - Invalid File Type (400)**: `NextResponse.json({ error: "Invalid file type. Only images are allowed." })`
    *   **Error - File Too Large (400)**: `NextResponse.json({ error: "File is too large. Maximum size is 5MB." })`
    *   **Error - Authentication Failed (401/403)**: If authentication is implemented and fails.
    *   **Error - Server Error (500)**: `NextResponse.json({ error: "Failed to upload avatar." })` (e.g., filesystem write error).

*   **Validation, Error Handling & Security**:
    *   **Validation**: Checks for file presence, type, and size.
    *   **Security/Notes**:
        *   **DEVELOPMENT ONLY**: This local filesystem storage approach is **NOT SUITABLE FOR PRODUCTION** in serverless environments (like Vercel) due to their ephemeral filesystems. Files uploaded this way will be lost on subsequent deployments or instance restarts.
        *   **Production Solution**: For production, use a cloud storage service like AWS S3, Google Cloud Storage, Cloudinary, or Vercel Blob Storage. The backend would then typically generate a presigned URL for the client to upload directly to the storage provider, or stream the file through the backend to the provider.
        *   **File Naming**: Ensure unique filenames to prevent overwrites.
        *   **Path Traversal**: Sanitize filenames to prevent path traversal attacks if user-provided names influence the path (though using UUIDs is safer).
        *   **Authentication**: Must be implemented to associate avatars with users.

*   **Potential Improvements/Notes (beyond DEV ONLY concern)**:
    *   **Image Optimization**: Consider optimizing images (compressing, resizing) after upload.
    *   **Database Update**: After successful upload, the URL of the avatar (from cloud storage in production) should be saved in the user's profile in the database (e.g., `profiles.avatar_url`). This route currently only returns the URL.

This detailed analysis should provide a good foundation for understanding the API's current state and identifying key areas for enhancement.
