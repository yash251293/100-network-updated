"use client"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getToken } from "@/lib/authClient";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { BookmarkIcon, ArrowLeft, X, Send, MessageCircle, Building2, MapPin, Calendar, DollarSign, Clock, Users, Star, Award, CheckCircle, Target, Upload, XCircle, Building } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProtectedRoute from '@/components/ProtectedRoute';


// Helper function to format salary
const formatSalary = (job: any) => {
  if (!job.salary_min && !job.salary_max) return "Not Disclosed";
  let salaryString = "";
  if (job.salary_min) salaryString += `$${(job.salary_min / 1000).toFixed(0)}k`;
  if (job.salary_max) salaryString += `${job.salary_min ? ' - ' : ''}${(job.salary_max / 1000).toFixed(0)}k`;
  if (job.salary_currency) salaryString += ` ${job.salary_currency}`;
  if (job.salary_period) salaryString += `/${job.salary_period.charAt(0).toUpperCase() + job.salary_period.slice(1)}`;
  return salaryString;
};

function ExplorePageContent() {
  // State for Modals and static interactions
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [showProjectApplicationModal, setShowProjectApplicationModal] = useState(false)
  const [showJobsModal, setShowJobsModal] = useState(false)
  const freelanceProjects: any[] = []; // Define freelanceProjects to prevent map error
  const [followedCompanies, setFollowedCompanies] = useState<number[]>([2]) // Static for now, pre-follow one company for demo

  // State for Job Application Modal
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    expectedSalary: "",
    startDate: "",
    resume: null,
    portfolio: null
  });
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false)

  // State for Recommended Jobs
  const [recommendedJobsData, setRecommendedJobsData] = useState<any[]>([])
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)
  const [jobsError, setJobsError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<any>(null) // For job detail modal
  const [detailedJobLoading, setDetailedJobLoading] = useState(false)
  const [detailedJobError, setDetailedJobError] = useState<string | null>(null)

  // State for Top Companies
  const [topCompaniesData, setTopCompaniesData] = useState<any[]>([])
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
  const [companiesError, setCompaniesError] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<any>(null)

  // Fetch Recommended Jobs
  const fetchRecommendedJobs = useCallback(async () => {
    setIsLoadingJobs(true);
    setJobsError(null);
    try {
      const response = await fetch(`/api/jobs?limit=3&sortBy=published_at&sortOrder=desc`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to fetch recommended jobs" }));
        throw new Error(errorData.message || "Failed to fetch recommended jobs");
      }
      const data = await response.json();
      setRecommendedJobsData(data.data || []);
    } catch (err: any) {
      setJobsError(err.message);
      toast.error(err.message || "Could not load recommended jobs.");
    } finally {
      setIsLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendedJobs();
  }, [fetchRecommendedJobs]);

  // Fetch Top Companies
  const fetchTopCompanies = useCallback(async () => {
    setIsLoadingCompanies(true);
    setCompaniesError(null);
    const token = getToken();
    try {
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`/api/companies?limit=3`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to fetch top companies" }));
        throw new Error(errorData.message || "Failed to fetch top companies");
      }
      const data = await response.json();
      setTopCompaniesData(data.data || []);
    } catch (err: any) {
      setCompaniesError(err.message);
      toast.error(err.message || "Could not load top companies.");
    } finally {
      setIsLoadingCompanies(false);
    }
  }, []);

  useEffect(() => {
    fetchTopCompanies();
  }, [fetchTopCompanies]);

  // Handle Job Click (for job details modal)
  const handleJobClick = async (jobSummary: any) => {
    if (!jobSummary || !jobSummary.id) {
      setDetailedJobError("Cannot fetch details for this job.");
      setSelectedJob(null);
      return;
    }
    setDetailedJobLoading(true);
    setDetailedJobError(null);
    setSelectedJob(null);
    try {
      const response = await fetch(`/api/jobs/${jobSummary.id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to fetch job details" }));
        throw new Error(errorData.message || "Failed to fetch job details");
      }
      const data = await response.json();
      setSelectedJob(data.data);
    } catch (err: any) {
      setDetailedJobError(err.message);
      toast.error(err.message || "Could not load job details.");
      setSelectedJob(null);
    } finally {
      setDetailedJobLoading(false);
    }
  };

  const handleApplyClick = () => setShowApplicationModal(true);

  // Handle Submit Application
  const handleSubmitApplication = async () => {
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
        setApplicationData({ coverLetter: "", expectedSalary: "", startDate: "", resume: null, portfolio: null });
      } else {
        toast.error(result.message || "Failed to submit application.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  // *** FIX: DEFINED THE MISSING HANDLER FUNCTIONS FOR THE COMPANY MODAL ***
  const handleViewJobsClick = () => {
    setShowJobsModal(true);
  };

  const isFollowed = (companyId: number) => {
    return followedCompanies.includes(companyId);
  };

  const handleFollowClick = (companyId: number) => {
    if (isFollowed(companyId)) {
        setFollowedCompanies(followedCompanies.filter(id => id !== companyId));
        toast.info("You have unfollowed the company.");
    } else {
        setFollowedCompanies([...followedCompanies, companyId]);
        toast.success("You are now following the company!");
    }
  };

  // Handle Company Click (for company details modal - uses limited data from list)
  const handleCompanyClick = (company: any) => {
    // This is a placeholder until a proper /api/companies/[id] is used.
    // It uses the limited data from the API list and finds a match in a static detailed object.
    const staticCompanyDetailsForModal = [
        {
            id: 1, name: "TechFlow Solutions", industry: "Web Development & Design", logo: "/placeholder.svg?height=60&width=60", size: "50-200 employees", location: "San Francisco, CA", founded: 2018, verified: true, companyType: "Startup", description: "Leading web development agency specializing in modern React applications and e-commerce solutions.", mission: "To empower businesses with cutting-edge web technologies that drive growth and innovation.", vision: "Becoming the go-to partner for companies seeking exceptional digital experiences.", values: ["Innovation", "Quality", "Collaboration", "Continuous Learning"], benefits: ["Flexible Work Hours", "Health Insurance", "Stock Options", "Professional Development", "Remote Work Options"], culture: "We foster a collaborative environment where creativity meets technical excellence. Our team values work-life balance and continuous learning.", recentNews: ["Launched AI-powered web analytics platform", "Expanded team by 40% in Q3 2024", "Partnership with major e-commerce brands"], website: "techflowsolutions.com", email: "careers@techflowsolutions.com", phone: "+1 (555) 123-4567",
            jobOpenings: [{ id: 101, title: "Senior React Developer", department: "Engineering", location: "San Francisco, CA / Remote", type: "Full-time", salary: "$120,000 - $150,000", experience: "5+ years", postedDate: "2024-01-15", description: "Lead development of next-generation React applications for enterprise clients." }, { id: 102, title: "UI/UX Designer", department: "Design", location: "San Francisco, CA", type: "Full-time", salary: "$90,000 - $120,000", experience: "3+ years", postedDate: "2024-01-20", description: "Design beautiful and intuitive user interfaces for web applications." }]
        },
        {
            id: 2, name: "WebCraft Studios", industry: "Digital Agency", logo: "/placeholder.svg?height=60&width=60", size: "20-50 employees", location: "Austin, TX", founded: 2020, verified: true, companyType: "Agency", description: "Creative digital agency focused on building exceptional web experiences for startups and established brands.", mission: "Crafting digital experiences that tell your brand's story and drive meaningful connections.", vision: "To be recognized as the most innovative digital agency in the creative industry.", values: ["Creativity", "Authenticity", "Excellence", "Partnership"], benefits: ["Creative Freedom", "Health & Dental", "Flexible PTO", "Team Retreats", "Learning Stipend"], culture: "A creative playground where designers and developers collaborate to push the boundaries of what's possible on the web.", recentNews: ["Won 3 Webby Awards for client projects", "Opened new office in Denver", "Featured in Design Week Magazine"], website: "webcraftstudios.com", email: "hello@webcraftstudios.com", phone: "+1 (555) 234-5678",
            jobOpenings: [{ id: 201, title: "Full Stack Developer", department: "Development", location: "Austin, TX / Remote", type: "Full-time", salary: "$95,000 - $125,000", experience: "4+ years", postedDate: "2024-01-18", description: "Build end-to-end web solutions using modern JavaScript frameworks." }]
        },
        {
            id: 3, name: "DevForge Technologies", industry: "Software Development", logo: "/placeholder.svg?height=60&width=60", size: "100-500 employees", location: "Seattle, WA", founded: 2015, verified: true, companyType: "Tech Company", description: "Enterprise software development company specializing in scalable web applications and cloud solutions.", mission: "Forging the future of enterprise software through innovative development practices and cutting-edge technology.", vision: "To be the leading provider of enterprise web solutions that transform how businesses operate.", values: ["Innovation", "Reliability", "Scalability", "Team Excellence"], benefits: ["Comprehensive Health Coverage", "401(k) Matching", "Sabbatical Program", "Professional Certifications", "Gym Membership"], culture: "We believe in empowering our developers with the latest tools and technologies while maintaining a supportive team environment.", recentNews: ["Completed Series B funding round", "Launched new cloud platform", "Acquired two smaller tech companies"], website: "devforge.tech", email: "careers@devforge.tech", phone: "+1 (555) 345-6789",
            jobOpenings: [{ id: 301, title: "Backend Developer", department: "Engineering", location: "Seattle, WA", type: "Full-time", salary: "$110,000 - $140,000", experience: "3+ years", postedDate: "2024-01-22", description: "Develop robust backend systems for enterprise-level applications." }, { id: 302, title: "DevOps Engineer", department: "Infrastructure", location: "Seattle, WA / Remote", type: "Full-time", salary: "$125,000 - $155,000", experience: "5+ years", postedDate: "2024-01-25", description: "Manage cloud infrastructure and deployment pipelines." }]
        }
    ];
    const staticData = staticCompanyDetailsForModal.find(c => company.name && c.name.toLowerCase().includes(company.name.toLowerCase()));
    setSelectedCompany(staticData || { ...company, description: "Details not fully available.", industry: "N/A", location: "N/A", size: "N/A", jobOpenings: [] });
  };

  // Handlers for (static) freelance project modals
  const [projectApplicationData, setProjectApplicationData] = useState({
    proposal: "",
    estimatedBudget: "",
    timeline: "",
    portfolio: null,
    experience: ""
  });

  const handleProjectClick = (project: any) => {
    const staticFreelanceProjectDetails = [
        {
            id: 1, title: "E-commerce Website Redesign", company: "Ra Labs", industry: "Internet & Software", logo: "/placeholder.svg?height=40&width=40", budget: "$3,000-5,000", duration: "4 weeks", posted: "2 days ago", description: "We need a complete redesign of our e-commerce platform. The project involves modernizing the UI/UX, improving conversion rates, and implementing responsive design across all devices.", requirements: ["React/Next.js experience", "E-commerce platform knowledge", "UI/UX design skills", "Responsive design expertise"], deliverables: ["Complete website redesign", "Mobile-responsive layouts", "Shopping cart optimization", "Payment gateway integration"], companyInfo: { size: "10-50 employees", founded: 2018, website: "ralabs.com", description: "Ra Labs creates innovative software solutions for modern businesses." }, skills: ["React", "Next.js", "Figma", "Shopify", "CSS/Sass"]
        },
    ];
    const detail = staticFreelanceProjectDetails.find(p => p.id === project.id) || project;
    setSelectedProject(detail);
  };

  const handleProjectApplyClick = () => {
    setShowProjectApplicationModal(true);
  };

  const handleSubmitProjectApplication = () => {
    console.log("Project application submitted:", { project: selectedProject?.title, ...projectApplicationData })
    toast.success("Your proposal has been submitted (demo).");
    setShowProjectApplicationModal(false);
    setProjectApplicationData({ proposal: "", estimatedBudget: "", timeline: "", portfolio: null, experience: "" });
  };


  return (
    <>
      <div>
      <div className="w-[65%] mx-auto">
      <h1 className="text-4xl font-heading text-primary-navy mb-6">Explore</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-slate-50 to-[#0056B3]/10 border-none shadow-md">
          <CardContent className="p-8">
            <h2 className="text-2xl font-heading text-primary-navy mb-3">Welcome to 100 Networks</h2>
            <p className="text-muted-foreground font-subheading mb-6 text-lg">
              Follow professionals, find opportunities, and grow your career with our global network.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="bg-primary-navy hover:bg-primary-navy/90">
                Complete Profile
              </Button>
              <Button size="sm" variant="outline" className="border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white" asChild>
                <Link href="/jobs">Explore Jobs</Link>
              </Button>
              <Button size="sm" variant="outline" className="border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white whitespace-nowrap" asChild>
                <Link href="/jobs/freelance">Explore Freelance</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-8">
            <h2 className="text-2xl font-heading text-primary-navy mb-3">Get Discovered</h2>
            <p className="text-muted-foreground font-subheading mb-6 text-lg">
              Update your skills and preferences to get matched with the right opportunities.
            </p>
            <Button variant="outline" className="w-full border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white" asChild>
              <Link href="/career-interests">Update Career Interests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommended" className="mb-8">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="recommended" className="font-subheading data-[state=active]:bg-primary-navy data-[state=active]:text-white">Recommended</TabsTrigger>
          <TabsTrigger value="trending" className="font-subheading data-[state=active]:bg-primary-navy data-[state=active]:text-white">Trending</TabsTrigger>
          <TabsTrigger value="nearby" className="font-subheading data-[state=active]:bg-primary-navy data-[state=active]:text-white">Nearby</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading text-primary-navy">
                Opportunities for <span className="text-[#0056B3]">software developers</span>
              </h2>
              <Link href="/jobs" className="text-base text-[#0056B3] hover:underline font-subheading">
                View more
              </Link>
            </div>
            {isLoadingJobs && <p>Loading recommended jobs...</p>}
            {jobsError && <p className="text-red-500">Error: {jobsError}</p>}
            {!isLoadingJobs && !jobsError && recommendedJobsData.length === 0 && <p>No recommended jobs found at the moment.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedJobsData.map((job) => (
                <Card
                  key={job.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
                  onClick={() => handleJobClick(job)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-start space-x-3">
                        <img src={job.company_logo_url || "/placeholder-logo.png"} alt={job.company_name || "Company"} className="h-12 w-12 rounded" />
                        <div>
                          <p className="font-subheading font-medium text-base">{job.company_name || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">{job.company?.industry || "N/A"}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 hover:bg-primary-navy/10"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* Handle bookmark logic */ }}
                      >
                        <BookmarkIcon className="h-5 w-5" />
                      </Button>
                    </div>
                    <h3 className="font-heading text-primary-navy mb-2 text-lg truncate" title={job.title}>{job.title}</h3>
                    <p className="text-base text-muted-foreground mb-3 font-subheading capitalize">
                      {job.job_type?.replace("_", "-") || "N/A"} • {job.location_city && job.location_state ? `${job.location_city}, ${job.location_state}` : job.location_country || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {formatSalary(job)} • Posted {job.published_at ? formatDistanceToNow(new Date(job.published_at), { addSuffix: true }) : "N/A"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Freelance Projects Section (now using empty freelanceProjects array) */}
          <div className="mb-8 opacity-50" title="Freelance projects coming soon">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading text-primary-navy">
                Freelance projects in <span className="text-[#0056B3]">web development</span>
              </h2>
              <Link href="/jobs/freelance" className="text-base text-[#0056B3] hover:underline font-subheading">
                View more
              </Link>
            </div>
            {freelanceProjects.length === 0 && <p className="text-slate-500">Freelance projects section is currently under development.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {freelanceProjects.map((project) => (
                <Card
                  key={project.id}
                  className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleProjectClick(project)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-start space-x-3">
                        <img src={project.logo} alt={project.company} className="h-12 w-12 rounded" />
                        <div>
                          <p className="font-subheading font-medium text-base">{project.company}</p>
                          <p className="text-sm text-muted-foreground">{project.industry}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 hover:bg-primary-navy/10"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          // Handle bookmark logic
                        }}
                      >
                        <BookmarkIcon className="h-5 w-5" />
                      </Button>
                    </div>
                    <h3 className="font-heading text-primary-navy mb-2 text-lg">{project.title}</h3>
                    <p className="text-base text-muted-foreground mb-3 font-subheading">{project.budget} • {project.duration}</p>
                    <p className="text-sm text-muted-foreground mb-4">Posted {project.posted}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading text-primary-navy">
                Top companies for <span className="text-[#0056B3]">web development</span>
              </h2>
              <Link href="/employers" className="text-base text-[#0056B3] hover:underline font-subheading">
                View more
              </Link>
            </div>
            {isLoadingCompanies && <p>Loading top companies...</p>}
            {companiesError && <p className="text-red-500">Error: {companiesError}</p>}
            {!isLoadingCompanies && !companiesError && topCompaniesData.length === 0 && <p>No top companies found at the moment.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topCompaniesData.map((company) => (
                <Card
                  key={company.id}
                  className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleCompanyClick(company)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-start space-x-4">
                        <img src={company.logo_url || "/placeholder-logo.png"} alt={company.name || "Company"} className="h-16 w-16 rounded" />
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="font-subheading font-medium text-base truncate" title={company.name}>{company.name || "N/A"}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{company.industry || "N/A"}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 hover:bg-primary-navy/10"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* Handle bookmark logic */}}
                      >
                        <BookmarkIcon className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{company.hq_location_city && company.hq_location_state ? `${company.hq_location_city}, ${company.hq_location_state}` : company.hq_location_country || "N/A"}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{company.size || "N/A"}</span>
                      </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        <span>{company.jobs_count !== undefined ? `${company.jobs_count} open position${company.jobs_count !== 1 ? 's' : ''}` : "Jobs: N/A"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trending">
          <div className="text-center py-12">
            <h3 className="text-lg font-heading text-primary-navy mb-2">Trending content coming soon</h3>
            <p className="text-muted-foreground font-subheading">We're gathering the most popular opportunities for you</p>
          </div>
        </TabsContent>

        <TabsContent value="nearby">
          <div className="text-center py-12">
            <h3 className="text-lg font-heading text-primary-navy mb-2">Enable location services</h3>
            <p className="text-muted-foreground font-subheading mb-4">Allow location access to see opportunities near you</p>
            <Button className="bg-primary-navy hover:bg-primary-navy/90">Enable Location</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div> {/* Closes w-[65%] mx-auto div */}

    {/* Job Details Modal */}
    {(selectedJob || detailedJobLoading || detailedJobError) && !showApplicationModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="icon" onClick={() => { setSelectedJob(null); setDetailedJobError(null); }} className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
                <h1 className="text-2xl font-heading text-primary-navy">Job Details</h1>
                <Button variant="ghost" size="icon" onClick={() => { setSelectedJob(null); setDetailedJobError(null); }} className="rounded-xl"><X className="h-5 w-5" /></Button>
            </div>
            {detailedJobLoading && <div className="text-center py-10"><Clock className="h-12 w-12 text-primary-navy mx-auto animate-spin mb-4" /><p>Loading job details...</p></div>}
            {!detailedJobLoading && detailedJobError && <div className="text-center py-10"><XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" /><p className="text-red-600">{detailedJobError}</p></div>}
            {!detailedJobLoading && !detailedJobError && selectedJob && (
            <div className="space-y-6">
              <div className="flex items-start space-x-6">
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                  <img src={selectedJob.company?.logo_url || "/placeholder-logo.png"} alt={selectedJob.company?.name || "Company"} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-heading text-primary-navy">{selectedJob.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-subheading ${selectedJob.location_type?.toLowerCase() === "remote" ? "bg-green-100 text-green-700" : selectedJob.location_type?.toLowerCase() === "hybrid" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                      {selectedJob.location_type?.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-slate-600 font-subheading mb-3">
                    <div className="flex items-center space-x-1"><Building className="h-4 w-4" /><span>{selectedJob.company?.name || "N/A"}</span></div>
                    <div className="flex items-center space-x-1"><MapPin className="h-4 w-4" /><span>{selectedJob.location || "N/A"}</span></div>
                    <div className="flex items-center space-x-1"><DollarSign className="h-4 w-4" /><span className="font-heading text-primary-navy">{formatSalary(selectedJob)}</span></div>
                  </div>
                  <div className="flex items-center space-x-4 text-slate-500 font-subheading">
                    <span className="capitalize">{selectedJob.job_type?.replace("_", "-") || "N/A"}</span>
                    <span>•</span>
                    <span>Posted {selectedJob.published_at ? formatDistanceToNow(new Date(selectedJob.published_at), { addSuffix: true }) : "N/A"}</span>
                    {selectedJob.application_deadline && <><span>•</span><span>Apply by {new Date(selectedJob.application_deadline).toLocaleDateString()}</span></>}
                  </div>
                </div>
              </div>
              <Separator />
              <div><h3 className="text-lg font-heading text-primary-navy mb-3">Job Description</h3><div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedJob.description || "<p>N/A</p>"}} /></div>
              {selectedJob.skills?.length > 0 && <div><h3 className="text-lg font-heading text-primary-navy mb-3">Skills</h3><div className="flex flex-wrap gap-2">{selectedJob.skills.map((skill:string, i:number) => <Badge key={i}>{skill}</Badge>)}</div></div>}
              {selectedJob.requirements?.length > 0 && <div><h3 className="text-lg font-heading text-primary-navy mb-3">Requirements</h3><ul className="list-disc pl-5 space-y-1">{selectedJob.requirements.map((r:string, i:number) => <li key={i}>{r}</li>)}</ul></div>}
              {selectedJob.responsibilities?.length > 0 && <div><h3 className="text-lg font-heading text-primary-navy mb-3">Responsibilities</h3><ul className="list-disc pl-5 space-y-1">{selectedJob.responsibilities.map((r:string, i:number) => <li key={i}>{r}</li>)}</ul></div>}
              {selectedJob.benefits && <div><h3 className="text-lg font-heading text-primary-navy mb-3">Benefits</h3><p>{selectedJob.benefits}</p></div>}
              {selectedJob.company && <div><h3 className="text-lg font-heading text-primary-navy mb-3">About {selectedJob.company.name}</h3> <p>{selectedJob.company.description || "N/A"}</p> </div>}
              <div className="pt-4">
                <Button
                  className="w-full bg-primary-navy hover:bg-slate-800 text-white rounded-xl font-subheading"
                  onClick={handleApplyClick}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Apply for this Position
                </Button>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Freelance Project Details Modal */}
    {selectedProject && !showProjectApplicationModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedProject(null)}
                  className="rounded-xl"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-heading text-primary-navy">Project Details</h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedProject(null)}
                className="rounded-xl"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <img src={selectedProject.logo} alt={selectedProject.company} className="h-16 w-16 rounded-xl" />
                <div className="flex-1">
                  <h2 className="text-2xl font-heading text-primary-navy mb-1">{selectedProject.title}</h2>
                  <p className="text-lg text-slate-600 font-subheading mb-2">{selectedProject.company}</p>
                  <div className="grid grid-cols-2 gap-4 text-slate-600 font-subheading mb-4">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      <span>{selectedProject.industry}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                      <span>{selectedProject.budget}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span>{selectedProject.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>Posted {selectedProject.posted}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-heading text-primary-navy mb-3">Project Description</h3>
                <p className="text-slate-600 font-subheading leading-relaxed">{selectedProject.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-heading text-primary-navy mb-3">Requirements</h3>
                <div className="space-y-2">
                  {selectedProject.requirements.map((req: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-slate-600 font-subheading">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-heading text-primary-navy mb-3">Deliverables</h3>
                <div className="space-y-2">
                  {selectedProject.deliverables.map((deliverable: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-[#0056B3] rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-600 font-subheading">{deliverable}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-heading text-primary-navy mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.skills.map((skill: string, index: number) => (
                    <Badge key={index} className="bg-blue-100 text-blue-700 font-subheading">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-heading text-primary-navy mb-3">About {selectedProject.company}</h3>
                <p className="text-slate-600 font-subheading leading-relaxed mb-3">{selectedProject.companyInfo.description}</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Founded:</span>
                    <span className="ml-2 text-slate-700 font-subheading">{selectedProject.companyInfo.founded}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Size:</span>
                    <span className="ml-2 text-slate-700 font-subheading">{selectedProject.companyInfo.size}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Website:</span>
                    <span className="ml-2 text-slate-700 font-subheading">{selectedProject.companyInfo.website}</span>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Button
                  className="w-full bg-primary-navy hover:bg-slate-800 text-white rounded-xl font-subheading"
                  onClick={handleProjectApplyClick}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Proposal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Job Application Modal */}
    <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-primary-navy">
            Apply for {selectedJob?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {selectedJob && (
            <Card className="border-slate-200 bg-slate-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <img src={selectedJob.company?.logo_url || "/placeholder-logo.png"} alt={selectedJob.company?.name} className="h-12 w-12 rounded" />
                  <div>
                    <h4 className="font-heading text-primary-navy">{selectedJob.title}</h4>
                    <p className="text-slate-600 font-subheading text-sm">{selectedJob.company?.name} • {selectedJob.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <Label htmlFor="coverLetter" className="font-subheading text-primary-navy">Cover Letter</Label>
            <Textarea
              id="coverLetter"
              placeholder="Tell us why you're the perfect fit for this role..."
              value={applicationData.coverLetter}
              onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
              className="mt-2 min-h-[120px] rounded-xl font-subheading"
            />
          </div>
          <div>
            <Label htmlFor="salary" className="font-subheading text-primary-navy">Expected Salary</Label>
            <Input
              id="salary"
              placeholder="e.g., $120,000"
              value={applicationData.expectedSalary}
              onChange={(e) => setApplicationData({...applicationData, expectedSalary: e.target.value})}
              className="mt-2 rounded-xl font-subheading"
            />
          </div>
          <div>
            <Label htmlFor="startDate" className="font-subheading text-primary-navy">Available Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={applicationData.startDate}
              onChange={(e) => setApplicationData({...applicationData, startDate: e.target.value})}
              className="mt-2 rounded-xl font-subheading"
            />
          </div>
          <div>
            <Label className="font-subheading text-primary-navy">Resume</Label>
            <div className="mt-2 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 font-subheading">Click to upload your resume</p>
              <p className="text-slate-400 font-subheading text-sm">PDF, DOC, or DOCX (max 5MB)</p>
            </div>
          </div>
          <div className="flex space-x-4 pt-4">
            <Button
              variant="outline"
              className="flex-1 rounded-xl font-subheading"
              onClick={() => setShowApplicationModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary-navy hover:bg-slate-800 text-white rounded-xl font-subheading"
              onClick={handleSubmitApplication}
              disabled={isSubmittingApplication}
            >
              {isSubmittingApplication ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Project Application Modal (static) */}
    <Dialog open={showProjectApplicationModal} onOpenChange={setShowProjectApplicationModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-primary-navy">
            Submit Proposal for {selectedProject?.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {selectedProject && (
            <Card className="border-slate-200 bg-slate-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <img src={selectedProject.logo} alt={selectedProject.company} className="h-12 w-12 rounded" />
                  <div>
                    <h4 className="font-heading text-primary-navy">{selectedProject.title}</h4>
                    <p className="text-slate-600 font-subheading text-sm">{selectedProject.company} • {selectedProject.budget}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <div>
            <Label htmlFor="proposal" className="font-subheading text-primary-navy">Project Proposal</Label>
            <Textarea
              id="proposal"
              placeholder="Describe your approach to this project..."
              value={projectApplicationData.proposal}
              onChange={(e) => setProjectApplicationData({...projectApplicationData, proposal: e.target.value})}
              className="mt-2 min-h-[120px] rounded-xl font-subheading"
            />
          </div>
          <div>
            <Label htmlFor="budget" className="font-subheading text-primary-navy">Your Budget Estimate</Label>
            <Input
              id="budget"
              placeholder="e.g., $4,500"
              value={projectApplicationData.estimatedBudget}
              onChange={(e) => setProjectApplicationData({...projectApplicationData, estimatedBudget: e.target.value})}
              className="mt-2 rounded-xl font-subheading"
            />
          </div>
          <div>
            <Label htmlFor="timeline" className="font-subheading text-primary-navy">Estimated Timeline</Label>
            <Input
              id="timeline"
              placeholder="e.g., 3-4 weeks"
              value={projectApplicationData.timeline}
              onChange={(e) => setProjectApplicationData({...projectApplicationData, timeline: e.target.value})}
              className="mt-2 rounded-xl font-subheading"
            />
          </div>
          <div>
            <Label className="font-subheading text-primary-navy">Portfolio/Previous Work</Label>
            <div className="mt-2 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 font-subheading">Upload portfolio or work samples</p>
              <p className="text-slate-400 font-subheading text-sm">PDF, Images, or ZIP (max 10MB)</p>
            </div>
          </div>
          <div className="flex space-x-4 pt-4">
            <Button
              variant="outline"
              className="flex-1 rounded-xl font-subheading"
              onClick={() => setShowProjectApplicationModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary-navy hover:bg-slate-800 text-white rounded-xl font-subheading"
              onClick={handleSubmitProjectApplication}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Proposal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Company Details Modal */}
    {selectedCompany && !showJobsModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="icon" onClick={() => setSelectedCompany(null)} className="rounded-xl">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-heading text-primary-navy">Company Profile</h1>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedCompany(null)} className="rounded-xl">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <img src={selectedCompany.logo} alt={selectedCompany.name} className="h-20 w-20 rounded-xl" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h2 className="text-2xl font-heading text-primary-navy">{selectedCompany.name}</h2>
                    {selectedCompany.verified && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <Badge
                      className={`${
                        selectedCompany.companyType === 'Startup' ? 'bg-green-100 text-green-700' :
                        selectedCompany.companyType === 'Agency' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      } font-subheading`}
                    >
                      {selectedCompany.companyType}
                    </Badge>
                  </div>
                  <p className="text-lg text-slate-600 font-subheading mb-3">{selectedCompany.industry}</p>
                  <div className="grid grid-cols-2 gap-4 text-slate-600 font-subheading">
                    <div className="flex items-center space-x-2"><MapPin className="h-4 w-4 text-slate-500" /><span>{selectedCompany.location}</span></div>
                    <div className="flex items-center space-x-2"><Users className="h-4 w-4 text-slate-500" /><span>{selectedCompany.size}</span></div>
                    <div className="flex items-center space-x-2"><Calendar className="h-4 w-4 text-slate-500" /><span>Founded {selectedCompany.founded}</span></div>
                    <div className="flex items-center space-x-2"><Building2 className="h-4 w-4 text-slate-500" /><span>{selectedCompany.jobOpenings.length} open positions</span></div>
                  </div>
                </div>
              </div>
              <Separator />
              <div><h3 className="text-lg font-heading text-primary-navy mb-3">About {selectedCompany.name}</h3><p className="text-slate-600 font-subheading leading-relaxed">{selectedCompany.description}</p></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><h4 className="font-heading text-primary-navy mb-2">Mission</h4><p className="text-slate-600 font-subheading">{selectedCompany.mission}</p></div>
                <div><h4 className="font-heading text-primary-navy mb-2">Vision</h4><p className="text-slate-600 font-subheading">{selectedCompany.vision}</p></div>
              </div>
              <div>
                <h3 className="text-lg font-heading text-primary-navy mb-3">Our Values</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCompany.values.map((value: string, index: number) => (
                    <Badge key={index} className="bg-blue-100 text-blue-700 font-subheading"><Star className="h-3 w-3 mr-1" />{value}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-heading text-primary-navy mb-3">Benefits & Perks</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCompany.benefits.map((benefit: string, index: number) => (
                    <Badge key={index} className="bg-green-100 text-green-700 font-subheading"><Award className="h-3 w-3 mr-1" />{benefit}</Badge>
                  ))}
                </div>
              </div>
              <div><h3 className="text-lg font-heading text-primary-navy mb-3">Company Culture</h3><p className="text-slate-600 font-subheading leading-relaxed">{selectedCompany.culture}</p></div>
              <div>
                <h3 className="text-lg font-heading text-primary-navy mb-3">Recent News</h3>
                <div className="space-y-2">
                  {selectedCompany.recentNews.map((news: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-[#0056B3] rounded-full mt-2 flex-shrink-0"></div><span className="text-slate-600 font-subheading">{news}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-heading text-primary-navy mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div><span className="text-slate-500">Website:</span><span className="ml-2 text-slate-700 font-subheading">{selectedCompany.website}</span></div>
                  <div><span className="text-slate-500">Email:</span><span className="ml-2 text-slate-700 font-subheading">{selectedCompany.email}</span></div>
                  <div><span className="text-slate-500">Phone:</span><span className="ml-2 text-slate-700 font-subheading">{selectedCompany.phone}</span></div>
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <Button
                  className="flex-1 bg-primary-navy hover:bg-slate-800 text-white rounded-xl font-subheading"
                  onClick={handleViewJobsClick}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  View Open Positions ({selectedCompany.jobOpenings.length})
                </Button>
                <Button
                  variant="outline"
                  className={`rounded-xl font-subheading ${
                    isFollowed(selectedCompany.id)
                      ? 'bg-[#0056B3] text-white border-[#0056B3] hover:bg-primary-navy'
                      : 'border-[#0056B3] text-[#0056B3] hover:bg-primary-navy hover:text-white'
                  }`}
                  onClick={() => handleFollowClick(selectedCompany.id)}
                >
                  {isFollowed(selectedCompany.id) ? (
                    <><CheckCircle className="h-4 w-4 mr-2" />Following</>
                  ) : (
                    <><Users className="h-4 w-4 mr-2" />Follow</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Jobs Modal */}
    <Dialog open={showJobsModal} onOpenChange={setShowJobsModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-primary-navy">
            Open Positions at {selectedCompany?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {selectedCompany && (
            <Card className="border-slate-200 bg-slate-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <img src={selectedCompany.logo} alt={selectedCompany.name} className="h-12 w-12 rounded" />
                  <div>
                    <h4 className="font-heading text-primary-navy">{selectedCompany.name}</h4>
                    <p className="text-slate-600 font-subheading text-sm">{selectedCompany.industry} • {selectedCompany.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <div className="space-y-4">
            {selectedCompany?.jobOpenings.map((job: any) => (
              <Card key={job.id} className="border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-heading text-primary-navy mb-2">{job.title}</h3>
                      <p className="text-slate-600 font-subheading mb-3">{job.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 font-subheading mb-4">
                        <div className="flex items-center space-x-2"><Building2 className="h-4 w-4 text-slate-500" /><span>{job.department}</span></div>
                        <div className="flex items-center space-x-2"><MapPin className="h-4 w-4 text-slate-500" /><span>{job.location}</span></div>
                        <div className="flex items-center space-x-2"><DollarSign className="h-4 w-4 text-slate-500" /><span>{job.salary}</span></div>
                        <div className="flex items-center space-x-2"><Clock className="h-4 w-4 text-slate-500" /><span>{job.type}</span></div>
                        <div className="flex items-center space-x-2"><Star className="h-4 w-4 text-slate-500" /><span>{job.experience} experience</span></div>
                        <div className="flex items-center space-x-2"><Calendar className="h-4 w-4 text-slate-500" /><span>Posted {new Date(job.postedDate).toLocaleDateString()}</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    {/* *** FIX: Made this button functional *** */}
                    <Button
                      className="bg-primary-navy hover:bg-slate-800 text-white rounded-xl font-subheading"
                      onClick={() => {
                        setShowJobsModal(false);
                        // setSelectedCompany(null); // User confirmed this was not needed here
                        handleJobClick({ id: job.id, ...job }); // Spread job to ensure all details are passed
                      }}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              className="rounded-xl font-subheading"
              onClick={() => setShowJobsModal(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Company Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
      </div> {/* Closes the outer wrapper div */}
    </>
  )
}

export default function ExplorePage() {
  // Suspense can be added if there are other client components that need it.
  return (
    <ProtectedRoute>
      <ExplorePageContent />
    </ProtectedRoute>
  );
}
