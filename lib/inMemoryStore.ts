// lib/inMemoryStore.ts

// THIS IS A TEMPORARY IN-MEMORY USER STORE FOR DEMONSTRATION PURPOSES.
// DO NOT USE THIS IN A PRODUCTION ENVIRONMENT.
// A proper database with secure password hashing (e.g., bcrypt, argon2) is essential for production.

import type { User } from './types'; // Import the expanded User interface

export let users: User[] = [];

// In a real app, these would interact with a database.

export const addUser = (userData: Pick<User, 'id' | 'name' | 'email' | 'password'>): User => {
  if (users.find(u => u.email === userData.email)) {
    // This check is also in register API, but good to have at store level too.
    throw new Error("User with this email already exists.");
  }
  // Initialize new users with empty profile fields
  const newUser: User = {
    ...userData,
    headline: '',
    summary: '',
    location: '',
    profilePictureUrl: '',
    linkedInProfileUrl: '',
    githubProfileUrl: '',
    personalWebsiteUrl: '',
    skills: [],
    experience: [],
    education: [],
  };
  users.push(newUser);
  return newUser;
};

export const findUserByEmail = (email: string): User | undefined => {
  return users.find(u => u.email === email);
};

export const findUserById = (id: string): User | undefined => {
  return users.find(u => u.id === id);
};

export const updateUserProfile = (userId: string, profileData: Partial<Omit<User, 'id' | 'email' | 'password'>>): User | null => {
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return null; // User not found
  }

  // Update only the allowed profile fields, excluding id, email, and password
  users[userIndex] = {
    ...users[userIndex],
    ...profileData,
  };

  // Return a copy of the user without the password for safety, even though it's in-memory
  const { password, ...userWithoutPassword } = users[userIndex];
  return userWithoutPassword;
};

// Posts Store
import type { Post } from './types';

export let posts: Post[] = [];

export const addPost = (
  authorId: string,
  authorName: string,
  content: string,
  imageUrl?: string,
  videoUrl?: string,
  linkUrl?: string,
  authorProfilePictureUrl?: string
): Post => {
  const newPost: Post = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9), // More unique temp ID
    authorId,
    authorName,
    authorProfilePictureUrl,
    content,
    imageUrl,
    videoUrl,
    linkUrl,
    // linkPreview can be handled by a separate service/function when creating post if URL exists
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likesCount: 0,
    commentsCount: 0,
  };
  posts.unshift(newPost); // Add to the beginning of the array for chronological order (newest first)
  return newPost;
};

export const getPosts = (): Post[] => {
  // The posts array is already in newest-first order due to unshift in addPost.
  // If sorting were ever needed (e.g., if posts could be added in other ways):
  // return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return posts;
};

export const findPostById = (postId: string): Post | undefined => {
  return posts.find(p => p.id === postId);
};
