"use client";

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react'; // Keep a simple icon import

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      setMessage("Minimal Profile Page Loaded Successfully!");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p style={{ marginLeft: '1rem', fontSize: '1.25rem' }}>Loading minimal page...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {message && (
        <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '0.375rem', backgroundColor: '#d1fae5', color: '#065f46' }}>
          {message}
        </div>
      )}
      <h1>Minimal Profile Page</h1>
      <p>If you see this, the basic component builds and renders correctly.</p>
    </div>
  );
}
