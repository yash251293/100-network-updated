"use client";

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/authClient';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Added Button import
import { format } from 'date-fns';
import Link from 'next/link'; // Added Link import

const ADMIN_EMAIL = 'yashrawlani00@gmail.com';

// Define a comprehensive interface for the expected user detail structure from the API
interface UserDetail {
  userid: string;
  email: string;
  registrationdate: string;
  firstname: string | null;
  lastname: string | null;
  avatarurl: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  linkedinurl: string | null;
  githuburl: string | null;
  websiteurl: string | null;
  phone: string | null;
  preferredjobtype: string | null;
  preferredexperiencelevel: string | null;
  remoteworkpreference: string | null;
  preferredindustries: string | null;
  skills: Array<{ name: string; proficiencylevel: string | null }>;
  experience: Array<{ title: string; companyname: string; location: string | null; startdate: string | null; enddate: string | null; currentjob: boolean; description: string | null }>;
  education: Array<{ schoolname: string; degree: string | null; fieldofstudy: string | null; startdate: string | null; enddate: string | null; currentstudent: boolean; description: string | null }>;
  jobsposted: Array<{ id: string; title: string; jobtype: string; status: string; createdat: string; publishedat: string | null }>;
  applicationssubmitted: Array<{ applicationid: string; applicationdate: string; applicationstatus: string; jobid: string; jobtitle: string; companyname: string }>;
}

interface UserProfileCheckResponse {
  success: boolean;
  data?: { email?: string; };
  message?: string;
}

interface AdminUserDetailResponse {
    success: boolean;
    data?: UserDetail;
    message?: string;
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const targetUserId = params?.userId as string;

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!targetUserId) {
        setError("User ID not found in URL.");
        setIsLoading(false);
        setIsAdmin(false);
        return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const token = getToken();

      if (!token) {
        router.push(`/auth/login?redirect=/admin/users/${targetUserId}`);
        return;
      }

      try {
        // 1. Verify admin status
        const profileRes = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!profileRes.ok) {
            let errorMsg = 'Failed to verify admin status';
            try { const errData = await profileRes.json(); errorMsg = errData.message || errorMsg; } catch(e){}
            throw new Error(errorMsg);
        }
        const profileApiResponse: UserProfileCheckResponse = await profileRes.json();

        // --- BEGIN ADDED DIAGNOSTIC LOGS ---
        // Log the part of the response that should contain the email
        // Assuming UserProfileCheckResponse is { success: boolean, data?: { email?: string } }
        // and profileApiResponse is this entire object.
        console.log("Admin User Detail Page - Admin Check: Full profileApiResponse object:", JSON.stringify(profileApiResponse, null, 2));
        console.log("Admin User Detail Page - Admin Check: profileApiResponse.data object:", JSON.stringify(profileApiResponse.data, null, 2));

        const currentUserEmail = profileApiResponse.data?.email; // This is the line we are testing

        console.log("Admin User Detail Page - Admin Check: Extracted currentUserEmail:", currentUserEmail);
        console.log("Admin User Detail Page - Admin Check: ADMIN_EMAIL constant:", ADMIN_EMAIL);

        if (currentUserEmail !== undefined && currentUserEmail !== null) {
          console.log("Admin User Detail Page - Admin Check: Comparison result (currentUserEmail === ADMIN_EMAIL):", currentUserEmail === ADMIN_EMAIL);
          if (typeof currentUserEmail === 'string' && typeof ADMIN_EMAIL === 'string') {
            console.log("Admin User Detail Page - Admin Check: Comparison result (lowercase) (currentUserEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()):", currentUserEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase());

            console.log("Admin User Detail Page - Admin Check: currentUserEmail char codes:");
            let codes = "";
            for(let i=0; i < currentUserEmail.length; i++) { codes += currentUserEmail.charCodeAt(i) + "(" + currentUserEmail[i] + ") "; }
            console.log(codes.trim());

            console.log("Admin User Detail Page - Admin Check: ADMIN_EMAIL char codes:");
            codes = "";
            for(let i=0; i < ADMIN_EMAIL.length; i++) { codes += ADMIN_EMAIL.charCodeAt(i) + "(" + ADMIN_EMAIL[i] + ") "; }
            console.log(codes.trim());
          }
        } else {
          console.log("Admin User Detail Page - Admin Check: currentUserEmail is undefined or null, cannot perform detailed comparison.");
        }
        // --- END ADDED DIAGNOSTIC LOGS ---

        if (currentUserEmail !== ADMIN_EMAIL) {
          setIsAdmin(false);
          setError('Access Forbidden: You are not authorized to view this page.');
          setIsLoading(false);
          return;
        }
        setIsAdmin(true);

        // 2. Fetch target user details
        const userDetailRes = await fetch(`/api/admin/users/${targetUserId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!userDetailRes.ok) {
          const errData: {message?:string} = await userDetailRes.json();
          throw new Error(errData.message || 'Failed to fetch user details.');
        }
        const userDetailApiResponse: AdminUserDetailResponse = await userDetailRes.json();
        if(userDetailApiResponse.success && userDetailApiResponse.data){
            setUserDetail(userDetailApiResponse.data);
        } else {
            throw new Error(userDetailApiResponse.message || 'User data not found in API response.');
        }

      } catch (err: any) {
        console.error("Admin user detail page error:", err);
        setError(err.message || 'An error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId]); // Removed router from deps

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading user details...</div>;
  }

  if (!isAdmin && isAdmin !== null) {
    return <div className="container mx-auto p-4 text-center text-red-500">{error || 'Access Forbidden.'}</div>;
  }

  if (error && !userDetail) { // Show error only if userDetail is not set (implies major fetch error)
     return <div className="container mx-auto p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!userDetail) {
    return <div className="container mx-auto p-4 text-center">User not found or could not be loaded. (IsAdmin: {String(isAdmin)})</div>;
  }

  const renderList = (items: any[], renderItem: (item: any, index: number) => JSX.Element, emptyMessage: string = "N/A") => {
    if (!items || items.length === 0) return <p className="text-muted-foreground">{emptyMessage}</p>;
    return <ul className="list-disc pl-5 space-y-1">{items.map(renderItem)}</ul>;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), 'PPpp');
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return "Invalid Date";
    }
  };

  return (
    <div className="space-y-6"> {/* Layout container is in app/admin/layout.tsx */}
      <Button variant="outline" onClick={() => router.back()} className="mb-4 print:hidden">
        &larr; Back
      </Button>
      <h1 className="text-3xl font-bold mb-2">User Details</h1>

      {error && userDetail && <p className="text-red-500 bg-red-100 p-3 rounded-md">Partial error: {error}</p>}

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userDetail.avatarurl || undefined} alt={`${userDetail.firstname || ''} ${userDetail.lastname || ''}`} />
              <AvatarFallback>{(userDetail.firstname?.[0] || 'U')}{(userDetail.lastname?.[0] || 'N')}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{userDetail.firstname || 'N/A'} {userDetail.lastname || 'N/A'}</CardTitle>
              <CardDescription>{userDetail.email}</CardDescription>
              <p className="text-sm text-muted-foreground">Registered: {formatDate(userDetail.registrationdate)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {userDetail.headline && <p><strong>Headline:</strong> {userDetail.headline}</p>}
          {userDetail.bio && <p className="whitespace-pre-line"><strong>Bio:</strong> {userDetail.bio}</p>}
          {userDetail.location && <p><strong>Location:</strong> {userDetail.location}</p>}
          {userDetail.phone && <p><strong>Phone:</strong> {userDetail.phone}</p>}
          {userDetail.websiteurl && <p><strong>Website:</strong> <a href={userDetail.websiteurl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{userDetail.websiteurl}</a></p>}
          {userDetail.linkedinurl && <p><strong>LinkedIn:</strong> <a href={userDetail.linkedinurl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{userDetail.linkedinurl}</a></p>}
          {userDetail.githuburl && <p><strong>GitHub:</strong> <a href={userDetail.githuburl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{userDetail.githuburl}</a></p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Profile Preferences</CardTitle></CardHeader>
        <CardContent>
          <p><strong>Preferred Job Type:</strong> {userDetail.preferredjobtype || 'N/A'}</p>
          <p><strong>Preferred Experience Level:</strong> {userDetail.preferredexperiencelevel || 'N/A'}</p>
          <p><strong>Remote Work Preference:</strong> {userDetail.remoteworkpreference || 'N/A'}</p>
          <p><strong>Preferred Industries:</strong> {userDetail.preferredindustries || 'N/A'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
        <CardContent>
          {renderList(userDetail.skills, (skill, i) => (
            <li key={`skill-${i}`}><Badge variant="secondary">{skill.name}</Badge> {skill.proficiencylevel && `(${skill.proficiencylevel})`}</li>
          ), "No skills listed.")}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Work Experience</CardTitle></CardHeader>
        <CardContent>
          {renderList(userDetail.experience, (exp, i) => (
            <li key={`exp-${i}`} className="mb-2 border-b pb-2 last:border-b-0 last:pb-0">
              <strong>{exp.title}</strong> at {exp.companyname} ({exp.location || 'N/A'})<br/>
              <span className="text-sm text-muted-foreground">{formatDate(exp.startdate)} - {exp.currentjob ? 'Present' : formatDate(exp.enddate)}</span>
              {exp.description && <p className="text-sm whitespace-pre-line">{exp.description}</p>}
            </li>
          ), "No work experience listed.")}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Education</CardTitle></CardHeader>
        <CardContent>
          {renderList(userDetail.education, (edu, i) => (
            <li key={`edu-${i}`} className="mb-2 border-b pb-2 last:border-b-0 last:pb-0">
              <strong>{edu.schoolname}</strong> - {edu.degree || 'N/A'} ({edu.fieldofstudy || 'N/A'})<br/>
              <span className="text-sm text-muted-foreground">{formatDate(edu.startdate)} - {edu.currentstudent ? 'Present' : formatDate(edu.enddate)}</span>
              {edu.description && <p className="text-sm whitespace-pre-line">{edu.description}</p>}
            </li>
          ), "No education listed.")}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Jobs Posted ({userDetail.jobsposted?.length || 0})</CardTitle></CardHeader>
        <CardContent>
          {renderList(userDetail.jobsposted, (job, i) => (
            <li key={`job-${job.id}`}>
              <Link href={`/jobs/${job.id}`} className="text-blue-500 hover:underline">{job.title}</Link> ({job.status}, {job.jobtype}) - Posted: {formatDate(job.createdat)}
            </li>
          ), "No jobs posted by this user.")}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Applications Submitted ({userDetail.applicationssubmitted?.length || 0})</CardTitle></CardHeader>
        <CardContent>
          {renderList(userDetail.applicationssubmitted, (app, i) => (
            <li key={`app-${app.applicationid}`}>
              Applied for <Link href={`/jobs/${app.jobid}`} className="text-blue-500 hover:underline">{app.jobtitle}</Link> at {app.companyname}
              <br/><span className="text-sm text-muted-foreground">Status: {app.applicationstatus}, Applied: {formatDate(app.applicationdate)}</span>
            </li>
          ), "No applications submitted by this user.")}
        </CardContent>
      </Card>
    </div>
  );
}
