import { z } from 'zod';

// --- Auth Schemas ---
export const SignupSchema = z.object({
  email: z.string().email({ message: 'Invalid email format.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
  firstName: z.string().min(1, { message: 'First name is required.' }).optional().or(z.literal('')), // Allow empty string to be converted to null by API
  lastName: z.string().min(1, { message: 'Last name is required.' }).optional().or(z.literal('')),  // Allow empty string to be converted to null by API
});

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email format.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});


// --- Profile Schemas ---
// Schema for updatable fields in the profile
export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, { message: 'First name cannot be empty if provided.' }).optional().or(z.literal('')),
  lastName: z.string().min(1, { message: 'Last name cannot be empty if provided.' }).optional().or(z.literal('')),
  headline: z.string().max(255, { message: 'Headline must be 255 characters or less.' }).optional().or(z.literal('')),
  bio: z.string().max(5000, { message: 'Bio must be 5000 characters or less.' }).optional().or(z.literal('')), // Increased limit for bio
  avatarUrl: z.string().url({ message: 'Invalid URL format for avatar.' }).optional().or(z.literal('')),
  coverPhotoUrl: z.string().url({ message: 'Invalid URL format for cover photo.' }).optional().or(z.literal('')),
  location: z.string().max(255, { message: 'Location must be 255 characters or less.' }).optional().or(z.literal('')),
  phoneNumber: z.string().max(50, { message: 'Phone number must be 50 characters or less.' }).regex(/^[\d\s()+-]*$/, { message: 'Invalid phone number format.'}).optional().or(z.literal('')),
  websiteUrl: z.string().url({ message: 'Invalid URL format for website.' }).optional().or(z.literal('')),
  linkedinUrl: z.string().url({ message: 'Invalid URL format for LinkedIn profile.' }).optional().or(z.literal('')),
  githubUrl: z.string().url({ message: 'Invalid URL format for GitHub profile.' }).optional().or(z.literal('')),
  // Note: .optional().or(z.literal('')) allows fields to be omitted or be an empty string.
  // The API logic can then convert empty strings to null if desired for the database.
});

export const AddSkillSchema = z.object({
  skill_name: z.string().min(1, { message: 'Skill name is required.' }).max(100, { message: 'Skill name must be 100 characters or less.' }),
  proficiency_level: z.string().max(50, { message: 'Proficiency level must be 50 characters or less.' }).optional().or(z.literal('')),
});

export const UpdateSkillSchema = z.object({
  skill_name: z.string().min(1, { message: 'Skill name cannot be empty if provided.' }).max(100, { message: 'Skill name must be 100 characters or less.' }).optional(),
  proficiency_level: z.string().max(50, { message: 'Proficiency level must be 50 characters or less.' }).optional().or(z.literal('')), // Allow empty string to clear it
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field (skill_name or proficiency_level) must be provided for an update.",
});

// --- Utility for parsing Zod errors ---
export const formatZodError = (error: z.ZodError): string[] => {
  return error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
};
