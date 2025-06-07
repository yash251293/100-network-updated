"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isAuthenticated, getToken } from '@/lib/authClient'; // Assuming authClient utility

// Define the user profile data structure based on API response
interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  phone: string | null;
  jobType: string | null;
  experienceLevel: string | null;
  remoteWorkPreference: string | null;
  preferredIndustries: string | null; // Consider parsing if it's JSON string
  isAvailableForFreelance: boolean | null;
  freelanceHeadline: string | null;
  freelanceBio: string | null;
  portfolioUrl: string | null;
  preferredFreelanceRateType: string | null;
  freelanceRateValue: number | null;
  userId: string; // This is the same as id from profiles table
  email: string | null;
  // Skills, Experience, Education are arrays of objects, define more detailed types if needed for context
  skills: any[];
  experience: any[];
  education: any[];
}

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  fetchUserProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserProfile = async () => {
    if (!isAuthenticated()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }
      const data: UserProfile = await response.json();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      setUser(null); // Clear user data on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []); // Fetch on initial mount

  return (
    <UserContext.Provider value={{ user, isLoading, error, fetchUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
