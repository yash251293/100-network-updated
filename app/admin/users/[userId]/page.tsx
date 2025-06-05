"use client";

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/authClient';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import Link from 'next/link';

const ADMIN_EMAIL = 'yashrawlani00@gmail.com';

interface UserDetail {
  userId: string;
  email: string;
  registrationDate: string;
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
  preferredJobType: string | null;
  preferredExperienceLevel: string | null;
  remoteWorkPreference: string | null;
  preferredIndustries: string | null;
  skills: Array<{ name: string; proficiencyLevel: string | null }>;
  experience: Array<{ title: string; companyName: string; location: string | null; startDate: string | null; endDate: string | null; currentJob: boolean; description: string | null }>;
  education: Array<{ schoolName: string; degree: string | null; fieldOfStudy: string | null; startDate: string | null; endDate: string | null; currentStudent: boolean; description: string | null }>;
  jobsPosted: Array<{ id: string; title: string; jobType: string; status: string; createdAt: string; publishedAt: string | null }>;
  applicationsSubmitted: Array<{ applicationId: string; applicationDate: string; applicationStatus: string; jobId: string; jobTitle: string; companyName: string }>;
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

        const currentUserEmail = profileApiResponse?.email;

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
  }, [targetUserId]);

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading user details...</div>;
  }

  if (!isAdmin && isAdmin !== null) {
    return <div className="container mx-auto p-4 text-center text-red-500">{error || 'Access Forbidden.'}</div>;
  }

  if (error && !userDetail) {
     return <div className="container mx-auto p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!userDetail) {
    return <div className="container mx-auto p-4 text-center">User not found or could not be loaded. (IsAdmin: {String(isAdmin)})</div>;
  }

  const renderList = (items: any[], renderItem: (item: any, index: number) => JSX.Element, emptyMessage: string = "N/A") => {
    if (!items || items.length === 0) return <p className="text-muted-foreground">{emptyMessage}</p>;
    return <ul className="list-disc pl-5 space-y-1">{items.map(renderItem)}</ul>;
  };

  const formatDateDisplay = (dateString?: string | null) => { // Renamed to avoid conflict with imported format
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), 'PPpp');
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return "Invalid Date";
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4 print:hidden">
        &larr; Back
      </Button>
      <h1 className="text-3xl font-bold mb-2">User Details</h1>

      {error && userDetail && <p className="text-red-500 bg-red-100 p-3 rounded-md">Partial error: {error}</p>}

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userDetail.avatarUrl || undefined} alt={`${userDetail.firstName || ''} ${userDetail.lastName || ''}`} />
              <AvatarFallback>{(userDetail.firstName?.[0] || 'U')}{(userDetail.lastName?.[0] || 'N')}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{userDetail.firstName || 'N/A'} {userDetail.lastName || 'N/A'}</CardTitle>
              <CardDescription>{userDetail.email}</CardDescription>
              <p className="text-sm text-muted-foreground">Registered: {formatDateDisplay(userDetail.registrationDate)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {userDetail.headline && <p><strong>Headline:</strong> {userDetail.headline}</p>}
          {userDetail.bio && <p className="whitespace-pre-line"><strong>Bio:</strong> {userDetail.bio}</p>}
          {userDetail.location && <p><strong>Location:</strong> {userDetail.location}</p>}
          {userDetail.phone && <p><strong>Phone:</strong> {userDetail.phone}</p>}
          {userDetail.websiteUrl && <p><strong>Website:</strong> <a href={userDetail.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{userDetail.websiteUrl}</a></p>}
          {userDetail.linkedinUrl && <p><strong>LinkedIn:</strong> <a href={userDetail.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{userDetail.linkedinUrl}</a></p>}
          {userDetail.githubUrl && <p><strong>GitHub:</strong> <a href={userDetail.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{userDetail.githubUrl}</a></p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Profile Preferences</CardTitle></CardHeader>
        <CardContent>
          <p><strong>Preferred Job Type:</strong> {userDetail.preferredJobType || 'N/A'}</p>
          <p><strong>Preferred Experience Level:</strong> {userDetail.preferredExperienceLevel || 'N/A'}</p>
          <p><strong>Remote Work Preference:</strong> {userDetail.remoteWorkPreference || 'N/A'}</p>
          <p><strong>Preferred Industries:</strong> {userDetail.preferredIndustries || 'N/A'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
        <CardContent>
          {renderList(userDetail.skills, (skill, i) => (
            <li key={`skill-${i}`}><Badge variant="secondary">{skill.name}</Badge> {skill.proficiencyLevel && `(${skill.proficiencyLevel})`}</li>
          ), "No skills listed.")}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Work Experience</CardTitle></CardHeader>
        <CardContent>
          {renderList(userDetail.experience, (exp, i) => (
            <li key={`exp-${i}`} className="mb-2 border-b pb-2 last:border-b-0 last:pb-0">
              <strong>{exp.title}</strong> at {exp.companyName} ({exp.location || 'N/A'})<br/>
              <span className="text-sm text-muted-foreground">{formatDateDisplay(exp.startDate)} - {exp.currentJob ? 'Present' : formatDateDisplay(exp.endDate)}</span>
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
              <strong>{edu.schoolName}</strong> - {edu.degree || 'N/A'} ({edu.fieldOfStudy || 'N/A'})<br/>
              <span className="text-sm text-muted-foreground">{formatDateDisplay(edu.startDate)} - {edu.currentStudent ? 'Present' : formatDateDisplay(edu.endDate)}</span>
              {edu.description && <p className="text-sm whitespace-pre-line">{exp.description}</p>} {/* Typo: should be edu.description */}
            </li>
          ), "No education listed.")}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Jobs Posted ({userDetail.jobsPosted?.length || 0})</CardTitle></CardHeader>
        <CardContent>
          {renderList(userDetail.jobsPosted, (job, i) => (
            <li key={`job-${job.id}`}>
              <Link href={`/jobs/${job.id}`} className="text-blue-500 hover:underline">{job.title}</Link> ({job.status}, {job.jobType}) - Posted: {formatDateDisplay(job.createdAt)}
            </li>
          ), "No jobs posted by this user.")}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Applications Submitted ({userDetail.applicationsSubmitted?.length || 0})</CardTitle></CardHeader>
        <CardContent>
          {renderList(userDetail.applicationsSubmitted, (app, i) => (
            <li key={`app-${app.applicationId}`}>
              Applied for <Link href={`/jobs/${app.jobId}`} className="text-blue-500 hover:underline">{app.jobTitle}</Link> at {app.companyName}
              <br/><span className="text-sm text-muted-foreground">Status: {app.applicationStatus}, Applied: {formatDateDisplay(app.applicationDate)}</span>
            </li>
          ), "No applications submitted by this user.")}
        </CardContent>
      </Card>
    </div>
  );
}
