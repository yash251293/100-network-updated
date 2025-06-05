import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; // Assuming db.ts is in lib
import { verifyAuthToken } from '@/lib/authUtils';
import { z } from 'zod'; // Import Zod

// Helper function for date formatting
function formatDateToYearMonth(dateString: string | null | Date): string | null {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        console.warn("formatDateToYearMonth received invalid date string:", dateString);
        return null;
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return null;
  }
}

// Zod Schemas for POST request validation
const skillSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, "Skill name cannot be empty."),
  // proficiencyLevel is not part of the current skills handling in POST,
  // but if it were, it would be:
  // proficiencyLevel: z.string().optional().nullable()
});

// The current POST handler for skills expects an array of strings (skill names)
// If the structure changes to objects, this schema needs to be used.
// For now, we'll use z.array(z.string()) for skills based on current POST logic.
const simpleSkillSchema = z.string().min(1, "Skill name cannot be empty.");


const experienceSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  title: z.string().min(1, "Job title is required."),
  company: z.string().min(1, "Company name is required."), // Matches current profileData.experience[].company
  location: z.string().optional().nullable(),
  startDate: z.union([
    z.string().regex(/^\d{4}-\d{2}$/, "Start date must be in YYYY-MM format or empty."),
    z.null()
  ]).optional(),
  endDate: z.union([
    z.string().regex(/^\d{4}-\d{2}$/, "End date must be in YYYY-MM format or empty."),
    z.null()
  ]).optional(),
  current: z.boolean().optional(), // Matches current profileData.experience[].current
  description: z.string().optional().nullable()
});

const educationSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  school: z.string().min(1, "School name is required."), // Matches current profileData.education[].school
  degree: z.string().optional().nullable(),
  field: z.string().optional().nullable(), // Matches current profileData.education[].field
  startDate: z.union([
    z.string().regex(/^\d{4}-\d{2}$/, "Start date must be in YYYY-MM format or empty."),
    z.null()
  ]).optional(),
  endDate: z.union([
    z.string().regex(/^\d{4}-\d{2}$/, "End date must be in YYYY-MM format or empty."),
    z.null()
  ]).optional(),
  current: z.boolean().optional(), // Matches current profileData.education[].current
  description: z.string().optional().nullable()
});

const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required.").max(100).optional().nullable(),
  lastName: z.string().min(1, "Last name is required.").max(100).optional().nullable(),
  avatarUrl: z.string().max(255).optional().nullable(), // Changed from URL to lenient string
  headline: z.string().max(255).optional().nullable(),
  bio: z.string().optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  linkedinUrl: z.string().url({ message: "Invalid LinkedIn URL." }).optional().nullable(),
  githubUrl: z.string().url({ message: "Invalid GitHub URL." }).optional().nullable(),
  websiteUrl: z.string().url({ message: "Invalid website URL." }).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),

  jobType: z.string().max(100).optional().nullable(),
  experienceLevel: z.string().max(100).optional().nullable(),
  remoteWorkPreference: z.string().max(100).optional().nullable(),
  preferredIndustries: z.string().optional().nullable(), // Kept as string, assuming client stringifies array

  isAvailableForFreelance: z.boolean().optional(),
  freelanceHeadline: z.string().max(255).optional().nullable(),
  freelanceBio: z.string().optional().nullable(),
  portfolioUrl: z.preprocess( (val) => (val === "" ? null : val), z.string().url({ message: "Invalid portfolio URL. Must be a full URL e.g. https://example.com" }).optional().nullable() ),
  preferredFreelanceRateType: z.string().max(50).optional().nullable(),
  freelanceRateValue: z.number().positive("Rate must be a positive number.").optional().nullable(),

  skills: z.array(simpleSkillSchema).optional().nullable(), // Using array of strings for skills based on current POST logic
  experience: z.array(experienceSchema).optional().nullable(),
  education: z.array(educationSchema).optional().nullable(),
});


export async function GET(request: Request) {
  try {
    const authResult = verifyAuthToken(request.headers.get('Authorization'));
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { userId } = authResult;

    // Fetch profile data
    const profileQuery = `
      SELECT
        id, first_name, last_name, avatar_url, headline, bio, location,
        linkedin_url, github_url, website_url, phone,
        job_type, experience_level, remote_work_preference, preferred_industries,
        is_available_for_freelance as "isAvailableForFreelance",
        freelance_headline as "freelanceHeadline",
        freelance_bio as "freelanceBio",
        portfolio_url as "portfolioUrl",
        preferred_freelance_rate_type as "preferredFreelanceRateType",
        freelance_rate_value as "freelanceRateValue"
      FROM profiles
      WHERE id = $1
    `;
    const profileRes = await query(profileQuery, [userId]);
    const profile = profileRes.rows[0] || {};

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

    // Fetch user's email
    const userEmailRes = await query('SELECT email FROM users WHERE id = $1', [userId]);
    const userEmail = userEmailRes.rows[0]?.email || null;

    const consolidatedProfile = {
      ...profile,
      userId: userId,
      email: userEmail,
      skills: skills,
      experience: experiences,
      education: educations,
    };
    
    consolidatedProfile.experience = experiences.map(exp => ({
        ...exp,
        company: exp.company_name,
        startDate: formatDateToYearMonth(exp.start_date),
        endDate: formatDateToYearMonth(exp.end_date)
    }));
    consolidatedProfile.education = educations.map(edu => ({
        ...edu,
        school: edu.school_name,
        startDate: formatDateToYearMonth(edu.start_date),
        endDate: formatDateToYearMonth(edu.end_date)
    }));

    return NextResponse.json(consolidatedProfile);

  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile data', details: (error as Error).message }, { status: 500 });
  }
}


export async function POST(request: Request) {
  const authResult = verifyAuthToken(request.headers.get('Authorization'));
  if (!authResult) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const { userId } = authResult;

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  console.log("API /api/profile POST received body:", body);
  const validationResult = profileUpdateSchema.safeParse(body);

  if (!validationResult.success) {
    console.error("API /api/profile POST Zod validation failed. Body:", body, "Errors:", validationResult.error.flatten());
    return NextResponse.json({
      success: false,
      message: "Validation failed.",
      errors: validationResult.error.flatten().fieldErrors,
      formErrors: validationResult.error.flatten().formErrors
    }, { status: 400 });
  }

  const profileData = validationResult.data; // Use validated data from now on

  try {
    await query('BEGIN'); // START TRANSACTION
    
    console.log(`API /api/profile POST: Saving data for userId: ${userId}`, profileData);

    const industriesString = profileData.preferredIndustries ? JSON.stringify(profileData.preferredIndustries) : null;

    await query(
      `INSERT INTO profiles (
         id, first_name, last_name, bio, location, website_url, avatar_url, phone,
         job_type, experience_level, remote_work_preference, preferred_industries,
         headline, linkedin_url, github_url,
         is_available_for_freelance, freelance_headline, freelance_bio,
         portfolio_url, preferred_freelance_rate_type, freelance_rate_value,
         updated_at
       )
       VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, CURRENT_TIMESTAMP
       )
       ON CONFLICT (id) DO UPDATE SET
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         bio = EXCLUDED.bio,
         location = EXCLUDED.location,
         website_url = EXCLUDED.website_url,
         avatar_url = EXCLUDED.avatar_url,
         phone = EXCLUDED.phone,
         job_type = EXCLUDED.job_type,
         experience_level = EXCLUDED.experience_level,
         remote_work_preference = EXCLUDED.remote_work_preference,
         preferred_industries = EXCLUDED.preferred_industries,
         headline = EXCLUDED.headline,
         linkedin_url = EXCLUDED.linkedin_url,
         github_url = EXCLUDED.github_url,
         is_available_for_freelance = EXCLUDED.is_available_for_freelance,
         freelance_headline = EXCLUDED.freelance_headline,
         freelance_bio = EXCLUDED.freelance_bio,
         portfolio_url = EXCLUDED.portfolio_url,
         preferred_freelance_rate_type = EXCLUDED.preferred_freelance_rate_type,
         freelance_rate_value = EXCLUDED.freelance_rate_value,
         updated_at = CURRENT_TIMESTAMP
      `,
      [
        userId,
        profileData.firstName,
        profileData.lastName,
        profileData.bio,
        profileData.location,
        profileData.websiteUrl,
        profileData.avatarUrl,
        profileData.phone,
        profileData.jobType,
        profileData.experienceLevel,
        profileData.remoteWorkPreference,
        industriesString,
        profileData.headline,
        profileData.linkedinUrl,
        profileData.githubUrl,
        profileData.isAvailableForFreelance,
        profileData.freelanceHeadline,
        profileData.freelanceBio,
        profileData.portfolioUrl,
        profileData.preferredFreelanceRateType,
        profileData.freelanceRateValue
      ]
    );
    console.log('Profile upserted');

    await query('DELETE FROM user_skills WHERE user_id = $1', [userId]);
    if (profileData.skills && profileData.skills.length > 0) {
      for (const skillName of profileData.skills) {
        if (typeof skillName !== 'string' || skillName.trim() === '') continue;
        let skillRes = await query('SELECT id FROM skills WHERE name = $1', [skillName.trim()]);
        let skillId;
        if (skillRes.rows.length > 0) {
          skillId = skillRes.rows[0].id;
        } else {
          skillRes = await query('INSERT INTO skills (name) VALUES ($1) RETURNING id', [skillName.trim()]);
          skillId = skillRes.rows[0].id;
        }
        await query('INSERT INTO user_skills (user_id, skill_id) VALUES ($1, $2)', [userId, skillId]);
      }
      console.log('New skills inserted/updated');
    }

    await query('DELETE FROM user_experience WHERE user_id = $1', [userId]);
    if (profileData.experience && profileData.experience.length > 0) {
      for (const exp of profileData.experience) {
        if (!exp.title || !exp.company) continue;

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

    await query('DELETE FROM user_education WHERE user_id = $1', [userId]);
    if (profileData.education && profileData.education.length > 0) {
      for (const edu of profileData.education) {
        if (!edu.school) continue;

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
    
    await query('COMMIT');
    return NextResponse.json({ success: true, message: 'Profile updated successfully' });

  } catch (error) {
    await query('ROLLBACK');
    console.error('POST /api/profile error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update profile data', details: (error as Error).message }, { status: 500 });
  }
}
