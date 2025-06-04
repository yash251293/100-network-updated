"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Bookmark as BookmarkIcon, // Renamed to avoid conflict with state variable
  Share2,
  MapPin,
  Briefcase, // Changed from Clock for job type
  DollarSign,
  Users, // Kept for applicants, though API doesn't provide this for a single job yet
  Building2,
  CalendarDays, // Changed from Calendar for consistency
  CheckCircle,
  AlertCircle,
  Info, // For "Nice to have"
  Award, // For "Benefits"
  Building, // For company logo placeholder
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";
import JobApplicationModal from "@/components/JobApplicationModal"; // Import the modal

// Interface for Job Details from API (based on /api/jobs/[id] route)
interface CompanyDetails {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  industry: string | null;
  size: string | null;
  hqLocation: string | null;
}
interface JobDetails {
  id: string;
  title: string;
  description: string | null;
  responsibilities: string | null; // Assuming these are TEXT, might need parsing if structured
  requirements: string | null;   // Assuming these are TEXT
  benefits: string | null;       // Assuming these are TEXT
  location: string | null;
  jobType: string;
  experienceLevel: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryPeriod: string | null;
  applicationDeadline: string | null; // ISO String
  status: string;
  publishedAt: string | null; // ISO String
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  postedByUserId: string;
  company: CompanyDetails;
  skills: string[]; // Array of skill names
}

// Helper to parse text fields that might contain lists
const parseListField = (text: string | null | undefined): string[] => {
  if (!text) return [];
  // Assuming items are separated by newlines or common list markers
  // This is a basic split, can be made more robust
  return text.split(/\n(?=\s*[-*•–—]|\s*\d+\.\s*)/) // Split by newline followed by list marker
             .map(item => item.replace(/^[\s*-*•–—]*/, '').replace(/^\d+\.\s*/, '').trim()) // Remove markers and trim
             .filter(item => item.length > 0);
};


export default function JobDetailPage() {
  const params = useParams();
  const jobId = params?.id as string; // Type assertion
  const { toast } = useToast();

  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false); // To disable apply button

  const fetchJobAndStatus = useCallback(async () => {
    if (!jobId) return;
    setIsLoading(true);
    setError(null);

    try {
      // Fetch job details
      const jobRes = await fetch(`/api/jobs/${jobId}`);
      if (!jobRes.ok) {
        if (jobRes.status === 404) throw new Error("Job not found");
        throw new Error(`Failed to load job details (${jobRes.status})`);
      }
      const jobData = await jobRes.json();
      setJobDetails(jobData.data);

      // Fetch initial bookmark status
      // For simplicity, we assume /api/job-bookmarks returns a list of bookmarked job IDs or full objects
      // A more specific endpoint like /api/jobs/${jobId}/bookmark-status would be better.
      try {
        const bookmarkRes = await fetch(`/api/job-bookmarks`); // This API returns full job objects with job_id
        if (bookmarkRes.ok) {
          const bookmarksData = await bookmarkRes.json();
          const isMarked = bookmarksData.data.some((b: any) => b.job_id === jobId);
          setIsBookmarked(isMarked);
        } else {
          console.warn("Could not fetch bookmark status.");
        }
      } catch (bookmarkError) {
         console.warn("Error checking bookmark status:", bookmarkError);
      }

      // Check if user has already applied (Example check, API might be different)
      try {
        const applicationCheckRes = await fetch(`/api/job-applications?jobId=${jobId}`); // This API should filter by current user via token
        if(applicationCheckRes.ok) {
            const applicationsData = await applicationCheckRes.json();
            if(applicationsData.data && applicationsData.data.length > 0) {
                setHasApplied(true);
            }
        }
      } catch(appCheckError) {
        console.warn("Error checking application status:", appCheckError);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJobAndStatus();
  }, [fetchJobAndStatus]);

  const handleToggleBookmark = async () => {
    if (!jobDetails) return;
    const originalBookmarkStatus = isBookmarked;
    setIsBookmarked(!isBookmarked); // Optimistic update

    try {
      const method = !originalBookmarkStatus ? 'POST' : 'DELETE';
      const response = await fetch(`/api/jobs/${jobDetails.id}/bookmark`, { method });
      if (!response.ok) {
        setIsBookmarked(originalBookmarkStatus); // Revert on failure
        toast({ title: "Error", description: "Failed to update bookmark.", variant: "destructive" });
      } else {
        toast({ title: "Success", description: `Job ${!originalBookmarkStatus ? 'bookmarked' : 'unbookmarked'}!` });
      }
    } catch (err) {
      setIsBookmarked(originalBookmarkStatus); // Revert on failure
      toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast({ title: "Link Copied!", description: "Job link copied to clipboard." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy link.", variant: "destructive" }));
  };

  const formatSalaryRange = (job: JobDetails) => {
    if (!job.salaryMin && !job.salaryMax) return "Not Disclosed";
    const min = job.salaryMin ? `$${(job.salaryMin / 1000).toFixed(0)}K` : '';
    const max = job.salaryMax ? `$${(job.salaryMax / 1000).toFixed(0)}K` : '';
    const currency = job.salaryCurrency || '';
    const period = job.salaryPeriod ? ` ${job.salaryPeriod}` : '';
    if (min && max) return `${min} - ${max} ${currency}${period}`;
    return `${min || max} ${currency}${period}`;
  };


  if (isLoading) {
    // loading.tsx handles the main skeleton. This return is for client-side loading state post-initial load.
    // Or, if not using Suspense with route groups, this would be the primary loading display.
    // For now, returning null relies on loading.tsx for the initial skeleton.
    return null;
  }

  if (error) {
    return <div className="container max-w-4xl py-6 text-center text-red-500">{error}</div>;
  }

  if (!jobDetails) {
    return <div className="container max-w-4xl py-6 text-center">Job details not available.</div>;
  }

  const responsibilitiesList = parseListField(jobDetails.responsibilities);
  const requirementsList = parseListField(jobDetails.requirements);
  const benefitsList = parseListField(jobDetails.benefits);
  // For "Nice to have", assuming it might be part of description or a separate field if API provides it
  // For now, let's assume it's not a dedicated field in JobDetails type.

  return (
    <>
      <div className="container max-w-4xl py-6">
        <div className="flex items-center mb-6">
          <Link href="/jobs" className="mr-4">
            <Button variant="ghost" size="icon" aria-label="Back to jobs">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            {/* Title can be here or inside the card */}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={handleShare} aria-label="Share job">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleToggleBookmark} aria-label={isBookmarked ? "Unbookmark job" : "Bookmark job"}>
              <BookmarkIcon className={`h-4 w-4 ${isBookmarked ? 'text-yellow-500 fill-yellow-400' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-6">
                  {jobDetails.company.logoUrl ? (
                    <Image src={jobDetails.company.logoUrl} alt={jobDetails.company.name} width={64} height={64} className="h-16 w-16 rounded-lg object-contain" />
                  ) : (
                    <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                      <Building className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-1">{jobDetails.title}</h1>
                    <div className="flex items-center space-x-4 text-muted-foreground text-sm mb-3">
                      <div className="flex items-center"><Building2 className="h-4 w-4 mr-1" />{jobDetails.company.name}</div>
                      {jobDetails.location && <div className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{jobDetails.location}</div>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{jobDetails.jobType}</Badge>
                      {jobDetails.experienceLevel && <Badge variant="secondary">{jobDetails.experienceLevel}</Badge>}
                      {jobDetails.applicationDeadline && <Badge variant="outline" className="border-orange-500 text-orange-600">Apply by: {new Date(jobDetails.applicationDeadline).toLocaleDateString()}</Badge>}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg text-sm">
                    <div><span className="font-semibold">Salary:</span> {formatSalaryRange(jobDetails)}</div>
                    <div><span className="font-semibold">Published:</span> {jobDetails.publishedAt ? formatDistanceToNow(new Date(jobDetails.publishedAt), { addSuffix: true }) : 'N/A'}</div>
                    {jobDetails.status && <div><span className="font-semibold">Status:</span> <Badge variant={jobDetails.status === 'Open' ? 'default' : 'secondary'}>{jobDetails.status}</Badge></div>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Job Description</CardTitle></CardHeader>
              <CardContent className="space-y-6 prose dark:prose-invert max-w-none">
                {jobDetails.description && <p className="leading-relaxed whitespace-pre-line">{jobDetails.description}</p>}

                {responsibilitiesList.length > 0 && (<>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center"><CheckCircle className="h-5 w-5 text-green-600 mr-2" />Key Responsibilities</h3>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {responsibilitiesList.map((item, i) => <li key={`resp-${i}`}>{item}</li>)}
                    </ul>
                  </div>
                </>)}

                {requirementsList.length > 0 && (<>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center"><AlertCircle className="h-5 w-5 text-orange-600 mr-2" />Requirements</h3>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {requirementsList.map((item, i) => <li key={`req-${i}`}>{item}</li>)}
                    </ul>
                  </div>
                </>)}

                {benefitsList.length > 0 && (<>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center"><Award className="h-5 w-5 text-indigo-600 mr-2" />Benefits & Perks</h3>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {benefitsList.map((item, i) => <li key={`ben-${i}`}>{item}</li>)}
                    </ul>
                  </div>
                </>)}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:sticky lg:top-6"> {/* Sticky sidebar */}
            <Card>
              <CardContent className="p-6">
                <Button
                  className="w-full mb-3"
                  size="lg"
                  onClick={() => setShowApplyModal(true)}
                  disabled={jobDetails.status !== 'Open' || hasApplied}
                >
                  {hasApplied ? "Already Applied" : (jobDetails.status !== 'Open' ? `Not Accepting Applications` : "Apply for this position")}
                </Button>
                <Button variant="outline" className="w-full" onClick={handleToggleBookmark}>
                  <BookmarkIcon className={`h-4 w-4 mr-2 ${isBookmarked ? 'text-yellow-500 fill-yellow-400' : ''}`} />
                  {isBookmarked ? 'Saved' : 'Save for later'}
                </Button>
              </CardContent>
            </Card>

            {jobDetails.skills && jobDetails.skills.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Required Skills</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {jobDetails.skills.map((skill, i) => <Badge key={`skill-${i}`} variant="outline">{skill}</Badge>)}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle className="text-lg">About {jobDetails.company.name}</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                   {jobDetails.company.logoUrl ? (
                    <Image src={jobDetails.company.logoUrl} alt={jobDetails.company.name} width={48} height={48} className="h-12 w-12 rounded-md object-contain" />
                  ) : (
                    <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center">
                      <Building className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{jobDetails.company.name}</h3>
                    {jobDetails.company.industry && <p className="text-muted-foreground">{jobDetails.company.industry}</p>}
                  </div>
                </div>
                {jobDetails.company.size && <div className="flex justify-between"><span className="text-muted-foreground">Size:</span><span>{jobDetails.company.size}</span></div>}
                {jobDetails.company.hqLocation && <div className="flex justify-between"><span className="text-muted-foreground">HQ:</span><span>{jobDetails.company.hqLocation}</span></div>}
                {jobDetails.company.websiteUrl && <Link href={jobDetails.company.websiteUrl} target="_blank" rel="noopener noreferrer"><Button variant="outline" className="w-full mt-2 text-xs">View Company Profile</Button></Link>}
                {jobDetails.company.description && <><Separator className="my-2" /><p className="text-muted-foreground">{jobDetails.company.description}</p></>}
              </CardContent>
            </Card>

            {/* Similar Jobs - Placeholder/Future improvement */}
            {/* <Card>
              <CardHeader><CardTitle className="text-lg">Similar Jobs</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Feature coming soon.</p>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
      {jobDetails && (
        <JobApplicationModal
          isOpen={showApplyModal}
          onClose={() => {
            setShowApplyModal(false);
            fetchJobAndStatus(); // Re-check application status after modal closes
          }}
          jobId={jobDetails.id}
          jobTitle={jobDetails.title}
        />
      )}
    </>
  );
}
