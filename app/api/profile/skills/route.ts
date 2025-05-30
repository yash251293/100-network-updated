import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth_utils';
import { AddSkillSchema, formatZodError } from '@/lib/validation_schemas';

export async function POST(request: Request) {
  try {
    const authUser = getAuthUserFromRequest(request);
    if (!authUser || !authUser.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }
    const userId = authUser.userId;

    const body = await request.json();

    // --- Input Validation with Zod ---
    const validationResult = AddSkillSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input.',
          details: formatZodError(validationResult.error),
        },
        { status: 400 }
      );
    }

    const { skill_name, proficiency_level } = validationResult.data;

    // --- Insert New Skill ---
    // The schema for user_skills is assumed to be:
    // id (SERIAL or UUID PRIMARY KEY), user_id (UUID), skill_name (VARCHAR), proficiency_level (VARCHAR)
    // And a unique constraint on (user_id, skill_name)

    const insertQuery = `
      INSERT INTO user_skills (user_id, skill_name, proficiency_level)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, skill_name, proficiency_level;
    `;

    try {
      const result = await pool.query(insertQuery, [
        userId,
        skill_name,
        proficiency_level || null, // Store empty string as null
      ]);

      if (result.rows.length === 0) {
        // Should not happen if RETURNING is used and insert is successful
        return NextResponse.json(
          { success: false, error: 'Failed to add skill, no data returned.' },
          { status: 500 }
        );
      }

      const newSkill = result.rows[0];

      return NextResponse.json(
        {
          success: true,
          message: 'Skill added successfully!',
          skill: {
            id: newSkill.id, // This is the user_skills.id
            skill_name: newSkill.skill_name,
            proficiency_level: newSkill.proficiency_level,
            // user_id: newSkill.user_id, // Optional: if client needs it
          },
        },
        { status: 201 }
      );

    } catch (dbError: any) {
      // Handle potential unique constraint violation for (user_id, skill_name)
      // The actual constraint name might vary based on your schema.sql.
      // PostgreSQL error code for unique_violation is '23505'.
      if (dbError.code === '23505') { // Unique violation
        // You might need to check dbError.constraint to be more specific if there are multiple unique constraints
        return NextResponse.json(
          { success: false, error: `Skill "${skill_name}" already exists for this user.` },
          { status: 409 } // Conflict
        );
      }
      // Re-throw other database errors to be caught by the outer try-catch
      throw dbError;
    }

  } catch (error) {
    console.error('Add Skill API Error:', error);
    // Ensure that if it's a known DB error re-thrown above, it's not double-logged or misreported
    if (error instanceof Error && (error as any).code !== '23505') { // Avoid re-logging unique violation if already handled by console.error
        // Generic error for other cases
    }
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while adding the skill.' },
      { status: 500 }
    );
  }
}
