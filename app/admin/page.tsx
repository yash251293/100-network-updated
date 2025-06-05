"use client";

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/authClient';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { format } from 'date-fns';

const ADMIN_EMAIL = 'yashrawlani00@gmail.com';

interface UserSummary {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  registrationDate: string; // ISO string
  jobsPostedCount: number;
  applicationsSubmittedCount: number;
}

// Basic Profile type to get current user's email
// interface UserProfile { // Not strictly needed if API returns combined data
//   email?: string;
// }


export default function AdminPage() { // Renamed to AdminPage
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [usersSummary, setUsersSummary] = useState<UserSummary[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      setIsAdmin(null);
      setError(null);
      const token = getToken();

      if (!token) {
        // Redirect to login if not authenticated.
        // Alternatively, show a message and prevent further execution.
        router.push('/auth/login?redirect=/admin');
        return;
      }

      // 1. Verify if current user is admin
      try {
        const profileRes = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!profileRes.ok) {
          // Handle non-OK responses for profile fetch specifically
          if (profileRes.status === 401) { // Unauthorized from profile API
             setError('Authentication failed. Please log in again.');
             setIsAdmin(false);
             router.push('/auth/login?redirect=/admin');
             return;
          }
          throw new Error(`Failed to fetch current user profile (status: ${profileRes.status}).`);
        }
        const profileData = await profileRes.json();

        // Assuming /api/profile returns { success: true, data: { id, email, first_name, ... } }
        const currentUserEmail = profileData.data?.email;

        if (currentUserEmail === ADMIN_EMAIL) {
          setIsAdmin(true);
          // 2. If admin, fetch users summary
          setIsLoadingData(true);
          const summaryRes = await fetch('/api/admin/users-summary', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!summaryRes.ok) {
            const errorResult = await summaryRes.json();
            throw new Error(errorResult.message || 'Failed to fetch users summary.');
          }
          const summaryData = await summaryRes.json();
          setUsersSummary(summaryData.data || []);
        } else {
          setIsAdmin(false);
          setError('Access Forbidden: You are not authorized to view this page.');
          // Optionally redirect to home page if not admin
          // router.push('/');
        }
      } catch (err: any) {
        console.error("Admin dashboard error:", err);
        setError(err.message || 'An error occurred while loading admin data.');
        setIsAdmin(false); // Assume not admin or error occurred
      } finally {
        setIsLoadingData(false);
        // Final check for isAdmin state if it's still null (shouldn't happen if try/catch is robust)
        if (isAdmin === null && !error) { // if still null and no specific error was set for admin check
          // This case implies an issue before setIsAdmin(true/false) was reached within try.
          // Default to not admin if status is indeterminate after checks.
          // setIsAdmin(false); // This might be redundant if the catch block handles it.
        }
      }
    };

    checkAdminAndFetchData();
  }, [router, isAdmin]); // Added isAdmin to dependency array to avoid potential issues if its state changes elsewhere, though unlikely here

  if (isAdmin === null) {
    return <div className="text-center p-10">Verifying admin status...</div>;
  }

  if (!isAdmin) {
    // If an error message specific to admin check failure is set, show it. Otherwise, generic forbidden.
    return <div className="text-center p-10 text-red-600">{error || 'Access Forbidden. You do not have permission to view this page.'}</div>;
  }

  // Admin is confirmed, now check data loading status
  if (isLoadingData) {
    return <div className="text-center p-10">Loading user data...</div>;
  }

  // If there was an error fetching summary data (but admin check passed)
  if (error && usersSummary.length === 0) {
      return <div className="text-center p-10 text-red-600">Error loading user summaries: {error}</div>;
  }

  return (
    <div> {/* Changed from container to allow layout to control container */}
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
      <h2 className="text-xl font-semibold mb-6">User Summaries</h2>

      {/* Display error related to data fetching if it occurred, even if some old data might be shown */}
      {error && !isLoadingData && <p className="text-red-500 mb-4">Error fetching data: {error}</p>}

      {usersSummary.length === 0 && !isLoadingData && !error && (
        <p className="text-center text-gray-500">No users found or no data to display.</p>
      )}

      {usersSummary.length > 0 && (
        <Table>
          <TableCaption>A list of user summaries and their activities.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Email</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Registered On</TableHead>
              <TableHead className="text-right">Jobs Posted</TableHead>
              <TableHead className="text-right">Apps Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersSummary.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-mono text-sm py-2">{user.email}</TableCell>
                <TableCell className="py-2">{user.firstName || 'N/A'}</TableCell>
                <TableCell className="py-2">{user.lastName || 'N/A'}</TableCell>
                <TableCell className="py-2">{format(new Date(user.registrationDate), 'PPpp')}</TableCell>
                <TableCell className="text-right py-2">{user.jobsPostedCount}</TableCell>
                <TableCell className="text-right py-2">{user.applicationsSubmittedCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
