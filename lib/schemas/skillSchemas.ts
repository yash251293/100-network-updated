import { z } from 'zod';

export const userSkillSchema = z.object({
  skillName: z.string().min(1, { message: 'Skill name cannot be empty' }),
  level: z.number().int().min(1, { message: 'Level must be at least 1' }).max(5, { message: 'Level cannot exceed 5' }), // Assuming a 1-5 scale for level
});

export type UserSkillSchemaType = z.infer<typeof userSkillSchema>;

export const skillUpdateSchema = z.object({
  level: z.number().int().min(1, { message: 'Level must be at least 1' }).max(5, { message: 'Level cannot exceed 5' }),
});

export type SkillUpdateSchemaType = z.infer<typeof skillUpdateSchema>;

// Schema for creating a skill in the master table (if ever exposed directly)
export const masterSkillSchema = z.object({
  name: z.string().min(1, { message: 'Skill name cannot be empty' }),
});

export type MasterSkillSchemaType = z.infer<typeof masterSkillSchema>;
