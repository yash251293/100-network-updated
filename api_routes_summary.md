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
*   **`POST /api/jobs`**: Creates a new job posting.
*   **`GET /api/jobs`**: Fetches job postings with filtering and pagination.
*   **`GET /api/jobs/{id}`**: Fetches details of a specific job posting.
*   **`PUT /api/jobs/{id}`**: Updates a specific job posting.
*   **`DELETE /api/jobs/{id}`**: Deletes a specific job posting.
*   **`POST /api/jobs/{id}/apply`**: Submits an application for a specific job.
*   **`GET /api/job-applications`**: Fetches job applications with filtering and pagination.
*   **`POST /api/jobs/{id}/bookmark`**: Bookmarks a specific job.
*   **`DELETE /api/jobs/{id}/bookmark`**: Removes a bookmark from a specific job.
*   **`GET /api/job-bookmarks`**: Fetches all jobs bookmarked by the current user.

---

## `app/api/auth/login/route.ts` (`POST /api/auth/login`)

*   **Purpose**: Authenticates a user based on their email and password.
*   **HTTP Method**: `POST`
*   **Request Processing**: Expects JSON body with `email`, `password`.
*   **Database Interaction**: Retrieves user from `users` table, compares password hash.
*   **Response Structure**: Success (200) with JWT and user info; Error (400, 401, 500).
*   **Security**: Uses `bcryptjs.compare`, JWT for sessions.
*   **Improvements**: Zod validation, rate limiting.

---

## `app/api/auth/signup/route.ts` (`POST /api/auth/signup`)

*   **Purpose**: Registers a new user.
*   **HTTP Method**: `POST`
*   **Request Body**: `email`, `password`, `firstName`, `lastName`.
*   **Database Interaction**: Checks for existing user, hashes password, inserts into `users` and `profiles`.
*   **Response Structure**: Success (201) with `userId`; Error (400, 409, 500).
*   **Security**: `bcryptjs.hash`.
*   **Improvements**: Zod validation, **transactional operations for user/profile creation (CRITICAL)**, email verification flow.

---

## `app/api/profile/route.ts` (`GET /api/profile`, `POST /api/profile`)

*   **Purpose**: `GET` fetches profile; `POST` updates/creates profile.
*   **Authentication**: Uses `verifyAuthToken` (JWT).
*   **`GET /api/profile`**:
    *   **Database**: Fetches from `users`, `profiles`, `user_skills`, `skills`, `user_experience`, `user_education`. Consolidates data.
    *   **Response**: Success (200) with profile object; Error (401/403, 404, 500).
*   **`POST /api/profile`**:
    *   **Request Body**: JSON with profile fields, skills, experience, education arrays.
    *   **Database**: Uses transaction. UPSERT to `profiles`. Deletes and inserts related skills, experience, education.
    *   **Response**: Success (200); Error (401/403, 400, 500).
*   **Improvements**: Zod validation for POST, consider PATCH for partial updates.

---

## `app/api/auth/request-password-reset/route.ts` (`POST /api/auth/request-password-reset`)

*   **Purpose**: Initiates password reset by sending a tokenized email.
*   **HTTP Method**: `POST`
*   **Request Body**: `email`.
*   **Functionality**: Finds user, generates secure token (hashed for DB storage), stores hash and expiry in `users` table, sends email with reset link (plaintext token).
    *   **DB Schema Change**: Requires `users` table to have `reset_token_hash` and `reset_token_expires_at`.
*   **Response Structure**: Success (200) with generic message; Error (400, 500).
*   **Security**: Prevents email enumeration, secure token generation, token hashing, time-limited tokens.
*   **Improvements**: Production email service, rate limiting.

---

## `app/api/auth/reset-password/route.ts` (`POST /api/auth/reset-password`)

*   **Purpose**: Sets a new password using a valid reset token.
*   **HTTP Method**: `POST`
*   **Request Body**: `token` (plaintext), `newPassword`.
*   **Functionality**: Validates input, hashes incoming token, finds user by token hash and expiry, updates password hash, nullifies reset token fields.
*   **Response Structure**: Success (200); Error (400 for invalid token/password, 500).
*   **Security**: Token verification (hash comparison, expiry), token invalidation, bcryptjs for new password.
*   **Improvements**: Stronger password rules, email notification of password change.

---

## `app/api/upload-avatar/route.ts` (`POST /api/upload-avatar`)

*   **Purpose**: Handles avatar image uploads (DEVELOPMENT ONLY).
*   **HTTP Method**: `POST`
*   **Request Body**: `FormData` with `avatar` field.
*   **Functionality**: Validates file (presence, type, size), saves to local `public/uploads/avatars`.
*   **Response Structure**: Success (200) with image URL; Error (400 for file issues, 500).
*   **Security/Notes**: **NOT FOR PRODUCTION**. Use cloud storage (S3, GCS, Vercel Blob) in production. Authentication required. URL should be saved to user's profile.

---
---

## Job & Application Related API Endpoints

---

## `app/api/jobs/route.ts` (`POST /api/jobs`)

*   **Purpose**: Creates a new job posting.
*   **HTTP Method**: `POST`
*   **Authentication**: Required (uses `verifyAuthToken` to get `posted_by_user_id`).
*   **Request Body (Zod Schema: `jobSchema`)**:
    *   `companyId` (string, UUID)
    *   `title` (string, non-empty)
    *   `description` (string, non-empty)
    *   `responsibilities`, `requirements`, `benefits`, `location` (all optional strings)
    *   `jobType` (string, e.g., "Full-time")
    *   `experienceLevel` (string, optional)
    *   `salaryMin`, `salaryMax` (number, optional)
    *   `salaryCurrency` (string, optional, default 'USD')
    *   `salaryPeriod` (string, optional, default 'Annual')
    *   `applicationDeadline` (ISO date string, optional)
    *   `status` (string, default 'Draft')
    *   `skills` (array of strings, optional - skill names)
*   **Database Interaction**:
    *   Uses transaction (`BEGIN`, `COMMIT`, `ROLLBACK`).
    *   Inserts into `jobs` table.
    *   If `skills` are provided:
        *   For each skill: queries `skills` table (case-insensitive), inserts if new, gets `skill_id`.
        *   Inserts into `job_skills_link` table.
*   **Response Structure**:
    *   **Success (201 Created)**: `NextResponse.json({ success: true, message: 'Job created successfully', jobId: newJobId })`.
    *   **Error (400 Bad Request)**: For validation errors (Zod) or if `companyId` (foreign key) is invalid.
    *   **Error (401 Unauthorized)**: If authentication fails.
    *   **Error (500 Internal Server Error)**: For database or other server errors.
*   **Validation**: Uses Zod schema for request body. Refinement for `salaryMin <= salaryMax`.
*   **Security**: Authentication protects endpoint. Parameterized queries.

---

## `app/api/jobs/route.ts` (`GET /api/jobs`)

*   **Purpose**: Fetches a list of job postings with filtering and pagination.
*   **HTTP Method**: `GET`
*   **Authentication**: Not strictly required to view jobs, but user context might be used for personalized results in future (e.g., bookmark status - handled client-side for now).
*   **Query Parameters (Zod Schema: `getJobsQuerySchema`)**:
    *   `searchTerm` (string, optional)
    *   `jobType` (string, optional)
    *   `experienceLevel` (string, optional) - Note: This field is also used for "category" in freelance project filtering.
    *   `location` (string, optional)
    *   `skills` (comma-separated string of skill names, optional)
    *   `companyId` (UUID string, optional)
    *   `status` (string, optional, default "Open")
    *   `page` (number, default 1)
    *   `limit` (number, default 10)
    *   `sortBy` (enum: 'published_at', 'title', 'salary_min', 'created_at', default 'published_at')
    *   `sortOrder` (enum: 'asc', 'desc', default 'desc')
*   **Database Interaction**:
    *   Dynamically builds SQL query.
    *   SELECTs from `jobs (j)` and `companies (c)`.
    *   LEFT JOINs `job_skills_link (jsl)` and `skills (s)` to aggregate skill names (`STRING_AGG`).
    *   WHERE clauses for filters: `status`, `searchTerm` (searches `j.title`, `j.description`, `c.name`), `jobType`, `experienceLevel`, `location`, `companyId`.
    *   Skill filtering: If `skills` provided, finds jobs matching ALL specified skills using a subquery or CTE.
    *   GROUP BY `j.id, c.id` (and other non-aggregated columns).
    *   ORDER BY (sanitized `sortBy`) and LIMIT/OFFSET for pagination.
    *   Separate `COUNT(DISTINCT j.id)` query for total items matching filters.
*   **Response Structure**:
    *   **Success (200 OK)**: `NextResponse.json({ data: jobsWithSkills, pagination: { totalItems, totalPages, currentPage, pageSize } })`.
        *   `jobsWithSkills`: Array of job objects. `skills_list` (comma-separated) is split into an array. Description is truncated.
    *   **Error (400 Bad Request)**: For invalid query parameters (Zod).
    *   **Error (500 Internal Server Error)**: For database errors.
*   **Validation**: Uses Zod schema for query parameters. `sortBy` is sanitized.

---

## `app/api/jobs/[id]/route.ts` (`GET /api/jobs/{id}`)

*   **Purpose**: Fetches details for a specific job posting by its ID.
*   **HTTP Method**: `GET`
*   **Path Parameter**: `id` (Job ID, UUID).
*   **Authentication**: Not strictly required.
*   **Database Interaction**:
    *   SELECTs fields from `jobs (j)` and `companies (c)`.
    *   LEFT JOINs `job_skills_link (jsl)` and `skills (s)` to aggregate skill names.
    *   WHERE `j.id = $1`.
    *   GROUP BY `j.id, c.id` (and other non-aggregated columns).
*   **Response Structure**:
    *   **Success (200 OK)**: `NextResponse.json({ success: true, data: jobDetails })`.
        *   `jobDetails`: Object containing job fields, a nested `company` object, and `skills` array (from `skills_list`).
    *   **Error (400 Bad Request)**: If `id` is not a valid UUID (Zod validation).
    *   **Error (404 Not Found)**: If job with the given ID is not found.
    *   **Error (500 Internal Server Error)**: For database errors.
*   **Validation**: Path parameter `id` validated as UUID using Zod.

---

## `app/api/jobs/[id]/route.ts` (`PUT /api/jobs/{id}`)

*   **Purpose**: Updates an existing job posting.
*   **HTTP Method**: `PUT`
*   **Authentication**: Required. User must be the one who posted the job (`posted_by_user_id`).
*   **Path Parameter**: `id` (Job ID, UUID).
*   **Request Body (Zod Schema: `updateJobSchema` - all fields optional)**: Same fields as `POST /api/jobs`.
*   **Database Interaction**:
    *   Uses transaction.
    *   Verifies job ownership by comparing `posted_by_user_id` with authenticated `userId`.
    *   Dynamically constructs `UPDATE jobs` statement for provided fields. Sets `updated_at = CURRENT_TIMESTAMP`.
    *   If `skills` array is in request body:
        *   Deletes all existing skills for the job from `job_skills_link`.
        *   If new `skills` array is not empty, iterates, finds/creates skills in `skills` table, and inserts into `job_skills_link`.
*   **Response Structure**:
    *   **Success (200 OK)**: `NextResponse.json({ success: true, message: 'Job updated successfully' })`.
    *   **Error (400 Bad Request)**: For invalid `id` or body (Zod), or if `companyId` is invalid.
    *   **Error (401 Unauthorized)**: Authentication failure.
    *   **Error (403 Forbidden)**: If user does not own the job.
    *   **Error (404 Not Found)**: If job not found.
    *   **Error (500 Internal Server Error)**: For database errors.
*   **Validation**: Zod for path param and body. Ownership check.

---

## `app/api/jobs/[id]/route.ts` (`DELETE /api/jobs/{id}`)

*   **Purpose**: Deletes a specific job posting.
*   **HTTP Method**: `DELETE`
*   **Authentication**: Required. User must be the one who posted the job.
*   **Path Parameter**: `id` (Job ID, UUID).
*   **Database Interaction**:
    *   Verifies job ownership.
    *   `DELETE FROM jobs WHERE id = $1`.
    *   Related data in `job_skills_link`, `job_applications`, `user_job_bookmarks` should be handled by `ON DELETE CASCADE` in DB schema.
*   **Response Structure**:
    *   **Success (200 OK)**: `NextResponse.json({ success: true, message: 'Job deleted successfully' })`.
    *   **Error (400 Bad Request)**: If `id` is invalid (Zod).
    *   **Error (401 Unauthorized)**: Authentication failure.
    *   **Error (403 Forbidden)**: If user does not own the job.
    *   **Error (404 Not Found)**: If job not found.
    *   **Error (500 Internal Server Error)**: For database errors.
*   **Validation**: Zod for path param. Ownership check.

---

## `app/api/jobs/[id]/apply/route.ts` (`POST /api/jobs/{id}/apply`)

*   **Purpose**: Allows an authenticated user to apply for a specific job.
*   **HTTP Method**: `POST`
*   **Authentication**: Required (uses `verifyAuthToken` to get `userId`).
*   **Path Parameter**: `id` (Job ID, UUID).
*   **Request Body (Zod Schema: `applicationBodySchema`)**:
    *   `coverLetter` (string, optional)
    *   `resumeUrl` (string URL, optional)
*   **Database Interaction**:
    *   Checks if job exists and its `status` is 'Open'.
    *   Checks if user has already applied for this job in `job_applications`.
    *   Inserts new record into `job_applications` (`job_id`, `user_id`, `cover_letter`, `resume_url`, `application_date`, `status` set to 'Applied').
*   **Response Structure**:
    *   **Success (201 Created)**: `NextResponse.json({ success: true, message: 'Application submitted successfully', applicationId: newApplicationId })`.
    *   **Error (400 Bad Request)**: Invalid `id`/body (Zod), job not open, or already applied.
    *   **Error (401 Unauthorized)**: Authentication failure.
    *   **Error (404 Not Found)**: Job not found.
    *   **Error (500 Internal Server Error)**: Database errors.
*   **Validation**: Zod for path param and body. Business logic checks (job status, duplicate application).

---

## `app/api/job-applications/route.ts` (`GET /api/job-applications`)

*   **Purpose**: Fetches job applications with filtering and pagination, based on user roles/permissions.
*   **HTTP Method**: `GET`
*   **Authentication**: Required (uses `verifyAuthToken`). `requestingUserId` is extracted.
*   **Query Parameters (Zod Schema: `getApplicationsQuerySchema`)**:
    *   `userId` (UUID string, optional): To fetch applications for a specific user.
    *   `jobId` (UUID string, optional): To fetch applications for a specific job.
    *   `status` (string, optional)
    *   `page` (number, default 1), `limit` (number, default 10)
    *   `sortBy` (enum: 'application_date', 'j.title', 'c.name', default 'application_date')
    *   `sortOrder` (enum: 'asc', 'desc', default 'desc')
*   **Authorization**:
    *   If `userId` param is present: `userId` must match `requestingUserId` (unless admin).
    *   If `jobId` param is present: `requestingUserId` must be `posted_by_user_id` for the job (unless admin).
    *   If neither `userId` nor `jobId`: Defaults to applications for `requestingUserId`.
*   **Database Interaction**:
    *   SELECTs from `job_applications (ja)`.
    *   JOINs `jobs (j)`, `companies (c)`, `users (u)`, and `profiles (p)` to include job title, company name, applicant email, applicant name.
    *   WHERE clauses based on validated and authorized query params.
    *   ORDER BY (sanitized) and LIMIT/OFFSET.
    *   Separate `COUNT(DISTINCT ja.id)` query for total items.
*   **Response Structure**:
    *   **Success (200 OK)**: `NextResponse.json({ data: applications, pagination: { totalItems, totalPages, ... } })`.
    *   **Error (400 Bad Request)**: Invalid query params (Zod).
    *   **Error (401 Unauthorized)**: Authentication failure.
    *   **Error (403 Forbidden)**: Authorization failure.
    *   **Error (404 Not Found)**: If `jobId` provided for auth check is not found.
    *   **Error (500 Internal Server Error)**: Database errors.
*   **Validation**: Zod for query params. Authorization logic.

---

## `app/api/jobs/[id]/bookmark/route.ts` (`POST /api/jobs/{id}/bookmark`, `DELETE /api/jobs/{id}/bookmark`)

*   **Purpose**:
    *   `POST`: Allows an authenticated user to bookmark a job.
    *   `DELETE`: Allows an authenticated user to remove a job bookmark.
*   **HTTP Method(s)**: `POST`, `DELETE`
*   **Authentication**: Required (uses `verifyAuthToken` to get `userId`).
*   **Path Parameter**: `id` (Job ID, UUID, validated by Zod).
*   **Database Interaction**:
    *   Checks if job with `id` exists in `jobs` table (returns 404 if not).
    *   **`POST`**: `INSERT INTO user_job_bookmarks (user_id, job_id) ... ON CONFLICT (user_id, job_id) DO NOTHING`.
    *   **`DELETE`**: `DELETE FROM user_job_bookmarks WHERE user_id = $1 AND job_id = $2`.
*   **Response Structure**:
    *   **`POST` Success (201 Created)**: `NextResponse.json({ success: true, message: 'Job bookmarked successfully' })`. (Returns 201 even if `ON CONFLICT` did nothing, indicating state is achieved).
    *   **`DELETE` Success (200 OK)**: `NextResponse.json({ success: true, message: 'Bookmark removed successfully' })` (if `rowCount > 0`).
    *   **`DELETE` Not Found (404)**: `NextResponse.json({ success: false, message: 'Bookmark not found...' })` (if `rowCount === 0`).
    *   **Error (400 Bad Request)**: Invalid `id` (Zod).
    *   **Error (401 Unauthorized)**: Authentication failure.
    *   **Error (404 Not Found)**: If job to be bookmarked/unbookmarked doesn't exist.
    *   **Error (500 Internal Server Error)**: Database errors.
*   **Validation**: Zod for path param. Job existence check.

---

## `app/api/job-bookmarks/route.ts` (`GET /api/job-bookmarks`)

*   **Purpose**: Fetches all jobs bookmarked by the currently authenticated user, with pagination.
*   **HTTP Method**: `GET`
*   **Authentication**: Required (uses `verifyAuthToken` to get `userId`).
*   **Query Parameters (Zod Schema: `getBookmarksQuerySchema`)**:
    *   `page` (number, default 1), `limit` (number, default 10)
    *   `sortBy` (enum: 'bookmark_date', 'job_publish_date', 'job_title', default 'bookmark_date')
    *   `sortOrder` (enum: 'asc', 'desc', default 'desc')
*   **Database Interaction**:
    *   SELECTs from `user_job_bookmarks (ujb)`.
    *   JOINs `jobs (j)`, `companies (c)`.
    *   LEFT JOINs `job_skills_link (jsl)` and `skills (s)` to aggregate skill names.
    *   WHERE `ujb.user_id = $userId`.
    *   GROUP BY `ujb.created_at, j.id, c.id` (and other non-aggregated columns).
    *   ORDER BY (sanitized `sortBy` mapped to actual columns) and LIMIT/OFFSET.
    *   Separate `COUNT(*)` query on `user_job_bookmarks` for the user.
*   **Response Structure**:
    *   **Success (200 OK)**: `NextResponse.json({ data: bookmarkedJobs, pagination: { totalItems, ... } })`.
        *   `bookmarkedJobs`: Array of job objects, each including `bookmark_date`, job details, company details, and `skills_list` (converted to array). Job description truncated.
    *   **Error (400 Bad Request)**: Invalid query params (Zod).
    *   **Error (401 Unauthorized)**: Authentication failure.
    *   **Error (500 Internal Server Error)**: Database errors.
*   **Validation**: Zod for query params. `sortBy` mapped and sanitized.

This detailed analysis should provide a good foundation for understanding the API's current state and identifying key areas for enhancement.
