import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; // Assuming db.ts is in lib

// Placeholder for actual authentication and user ID retrieval
async function getUserIdFromRequest(request: Request): Promise<string | null> {
  // In a real app, you would:
  // 1. Get the token from the Authorization header (e.g., Bearer token).
  // 2. Validate the token.
  // 3. Extract the user ID from the token.
  // For now, as 'fake-jwt-token' is client-side, this is a major simplification
  // and not secure. We'll simulate returning a hardcoded user ID for development.
  // THIS IS A CRITICAL SECURITY GAP that needs a proper solution (e.g., NextAuth.js or proper JWT handling).
  console.warn("API /api/profile GET: Using hardcoded user ID due to missing server-side auth. THIS IS INSECURE.");
  // To make this testable with existing users in the DB (who have UUIDs),
  // we'd need a known UUID. Let's assume the first user for now, if any.
  // OR, for a more stable mock during development IF YOU HAVE A KNOWN USER UUID:
  // return "your-known-user-uuid-for-testing";
  // For now, let's return a placeholder that would cause it to fetch nothing if no such user.
  // A better mock for now: try to fetch the first user from the users table if no auth.
  try {
    const users = await query('SELECT id FROM users LIMIT 1;');
    if (users.rows.length > 0) {
      console.log(`API /api/profile GET: Mocking with user ID: ${users.rows[0].id}`);
      return users.rows[0].id;
    }
  } catch (e) {
    //
  }
  return null; // Or a specific test user ID
}

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required. User not found.' }, { status: 401 });
    }

    // Fetch profile data
    const profileRes = await query('SELECT * FROM profiles WHERE id = $1', [userId]);
    const profile = profileRes.rows[0] || {}; // 기본값으로 빈 객체

    // Fetch skills data
    const skillsRes = await query(
      'SELECT s.id, s.name, us.proficiency_level FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = $1',
      [userId]
    );
    const skills = skillsRes.rows;

    // Fetch experience data
    const experienceRes = await query('SELECT * FROM user_experience WHERE user_id = $1 ORDER BY start_date DESC, id DESC', [userId]);
    const experiences = experienceRes.rows;

    // Fetch education data
    const educationRes = await query('SELECT * FROM user_education WHERE user_id = $1 ORDER BY start_date DESC, id DESC', [userId]);
    const educations = educationRes.rows;

    const consolidatedProfile = {
      ...profile, // Spread profile fields (id, first_name, last_name, avatar_url, headline etc.)
      // Note: profile.id will be the same as userId here.
      // The schema for profiles table has 'id' as its PK which is also the user_id FK.
      // We might want to ensure the returned object has a clear userId if profile object itself doesn't explicitly contain it as 'userId'
      userId: userId, // Explicitly include userId
      skills: skills,
      experience: experiences, // Ensure this matches frontend state structure key
      education: educations,   // Ensure this matches frontend state structure key
    };
    
    // Ensure field names from DB (e.g. company_name, school_name) are mapped to frontend state keys if different
    // For example, if frontend expects 'company' but DB has 'company_name'
    consolidatedProfile.experience = experiences.map(exp => ({
        ...exp,
        company: exp.company_name // Map company_name to company
    }));
    consolidatedProfile.education = educations.map(edu => ({
        ...edu,
        school: edu.school_name // Map school_name to school
    }));


    return NextResponse.json(consolidatedProfile);

  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile data', details: (error as Error).message }, { status: 500 });
  }
}

// (getUserIdFromRequest and GET handler from previous step should be above this)
// import { query } from '@/lib/db'; // Already imported
// import { NextResponse } from 'next/server'; // Already imported

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request); // Using the same mocked auth

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required. User not found.' }, { status: 401 });
  }

  try {
    const profileData = await request.json();

    // IMPORTANT: Use a database transaction to ensure all operations succeed or fail together.
    // The specific way to do transactions depends on the 'pg' library setup in `lib/db.ts`.
    // Assuming `lib/db.ts` exports a way to get a client and manage transactions, like:
    // const client = await getPool().connect(); // Get a client from the pool
    // await client.query('BEGIN');
    // ... operations ...
    // await client.query('COMMIT');
    // client.release();
    // If `lib/db.ts` doesn't support this directly, this is a simplification.
    // For now, we'll write the queries sequentially and note the need for explicit transaction handling.
    
    console.log(`API /api/profile POST: Saving data for userId: ${userId}`, profileData);

    // 1. Update/Insert into `profiles` table
    // Note: The 'profiles' table uses the user's 'id' as its primary key.
    // We need to handle both insert (if no profile yet) and update (if profile exists).
    // This is often done with an "UPSERT" operation (INSERT ... ON CONFLICT ... DO UPDATE).
    // const {
    //   first_name, // Assuming this comes from profileData; form has 'firstName'
    //   last_name,  // Assuming this comes from profileData; form has 'lastName'
    //   avatar_url, // Assuming from profileData; form has 'profilePicture'
    //   headline,   // Assuming from profileData; form doesn't explicitly have this.
    //   bio,
    //   location,
    //   linkedin_url, // Assuming from profileData; form doesn't explicitly have this.
    //   github_url,   // Assuming from profileData; form doesn't explicitly have this.
    //   website_url,  // Assuming from profileData; form has 'website'
    //   // other fields from profileData that map to `profiles` table columns
    // } = profileData;

    // Map frontend field names to DB column names if they differ
    // The current CompleteProfilePage state uses: profilePicture, bio, location, website, phone
    // The `profiles` schema has: first_name, last_name, avatar_url, headline, bio, location, linkedin_url, github_url, website_url
    // There's a mismatch to be handled. For now, we'll use what's available.
    // A more robust solution would involve mapping all fields or adjusting the form state.

    await query(
      `INSERT INTO profiles (id, bio, location, website_url, avatar_url, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         bio = EXCLUDED.bio,
         location = EXCLUDED.location,
         website_url = EXCLUDED.website_url,
         avatar_url = EXCLUDED.avatar_url,
         updated_at = CURRENT_TIMESTAMP
      `,
      [userId, profileData.bio, profileData.location, profileData.website, profileData.profilePicture]
    );
    console.log('Profile upserted');


    // 2. Handle Skills (delete old, find/create in skills, insert into user_skills)
    await query('DELETE FROM user_skills WHERE user_id = $1', [userId]);
    console.log('Old skills deleted');
    if (profileData.skills && profileData.skills.length > 0) {
      for (const skillName of profileData.skills) { // Assuming profileData.skills is an array of skill names
        if (typeof skillName !== 'string' || skillName.trim() === '') continue; // Basic validation
        let skillRes = await query('SELECT id FROM skills WHERE name = $1', [skillName.trim()]);
        let skillId;
        if (skillRes.rows.length > 0) {
          skillId = skillRes.rows[0].id;
        } else {
          skillRes = await query('INSERT INTO skills (name) VALUES ($1) RETURNING id', [skillName.trim()]);
          skillId = skillRes.rows[0].id;
          console.log(`Skill '${skillName.trim()}' created with id ${skillId}`);
        }
        await query('INSERT INTO user_skills (user_id, skill_id) VALUES ($1, $2)', [userId, skillId]);
      }
      console.log('New skills inserted');
    }

    // 3. Handle Experience (delete old, insert new)
    await query('DELETE FROM user_experience WHERE user_id = $1', [userId]);
    console.log('Old experiences deleted');
    if (profileData.experience && profileData.experience.length > 0) {
      for (const exp of profileData.experience) {
        if (!exp.title || !exp.company) continue; // Skip if essential fields are missing
        await query(
          `INSERT INTO user_experience (user_id, title, company_name, location, start_date, end_date, current_job, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [userId, exp.title, exp.company, exp.location, exp.startDate || null, exp.endDate || null, exp.current || false, exp.description]
        );
      }
      console.log('New experiences inserted');
    }

    // 4. Handle Education (delete old, insert new)
    await query('DELETE FROM user_education WHERE user_id = $1', [userId]);
    console.log('Old education deleted');
    if (profileData.education && profileData.education.length > 0) {
      for (const edu of profileData.education) {
        if (!edu.school) continue; // Skip if essential fields are missing
        await query(
          `INSERT INTO user_education (user_id, school_name, degree, field_of_study, start_date, end_date, current_student, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [userId, edu.school, edu.degree, edu.field, edu.startDate || null, edu.endDate || null, edu.current || false, edu.description || '']
        );
      }
      console.log('New education inserted');
    }
    
    // TODO: Handle career preferences (jobType, experienceLevel, industries, remoteWork)
    // These fields are in profileData but not currently saved to any specific table in schema.sql.
    // They might go into the `profiles` table if columns are added, or a new `user_preferences` table.
    // For now, we acknowledge they are collected but not persisted by this script.
    console.warn("Career preferences from profileData are not currently being saved to the database by this endpoint.");


    // await client.query('COMMIT'); // If using explicit transactions
    return NextResponse.json({ message: 'Profile updated successfully' });

  } catch (error) {
    // await client.query('ROLLBACK'); // If using explicit transactions
    console.error('POST /api/profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile data', details: (error as Error).message }, { status: 500 });
  } finally {
    // client.release(); // If using explicit transactions
  }
}
