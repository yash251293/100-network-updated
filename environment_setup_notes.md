# Environment Variable Setup for JWT Authentication

For the JWT-based authentication to function securely, a `JWT_SECRET` environment variable **must** be defined in your server environment.

## `JWT_SECRET`

*   **Purpose**: This is a secret key used to sign and verify JSON Web Tokens. It ensures that tokens are legitimate and have not been tampered with.
*   **Security**: This secret key must be kept confidential and should **never** be committed to version control or exposed to the client-side.
*   **Generation**: Generate a strong, random string for this secret. A good way to generate one is using a command like:
    ```bash
    openssl rand -hex 32
    ```
    This will produce a 64-character hexadecimal string.
*   **Usage**:
    *   **Development**: Create a `.env.local` file in the root of your project (if it doesn't exist) and add the secret:
        ```
        JWT_SECRET=your_generated_strong_secret_here
        ```
        Ensure `.env.local` is listed in your `.gitignore` file.
    *   **Production**: Set this environment variable in your deployment platform's settings (e.g., Vercel, Netlify, AWS, Docker environment variables).

**Example `.env.local` entry:**

```
POSTGRES_URL=postgresql://flexbone_user:flexbone_password@localhost:5432/flexbone_db
JWT_SECRET=your_generated_strong_random_string_here_e_g_output_from_openssl_rand_hex_32
```

**Important**: The application will fail to generate or verify JWTs correctly if `JWT_SECRET` is not set, leading to login failures and inability to access protected API routes. The server logs will indicate if the `JWT_SECRET` is missing.
