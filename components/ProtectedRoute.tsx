"use client"; // This component needs to use client-side hooks

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/authClient'; // Adjust path if needed

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    // Ensure this check only runs on the client-side after hydration
    if (typeof window !== 'undefined' && !isAuthenticated()) {
      router.push('/auth/login'); // Redirect to login if not authenticated
    }
  }, [router]); // Add router to dependency array

  // While checking or if redirecting, show nothing or a loader
  if (!isAuthenticated() && typeof window !== 'undefined') {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
};

export default ProtectedRoute;
