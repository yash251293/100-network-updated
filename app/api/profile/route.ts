import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; // Assuming db.ts is in lib

// Helper function for date formatting
function formatDateToYearMonth(dateString: string | null | Date): string | null {
  if (!dateString) return null;
  try {
    // Attempt to handle cases where dateString might already be a Date object (e.g., from DB)
    // or a string that needs parsing.
    const date = new Date(dateString);
    // Check if date is valid after parsing. Invalid dates can result from bad strings.
    if (isNaN(date.getTime())) {
        // If the date is invalid (e.g. from a malformed string or already problematic date from DB),
        // it's safer to return null or the original string, rather than "NaN-NaN".
        console.warn("formatDateToYearMonth received invalid date string:", dateString);
        return null;
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return null; // Or return original string if preferred on error
  }
}

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
    // And format dates
    consolidatedProfile.experience = experiences.map(exp => ({
        ...exp,
        company: exp.company_name, // Map company_name to company
        startDate: formatDateToYearMonth(exp.start_date),
        endDate: formatDateToYearMonth(exp.end_date)
    }));
    consolidatedProfile.education = educations.map(edu => ({
        ...edu,
        school: edu.school_name, // Map school_name to school
        startDate: formatDateToYearMonth(edu.start_date),
        endDate: formatDateToYearMonth(edu.end_date)
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
    await query('BEGIN'); // START TRANSACTION
    const profileData = await request.json();
    
    console.log(`API /api/profile POST: Saving data for userId: ${userId}`, profileData);

    // 1. Update/Insert into `profiles` table
    // Map frontend field names to DB column names if they differ
    const industriesString = profileData.industries ? JSON.stringify(profileData.industries) : null;

    console.log('Processing and saving career preferences:', {
      jobType: profileData.jobType,
      experienceLevel: profileData.experienceLevel,
      remoteWork: profileData.remoteWork,
      industries: profileData.industries
    });

    await query(
      `INSERT INTO profiles (id, bio, location, website_url, avatar_url, phone, job_type, experience_level, remote_work_preference, preferred_industries, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         bio = EXCLUDED.bio,
         location = EXCLUDED.location,
         website_url = EXCLUDED.website_url,
         avatar_url = EXCLUDED.avatar_url,
         phone = EXCLUDED.phone,
         job_type = EXCLUDED.job_type,
         experience_level = EXCLUDED.experience_level,
         remote_work_preference = EXCLUDED.remote_work_preference,
         preferred_industries = EXCLUDED.preferred_industries,
         updated_at = CURRENT_TIMESTAMP
      `,
      [
        userId,
        profileData.bio,
        profileData.location,
        profileData.website,
        profileData.profilePicture,
        profileData.phone, // New field
        profileData.jobType, // New field
        profileData.experienceLevel, // New field
        profileData.remoteWork, // New field
        industriesString // New field (stringified array)
      ]
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

        let processedStartDate = exp.startDate || null;
        if (processedStartDate && /^\d{4}-\d{2}$/.test(processedStartDate)) {
          processedStartDate = processedStartDate + "-01";
        }

        let processedEndDate = exp.endDate || null;
        if (processedEndDate && /^\d{4}-\d{2}$/.test(processedEndDate)) {
          processedEndDate = processedEndDate + "-01";
        }

        await query(
          `INSERT INTO user_experience (user_id, title, company_name, location, start_date, end_date, current_job, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [userId, exp.title, exp.company, exp.location, processedStartDate, processedEndDate, exp.current || false, exp.description]
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

        let processedEduStartDate = edu.startDate || null;
        if (processedEduStartDate && /^\d{4}-\d{2}$/.test(processedEduStartDate)) {
          processedEduStartDate = processedEduStartDate + "-01";
        }

        let processedEduEndDate = edu.endDate || null;
        if (processedEduEndDate && /^\d{4}-\d{2}$/.test(processedEduEndDate)) {
          processedEduEndDate = processedEduEndDate + "-01";
        }

        await query(
          `INSERT INTO user_education (user_id, school_name, degree, field_of_study, start_date, end_date, current_student, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [userId, edu.school, edu.degree, edu.field, processedEduStartDate, processedEduEndDate, edu.current || false, edu.description || '']
        );
      }
      console.log('New education inserted');
    }
    
    // Career preferences are now handled by the main profiles upsert.
    // The console.log above confirms processing.

    await query('COMMIT'); // COMMIT TRANSACTION
    return NextResponse.json({ message: 'Profile updated successfully' });

  } catch (error) {
    await query('ROLLBACK'); // ROLLBACK TRANSACTION ON ERROR
    console.error('POST /api/profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile data', details: (error as Error).message }, { status: 500 });
  } finally {
    // if (client) client.release();
  }
}
