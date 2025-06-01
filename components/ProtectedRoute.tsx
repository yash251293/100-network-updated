"use client"; // This component needs to use client-side hooks

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '../lib/authClient'; // Adjust path if needed

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    // Ensure this check only runs on the client-side after hydration
    if (typeof window !== 'undefined' && !isAuthenticated()) {
      router.push('/auth/login');
    }
  }, [router]); // Add router to dependency array, though its identity is stable

  // While checking or if redirecting, you might want to show a loader
  // For simplicity, we'll return null if not authenticated and useEffect is about to redirect
  // Or, render children if authenticated
  if (!isAuthenticated() && typeof window !== 'undefined') {
    // This helps prevent flashing the protected content before redirect
    // You could return a loading spinner here as well
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
