import { z } from 'zod';

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, { message: 'First name cannot be empty' }).optional().or(z.literal('')),
  lastName: z.string().min(1, { message: 'Last name cannot be empty' }).optional().or(z.literal('')),
  bio: z.string().max(500, { message: 'Bio cannot exceed 500 characters' }).optional().or(z.literal('')),
  avatarUrl: z.string().url({ message: 'Invalid URL format for avatar' }).optional().or(z.literal('')),
});

export type ProfileUpdateSchemaType = z.infer<typeof profileUpdateSchema>;
