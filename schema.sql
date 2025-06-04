-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Profiles Table
-- One-to-one relationship with users table
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(255),
    headline VARCHAR(255),
    bio TEXT,
    location VARCHAR(255),
    linkedin_url VARCHAR(255) UNIQUE,
    github_url VARCHAR(255) UNIQUE,
    website_url VARCHAR(255),
    phone VARCHAR(255),
    job_type VARCHAR(100),
    experience_level VARCHAR(100),
    remote_work_preference VARCHAR(100),
    preferred_industries TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY(id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Skills Table (Master list of all available skills)
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Skills Table (Join table for user's skills)
-- Many-to-many relationship between users and skills
CREATE TABLE user_skills (
    user_id UUID,
    skill_id INTEGER,
    proficiency_level VARCHAR(50), -- e.g., "Beginner", "Intermediate", "Advanced"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, skill_id),
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_skill
        FOREIGN KEY(skill_id)
        REFERENCES skills(id)
        ON DELETE CASCADE
);

-- Optional: Triggers to update updated_at timestamps

-- For users table
CREATE OR REPLACE FUNCTION update_updated_at_users()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_users();

-- For profiles table
CREATE OR REPLACE FUNCTION update_updated_at_profiles()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_profiles();

-- Note: `skills` and `user_skills` tables might not need `updated_at` triggers
-- if their records are generally immutable or updates are not critical to track this way.
-- `skills.name` is unique and shouldn't change often.
-- `user_skills` entries might be deleted and re-added, or proficiency_level updated.
-- If `user_skills.proficiency_level` updates need to refresh `updated_at`, a trigger can be added.

CREATE OR REPLACE FUNCTION update_updated_at_user_skills()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP; -- Assuming user_skills will have an updated_at column
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- If you add an `updated_at` column to `user_skills`:
-- ALTER TABLE user_skills ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
-- CREATE TRIGGER trigger_user_skills_updated_at
-- BEFORE UPDATE ON user_skills
-- FOR EACH ROW
-- EXECUTE FUNCTION update_updated_at_user_skills();

-- Indexes for performance

-- On users table
CREATE INDEX idx_users_email ON users(email);

-- On profiles table
-- id is primary key, already indexed. Consider indexing other frequently queried columns if any.
CREATE INDEX idx_profiles_linkedin_url ON profiles(linkedin_url);
CREATE INDEX idx_profiles_github_url ON profiles(github_url);

-- On skills table
CREATE INDEX idx_skills_name ON skills(name);

-- On user_skills table
-- Primary key (user_id, skill_id) is already indexed.
-- Consider an index on skill_id if you frequently query for all users with a specific skill.
CREATE INDEX idx_user_skills_skill_id ON user_skills(skill_id);


-- User Experience Table
CREATE TABLE user_experience (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL, -- Changed from 'company' to 'company_name' to avoid SQL keyword clash if any
    location VARCHAR(255),
    start_date DATE, -- Storing as DATE, frontend will need to provide YYYY-MM-01 if only month is given
    end_date DATE,
    current_job BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_experience_user_id ON user_experience(user_id);

-- Trigger for user_experience updated_at
CREATE OR REPLACE FUNCTION update_updated_at_user_experience()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_experience_updated_at
BEFORE UPDATE ON user_experience
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_user_experience();


-- User Education Table
CREATE TABLE user_education (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    school_name VARCHAR(255) NOT NULL,
    degree VARCHAR(255),
    field_of_study VARCHAR(255),
    start_date DATE, -- Storing as DATE
    end_date DATE,
    current_student BOOLEAN DEFAULT FALSE,
    description TEXT, -- Optional field for notes or achievements
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_education_user_id ON user_education(user_id);

-- Trigger for user_education updated_at
CREATE OR REPLACE FUNCTION update_updated_at_user_education()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_education_updated_at
BEFORE UPDATE ON user_education
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_user_education();
