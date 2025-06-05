"use client"

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookmarkIcon as LucideBookmarkIcon, Filter, Search, Clock, CheckCircle, XCircle, Calendar, Briefcase, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import JobCard, { JobCardSkeleton, Job as JobType } from "@/components/JobCard";
import { formatDistanceToNow } from 'date-fns';
import Image from "next/image";
import { getToken } from "@/lib/authClient"; // Added
import { toast } from "sonner"; // Added
import { Skeleton } from "@/components/ui/skeleton"; // Added for AppliedJobCardSkeleton

// Types for Applied Job (assuming structure from API)
interface AppliedJob {
  application_id: string;
  job_id: string;
  user_id: string;
  application_date: string;
  status: string;
  cover_letter?: string | null;
  resume_url?: string | null;
  notes?: string | null;
  job_title: string;
  job_location?: string | null;
  company_name: string;
  company_logo_url?: string | null;
  applicant_email?: string;
  applicant_first_name?: string | null;
  applicant_last_name?: string | null;
}

const getStatusIcon = (status: string) => {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case "applied": return <Clock className="h-4 w-4 text-blue-600" />;
    case "under review": return <Clock className="h-4 w-4 text-orange-600" />;
    case "interview scheduled": return <Calendar className="h-4 w-4 text-green-600" />;
    case "rejected": return <XCircle className="h-4 w-4 text-red-600" />;
    case "offer extended": return <CheckCircle className="h-4 w-4 text-purple-600" />;
    case "withdrawn": return <XCircle className="h-4 w-4 text-gray-500" />;
    default: return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusBadge = (status: string) => {
  const statusLower = status?.toLowerCase();
  const variants: { [key: string]: string } = {
    "applied": "bg-blue-100 text-blue-800",
    "under review": "bg-orange-100 text-orange-800",
    "interview scheduled": "bg-green-100 text-green-800",
    "rejected": "bg-red-100 text-red-800",
    "offer extended": "bg-purple-100 text-purple-800",
    "withdrawn": "bg-gray-100 text-gray-800",
  };
  return <Badge className={`${variants[statusLower] || 'bg-gray-100 text-gray-800'} border-0`}>{status || "Unknown"}</Badge>;
};

interface AppliedJobCardProps {
  application: AppliedJob;
}

function AppliedJobCard({ application }: AppliedJobCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-4">
          {application.company_logo_url ? (
            <Image src={application.company_logo_url} alt={application.company_name} width={40} height={40} className="rounded-md object-contain h-10 w-10" />
          ) : (
            <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
              <Briefcase size={20} className="text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            {application.job_id && typeof application.job_id === 'string' && application.job_id.trim() !== '' ? (
              <h3 className="font-medium text-primary hover:underline">
                <Link href={`/jobs/${application.job_id}`}>{application.job_title}</Link>
              </h3>
            ) : (
              <h3 className="font-medium text-primary">{application.job_title}</h3>
            )}
            <div className="flex items-center space-x-2">
              {getStatusIcon(application.status)}
              {getStatusBadge(application.status)}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {application.company_name} {application.job_location && `• ${application.job_location}`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Applied: {application.application_date ? formatDistanceToNow(new Date(application.application_date), { addSuffix: true }) : 'N/A'}
          </p>
          {application.resume_url && (
            <a
              href={application.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline inline-flex items-center mt-1"
            >
              View Resume <ExternalLink size={12} className="ml-1" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function AppliedJobCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start">
        <Skeleton className="h-10 w-10 rounded-md mr-4 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-24 rounded-md" />
      </div>
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState(new Set<string>());
  const [appliedJobsList, setAppliedJobsList] = useState<AppliedJob[]>([]);
  const [isLoadingApplied, setIsLoadingApplied] = useState(true);
  const [errorApplied, setErrorApplied] = useState<string | null>(null);
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("");
  const [appliedCurrentPage, setAppliedCurrentPage] = useState(1);
  const [appliedTotalPages, setAppliedTotalPages] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (activeTab === "all") setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, activeTab]);

  const fetchBookmarkedJobs = useCallback(async () => {
    const token = getToken();
    if (!token) {
      // Not strictly an error, user might not be logged in. Clear existing bookmarks.
      setBookmarkedJobIds(new Set());
      return;
    }
    try {
      const response = await fetch('/api/job-bookmarks?limit=500', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        let errorDetails = '';
        try {
          // Attempt to get more details, but don't let this fail loudly
          const errorData = await response.json(); // Try JSON first
          errorDetails = errorData.message || JSON.stringify(errorData);
        } catch (e) {
          // If .json() fails, try .text()
          try {
            errorDetails = await response.text();
          } catch (e2) {
            errorDetails = 'Could not retrieve error details.';
          }
        }
        console.error(`Failed to fetch bookmarked jobs. Status: ${response.status}. Details: ${errorDetails}`);
        // Optionally set a specific error state for bookmark loading here
        // e.g., setErrorBookmarks(`Failed to load bookmarks: ${response.status}`);
        return; // Exit the function
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data && data.data && Array.isArray(data.data)) {
          const ids = new Set<string>(data.data.map((bookmark: any) => bookmark.job_id));
          setBookmarkedJobIds(ids);
        } else {
          console.error('Fetched bookmarks data is not in expected format:', data);
        }
      } else {
        const responseText = await response.text();
        console.error('Received non-JSON response when fetching bookmarks:', responseText);
      }
    } catch (err) {
      console.error("Error fetching or processing bookmarks:", err);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({ page: String(currentPage), limit: "5" });
      if (debouncedSearchTerm) queryParams.set("searchTerm", debouncedSearchTerm);
      if (jobType) queryParams.set("jobType", jobType);
      if (experienceLevel) queryParams.set("experienceLevel", experienceLevel);
      if (locationFilter) queryParams.set("location", locationFilter);
      const response = await fetch(`/api/jobs?${queryParams.toString()}`); // Public, no token needed
      if (!response.ok) throw new Error((await response.json()).message || `Failed to fetch jobs`);
      const data = await response.json();
      setJobs(data.data || []);
      setTotalPages(data.pagination.totalPages || 1);
    } catch (err: any) {
      setError(err.message);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, jobType, experienceLevel, locationFilter]);

  const fetchAppliedJobs = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setErrorApplied("Please log in to see your applications.");
      setAppliedJobsList([]);
      setIsLoadingApplied(false);
      return;
    }
    setIsLoadingApplied(true);
    setErrorApplied(null);
    try {
      const queryParams = new URLSearchParams({ page: String(appliedCurrentPage), limit: "5" });
      if (appliedStatusFilter && appliedStatusFilter !== "all") queryParams.set("status", appliedStatusFilter);
      const response = await fetch(`/api/job-applications?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error((await response.json()).message || `Failed to fetch applied jobs`);
      const data = await response.json();
      setAppliedJobsList(data.data || []);
      setAppliedTotalPages(data.pagination.totalPages || 1);
    } catch (err: any) {
      setErrorApplied(err.message);
      setAppliedJobsList([]);
    } finally {
      setIsLoadingApplied(false);
    }
  }, [appliedCurrentPage, appliedStatusFilter]);

  useEffect(() => {
    if (activeTab === "all") {
      fetchJobs();
      fetchBookmarkedJobs();
    } else if (activeTab === "applied") {
      fetchAppliedJobs();
    }
  }, [activeTab, fetchJobs, fetchAppliedJobs, fetchBookmarkedJobs]);

  const handleBookmarkToggle = async (jobId: string) => {
    const token = getToken();
    if (!token) {
      toast.error("Please log in to bookmark jobs.");
      return;
    }
    const isCurrentlyBookmarked = bookmarkedJobIds.has(jobId);
    const originalBookmarks = new Set(bookmarkedJobIds);
    setBookmarkedJobIds(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyBookmarked) newSet.delete(jobId);
      else newSet.add(jobId);
      return newSet;
    });
    try {
      const method = isCurrentlyBookmarked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/jobs/${jobId}/bookmark`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        setBookmarkedJobIds(originalBookmarks);
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update bookmark.');
      } else {
        toast.success(`Job ${isCurrentlyBookmarked ? 'unbookmarked' : 'bookmarked'}!`);
      }
    } catch (error) {
      setBookmarkedJobIds(originalBookmarks);
      toast.error('Error updating bookmark.');
    }
  };

  const handleJobTypeChange = (value: string) => { setJobType(value === "all" ? "" : value); setCurrentPage(1); };
  const handleExperienceLevelChange = (value: string) => { setExperienceLevel(value === "all" ? "" : value); setCurrentPage(1); };
  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => { setLocationFilter(event.target.value); setCurrentPage(1); };
  const handleAppliedStatusChange = (value: string) => { setAppliedStatusFilter(value === "all" ? "" : value); setAppliedCurrentPage(1); };

  const renderAllJobsContent = () => {
    if (isLoading && jobs.length === 0) return <div className="space-y-4">{[...Array(5)].map((_, i) => <JobCardSkeleton key={i} />)}</div>;
    if (error) return <p className="text-red-500 text-center py-8">Error: {error}</p>;
    if (jobs.length === 0 && !isLoading) return <p className="text-muted-foreground text-center py-8">No jobs found matching your criteria.</p>;
    return (
      <div className="space-y-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onBookmarkToggle={handleBookmarkToggle} isBookmarked={bookmarkedJobIds.has(job.id)} />
        ))}
      </div>
    );
  };

  const renderAppliedJobsContent = () => {
    if (isLoadingApplied && appliedJobsList.length === 0) return <div className="space-y-4">{[...Array(3)].map((_, i) => <AppliedJobCardSkeleton key={i} />)}</div>;
    if (errorApplied) return <p className="text-red-500 text-center py-8">Error: {errorApplied}</p>;
    if (appliedJobsList.length === 0 && !isLoadingApplied) return (
        <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium">No applications yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Start applying to jobs to track your applications here.</p>
        </div>
    );
    return (
      <div className="space-y-4">
        {appliedJobsList.map((app) => <AppliedJobCard key={app.application_id} application={app} />)}
      </div>
    );
  };

  return (
    <div className="container max-w-5xl py-6">
      <h1 className="text-2xl font-bold mb-6">Jobs</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="applied">Applied Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="relative sm:col-span-2 md:col-span-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search jobs by title, company, keyword..." className="pl-10 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={jobType} onValueChange={handleJobTypeChange}>
              <SelectTrigger><SelectValue placeholder="Job type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Job Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem><SelectItem value="Internship">Internship</SelectItem>
                <SelectItem value="Freelance Project">Freelance Project</SelectItem>
              </SelectContent>
            </Select>
            <Select value={experienceLevel} onValueChange={handleExperienceLevelChange}>
              <SelectTrigger><SelectValue placeholder="Experience level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Entry">Entry</SelectItem><SelectItem value="Mid-level">Mid-level</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem><SelectItem value="Lead">Lead</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem><SelectItem value="Director">Director</SelectItem>
                <SelectItem value="Executive">Executive</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Location (e.g., city, remote)" value={locationFilter} onChange={handleLocationChange} />
          </div>
          {renderAllJobsContent()}
          {jobs.length > 0 && totalPages > 1 && !isLoading && (
            <div className="flex items-center justify-center space-x-4 pt-4">
              <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4 mr-1" /> Previous</Button>
              <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="applied" className="space-y-6">
          <div className="flex space-x-4">
            <Select value={appliedStatusFilter} onValueChange={handleAppliedStatusChange}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                <SelectItem value="Offer Extended">Offer Extended</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {renderAppliedJobsContent()}
           {appliedJobsList.length > 0 && appliedTotalPages > 1 && !isLoadingApplied && (
            <div className="flex items-center justify-center space-x-4 pt-4">
              <Button variant="outline" onClick={() => setAppliedCurrentPage(p => Math.max(1, p - 1))} disabled={appliedCurrentPage === 1}><ChevronLeft className="h-4 w-4 mr-1" /> Previous</Button>
              <span className="text-sm text-muted-foreground">Page {appliedCurrentPage} of {appliedTotalPages}</span>
              <Button variant="outline" onClick={() => setAppliedCurrentPage(p => Math.min(appliedTotalPages, p + 1))} disabled={appliedCurrentPage === appliedTotalPages}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
