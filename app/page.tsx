"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/authClient';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure this runs only on the client side
    if (typeof window !== 'undefined') {
      if (isAuthenticated()) {
        router.replace('/feed'); // Or '/explore' if that's preferred default for logged-in users
      } else {
        router.replace('/auth/login');
      }
      // setIsLoading(false); // Set loading to false after redirection logic attempt
      // No, we don't want to set loading to false here because the page will unmount.
      // The router.replace will navigate away.
    }
  }, [router]);

  // Optionally, render a loading state while the redirect is processed,
  // though router.replace should be quite fast.
  // If not redirecting immediately, this helps prevent rendering anything else.
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' }}>
        <p style={{ fontSize: '1.2rem', color: '#333' }}>Loading...</p>
      </div>
    );
    // Or return null if you prefer a blank screen during the brief moment before redirection.
  }

  return null; // Should ideally not be reached if redirection works promptly.
}
