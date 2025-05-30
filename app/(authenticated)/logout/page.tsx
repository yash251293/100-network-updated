'use client';

import type React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Corrected import for App Router
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Perform logout actions
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser'); // Also remove any stored user info

    // Add a small delay to ensure localStorage operations complete
    // and to give a visual cue of "logging out" before redirect.
    const timer = setTimeout(() => {
      router.push('/auth/login');
    }, 1000); // 1 second delay

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, [router]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
      <p className="text-xl text-gray-700">Logging you out...</p>
      <p className="text-sm text-gray-500">Please wait while we securely end your session.</p>
    </div>
  );
}
