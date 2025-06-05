"use client";

import { useEffect, useState } from 'react'; // Removed useCallback as checkAdminAndFetchData is inside useEffect
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
import Link from 'next/link'; // Import Link

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

// Assuming this is the actual structure from /api/profile based on prior fixes
// where it returns a consolidated object.
interface UserProfileResponse {
  success: boolean;
  data?: { // data might be optional if success is false
    email?: string;
    // other fields from combined user & profile data
  };
  message?: string; // In case of error
}


export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [usersSummary, setUsersSummary] = useState<UserSummary[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false); // For summary data specifically
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      setIsAdmin(null); // Indicates admin check is in progress
      setError(null);
      const token = getToken();

      if (!token) {
        router.push('/auth/login?redirect=/admin');
        // No need to set isAdmin to false here, as the component will unmount or redirect.
        return;
      }

      try {
        // 1. Verify if current user is admin
        const profileRes = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!profileRes.ok) {
          let errorMsg = 'Failed to fetch current user profile to verify admin status.';
          try {
            const errorData: {message?: string} = await profileRes.json();
            errorMsg = errorData.message || errorMsg;
          } catch (e) { /* ignore parsing error, use default msg */ }
          throw new Error(errorMsg);
        }

        const profileApiResponse: UserProfileResponse = await profileRes.json();

        // --- BEGIN ADDED LOGS ---
        // console.log("Admin Check: Full profileApiResponse:", JSON.stringify(profileApiResponse, null, 2)); // Log the whole object
        const currentUserEmail = profileApiResponse?.email;
        // console.log("Admin Check: Extracted currentUserEmail:", currentUserEmail);
        // console.log("Admin Check: ADMIN_EMAIL constant:", ADMIN_EMAIL);
        // console.log("Admin Check: Comparison result (currentUserEmail === ADMIN_EMAIL):", currentUserEmail === ADMIN_EMAIL);
        // if (currentUserEmail && typeof currentUserEmail === 'string' && typeof ADMIN_EMAIL === 'string') {
        //   console.log("Admin Check: Comparison result (lowercase) (currentUserEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()):", currentUserEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase());
        //   console.log("Admin Check: currentUserEmail char codes:");
        //   for(let i=0; i < currentUserEmail.length; i++) { console.log(currentUserEmail.charCodeAt(i) + " (" + currentUserEmail[i] + ")"); }
        //   console.log("Admin Check: ADMIN_EMAIL char codes:");
        //   for(let i=0; i < ADMIN_EMAIL.length; i++) { console.log(ADMIN_EMAIL.charCodeAt(i) + " (" + ADMIN_EMAIL[i] + ")"); }
        // }
        // --- END ADDED LOGS ---

        if (currentUserEmail === ADMIN_EMAIL) { // Or use toLowerCase comparison if that's the fix
          setIsAdmin(true); // Admin status confirmed

          // 2. If admin, fetch users summary
          setIsLoadingData(true); // Start loading summary data
          setError(null); // Clear previous errors before fetching summary
          try {
            const summaryRes = await fetch('/api/admin/users-summary', {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!summaryRes.ok) {
              let summaryErrorMsg = 'Failed to fetch users summary.';
              try {
                const errorResult: {message?: string} = await summaryRes.json();
                summaryErrorMsg = errorResult.message || summaryErrorMsg;
              } catch (e) { /* ignore parsing error */ }
              throw new Error(summaryErrorMsg);
            }
            const summaryData = await summaryRes.json();
            setUsersSummary(summaryData.data || []);
          } catch (summaryErr: any) {
            console.error("Failed to fetch users summary:", summaryErr);
            setError(summaryErr.message || 'Could not load user summaries.');
            setUsersSummary([]); // Clear previous summary data on error
          } finally {
            setIsLoadingData(false); // Finish loading summary data
          }
        } else {
          setIsAdmin(false); // Not an admin
          setError('Access Forbidden: You are not authorized to view this page.');
        }
      } catch (err: any) {
        console.error("Admin dashboard initial check error:", err);
        setError(err.message || 'An error occurred during admin verification.');
        setIsAdmin(false); // Set to false on any error during admin check
      }
      // No finally block needed here to set isAdmin, as it's set in try/catch.
      // setIsLoadingData(false) is handled within the admin block.
    };

    checkAdminAndFetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Changed dependency array to [] to run once on mount.
          // router.push is an exception that doesn't need to be in deps if it causes unmount/redirect.

  if (isAdmin === null) {
    return <div className="container mx-auto p-4 text-center">Verifying admin status...</div>;
  }

  if (!isAdmin) {
    return <div className="container mx-auto p-4 text-center text-red-500">{error || 'Access Forbidden. You are not authorized to view this page.'}</div>;
  }

  // Admin is true, now show data or data loading state
  if (isLoadingData) {
    return <div className="container mx-auto p-4 text-center">Loading user data...</div>;
  }

  // Error for user summary data, but admin is confirmed
  if (error && usersSummary.length === 0) {
      return (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Dashboard</h1>
          <p className="text-red-500 text-center">{error}</p>
        </div>
      );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin Dashboard - User Summaries</h1>
      {/* Display partial error for summary fetch if it occurred but we might have old data or want to show it */}
      {error && <p className="text-red-500 mb-4 text-center">Error fetching latest summary: {error}</p>}

      {usersSummary.length === 0 && !isLoadingData && (
        <p className="text-center text-muted-foreground">No users found or data could not be loaded.</p>
      )}

      {usersSummary.length > 0 && (
        <Table>
          <TableCaption>A list of user summaries and their activities.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Jobs Posted</TableHead>
              <TableHead className="text-right">Apps Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersSummary.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/users/${user.id}`} className="text-blue-600 hover:underline">
                    {user.email}
                  </Link>
                </TableCell>
                <TableCell>{user.firstName || 'N/A'}</TableCell>
                <TableCell>{user.lastName || 'N/A'}</TableCell>
                <TableCell>{user.registrationDate ? format(new Date(user.registrationDate), 'PPpp') : 'N/A'}</TableCell>
                <TableCell className="text-right">{user.jobsPostedCount}</TableCell>
                <TableCell className="text-right">{user.applicationsSubmittedCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
