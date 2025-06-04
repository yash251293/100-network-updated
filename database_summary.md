# Database Summary

## Schema Details (`schema.sql`)

The database schema defines tables for managing users, their profiles, skills, work experience, and education.

### Tables and Relationships:

1.  **`users` Table:**
    *   Stores core user information.
    *   `id`: UUID, Primary Key, defaults to `gen_random_uuid()`.
    *   `email`: VARCHAR(255), Unique, Not Null.
    *   `password_hash`: VARCHAR(255), Not Null.
    *   `created_at`: TIMESTAMP WITH TIME ZONE, defaults to `CURRENT_TIMESTAMP`.
    *   `updated_at`: TIMESTAMP WITH TIME ZONE, defaults to `CURRENT_TIMESTAMP`.

2.  **`profiles` Table:**
    *   Stores extended user profile information.
    *   **Relationship**: One-to-one with `users` table via `id`.
    *   `id`: UUID, Primary Key, Foreign Key referencing `users(id)` (ON DELETE CASCADE).
    *   `first_name`: VARCHAR(100).
    *   `last_name`: VARCHAR(100).
    *   `avatar_url`: VARCHAR(255).
    *   `headline`: VARCHAR(255).
    *   `bio`: TEXT.
    *   `location`: VARCHAR(255).
    *   `linkedin_url`: VARCHAR(255), Unique.
    *   `github_url`: VARCHAR(255), Unique.
    *   `website_url`: VARCHAR(255).
    *   `phone`: VARCHAR(255).
    *   `job_type`: VARCHAR(100).
    *   `experience_level`: VARCHAR(100).
    *   `remote_work_preference`: VARCHAR(100).
    *   `preferred_industries`: TEXT.
    *   `created_at`: TIMESTAMP WITH TIME ZONE, defaults to `CURRENT_TIMESTAMP`.
    *   `updated_at`: TIMESTAMP WITH TIME ZONE, defaults to `CURRENT_TIMESTAMP`.

3.  **`skills` Table:**
    *   Master list of all available skills.
    *   `id`: SERIAL, Primary Key.
    *   `name`: VARCHAR(100), Unique, Not Null.
    *   `created_at`: TIMESTAMP WITH TIME ZONE, defaults to `CURRENT_TIMESTAMP`.

4.  **`user_skills` Table:**
    *   Join table for user's skills.
    *   **Relationship**: Many-to-many between `users` and `skills`.
    *   `user_id`: UUID, Foreign Key referencing `users(id)` (ON DELETE CASCADE).
    *   `skill_id`: INTEGER, Foreign Key referencing `skills(id)` (ON DELETE CASCADE).
    *   `proficiency_level`: VARCHAR(50) (e.g., "Beginner", "Intermediate", "Advanced").
    *   `created_at`: TIMESTAMP WITH TIME ZONE, defaults to `CURRENT_TIMESTAMP`.
    *   Primary Key: (`user_id`, `skill_id`).
    *   (Note: An `updated_at` column and corresponding trigger are suggested as optional if tracking updates to `proficiency_level` is needed).

5.  **`user_experience` Table:**
    *   Stores user's work experience.
    *   `id`: SERIAL, Primary Key.
    *   `user_id`: UUID, Foreign Key referencing `users(id)` (ON DELETE CASCADE).
    *   `title`: VARCHAR(255), Not Null.
    *   `company_name`: VARCHAR(255), Not Null.
    *   `location`: VARCHAR(255).
    *   `start_date`: DATE.
    *   `end_date`: DATE.
    *   `current_job`: BOOLEAN, defaults to `FALSE`.
    *   `description`: TEXT.
    *   `created_at`: TIMESTAMP WITH TIME ZONE, defaults to `CURRENT_TIMESTAMP`.
    *   `updated_at`: TIMESTAMP WITH TIME ZONE, defaults to `CURRENT_TIMESTAMP`.

6.  **`user_education` Table:**
    *   Stores user's education history.
    *   `id`: SERIAL, Primary Key.
    *   `user_id`: UUID, Foreign Key referencing `users(id)` (ON DELETE CASCADE).
    *   `school_name`: VARCHAR(255), Not Null.
    *   `degree`: VARCHAR(255).
    *   `field_of_study`: VARCHAR(255).
    *   `start_date`: DATE.
    *   `end_date`: DATE.
    *   `current_student`: BOOLEAN, defaults to `FALSE`.
    *   `description`: TEXT.
    *   `created_at`: TIMESTAMP WITH TIME ZONE, defaults to `CURRENT_TIMESTAMP`.
    *   `updated_at`: TIMESTAMP WITH TIME ZONE, defaults to `CURRENT_TIMESTAMP`.

### Triggers:

*   Triggers are defined to automatically update the `updated_at` column to the current timestamp whenever a row is updated in the following tables:
    *   `users` (function `update_updated_at_users`)
    *   `profiles` (function `update_updated_at_profiles`)
    *   `user_experience` (function `update_updated_at_user_experience`)
    *   `user_education` (function `update_updated_at_user_education`)
*   A function `update_updated_at_user_skills` is defined, and its trigger can be enabled if an `updated_at` column is added to `user_skills`.

### Indexes:

*   **`users` Table:**
    *   `idx_users_email` ON `users(email)`.
*   **`profiles` Table:**
    *   `idx_profiles_linkedin_url` ON `profiles(linkedin_url)`.
    *   `idx_profiles_github_url` ON `profiles(github_url)`.
*   **`skills` Table:**
    *   `idx_skills_name` ON `skills(name)`.
*   **`user_skills` Table:**
    *   `idx_user_skills_skill_id` ON `user_skills(skill_id)`.
*   **`user_experience` Table:**
    *   `idx_user_experience_user_id` ON `user_experience(user_id)`.
*   **`user_education` Table:**
    *   `idx_user_education_user_id` ON `user_education(user_id)`.
*   Primary keys are automatically indexed.

## PostgreSQL Setup Instructions (`POSTGRESQL_SETUP.md`)

This document outlines the steps to set up a PostgreSQL database environment for the project.

### 1. Installation:

*   **Ubuntu/Debian:**
    ```bash
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
    ```
*   **macOS (Homebrew):**
    ```bash
    brew install postgresql
    brew services start postgresql
    ```
    (Path for `pg_ctl` might vary, e.g., `/usr/local/var/postgres` or `/opt/homebrew/var/postgres`).

### 2. Start PostgreSQL Service:

*   **Ubuntu/Debian (systemd):**
    ```bash
    sudo systemctl start postgresql
    sudo systemctl enable postgresql # Optional
    sudo systemctl status postgresql
    ```
*   **macOS (Homebrew):**
    Handled by `brew services start postgresql`. Manual start: `pg_ctl -D /usr/local/var/postgres start`.

### 3. Create Database and User:

*   Access `psql`: `sudo -u postgres psql` (or `psql postgres` / `psql` on macOS).
*   SQL Commands:
    ```sql
    CREATE USER flexbone_user WITH PASSWORD 'flexbone_password'; -- !!CHANGE PASSWORD IN PRODUCTION!!
    CREATE DATABASE flexbone_db OWNER flexbone_user;
    ```
*   Connect to verify: `\c flexbone_db`
*   Exit `psql`: `\q`

### 4. Grant Privileges:

*   Access `psql` (as superuser, potentially connecting directly to `flexbone_db`).
*   SQL Commands:
    ```sql
    GRANT ALL PRIVILEGES ON DATABASE flexbone_db TO flexbone_user;
    -- For schema 'public' (if using schema.sql)
    GRANT ALL PRIVILEGES ON SCHEMA public TO flexbone_user;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO flexbone_user;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO flexbone_user;
    GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO flexbone_user;
    -- For future objects
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO flexbone_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO flexbone_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO flexbone_user;
    ```

### 5. Apply Schema:

*   After setup, run the `schema.sql` file:
    ```bash
    psql -U flexbone_user -d flexbone_db -h localhost -f path/to/your/schema.sql
    ```
    (You will be prompted for `flexbone_password`).

### 6. Configure Client Authentication (`pg_hba.conf`):

*   **Purpose**: Controls which hosts can connect, users, databases, and authentication methods.
*   **Find `pg_hba.conf`**: In `psql`, run `SHOW hba_file;`.
    *   Common Ubuntu: `/etc/postgresql/<VERSION>/main/pg_hba.conf`
    *   Common macOS: `/usr/local/var/postgres/pg_hba.conf` or `/opt/homebrew/var/postgres/pg_hba.conf`
*   **Edit `pg_hba.conf`**: Add/modify lines to allow `flexbone_user` to connect to `flexbone_db` using `md5` or `scram-sha-256` (more secure) password authentication. Example entries:
    ```
    # TYPE  DATABASE        USER            ADDRESS                 METHOD
    local   flexbone_db     flexbone_user                           md5  # Or scram-sha-256
    host    flexbone_db     flexbone_user   127.0.0.1/32            md5  # Or scram-sha-256
    host    flexbone_db     flexbone_user   ::1/128                 md5  # Or scram-sha-256
    ```
*   **Reload PostgreSQL Configuration**:
    *   Ubuntu/Debian: `sudo systemctl reload postgresql`
    *   macOS (Homebrew): `brew services reload postgresql` or `pg_ctl -D /path/to/data_directory reload`
    *   Or via SQL: `SELECT pg_reload_conf();`

**Security Note**: The setup guide uses `flexbone_password` as a placeholder. **This password must be changed to a strong, unique password in any real or production environment.**
