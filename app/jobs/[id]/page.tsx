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
  Bookmark as BookmarkIcon,
  Share2,
  MapPin,
  Briefcase,
  DollarSign,
  Users,
  Building2,
  CalendarDays,
  CheckCircle,
  AlertCircle,
  Info,
  Award,
  Building,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";
import JobApplicationModal from "@/components/JobApplicationModal";
import { getToken } from "@/lib/authClient"; // Added

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
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
  location: string | null;
  jobType: string;
  experienceLevel: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryPeriod: string | null;
  applicationDeadline: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  postedByUserId: string;
  company: CompanyDetails;
  skills: string[];
}

const parseListField = (text: string | null | undefined): string[] => {
  if (!text) return [];
  return text.split(/\n(?=\s*[-*•–—]|\s*\d+\.\s*)/)
             .map(item => item.replace(/^[\s*-*•–—]*/, '').replace(/^\d+\.\s*/, '').trim())
             .filter(item => item.length > 0);
};

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params?.id as string;
  const { toast } = useToast();

  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const fetchJobAndStatus = useCallback(async () => {
    if (!jobId) return;
    setIsLoading(true);
    setError(null);
    const token = getToken(); // Get token for auth calls

    try {
      // Fetch job details (public, no token needed)
      const jobRes = await fetch(`/api/jobs/${jobId}`);
      if (!jobRes.ok) {
          let errorMsg = `Failed to load job details (${jobRes.status})`;
          try {
            // Attempt to parse the error response body
            const errorData = await jobRes.json();
            if (errorData && errorData.message) {
              errorMsg = `${errorData.message} (Status: ${jobRes.status})`;
              if (errorData.errors && errorData.errors.id && Array.isArray(errorData.errors.id)) {
                errorMsg += ` Details: ID Errors: ${errorData.errors.id.join(', ')}`;
              } else if (errorData.errors && Object.keys(errorData.errors).length > 0) {
                errorMsg += ` Details: Field Errors: ${JSON.stringify(errorData.errors)}`;
              } else if (errorData.formErrors && Array.isArray(errorData.formErrors) && errorData.formErrors.length > 0) {
                errorMsg += ` Details: Form Errors: ${errorData.formErrors.join(', ')}`;
              } else if (errorData.message && errorData.message !== errorMsg.substring(0, errorMsg.indexOf(" (Status:"))) {
                // If we captured a specific message from errorData.message and it's different from the base errorMsg
                // and no other details were found, this means the message itself is the detail.
                // This case might be redundant if errorData.message is always used for the base, but good for safety.
              }
            }
          } catch (parseError) {
            // Ignore if parsing fails, stick with the original status-based message
          }
          throw new Error(errorMsg);
      }
      const jobData = await jobRes.json();
      setJobDetails(jobData.data);

      if (token) { // Only fetch user-specific data if token exists
        // Fetch initial bookmark status
        try {
          const bookmarkRes = await fetch(`/api/job-bookmarks`, { // Fetches all user's bookmarks
            headers: { 'Authorization': `Bearer ${token}` }
          });
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

        // Check if user has already applied
        try {
          const applicationCheckRes = await fetch(`/api/job-applications?jobId=${jobId}`, {
             headers: { 'Authorization': `Bearer ${token}` }
          });
          if(applicationCheckRes.ok) {
              const applicationsData = await applicationCheckRes.json();
              // Check if any application in the returned data is by the current user for this job
              // The API should ideally filter by current user via token, so if data.length > 0, it's an application by this user.
              if(applicationsData.data && applicationsData.data.length > 0) {
                  setHasApplied(true);
              } else {
                  setHasApplied(false); // Explicitly set to false if no applications found
              }
          } else {
            console.warn("Could not fetch application status.");
            setHasApplied(false);
          }
        } catch(appCheckError) {
          console.warn("Error checking application status:", appCheckError);
          setHasApplied(false);
        }
      } else {
        // No token, user is not logged in or token is unavailable
        setIsBookmarked(false);
        setHasApplied(false); // Cannot determine application status without login
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
    const token = getToken();
    if (!token) {
      toast({ title: "Authentication Required", description: "Please log in to bookmark jobs.", variant: "destructive" });
      return;
    }

    const originalBookmarkStatus = isBookmarked;
    setIsBookmarked(!isBookmarked);

    try {
      const method = !originalBookmarkStatus ? 'POST' : 'DELETE';
      const response = await fetch(`/api/jobs/${jobDetails.id}/bookmark`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        setIsBookmarked(originalBookmarkStatus);
        const errorData = await response.json();
        toast({ title: "Error", description: errorData.message || "Failed to update bookmark.", variant: "destructive" });
      } else {
        toast({ title: "Success", description: `Job ${!originalBookmarkStatus ? 'bookmarked' : 'unbookmarked'}!` });
      }
    } catch (err) {
      setIsBookmarked(originalBookmarkStatus);
      toast({ title: "Error", description: "An error occurred while updating bookmark.", variant: "destructive" });
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

  return (
    <>
      <div className="container max-w-4xl py-6">
        <div className="flex items-center mb-6">
          <Link href="/jobs" className="mr-4">
            <Button variant="ghost" size="icon" aria-label="Back to jobs">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1"></div>
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
                {responsibilitiesList.length > 0 && (<> <Separator /> <div> <h3 className="text-lg font-semibold mb-3 flex items-center"><CheckCircle className="h-5 w-5 text-green-600 mr-2" />Key Responsibilities</h3> <ul className="list-disc pl-5 space-y-1 text-muted-foreground"> {responsibilitiesList.map((item, i) => <li key={`resp-${i}`}>{item}</li>)} </ul> </div> </>)}
                {requirementsList.length > 0 && (<> <Separator /> <div> <h3 className="text-lg font-semibold mb-3 flex items-center"><AlertCircle className="h-5 w-5 text-orange-600 mr-2" />Requirements</h3> <ul className="list-disc pl-5 space-y-1 text-muted-foreground"> {requirementsList.map((item, i) => <li key={`req-${i}`}>{item}</li>)} </ul> </div> </>)}
                {benefitsList.length > 0 && (<> <Separator /> <div> <h3 className="text-lg font-semibold mb-3 flex items-center"><Award className="h-5 w-5 text-indigo-600 mr-2" />Benefits & Perks</h3> <ul className="list-disc pl-5 space-y-1 text-muted-foreground"> {benefitsList.map((item, i) => <li key={`ben-${i}`}>{item}</li>)} </ul> </div> </>)}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:sticky lg:top-6">
            <Card>
              <CardContent className="p-6">
                <Button
                  className="w-full mb-3"
                  size="lg"
                  onClick={() => {
                    const token = getToken();
                    if (!token) {
                      toast({ title: "Authentication Required", description: "Please log in to apply for jobs.", variant: "destructive" });
                      return;
                    }
                    setShowApplyModal(true);
                  }}
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
          </div>
        </div>
      </div>
      {jobDetails && (
        <JobApplicationModal
          isOpen={showApplyModal}
          onClose={() => {
            setShowApplyModal(false);
            fetchJobAndStatus();
          }}
          jobId={jobDetails.id}
          jobTitle={jobDetails.title}
        />
      )}
    </>
  );
}
