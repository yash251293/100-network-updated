import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth_utils';
import { UpdateSkillSchema, formatZodError } from '@/lib/validation_schemas';
import { z } from 'zod';

// Schema to validate skill_id from URL path (assuming UUID)
const SkillIdPathSchema = z.object({
  skill_id: z.string().uuid({ message: "Invalid Skill ID format in URL path." }),
});

interface RouteParams {
  params: {
    skill_id: string;
  };
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const authUser = getAuthUserFromRequest(request);
    if (!authUser || !authUser.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }
    const userId = authUser.userId;

    // --- Validate skill_id from route params ---
    const pathValidationResult = SkillIdPathSchema.safeParse(params);
    if (!pathValidationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Skill ID in URL path.',
          // Access errors from pathValidationResult.error, not skillIdValidation.error
          details: formatZodError(pathValidationResult.error),
        },
        { status: 400 }
      );
    }
    const { skill_id: skillId } = pathValidationResult.data; // skillId is now a validated UUID string

    const body = await request.json();

    // --- Input Validation with Zod for request body ---
    const validationResult = UpdateSkillSchema.safeParse(body);
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

    // --- Check if the skill entry exists and belongs to the user ---
    const existingSkillQuery = 'SELECT * FROM user_skills WHERE id = $1 AND user_id = $2';
    const existingSkillResult = await pool.query(existingSkillQuery, [skillId, userId]);

    if (existingSkillResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Skill not found or you do not have permission to update it.' },
        { status: 404 } // Or 403 if you want to differentiate
      );
    }

    // --- Construct Update Query ---
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (skill_name !== undefined) {
      updateFields.push(`skill_name = $${paramCount++}`);
      updateValues.push(skill_name);
    }
    if (proficiency_level !== undefined) {
      updateFields.push(`proficiency_level = $${paramCount++}`);
      updateValues.push(proficiency_level === '' ? null : proficiency_level);
    }

    // Should not happen due to Zod .refine, but as a safeguard:
    if (updateFields.length === 0) {
        return NextResponse.json(
            { success: false, error: 'No fields provided for update.'},
            { status: 400 }
        );
    }

    updateValues.push(skillId);
    updateValues.push(userId);

    const updateQuery = `
      UPDATE user_skills
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount++} AND user_id = $${paramCount++}
      RETURNING id, user_id, skill_name, proficiency_level;
    `;

    try {
      const result = await pool.query(updateQuery, updateValues);

      if (result.rows.length === 0) {
         // Should ideally not happen if the initial check passed and ID is correct
        return NextResponse.json(
            { success: false, error: 'Failed to update skill or skill not found post-update.'},
            { status: 404 }
        );
      }

      const updatedSkill = result.rows[0];

      return NextResponse.json(
        {
          success: true,
          message: 'Skill updated successfully!',
          skill: {
            id: updatedSkill.id,
            skill_name: updatedSkill.skill_name,
            proficiency_level: updatedSkill.proficiency_level,
          },
        },
        { status: 200 }
      );
    } catch (dbError: any) {
      // Handle potential unique constraint violation for (user_id, skill_name)
      if (dbError.code === '23505') {
        return NextResponse.json(
          { success: false, error: `Another skill with the name "${skill_name}" already exists for this user.` },
          { status: 409 } // Conflict
        );
      }
      throw dbError; // Re-throw for outer catch
    }

  } catch (error) {
    console.error('Update Skill API Error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while updating the skill.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const authUser = getAuthUserFromRequest(request);
    if (!authUser || !authUser.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }
    const userId = authUser.userId;

    // --- Validate skill_id from route params ---
    const pathValidationResult = SkillIdPathSchema.safeParse(params);
    if (!pathValidationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Skill ID in URL path.',
          details: formatZodError(pathValidationResult.error),
        },
        { status: 400 }
      );
    }
    const { skill_id: skillId } = pathValidationResult.data;

    // --- Check if the skill entry exists and belongs to the user BEFORE deleting ---
    // This also serves to confirm ownership.
    const checkQuery = 'SELECT id FROM user_skills WHERE id = $1 AND user_id = $2';
    const checkResult = await pool.query(checkQuery, [skillId, userId]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Skill not found or you do not have permission to delete it.' },
        { status: 404 } // Or 403
      );
    }

    // --- Delete the Skill ---
    const deleteQuery = 'DELETE FROM user_skills WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await pool.query(deleteQuery, [skillId, userId]);

    if (result.rowCount === 0) {
      // This case should ideally be caught by the check above,
      // but as a safeguard if something changes between check and delete.
      return NextResponse.json(
        { success: false, error: 'Skill not found or deletion failed unexpectedly.' },
        { status: 404 }
      );
    }

    // Return 204 No Content for successful deletion as there's no body content.
    // Or, return 200 with a success message if preferred.
    return new NextResponse(null, { status: 204 });
    // return NextResponse.json({ success: true, message: 'Skill deleted successfully.' }, { status: 200 });


  } catch (error) {
    console.error('Delete Skill API Error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while deleting the skill.' },
      { status: 500 }
    );
  }
}
