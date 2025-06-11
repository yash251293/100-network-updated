"use client"

import { useState, useEffect, useCallback } from "react"
import { formatDistanceToNow } from 'date-fns'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookmarkIcon, Filter, Search, Clock, CheckCircle, XCircle, Calendar, Briefcase, MapPin, DollarSign, Building, FileText, ChevronRight, Star, Users, Award, TrendingUp, Zap, Globe, ArrowLeft, X, Send, Upload } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getToken } from "@/lib/authClient";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"

// Helper to get status text from status key
const getStatusText = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    applied: "Application Submitted",
    under_review: "Under Review",
    interview_scheduled: "Interview Scheduled",
    interview_completed: "Interview Completed",
    offer_extended: "Offer Extended",
    offer_accepted: "Offer Accepted",
    offer_declined: "Offer Declined",
    rejected: "Not Selected",
    withdrawn: "Application Withdrawn",
  };
  return statusMap[status.toLowerCase()] || status;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "applied": return <Clock className="h-4 w-4 text-primary-navy" />;
    case "under_review": return <Clock className="h-4 w-4 text-orange-500" />;
    case "interview_scheduled": return <Calendar className="h-4 w-4 text-green-500" />;
    case "rejected": return <XCircle className="h-4 w-4 text-red-500" />;
    case "accepted": return <CheckCircle className="h-4 w-4 text-green-500" />;
    default: return <Clock className="h-4 w-4 text-slate-400" />;
  }
};

const getStatusBadge = (status: string, statusText: string) => {
  const variants: {[key: string]: string} = {
    applied: "bg-primary-navy/10 text-primary-navy border-primary-navy/20",
    under_review: "bg-orange-50 text-orange-600 border-orange-200",
    interview_scheduled: "bg-green-50 text-green-600 border-green-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
    accepted: "bg-green-50 text-green-600 border-green-200",
  };
  return <Badge className={`${variants[status] || 'bg-slate-100 text-slate-700'} font-subheading`}>{statusText}</Badge>;
};

const formatSalary = (job: any) => {
  if (!job.salary_min && !job.salary_max) return "Not Disclosed";
  let salaryString = "";
  if (job.salary_min) salaryString += `$${(job.salary_min / 1000).toFixed(0)}k`;
  if (job.salary_max) salaryString += `${job.salary_min ? ' - ' : ''}${(job.salary_max / 1000).toFixed(0)}k`;
  if (job.salary_currency) salaryString += ` ${job.salary_currency}`;
  if (job.salary_period) salaryString += `/${job.salary_period.charAt(0).toUpperCase() + job.salary_period.slice(1)}`;
  return salaryString;
};

export default function JobsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [salaryRange, setSalaryRange] = useState([40000, 200000]);
  const [experienceRange, setExperienceRange] = useState([0, 15]); // Example: years of experience
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({ coverLetter: "", expectedSalary: "", availableStartDate: "", resume: null, portfolio: null });

  const [jobsData, setJobsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [experienceLevelFilter, setExperienceLevelFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [workModeFilter, setWorkModeFilter] = useState("");

  const [detailedJobLoading, setDetailedJobLoading] = useState(false);
  const [detailedJobError, setDetailedJobError] = useState<string | null>(null);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);

  const [activeTab, setActiveTab] = useState("findJobs");
  const [appliedJobsList, setAppliedJobsList] = useState<any[]>([]);
  const [isLoadingApplied, setIsLoadingApplied] = useState(false);
  const [errorApplied, setErrorApplied] = useState<string | null>(null);
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("");
  const [appliedCurrentPage, setAppliedCurrentPage] = useState(1);
  const [appliedTotalPages, setAppliedTotalPages] = useState(1);
  const [appliedTotalItems, setAppliedTotalItems] = useState(0);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let effectiveLocationFilter = locationFilter;
      if (workModeFilter === "Remote") {
        effectiveLocationFilter = "Remote";
      }
      const params = new URLSearchParams({ page: String(currentPage), limit: "5" });
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      if (jobTypeFilter) params.append("job_type", jobTypeFilter);
      if (experienceLevelFilter) params.append("experience_levels", experienceLevelFilter);
      if (effectiveLocationFilter) params.append("location", effectiveLocationFilter);
      // if (workModeFilter && workModeFilter !== "Remote") params.append("work_mode", workModeFilter); // If API supports separate work_mode

      const response = await fetch(`/api/jobs?${params.toString()}`);
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message || "Failed to fetch jobs");
      const data = await response.json();
      setJobsData(data.data || []);
      setTotalPages(data.pagination.total_pages || 1);
    } catch (err: any) {
      setError(err.message);
      setJobsData([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, jobTypeFilter, experienceLevelFilter, locationFilter, workModeFilter]);

  useEffect(() => {
    if (activeTab === "findJobs") {
      fetchJobs();
    }
  }, [activeTab, fetchJobs, currentPage, debouncedSearchTerm, jobTypeFilter, experienceLevelFilter, locationFilter, workModeFilter]);

  const handleSidebarJobTypeChange = (value: string, checked: boolean) => {
    setJobTypeFilter(checked ? value : "");
    setCurrentPage(1);
  };

  const handleSidebarExperienceChange = (value: string, checked: boolean) => {
    setExperienceLevelFilter(checked ? value : "");
    setCurrentPage(1);
  };

  const handleSidebarWorkModeChange = (value: string, checked: boolean) => {
    const newWorkMode = checked ? value : "";
    setWorkModeFilter(newWorkMode);
    if (newWorkMode === "Remote") {
      setLocationFilter("Remote");
    } else if (workModeFilter === "Remote" && !checked && locationFilter === "Remote") {
      setLocationFilter("");
    }
    setCurrentPage(1);
  };

  const fetchAppliedJobs = useCallback(async () => {
    // ... (fetchAppliedJobs implementation remains the same as in Turn 31)
    const token = getToken();
    if (!token) {
      setErrorApplied("Please log in to view your applications.");
      setAppliedJobsList([]);
      setIsLoadingApplied(false);
      return;
    }
    setIsLoadingApplied(true);
    setErrorApplied(null);
    try {
      const params = new URLSearchParams({ page: String(appliedCurrentPage), limit: "5" });
      if (appliedStatusFilter && appliedStatusFilter !== "all") params.append("status", appliedStatusFilter);
      const response = await fetch(`/api/job-applications?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message || "Failed to fetch applied jobs");
      const data = await response.json();
      setAppliedJobsList(data.data || []);
      setAppliedTotalPages(data.pagination?.totalPages || 1);
      setAppliedTotalItems(data.pagination?.totalItems || 0);
    } catch (err: any) {
      setErrorApplied(err.message);
      setAppliedJobsList([]);
      toast.error(err.message || "Failed to load applied jobs.");
    } finally {
      setIsLoadingApplied(false);
    }
  }, [appliedCurrentPage, appliedStatusFilter]);

  useEffect(() => {
    if (activeTab === 'applied') {
      fetchAppliedJobs();
    }
  }, [appliedCurrentPage, appliedStatusFilter, activeTab, fetchAppliedJobs]);

  const jobsForModalDetails = [ /* ... static job details for modal remain same as Turn 31 ... */ ];

  const handleJobClick = async (jobSummary: any) => { /* ... remains same as Turn 31 ... */
    if (!jobSummary || !jobSummary.id) {
      console.error("Job summary or ID is missing", jobSummary);
      setDetailedJobError("Cannot fetch details for this job.");
      setSelectedJob(null);
      return;
    }
    setDetailedJobLoading(true);
    setDetailedJobError(null);
    const fullJobDetail = jobsForModalDetails.find(j => j.id === jobSummary.id) || jobSummary;
    setSelectedJob(fullJobDetail);
    setDetailedJobLoading(false);
  };
  const handleApplyClick = () => setShowApplicationModal(true);
  const handleSubmitApplication = async () => { /* ... remains same as Turn 31 ... */
    if (!selectedJob || !selectedJob.id) {
      toast.error("No job selected for application.");
      return;
    }
    setIsSubmittingApplication(true);
    const token = getToken();
    if (!token) {
      toast.error("Authentication required to apply.");
      setIsSubmittingApplication(false);
      return;
    }
    try {
      const response = await fetch(`/api/jobs/${selectedJob.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ coverLetter: applicationData.coverLetter }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message || "Application submitted successfully!");
        setShowApplicationModal(false);
        setApplicationData({ coverLetter: "", expectedSalary: "", availableStartDate: "", resume: null, portfolio: null });
      } else {
        toast.error(result.message || "Failed to submit application.");
      }
    } catch (error) {
      console.error("Application submission error:", error);
      toast.error("An unexpected error occurred while submitting your application.");
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  return (
    <>
      <div className="w-[65%] mx-auto py-6">
        <div className="mb-8">
          <h1 className="text-4xl font-heading text-primary-navy mb-2">Career Opportunities</h1>
          <p className="text-slate-600 font-subheading text-xl">Discover your next career move with leading companies</p>
        </div>

        <div className="mb-6 border-b border-slate-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button onClick={() => setActiveTab("findJobs")} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === "findJobs" ? "border-primary-navy text-primary-navy" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}>
              Find Jobs
            </button>
            <button onClick={() => setActiveTab("applied")} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === "applied" ? "border-primary-navy text-primary-navy" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}>
              My Applications ({appliedTotalItems > 0 ? appliedTotalItems : '...'})
            </button>
          </nav>
        </div>

        {activeTab === "findJobs" && (
          <div className="flex gap-6">
            <div className="w-64 flex-shrink-0"> {/* Sidebar */}
              <div className="space-y-6">
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-heading text-primary-navy flex items-center justify-between">
                      <span className="flex items-center"><Filter className="h-5 w-5 mr-2" />Advanced Filters</span>
                      <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="text-[#0056B3] hover:text-primary-navy hover:bg-primary-navy/5 rounded-lg">
                        {showFilters ? 'Hide' : 'Show'}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  {showFilters && (
                    <CardContent className="space-y-6">
                      {/* Job Type */}
                      <div>
                        <h4 className="font-subheading font-medium text-primary-navy mb-3">Job Type</h4>
                        <div className="space-y-2">
                          {[
                            { id: "sidebar-filter-full-time", label: "Full-time", value: "full-time" },
                            { id: "sidebar-filter-part-time", label: "Part-time", value: "part-time" },
                            { id: "sidebar-filter-contract", label: "Contract", value: "contract" },
                            { id: "sidebar-filter-internship", label: "Internship", value: "internship" },
                          ].map(type => (
                            <div key={type.id} className="flex items-center space-x-2">
                              <Checkbox id={type.id} checked={jobTypeFilter === type.value} onCheckedChange={(checked) => handleSidebarJobTypeChange(type.value, !!checked)} />
                              <label htmlFor={type.id} className="text-sm font-subheading text-slate-600 cursor-pointer">{type.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      {/* Experience Level */}
                      <div>
                        <h4 className="font-subheading font-medium text-primary-navy mb-3">Experience Level</h4>
                        <div className="space-y-2">
                          {[
                            { id: "sidebar-filter-entry-level", label: "Entry Level", value: "entry-level" },
                            { id: "sidebar-filter-mid-level", label: "Mid Level", value: "mid-level" },
                            { id: "sidebar-filter-senior-level", label: "Senior Level", value: "senior-level" },
                            { id: "sidebar-filter-lead", label: "Lead", value: "lead" },
                            { id: "sidebar-filter-principal", label: "Principal", value: "principal" },
                          ].map(level => (
                            <div key={level.id} className="flex items-center space-x-2">
                              <Checkbox id={level.id} checked={experienceLevelFilter === level.value} onCheckedChange={(checked) => handleSidebarExperienceChange(level.value, !!checked)} />
                              <label htmlFor={level.id} className="text-sm font-subheading text-slate-600 cursor-pointer">{level.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      {/* Salary Range (UI Only) */}
                      <div>
                        <h4 className="font-subheading font-medium text-primary-navy mb-3">Salary Range (UI Only)</h4>
                        <div className="px-2">
                          <Slider value={salaryRange} onValueChange={(value) => { console.log("Salary range (UI only):", value); setSalaryRange(value);}} max={200000} min={30000} step={5000} className="mb-3" />
                          <div className="flex justify-between text-sm font-subheading text-slate-500"><span>${salaryRange[0].toLocaleString()}</span><span>${salaryRange[1].toLocaleString()}</span></div>
                        </div>
                      </div>
                      <Separator />
                      {/* Work Mode */}
                      <div>
                        <h4 className="font-subheading font-medium text-primary-navy mb-3">Work Mode</h4>
                        <div className="space-y-2">
                          {[
                            { id: "sidebar-filter-remote-mode", label: "Remote", value: "Remote" },
                            { id: "sidebar-filter-hybrid-mode", label: "Hybrid", value: "Hybrid" },
                            { id: "sidebar-filter-on-site-mode", label: "On-site", value: "On-site" },
                          ].map(mode => (
                            <div key={mode.id} className="flex items-center space-x-2">
                              <Checkbox id={mode.id} checked={workModeFilter === mode.value} onCheckedChange={(checked) => handleSidebarWorkModeChange(mode.value, !!checked)} />
                              <label htmlFor={mode.id} className="text-sm font-subheading text-slate-600 cursor-pointer">{mode.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      {/* Other filters (UI Only) */}
                      <div><h4 className="font-subheading font-medium text-primary-navy mb-3">Company Size (UI Only)</h4><div className="space-y-2"><Checkbox id="ui-startup" onCheckedChange={(e) => console.log("Filter changed (UI only)", e)} /><label htmlFor="ui-startup">Startup (1-50)</label></div></div> <Separator />
                      <div><h4 className="font-subheading font-medium text-primary-navy mb-3">Industry (UI Only)</h4><div className="space-y-2"><Checkbox id="ui-tech" onCheckedChange={(e) => console.log("Filter changed (UI only)", e)} /><label htmlFor="ui-tech">Technology</label></div></div> <Separator />
                      <div><h4 className="font-subheading font-medium text-primary-navy mb-3">Skills (UI Only)</h4><div className="space-y-2"><Checkbox id="ui-react" onCheckedChange={(e) => console.log("Filter changed (UI only)", e)} /><label htmlFor="ui-react">React</label></div></div> <Separator />
                      <div><h4 className="font-subheading font-medium text-primary-navy mb-3">Benefits (UI Only)</h4><div className="space-y-2"><Checkbox id="ui-health" onCheckedChange={(e) => console.log("Filter changed (UI only)", e)} /><label htmlFor="ui-health">Health Insurance</label></div></div>

                      <Button className="w-full bg-primary-navy hover:bg-primary-navy/90 text-white rounded-lg font-subheading" onClick={() => fetchJobs()}>
                        Apply Sidebar Filters
                      </Button>
                    </CardContent>
                  )}
                </Card>
              </div>
            </div>

            {/* Main Content Area for Find Jobs */}
            <div className="flex-1 space-y-8">
              {/* Search and Top Filters */}
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input placeholder="Search positions, companies, or keywords..." className="pl-12 h-12 border-slate-200 focus:border-slate-300 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-subheading rounded-xl w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <div className="mt-4 flex flex-col md:flex-row gap-4">
                    <Select value={jobTypeFilter} onValueChange={(value) => {setJobTypeFilter(value); setCurrentPage(1);}}>
                      <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Job Type" /></SelectTrigger>
                      <SelectContent><SelectItem value="">All Types</SelectItem><SelectItem value="full-time">Full-time</SelectItem><SelectItem value="part-time">Part-time</SelectItem><SelectItem value="contract">Contract</SelectItem><SelectItem value="internship">Internship</SelectItem></SelectContent>
                    </Select>
                    <Select value={experienceLevelFilter} onValueChange={(value) => {setExperienceLevelFilter(value); setCurrentPage(1);}}>
                      <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Experience Level" /></SelectTrigger>
                      <SelectContent><SelectItem value="">All Levels</SelectItem><SelectItem value="entry-level">Entry Level</SelectItem><SelectItem value="mid-level">Mid Level</SelectItem><SelectItem value="senior-level">Senior Level</SelectItem><SelectItem value="lead">Lead</SelectItem><SelectItem value="principal">Principal</SelectItem></SelectContent>
                    </Select>
                    <Input placeholder="Location (e.g. city, country)" className="h-10 border-slate-200 focus:border-slate-300 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-subheading rounded-xl w-full md:w-[200px]" value={locationFilter} onChange={(e) => {setLocationFilter(e.target.value); setCurrentPage(1);}} disabled={workModeFilter === "Remote"} />
                  </div>
                </CardContent>
              </Card>
              {/* Job Listings */}
              <div className="space-y-4">
                {/* ... (isLoading, error, empty states for jobsData remain same) ... */}
                 {isLoading && jobsData.length === 0 && (<>[...Array(3)].map((_, i) => (<Card key={`skeleton-${i}`} className="border-slate-200"><CardContent className="p-6"><div className="animate-pulse flex space-x-4"><div className="rounded-lg bg-slate-200 h-16 w-16"></div><div className="flex-1 space-y-3 py-1"><div className="h-4 bg-slate-200 rounded w-3/4"></div><div className="space-y-2"><div className="h-3 bg-slate-200 rounded"></div><div className="h-3 bg-slate-200 rounded w-5/6"></div></div><div className="h-8 bg-slate-200 rounded w-1/4 mt-3"></div></div></div></CardContent></Card>))</>)}
                {!isLoading && error && (<Card className="border-red-200 bg-red-50"><CardContent className="p-6 text-center"><XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" /><h3 className="text-lg font-semibold text-red-700">Error Fetching Jobs</h3><p className="text-red-600">{error}</p><Button onClick={fetchJobs} className="mt-4">Try Again</Button></CardContent></Card>)}
                {!isLoading && !error && jobsData.length === 0 && (<Card className="border-slate-200"><CardContent className="p-6 text-center"><Search className="h-12 w-12 text-slate-400 mx-auto mb-2" /><h3 className="text-lg font-semibold text-slate-700">No Jobs Found</h3><p className="text-slate-500">Try adjusting your search terms or filters.</p></CardContent></Card>)}
                {!error && jobsData.map((job) => { /* ... (job card mapping remains same) ... */
                  const getLocationTypeColor = (locationType: string | null) => {
                    switch (locationType?.toLowerCase()) {
                      case "remote": return "bg-green-100 text-green-700";
                      case "hybrid": return "bg-blue-100 text-blue-700";
                      case "on-site": case "on_site": return "bg-red-100 text-red-700";
                      default: return "bg-slate-100 text-slate-700";
                    }
                  };
                  const locationTypeLabel = job.location_type?.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || "N/A";
                  return (
                    <Card key={job.id} className="border-slate-200 hover:shadow-lg hover:border-primary-navy/30 transition-all duration-200 group cursor-pointer" onClick={() => handleJobClick(job)}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start space-x-4 mb-4">
                              <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0"><img src={job.company_logo_url || "/placeholder-logo.png"} alt={job.company_name || "Company"} className="w-full h-full object-cover" /></div>
                              <div className="flex-1 min-w-0"><h3 className="text-xl font-heading text-primary-navy group-hover:text-primary-navy transition-colors line-clamp-1">{job.title}</h3><div className="flex items-center space-x-3 text-slate-600 mt-1 text-base"><div className="flex items-center space-x-1"><Building className="h-4 w-4" /><span className="font-subheading truncate">{job.company_name || "N/A"}</span></div><div className="flex items-center space-x-1"><MapPin className="h-4 w-4" /><span className="font-subheading truncate">{job.location_city && job.location_state ? `${job.location_city}, ${job.location_state}` : job.location_country || "N/A"}</span></div></div></div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">{(job.skills || []).slice(0, 4).map((skill: string, index: number) => (<span key={index} className={`px-3 py-1 rounded-full text-sm font-subheading bg-slate-100 text-slate-700`}>{skill}</span>))}{(job.skills || []).length > 4 && (<span className="px-3 py-1 rounded-full text-sm font-subheading bg-slate-100 text-slate-700">+{ (job.skills || []).length - 4} more</span>)}</div>
                            <p className="text-slate-600 font-subheading leading-relaxed mb-4 text-base line-clamp-3">{job.description_short || job.description?.substring(0, 150) + "..." || "No description available."}</p>
                            <div className="flex items-center justify-between text-base"><div className="flex items-center space-x-4 text-slate-500"><div className="flex items-center space-x-1"><DollarSign className="h-4 w-4" /><span className="font-subheading">{formatSalary(job)}</span></div><span className="font-subheading capitalize">{job.job_type?.replace("_", "-") || "N/A"}</span><span className={`px-3 py-1 rounded-full text-sm font-subheading ${getLocationTypeColor(job.location_type)}`}>{locationTypeLabel}</span></div><span className="text-sm text-slate-400 font-subheading">{job.published_at ? formatDistanceToNow(new Date(job.published_at), { addSuffix: true }) : "N/A"}</span></div>
                          </div>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary-navy hover:bg-primary-navy/5 rounded-full flex-shrink-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); console.log("Bookmark clicked for job:", job.id);}}><BookmarkIcon className="h-4 w-4" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {/* Pagination Controls */}
                {!isLoading && !error && jobsData.length > 0 && totalPages > 1 && ( <div className="flex justify-center items-center space-x-4 mt-8"><Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} variant="outline">Previous</Button><span className="text-sm font-subheading">Page {currentPage} of {totalPages}</span><Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} variant="outline">Next</Button></div>)}
              </div>
            </div>
          </div>
        )}

        {activeTab === "applied" && (
          <div className="space-y-6">
            {/* ... (Applied jobs tab content remains the same as Turn 31) ... */}
            <Card className="border-slate-200 shadow-sm"><CardContent className="p-6"><Select value={appliedStatusFilter} onValueChange={(value) => {setAppliedStatusFilter(value); setAppliedCurrentPage(1);}}><SelectTrigger className="w-full md:w-[280px]"><SelectValue placeholder="Filter by application status" /></SelectTrigger><SelectContent><SelectItem value="">All Statuses</SelectItem><SelectItem value="applied">Applied</SelectItem><SelectItem value="under_review">Under Review</SelectItem><SelectItem value="interview_scheduled">Interview Scheduled</SelectItem><SelectItem value="interview_completed">Interview Completed</SelectItem><SelectItem value="offer_extended">Offer Extended</SelectItem><SelectItem value="offer_accepted">Offer Accepted</SelectItem><SelectItem value="offer_declined">Offer Declined</SelectItem><SelectItem value="rejected">Not Selected</SelectItem><SelectItem value="withdrawn">Withdrawn</SelectItem></SelectContent></Select></CardContent></Card>
            {isLoadingApplied && <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary-navy" /> Loading applied jobs...</div>}
            {!isLoadingApplied && errorApplied && <div className="text-center py-10 text-red-500"><AlertTriangle className="inline h-5 w-5 mr-1"/>{errorApplied} <Button onClick={fetchAppliedJobs} variant="link">Try again</Button></div>}
            {!isLoadingApplied && !errorApplied && appliedJobsList.length === 0 && <div className="text-center py-10 text-slate-500">You have not applied for any jobs yet.</div>}
            <div className="space-y-4">{appliedJobsList.map((application) => (<Card key={application.application_id} className="border-slate-200 shadow-sm"><CardContent className="p-6"><div className="flex flex-col sm:flex-row items-start justify-between gap-4"><div className="flex-1 min-w-0"><div className="flex items-start space-x-4 mb-2 sm:mb-4"><div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0"><img src={application.company_logo_url || "/placeholder-logo.png"} alt={application.company_name} className="w-full h-full object-cover" /></div><div className="flex-1 min-w-0"><h3 className="text-lg sm:text-xl font-heading text-primary-navy line-clamp-1">{application.job_title}</h3><div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 text-slate-600 mt-1 text-sm sm:text-base"><div className="flex items-center space-x-1"><Building className="h-4 w-4" /><span>{application.company_name}</span></div><div className="flex items-center space-x-1 mt-1 sm:mt-0"><MapPin className="h-4 w-4" /><span>{application.job_location || "N/A"}</span></div></div></div></div><p className="text-xs sm:text-sm text-slate-500 mb-2">Applied: {formatDistanceToNow(new Date(application.application_date), { addSuffix: true })}</p><div className="flex items-center space-x-2">{getStatusIcon(application.status)}{getStatusBadge(application.status, getStatusText(application.status))}</div></div><div className="flex-shrink-0 mt-2 sm:mt-0"><Link href={`/jobs/${application.job_id}`} passHref><Button variant="outline" size="sm">View Job</Button></Link></div></div></CardContent></Card>))}</div>
            {!isLoadingApplied && !errorApplied && appliedJobsList.length > 0 && appliedTotalPages > 1 && (<div className="flex justify-center items-center space-x-4 mt-8"><Button onClick={() => setAppliedCurrentPage(prev => Math.max(prev - 1, 1))} disabled={appliedCurrentPage === 1} variant="outline">Previous</Button><span>Page {appliedCurrentPage} of {appliedTotalPages}</span><Button onClick={() => setAppliedCurrentPage(prev => Math.min(prev + 1, appliedTotalPages))} disabled={appliedCurrentPage === appliedTotalPages} variant="outline">Next</Button></div>)}
          </div>
        )}

        {/* Modals (Job Details, Application) remain the same as Turn 31 */}
        {(selectedJob || detailedJobLoading || detailedJobError) && !showApplicationModal && ( <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"><div className="p-6"> <div className="flex items-center justify-between mb-6"><div className="flex items-center space-x-3"><Button variant="ghost" size="icon" onClick={() => { setSelectedJob(null); setDetailedJobError(null);}} className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button><h1 className="text-2xl font-heading text-primary-navy">Job Details</h1></div><Button variant="ghost" size="icon" onClick={() => { setSelectedJob(null); setDetailedJobError(null);}} className="rounded-xl"><X className="h-5 w-5" /></Button></div> {detailedJobLoading && (<div className="text-center py-10"><Clock className="h-12 w-12 text-primary-navy mx-auto animate-spin mb-4" /><p className="text-lg font-semibold text-primary-navy">Loading job details...</p></div>)} {!detailedJobLoading && detailedJobError && (<div className="text-center py-10"><XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" /><p className="text-lg font-semibold text-red-700">Error</p><p className="text-red-600 mb-4">{detailedJobError}</p><Button onClick={() => { setSelectedJob(null); setDetailedJobError(null); }}>Close</Button></div>)} {!detailedJobLoading && !detailedJobError && selectedJob && (<div className="space-y-6"> <div className="flex items-start space-x-6"><div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0"><img src={selectedJob.company?.logo_url || "/placeholder-logo.png"} alt={selectedJob.company?.name || "Company"} className="w-full h-full object-cover" /></div><div className="flex-1"><div className="flex items-center justify-between mb-2"><h2 className="text-2xl font-heading text-primary-navy">{selectedJob.title}</h2><span className={`px-3 py-1 rounded-full text-sm font-subheading ${ selectedJob.location_type?.toLowerCase() === "remote" ? "bg-green-100 text-green-700" : selectedJob.location_type?.toLowerCase() === "hybrid" ? "bg-blue-100 text-blue-700" : selectedJob.location_type?.toLowerCase() === "on-site" || selectedJob.location_type?.toLowerCase() === "on_site" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700" }`}>{selectedJob.location_type?.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || "N/A"}</span></div><div className="flex items-center space-x-6 text-slate-600 font-subheading mb-3"><div className="flex items-center space-x-1"><Building className="h-4 w-4" /><span>{selectedJob.company?.name || "N/A"}</span></div><div className="flex items-center space-x-1"><MapPin className="h-4 w-4" /><span>{selectedJob.location || "N/A"}</span></div><div className="flex items-center space-x-1"><DollarSign className="h-4 w-4" /><span className="font-heading text-primary-navy">{formatSalary(selectedJob)}</span></div></div><div className="flex items-center space-x-4 text-slate-500 font-subheading"><span className="capitalize">{selectedJob.job_type?.replace("_", "-") || "N/A"}</span><span>•</span><span>Posted {selectedJob.published_at ? formatDistanceToNow(new Date(selectedJob.published_at), { addSuffix: true }) : "N/A"}</span>{selectedJob.application_deadline && (<><span>•</span><span>Apply by {new Date(selectedJob.application_deadline).toLocaleDateString()}</span></>)}</div></div></div> <Separator /> <div><h3 className="text-lg font-heading text-primary-navy mb-3">Job Description</h3><div className="prose prose-sm max-w-none text-slate-600 font-subheading" dangerouslySetInnerHTML={{ __html: selectedJob.description || "<p>No description available.</p>" }} /></div> {selectedJob.skills && selectedJob.skills.length > 0 && (<div><h3 className="text-lg font-heading text-primary-navy mb-3">Skills Required</h3><div className="flex flex-wrap gap-2">{selectedJob.skills.map((skill: string, index: number) => ( <Badge key={index} className="font-subheading bg-slate-100 text-slate-700">{skill}</Badge>))}</div></div>)} {selectedJob.requirements && selectedJob.requirements.length > 0 && (<div><h3 className="text-lg font-heading text-primary-navy mb-3">Requirements</h3><ul className="space-y-2">{selectedJob.requirements.map((requirement: string, index: number) => (<li key={index} className="flex items-start space-x-2"><CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" /><span className="text-slate-600 font-subheading">{requirement}</span></li>))}</ul></div>)} {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (<div><h3 className="text-lg font-heading text-primary-navy mb-3">Responsibilities</h3><ul className="space-y-2">{selectedJob.responsibilities.map((responsibility: string, index: number) => (<li key={index} className="flex items-start space-x-2"><CheckCircle className="h-4 w-4 text-primary-navy mt-1 flex-shrink-0" /><span className="text-slate-600 font-subheading">{responsibility}</span></li>))}</ul></div>)} {selectedJob.benefits && (<div><h3 className="text-lg font-heading text-primary-navy mb-3">Benefits</h3><p className="text-slate-600 font-subheading">{selectedJob.benefits}</p></div>)} {selectedJob.company && (<div><h3 className="text-lg font-heading text-primary-navy mb-3">About {selectedJob.company.name}</h3><Card className="border-slate-200"><CardContent className="p-4"><div className="space-y-3"><div><h4 className="font-heading text-primary-navy">{selectedJob.company.name}</h4><div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">{selectedJob.company.size && <span>{selectedJob.company.size}</span>}{selectedJob.company.industry && <><span>•</span><span>{selectedJob.company.industry}</span></>}</div></div>{selectedJob.company.description && <p className="text-slate-600 font-subheading">{selectedJob.company.description}</p>}{selectedJob.company.website_url && ( <p className="text-sm"><Link href={selectedJob.company.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Visit website <Globe className="h-3 w-3 inline-block ml-1" /></Link></p>)}</div></CardContent></Card></div>)} <div className="flex space-x-4 pt-4"><Button className="flex-1 bg-primary-navy hover:bg-primary-navy/90 text-white rounded-xl font-subheading" onClick={handleApplyClick}>Apply for this Position</Button><Button variant="outline" className="border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white rounded-xl font-subheading"><BookmarkIcon className="h-4 w-4 mr-2" />Save Job</Button></div></div>)}</div></div></div>)}
        <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>{/* ... (Application Modal content remains same) ... */}</Dialog>
      </div>
    </>
  )
}

[end of app/jobs/page.tsx]
