"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookmarkIcon as LucideBookmarkIcon, Search, Briefcase, Users, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import JobCard, { JobCardSkeleton, Job as JobType } from "@/components/JobCard"; // Using existing JobCard
import { toast } from "sonner";
import { getToken } from '@/lib/authClient'; // Ensure this import

// Budget filter options
const budgetOptions = [
  { value: "all", label: "All Budgets" },
  { value: "0-500", label: "Under $500" },
  { value: "500-1000", label: "$500 - $1,000" },
  { value: "1000-2500", label: "$1,000 - $2,500" },
  { value: "2500-5000", label: "$2,500 - $5,000" },
  { value: "5000+", label: "Over $5,000" },
];

// Category options for freelance projects
const projectCategories = [
    { value: "all", label: "All Categories" },
    { value: "Web Development", label: "Web Development" },
    { value: "Mobile Development", label: "Mobile Development" },
    { value: "Design", label: "Design" },
    { value: "Content Writing", label: "Content Writing" },
    { value: "Marketing", label: "Marketing" },
    { value: "Data Analysis", label: "Data Analysis" },
    { value: "AI & Machine Learning", label: "AI & Machine Learning"},
    { value: "Consulting", label: "Consulting" },
    { value: "Video & Animation", label: "Video & Animation" },
    { value: "Other", label: "Other" },
];


export default function FreelancePage() {
  const [activeTab, setActiveTab] = useState("gigs");

  // State for "Gigs & Projects" tab
  const [projects, setProjects] = useState<JobType[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [errorProjects, setErrorProjects] = useState<string | null>(null);
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const [debouncedProjectSearchTerm, setDebouncedProjectSearchTerm] = useState("");
  const [projectCategoryFilter, setProjectCategoryFilter] = useState("");
  const [projectBudgetFilter, setProjectBudgetFilter] = useState(""); // e.g., "0-500"
  const [projectCurrentPage, setProjectCurrentPage] = useState(1);
  const [projectTotalPages, setProjectTotalPages] = useState(1);
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState(new Set<string>());

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedProjectSearchTerm(projectSearchTerm);
      if (activeTab === "gigs") setProjectCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [projectSearchTerm, activeTab]);

  const fetchBookmarkedJobs = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setBookmarkedJobIds(new Set<string>());
      return;
    }

    try {
      const response = await fetch('/api/job-bookmarks?limit=500', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMsg = "Failed to fetch bookmarked jobs.";
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          errorMsg = `${errorMsg} Status: ${response.status}`;
        }
        console.error("fetchBookmarkedJobs error:", errorMsg);
        toast.error(errorMsg);
        setBookmarkedJobIds(new Set<string>());
        return;
      }

      const data = await response.json();
      if (data && data.data && Array.isArray(data.data)) {
        const ids = new Set<string>(data.data.map((bookmark: any) => bookmark.job_id));
        setBookmarkedJobIds(ids);
      } else {
        console.error("Fetched bookmarks data is not in the expected format:", data);
        toast.error("Received unexpected bookmark data format.");
        setBookmarkedJobIds(new Set<string>());
      }
    } catch (err: any) {
      console.error("Exception in fetchBookmarkedJobs:", err);
      toast.error(err.message || "An error occurred while fetching your bookmarks.");
      setBookmarkedJobIds(new Set<string>());
    }
  }, []); // Assuming toast from sonner is stable

  const fetchProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    setErrorProjects(null);
    try {
      const queryParams = new URLSearchParams({
        jobType: "Freelance Project", // Hardcoded filter
        page: String(projectCurrentPage),
        limit: "6", // Show 6 projects per page
      });
      if (debouncedProjectSearchTerm) queryParams.set("searchTerm", debouncedProjectSearchTerm);

      // API for GET /api/jobs needs to support 'category' (maps to experienceLevel in schema)
      // and budget range (salaryMin, salaryMax) for these filters to work on backend.
      // For now, we pass them, but API might not use them yet.
      if (projectCategoryFilter && projectCategoryFilter !== "all") {
        queryParams.set("experienceLevel", projectCategoryFilter); // Assuming category maps to experienceLevel for filtering
      }
      if (projectBudgetFilter && projectBudgetFilter !== "all") {
        const [min, max] = projectBudgetFilter.split('-');
        if (min) queryParams.set("salaryMin", min);
        if (max && max !== "+") queryParams.set("salaryMax", max);
        else if (max === "+") queryParams.set("salaryMin", min); // For "5000+" case, only min is set
      }

      const response = await fetch(`/api/jobs?${queryParams.toString()}`);
      if (!response.ok) throw new Error((await response.json()).message || "Failed to fetch projects");
      const data = await response.json();
      setProjects(data.data || []);
      setProjectTotalPages(data.pagination.totalPages || 1);
    } catch (err: any) {
      setErrorProjects(err.message);
      setProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [projectCurrentPage, debouncedProjectSearchTerm, projectCategoryFilter, projectBudgetFilter]);

  useEffect(() => {
    if (activeTab === "gigs") {
      fetchProjects();
      fetchBookmarkedJobs();
    }
  }, [activeTab, fetchProjects, fetchBookmarkedJobs]);

  const handleBookmarkToggleProjects = async (jobId: string) => {
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
      const response = await fetch(`/api/jobs/${jobId}/bookmark`, { method });
      if (!response.ok) {
        setBookmarkedJobIds(originalBookmarks);
        toast.error('Failed to update bookmark.');
      } else {
        toast.success(`Project ${isCurrentlyBookmarked ? 'unbookmarked' : 'bookmarked'}!`);
      }
    } catch (error) {
      setBookmarkedJobIds(originalBookmarks);
      toast.error('Error updating bookmark.');
    }
  };

  const handleCategoryChange = (value: string) => { setProjectCategoryFilter(value); setProjectCurrentPage(1); };
  const handleBudgetChange = (value: string) => { setProjectBudgetFilter(value); setProjectCurrentPage(1); };

  const renderGigsContent = () => {
    if (isLoadingProjects && projects.length === 0) {
      return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <JobCardSkeleton key={i} />)}</div>;
    }
    if (errorProjects) return <p className="text-red-500 text-center py-8">Error: {errorProjects}</p>;
    if (projects.length === 0) return <p className="text-muted-foreground text-center py-8">No projects found matching your criteria.</p>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <JobCard
            key={project.id}
            job={project}
            onBookmarkToggle={handleBookmarkToggleProjects}
            isBookmarked={bookmarkedJobIds.has(project.id)}
            className="h-full flex flex-col" // Ensure cards in grid take full height if content varies
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container max-w-5xl py-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Freelance Marketplace</h1>
          <p className="text-muted-foreground">Find work or hire talented professionals</p>
        </div>
        <Link href="/jobs/freelance/post">
          <Button className="w-full sm:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            Post a Project
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="gigs" className="text-base py-3"><Briefcase className="h-4 w-4 mr-2" />Gigs & Projects</TabsTrigger>
          <TabsTrigger value="freelancers" className="text-base py-3"><Users className="h-4 w-4 mr-2" />Hire Freelancers</TabsTrigger>
        </TabsList>

        <TabsContent value="gigs">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects by title, skills..."
                className="pl-10 w-full"
                value={projectSearchTerm}
                onChange={(e) => setProjectSearchTerm(e.target.value)}
              />
            </div>
            <Select value={projectCategoryFilter} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {projectCategories.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={projectBudgetFilter} onValueChange={handleBudgetChange}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Budget" />
              </SelectTrigger>
              <SelectContent>
                {budgetOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {renderGigsContent()}
          {projects.length > 0 && projectTotalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-4">
              <Button variant="outline" onClick={() => setProjectCurrentPage(p => Math.max(1, p - 1))} disabled={projectCurrentPage === 1 || isLoadingProjects}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <span className="text-sm">Page {projectCurrentPage} of {projectTotalPages}</span>
              <Button variant="outline" onClick={() => setProjectCurrentPage(p => Math.min(projectTotalPages, p + 1))} disabled={projectCurrentPage === projectTotalPages || isLoadingProjects}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="freelancers">
          <div className="text-center py-10 border rounded-lg bg-muted/20">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Coming Soon!</h3>
            <p className="text-muted-foreground mt-2">
              The ability to browse, search, and hire talented freelancers will be available here soon.
            </p>
             <p className="text-sm text-muted-foreground mt-1">Stay tuned for updates.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
