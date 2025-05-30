-- Database Schema for Professional Networking Platform
-- Version 1.0

-- Extension for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---- Users and Authentication ----
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords only!
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user' NOT NULL, -- e.g., 'user', 'admin', 'employer_admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    email_verified_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);

-- ---- User Profiles ----
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    headline TEXT, -- e.g., "Senior Software Engineer at TechCorp"
    bio TEXT,
    avatar_url TEXT,
    cover_photo_url TEXT,
    location VARCHAR(255), -- e.g., "San Francisco, CA"
    phone_number VARCHAR(50),
    website_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    public_profile BOOLEAN DEFAULT TRUE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_location ON user_profiles(location);

-- ---- Skills ----
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE INDEX idx_skills_name ON skills(name);

-- ---- User Skills (Join Table) ----
CREATE TABLE user_skills (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, skill_id)
);

-- ---- User Experiences ----
CREATE TABLE user_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL, -- Could link to a companies table if companies are also users/managed entities
    location VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE, -- NULL if current
    description TEXT,
    employment_type VARCHAR(50), -- e.g., 'Full-time', 'Part-time', 'Contract'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_experiences_user_id ON user_experiences(user_id);

-- ---- User Education ----
CREATE TABLE user_educations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    institution_name VARCHAR(255) NOT NULL,
    degree VARCHAR(255),
    field_of_study VARCHAR(255),
    start_date DATE,
    end_date DATE, -- NULL if current or expected
    description TEXT, -- e.g., honors, activities
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_educations_user_id ON user_educations(user_id);

-- ---- Companies ----
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    industry VARCHAR(100),
    company_size VARCHAR(50), -- e.g., "1-50", "51-200"
    hq_location VARCHAR(255),
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- User who initially registered the company
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_industry ON companies(industry);

-- ---- Jobs ----
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    posted_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- User who posted the job
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255), -- e.g., "San Francisco, CA", "Remote"
    job_type VARCHAR(50), -- e.g., 'Full-time', 'Part-time', 'Contract', 'Internship'
    experience_level VARCHAR(50), -- e.g., 'Entry', 'Mid', 'Senior'
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(3) DEFAULT 'USD',
    is_remote BOOLEAN DEFAULT FALSE,
    application_url TEXT, -- External application link
    application_email VARCHAR(255), -- Email to apply
    status VARCHAR(50) DEFAULT 'open' NOT NULL, -- e.g., 'open', 'closed', 'filled'
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_title ON jobs(title);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_experience_level ON jobs(experience_level);

-- ---- Job Skills (Join Table) ----
CREATE TABLE job_skills (
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);

-- ---- User Saved Jobs ----
CREATE TABLE user_saved_jobs (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id)
);

-- ---- Events ----
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(100), -- e.g., 'Career Fair', 'Workshop', 'Networking', 'Info Session'
    medium VARCHAR(50), -- e.g., 'Virtual', 'In-Person', 'Hybrid'
    location_or_url TEXT, -- Physical address or virtual meeting URL
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    organized_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organized_by_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    registration_url TEXT,
    status VARCHAR(50) DEFAULT 'upcoming' NOT NULL, -- e.g., 'upcoming', 'ongoing', 'past', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_title ON events(title);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_start_time ON events(start_time);

-- ---- User Event Registrations/Saved Events ----
CREATE TABLE user_event_registrations (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    registration_status VARCHAR(50) DEFAULT 'registered' NOT NULL, -- 'registered', 'saved_for_later', 'attended'
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, event_id)
);

-- ---- Feed Posts ----
CREATE TABLE feed_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT, -- URL for image or video if any
    media_type VARCHAR(50), -- 'image', 'video'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feed_posts_user_id ON feed_posts(user_id);

-- ---- Feed Post Likes ----
CREATE TABLE feed_post_likes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES feed_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

-- ---- Feed Post Comments ----
CREATE TABLE feed_post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES feed_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    parent_comment_id UUID REFERENCES feed_post_comments(id) ON DELETE CASCADE, -- For threaded comments
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feed_post_comments_post_id ON feed_post_comments(post_id);
CREATE INDEX idx_feed_post_comments_user_id ON feed_post_comments(user_id);

-- ---- User Connections ----
-- This table can represent different types of connections: 'followed', 'connected' (mutual)
CREATE TABLE user_connections (
    user_a_id UUID REFERENCES users(id) ON DELETE CASCADE, -- The initiator or follower
    user_b_id UUID REFERENCES users(id) ON DELETE CASCADE, -- The target or followed
    connection_type VARCHAR(50) NOT NULL, -- e.g., 'followed_by_a', 'connected'
    status VARCHAR(50), -- e.g., 'pending' (for mutual connections), 'accepted'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- e.g. when status changes
    PRIMARY KEY (user_a_id, user_b_id, connection_type) -- ensures unique follow/connection request
);

CREATE INDEX idx_user_connections_user_b_id ON user_connections(user_b_id); -- To easily find followers/connections of user_b

-- ---- Conversations ----
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Last message time
);

-- ---- Conversation Participants (Join Table) ----
CREATE TABLE conversation_participants (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP WITH TIME ZONE, -- To track unread messages
    PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);

-- ---- Messages ----
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

-- ---- Notifications ----
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL, -- The recipient of the notification
    type VARCHAR(100) NOT NULL, -- e.g., 'new_job_posting', 'event_reminder', 'new_message', 'connection_request', 'feed_like'
    related_entity_id UUID, -- ID of the job, event, message, user, post, etc.
    related_entity_type VARCHAR(100), -- 'job', 'event', 'message', 'user', 'feed_post'
    content TEXT, -- Optional: pre-generated notification text
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);


-- ---- Triggers for updated_at timestamps ----
-- Example for one table, repeat for others or create a generic function

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to tables that have an updated_at column
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_user_experiences_updated_at
BEFORE UPDATE ON user_experiences
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_user_educations_updated_at
BEFORE UPDATE ON user_educations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_feed_posts_updated_at
BEFORE UPDATE ON feed_posts
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_feed_post_comments_updated_at
BEFORE UPDATE ON feed_post_comments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_user_connections_updated_at
BEFORE UPDATE ON user_connections
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- End of Schema --
-- You might want to add more specific indexes based on query patterns.
-- Consider ENUM types for fields like 'role', 'status', 'type' for better data integrity and performance,
-- but VARCHAR is used here for simplicity in this initial script.
-- Example ENUM creation (run before table creation):
-- CREATE TYPE job_status AS ENUM ('open', 'closed', 'filled');
-- Then use 'job_status' as the data type.
-- However, managing ENUMs (adding new values) requires ALTER TYPE, which can be more complex than updating VARCHAR values.

-- Seed data (sample inserts) would typically be in a separate file (e.g., seed.sql).
