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

    -- New Freelancer Fields --
    is_available_for_freelance BOOLEAN DEFAULT FALSE NOT NULL,
    freelance_headline VARCHAR(255) NULL,
    freelance_bio TEXT NULL,
    portfolio_url VARCHAR(255) NULL,
    preferred_freelance_rate_type VARCHAR(50) NULL, -- e.g., 'hourly', 'fixed', 'negotiable'
    freelance_rate_value NUMERIC(10,2) NULL, -- Example: 12345678.90

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

-- Companies Table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(255),
    website_url VARCHAR(255),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    hq_location VARCHAR(255),
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Company can exist even if creator user is deleted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_industry ON companies(industry);

-- Trigger for companies updated_at
CREATE OR REPLACE FUNCTION update_updated_at_companies()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_companies();

-- Jobs Table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    posted_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    responsibilities TEXT,
    requirements TEXT,
    benefits TEXT,
    location VARCHAR(255),
    job_type VARCHAR(50) NOT NULL, -- e.g., Full-time, Part-time, Contract, Internship, Freelance Project
    experience_level VARCHAR(50), -- e.g., Entry, Mid-level, Senior
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(3) DEFAULT 'USD',
    salary_period VARCHAR(20) DEFAULT 'Annual', -- e.g., Annual, Hourly
    application_deadline TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft', -- e.g., Draft, Open, Closed, Filled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_posted_by_user_id ON jobs(posted_by_user_id);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_location ON jobs(location); -- For location-based searches
CREATE INDEX idx_jobs_published_at ON jobs(published_at); -- For ordering by publication date

-- Trigger for jobs updated_at
CREATE OR REPLACE FUNCTION update_updated_at_jobs()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_jobs();

-- Job Skills Link Table (Many-to-Many for Jobs and existing Skills table)
CREATE TABLE job_skills_link (
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (job_id, skill_id)
);

CREATE INDEX idx_job_skills_link_job_id ON job_skills_link(job_id);
CREATE INDEX idx_job_skills_link_skill_id ON job_skills_link(skill_id);

-- Job Applications Table
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- The applicant
    application_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'Applied', -- e.g., Applied, Under Review, Interview Scheduled, Offer Extended, Rejected, Withdrawn
    cover_letter TEXT,
    resume_url VARCHAR(255),
    notes TEXT, -- Internal notes by hiring team, or applicant's notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);

-- Trigger for job_applications updated_at
CREATE OR REPLACE FUNCTION update_updated_at_job_applications()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_job_applications_updated_at
BEFORE UPDATE ON job_applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_job_applications();

-- User Job Bookmarks Table
CREATE TABLE user_job_bookmarks (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id)
);

CREATE INDEX idx_user_job_bookmarks_user_id ON user_job_bookmarks(user_id);
CREATE INDEX idx_user_job_bookmarks_job_id ON user_job_bookmarks(job_id);


-- Messaging Tables --

-- Conversations Table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(10) NOT NULL CHECK (type IN ('one_on_one', 'group')),
    name VARCHAR(255), -- Nullable, primarily for group chats
    avatar_url VARCHAR(255), -- Nullable, primarily for group chats
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- User who initiated the group
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Stores timestamp of the last message or activity
);

CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_created_by_user_id ON conversations(created_by_user_id);

-- Conversation Participants Table
-- Junction table to link users to conversations
CREATE TABLE conversation_participants (
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(10) CHECK (role IN ('member', 'admin')), -- Nullable for 1-on-1, 'admin' for group creator, 'member' for others
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP WITH TIME ZONE, -- Tracks when the user last read messages in this conversation
    PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);

-- Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Message remains even if sender's account is deleted
    content_type VARCHAR(10) NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'file')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Status for sent/delivered/read - can be enhanced later
    -- For simplicity, we'll focus on created_at for ordering and assume 'sent' upon creation.
    -- Read status will be primarily managed by `conversation_participants.last_read_at`.
    -- An explicit message status (sent, delivered, read by specific recipients) is more complex.
    status VARCHAR(10) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read'))
);

CREATE INDEX idx_messages_conversation_id_created_at ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC); -- For global activity feeds if needed

-- Trigger for conversations updated_at
-- This trigger will update 'updated_at' whenever a message is added to a conversation (handled by API logic)
-- or when conversation details (name, avatar) change.
-- For now, we'll rely on API logic to update conversations.updated_at when new messages are sent.
-- A more database-centric trigger could be added if direct DB updates to messages should also update conversation.
-- However, typically the application layer handles updating the parent conversation's timestamp.
-- Let's add a standard updated_at trigger for direct modifications to the conversations table itself.

CREATE OR REPLACE FUNCTION update_updated_at_conversations()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_conversations();
