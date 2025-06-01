'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Assuming this path is correct

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId'); // Clean up any other auth-related items
    router.push('/auth/login');
  };

  return (
    <header className="p-4 bg-gray-800 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <div>Logo</div> {/* Placeholder for Logo */}
        <nav>
          {/* Placeholder for other navigation items */}
          {/* Example: <a href="/dashboard" className="mr-4">Dashboard</a> */}
        </nav>
        <Button onClick={handleLogout} variant="outline" className="ml-4">
          Logout
        </Button>
      </div>
    </header>
  );
}
