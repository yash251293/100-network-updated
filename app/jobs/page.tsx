"use client"

"use client"

import { useState, useEffect, useCallback } from "react"
import { formatDistanceToNow } from 'date-fns'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookmarkIcon, Filter, Search, Clock, CheckCircle, XCircle, Calendar, Briefcase, MapPin, DollarSign, Building, FileText, ChevronRight, Star, Users, Award, TrendingUp, Zap, Globe, ArrowLeft, X, Send, Upload } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getToken } from "@/lib/authClient"; // Added
import { toast } from "sonner"; // Added (likely already present, but ensure)
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"

const appliedJobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechVision",
    logo: "/abstract-tech-logo.png",
    location: "San Francisco, CA",
    salary: "$120K - $150K",
    type: "Full-time",
    remote: "Remote",
    appliedDate: "3 days ago",
    status: "under_review",
    statusText: "Under Review",
    description: "We're looking for a senior frontend developer to lead our web application development team.",
    skills: ["React", "TypeScript", "Redux", "5+ years"],
  },
  {
    id: "4",
    title: "Digital Marketing Manager",
    company: "GrowthBoost",
    logo: "/marketing-agency-logo.png",
    location: "New York, NY",
    salary: "$75K - $95K",
    type: "Full-time",
    remote: "Hybrid",
    appliedDate: "1 week ago",
    status: "interview_scheduled",
    statusText: "Interview Scheduled",
    description: "Lead our digital marketing efforts across multiple channels to drive growth for our B2B clients.",
    skills: ["SEO", "SEM", "Social Media", "Analytics"],
  },
  {
    id: "6",
    title: "UX Designer",
    company: "DesignCorp",
    logo: "/design-agency-logo.png",
    location: "Austin, TX",
    salary: "$80K - $100K",
    type: "Full-time",
    remote: "Remote",
    appliedDate: "2 weeks ago",
    status: "rejected",
    statusText: "Not Selected",
    description: "Create intuitive user experiences for our mobile and web applications.",
    skills: ["Figma", "User Research", "Prototyping", "3+ years"],
  },
  {
    id: "7",
    title: "Backend Engineer",
    company: "CloudTech",
    logo: "/tech-startup-logo.png",
    location: "Seattle, WA",
    salary: "$100K - $130K",
    type: "Full-time",
    remote: "Hybrid",
    appliedDate: "3 weeks ago",
    status: "applied",
    statusText: "Application Submitted",
    description: "Build scalable backend systems and APIs for our cloud platform.",
    skills: ["Node.js", "AWS", "Docker", "PostgreSQL"],
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "applied":
      return <Clock className="h-4 w-4 text-primary-navy" />
    case "under_review":
      return <Clock className="h-4 w-4 text-orange-500" />
    case "interview_scheduled":
      return <Calendar className="h-4 w-4 text-green-500" />
    case "rejected":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "accepted":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    default:
      return <Clock className="h-4 w-4 text-slate-400" />
  }
}

const getStatusBadge = (status: string, statusText: string) => {
  const variants = {
    applied: "bg-primary-navy/10 text-primary-navy border-primary-navy/20",
    under_review: "bg-orange-50 text-orange-600 border-orange-200",
    interview_scheduled: "bg-green-50 text-green-600 border-green-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
    accepted: "bg-green-50 text-green-600 border-green-200",
  }

  return <Badge className={`${variants[status as keyof typeof variants]} font-subheading`}>{statusText}</Badge>
}

// Helper function to format salary
const formatSalary = (job: any) => {
  if (!job.salary_min && !job.salary_max) return "Not Disclosed";
  let salaryString = "";
  if (job.salary_min) salaryString += `$${(job.salary_min / 1000).toFixed(0)}k`; // Assuming salary is in cents or smallest unit
  if (job.salary_max) salaryString += `${job.salary_min ? ' - ' : ''}${(job.salary_max / 1000).toFixed(0)}k`;
  if (job.salary_currency) salaryString += ` ${job.salary_currency}`;
  if (job.salary_period) salaryString += `/${job.salary_period.charAt(0).toUpperCase() + job.salary_period.slice(1)}`;
  return salaryString;
};


export default function JobsPage() {
  // Existing states
  const [showFilters, setShowFilters] = useState(false)
  const [salaryRange, setSalaryRange] = useState([40000, 200000]) // Keep for now, not wired to API
  const [experienceRange, setExperienceRange] = useState([0, 15]) // Keep for now, not wired to API
  const [selectedJob, setSelectedJob] = useState<any>(null) // Keep for modal
  const [showApplicationModal, setShowApplicationModal] = useState(false) // Keep for modal
  const [applicationData, setApplicationData] = useState({ // Keep for modal
    coverLetter: "",
    expectedSalary: "",
    availableStartDate: "",
    resume: null,
    portfolio: null
  })

  // New state variables for API data
  const [jobsData, setJobsData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [jobTypeFilter, setJobTypeFilter] = useState("") // Example: "full-time"
  const [experienceLevelFilter, setExperienceLevelFilter] = useState("") // Example: "senior-level"
  const [locationFilter, setLocationFilter] = useState("") // Example: "San Francisco, CA"

  // State for detailed job modal
  const [detailedJobLoading, setDetailedJobLoading] = useState(false);
  const [detailedJobError, setDetailedJobError] = useState<string | null>(null);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false); // Added

  // Existing static data (will be removed or adapted)
  const statusCounts = { // This will need to be dynamic if "My Applications" tab is implemented
    total: appliedJobs.length,
    pending: appliedJobs.filter(job => job.status === "applied" || job.status === "under_review").length,
    interviews: appliedJobs.filter(job => job.status === "interview_scheduled").length,
    hired: appliedJobs.filter(job => job.status === "accepted").length,
  }

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: "5", // Or your desired limit
      });
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      if (jobTypeFilter) params.append("job_type", jobTypeFilter);
      if (experienceLevelFilter) params.append("experience_levels", experienceLevelFilter); // API uses experience_levels
      if (locationFilter) params.append("location", locationFilter);

      const response = await fetch(`/api/jobs?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to fetch jobs" }));
        throw new Error(errorData.message || "Failed to fetch jobs");
      }
      const data = await response.json();
      setJobsData(data.data || []);
      setTotalPages(data.pagination.total_pages || 1);
    } catch (err: any) {
      setError(err.message);
      setJobsData([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, jobTypeFilter, experienceLevelFilter, locationFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // REMOVE STATIC JOBS ARRAY LATER or IF IT INTERFERES
  const jobs = [ // This is static data, will be replaced by jobsData
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechVision",
      logo: "/abstract-tech-logo.png",
      location: "San Francisco, CA",
      salary: "$120K - $150K",
      type: "Full-time",
      remote: "Remote",
      posted: "3 days ago",
      description: "We're looking for a senior frontend developer to lead our web application development team and architect scalable solutions for our growing platform.",
      fullDescription: "We are seeking a highly skilled Senior Frontend Developer to join our dynamic team at TechVision. You will be responsible for architecting and developing scalable web applications using modern frontend technologies. This role offers the opportunity to work on cutting-edge projects that impact millions of users worldwide. You'll collaborate closely with our product, design, and backend teams to create exceptional user experiences.",
      skills: ["React", "TypeScript", "Redux", "5+ years"],
      requirements: [
        "5+ years of experience in frontend development",
        "Expert knowledge of React and TypeScript",
        "Experience with state management libraries (Redux, MobX)",
        "Strong understanding of modern JavaScript (ES6+)",
        "Experience with testing frameworks (Jest, React Testing Library)",
        "Familiarity with modern build tools (Webpack, Vite)",
        "Experience with CSS-in-JS libraries or CSS modules"
      ],
      responsibilities: [
        "Lead frontend architecture decisions and technical direction",
        "Mentor junior developers and conduct code reviews",
        "Collaborate with design team to implement pixel-perfect UIs",
        "Optimize application performance and ensure scalability",
        "Participate in agile development processes and sprint planning",
        "Stay up-to-date with latest frontend technologies and best practices"
      ],
      companyInfo: {
        name: "TechVision",
        size: "100-500 employees",
        industry: "Technology",
        founded: "2018",
        description: "TechVision is a fast-growing technology company that develops innovative software solutions for businesses worldwide.",
        benefits: ["Health Insurance", "401(k) Matching", "Unlimited PTO", "Remote Work", "Learning Budget"],
        culture: "Innovation-driven, collaborative, and growth-focused environment"
      },
      applicationDeadline: "2024-02-15",
      hiringManager: "Sarah Chen, Engineering Manager"
    },
    {
      id: 2,
      title: "Python AI Engineer",
      company: "Flexbone",
      logo: "/flexbone-logo.png",
      location: "Atlanta, GA",
      salary: "$90K - $110K",
      type: "Contract",
      remote: "Hybrid",
      posted: "1 week ago",
      description: "Join our AI team to develop cutting-edge machine learning solutions for healthcare applications and make a real impact on patient outcomes.",
      fullDescription: "Flexbone is looking for a talented Python AI Engineer to join our healthcare AI division. You will be working on revolutionary machine learning models that help healthcare providers make better decisions and improve patient outcomes. This role involves working with large healthcare datasets, developing predictive models, and deploying AI solutions in production environments.",
      skills: ["Python", "TensorFlow", "Machine Learning", "3+ years"],
      requirements: [
        "3+ years of experience in machine learning and AI",
        "Strong proficiency in Python and ML libraries (TensorFlow, PyTorch, scikit-learn)",
        "Experience with data preprocessing and feature engineering",
        "Knowledge of deep learning architectures and techniques",
        "Experience with cloud platforms (AWS, GCP, or Azure)",
        "Understanding of healthcare data standards (HL7, FHIR) is a plus",
        "Master's degree in Computer Science, Data Science, or related field"
      ],
      responsibilities: [
        "Develop and train machine learning models for healthcare applications",
        "Work with healthcare data to extract meaningful insights",
        "Collaborate with data scientists and healthcare professionals",
        "Deploy and monitor ML models in production environments",
        "Conduct research on new AI techniques and methodologies",
        "Ensure models meet regulatory and compliance requirements"
      ],
      companyInfo: {
        name: "Flexbone",
        size: "50-100 employees",
        industry: "Healthcare Technology",
        founded: "2020",
        description: "Flexbone develops AI-powered solutions for healthcare providers to improve patient care and operational efficiency.",
        benefits: ["Health Insurance", "Flexible Hours", "Professional Development", "Stock Options"],
        culture: "Mission-driven team focused on improving healthcare through technology"
      },
      applicationDeadline: "2024-02-20",
      hiringManager: "Dr. Michael Torres, Head of AI"
    },
    {
      id: 3,
      title: "Full Stack Developer",
      company: "Source",
      logo: "/generic-company-logo.png",
      location: "Chicago, IL",
      salary: "$85K - $105K",
      type: "Full-time",
      remote: "On-site",
      posted: "2 weeks ago",
      description: "We need a talented full stack developer to build and maintain web applications for our clients in the construction industry.",
      fullDescription: "Source is seeking a Full Stack Developer to join our development team. You will be responsible for building and maintaining web applications that serve our clients in the construction industry. This role requires both frontend and backend development skills, with a focus on creating robust, scalable solutions that help construction companies manage their projects more efficiently.",
      skills: ["JavaScript", "Node.js", "React", "MongoDB"],
      requirements: [
        "3+ years of full stack development experience",
        "Proficiency in JavaScript and modern frameworks (React, Vue, or Angular)",
        "Strong backend development skills with Node.js",
        "Experience with databases (MongoDB, PostgreSQL, or MySQL)",
        "Knowledge of RESTful API design and development",
        "Familiarity with version control systems (Git)",
        "Understanding of web security best practices"
      ],
      responsibilities: [
        "Develop and maintain full stack web applications",
        "Design and implement RESTful APIs",
        "Work closely with clients to understand requirements",
        "Ensure application performance and scalability",
        "Participate in code reviews and technical discussions",
        "Troubleshoot and debug applications"
      ],
      companyInfo: {
        name: "Source",
        size: "20-50 employees",
        industry: "Construction Technology",
        founded: "2015",
        description: "Source provides technology solutions to construction companies, helping them streamline operations and improve project management.",
        benefits: ["Health Insurance", "Retirement Plan", "Professional Development", "Team Events"],
        culture: "Close-knit team with strong focus on client satisfaction and technical excellence"
      },
      applicationDeadline: "2024-02-25",
      hiringManager: "Jennifer Kim, CTO"
    },
    {
      id: 4,
      title: "Digital Marketing Manager",
      company: "GrowthBoost",
      logo: "/marketing-agency-logo.png",
      location: "New York, NY",
      salary: "$75K - $95K",
      type: "Full-time",
      remote: "Hybrid",
      posted: "5 days ago",
      description: "Lead our digital marketing efforts across multiple channels to drive growth for our B2B clients and expand market reach.",
      fullDescription: "GrowthBoost is looking for a dynamic Digital Marketing Manager to lead our marketing initiatives and drive growth for our B2B clients. You will be responsible for developing and executing comprehensive digital marketing strategies across multiple channels including SEO, SEM, social media, and content marketing. This role offers the opportunity to work with diverse clients and make a significant impact on their business growth.",
      skills: ["SEO", "SEM", "Social Media", "Analytics"],
      requirements: [
        "3+ years of digital marketing experience, preferably in B2B",
        "Strong knowledge of SEO and SEM best practices",
        "Experience with social media marketing and management",
        "Proficiency in Google Analytics and other marketing tools",
        "Excellent content creation and copywriting skills",
        "Experience with marketing automation platforms",
        "Strong analytical skills and data-driven mindset"
      ],
      responsibilities: [
        "Develop and execute digital marketing strategies for B2B clients",
        "Manage SEO and SEM campaigns to drive organic and paid traffic",
        "Create and manage social media content and campaigns",
        "Analyze campaign performance and provide actionable insights",
        "Collaborate with creative team on marketing materials",
        "Stay up-to-date with digital marketing trends and best practices"
      ],
      companyInfo: {
        name: "GrowthBoost",
        size: "30-75 employees",
        industry: "Digital Marketing",
        founded: "2017",
        description: "GrowthBoost is a digital marketing agency specializing in B2B growth strategies and lead generation.",
        benefits: ["Health Insurance", "Flexible Work", "Professional Development", "Performance Bonuses"],
        culture: "Creative, data-driven team focused on delivering exceptional results for clients"
      },
      applicationDeadline: "2024-02-18",
      hiringManager: "Alex Rodriguez, Marketing Director"
    },
    {
      id: 5,
      title: "Product Manager - Fintech",
      company: "FinTech Solutions",
      logo: "/finance-company-logo.png",
      location: "Boston, MA",
      salary: "$110K - $140K",
      type: "Full-time",
      remote: "Hybrid",
      posted: "1 week ago",
      description: "Drive the product roadmap for our financial technology solutions, working closely with engineering and design teams to deliver exceptional user experiences.",
      fullDescription: "FinTech Solutions is seeking an experienced Product Manager to drive the development of our financial technology products. You will be responsible for defining product strategy, managing the product roadmap, and working closely with cross-functional teams to deliver innovative solutions that meet our customers' needs. This role requires a deep understanding of the fintech industry and strong leadership skills.",
      skills: ["Product Management", "Fintech", "Agile", "5+ years"],
      requirements: [
        "5+ years of product management experience, preferably in fintech",
        "Strong understanding of financial services and regulations",
        "Experience with agile development methodologies",
        "Excellent analytical and problem-solving skills",
        "Strong communication and leadership abilities",
        "Experience with product analytics and user research",
        "MBA or relevant advanced degree preferred"
      ],
      responsibilities: [
        "Define and execute product strategy and roadmap",
        "Gather and prioritize product requirements from stakeholders",
        "Work closely with engineering and design teams",
        "Conduct market research and competitive analysis",
        "Manage product launches and go-to-market strategies",
        "Monitor product performance and user feedback"
      ],
      companyInfo: {
        name: "FinTech Solutions",
        size: "200-500 employees",
        industry: "Financial Technology",
        founded: "2016",
        description: "FinTech Solutions provides innovative financial technology products that help businesses manage their finances more effectively.",
        benefits: ["Health Insurance", "401(k) Matching", "Stock Options", "Flexible PTO", "Learning Budget"],
        culture: "Innovation-focused environment with emphasis on customer success and collaboration"
      },
      applicationDeadline: "2024-02-22",
      hiringManager: "David Park, VP of Product"
    }
  ]

  const handleJobClick = async (jobSummary: any) => {
    // setSelectedJob(jobSummary) // Old behavior
    if (!jobSummary || !jobSummary.id) {
      console.error("Job summary or ID is missing", jobSummary);
      setDetailedJobError("Cannot fetch details for this job.");
      setSelectedJob(null);
      return;
    }

    setDetailedJobLoading(true);
    setDetailedJobError(null);
    setSelectedJob(null); // Clear previous selection immediately

    try {
      const response = await fetch(`/api/jobs/${jobSummary.id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to fetch job details" }));
        throw new Error(errorData.message || "Failed to fetch job details");
      }
      const data = await response.json();
      setSelectedJob(data.data); // API returns details under data.data
    } catch (err: any) {
      setDetailedJobError(err.message);
      setSelectedJob(null);
    } finally {
      setDetailedJobLoading(false);
    }
  };

  const handleApplyClick = () => {
    setShowApplicationModal(true)
  }

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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          coverLetter: applicationData.coverLetter,
          // Not sending other fields as per subtask instructions
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Application submitted successfully!");
        setShowApplicationModal(false);
        setApplicationData({
          coverLetter: "",
          expectedSalary: "",
          availableStartDate: "",
          resume: null,
          portfolio: null
        });
      } else {
        toast.error(result.message || "Failed to submit application.");
      }
    } catch (error) {
      console.error("Application submission error:", error);
      toast.error("An unexpected error occurred while submitting your application.");
    } finally {
      setIsSubmittingApplication(false);
    }
  }

  return (
    <>
      <div className="w-[65%] mx-auto py-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-heading text-primary-navy mb-2">Career Opportunities</h1>
        <p className="text-slate-600 font-subheading text-xl">Discover your next career move with leading companies</p>
      </div>

      <div className="flex gap-6">
        {/* Enhanced Sidebar for Jobs */}
        <div className="w-64 flex-shrink-0">
          <div className="space-y-6">
            {/* Applied Jobs */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-heading text-primary-navy flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  My Applications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/jobs/freelance/applied-jobs">
                  <Button
                    variant="outline"
                    className="w-full justify-between border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white rounded-xl font-subheading"
                  >
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Applied Jobs
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-500 font-subheading">
                  <div className="text-center">
                    <p className="font-semibold text-primary-navy">{statusCounts.total}</p>
                    <p className="text-xs">Total Applied</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-blue-600">{statusCounts.interviews}</p>
                    <p className="text-xs">Interviews</p>
                  </div>
            </div>
              </CardContent>
            </Card>

            {/* Advanced Filters */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-heading text-primary-navy flex items-center justify-between">
                  <span className="flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Advanced Filters
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-[#0056B3] hover:text-primary-navy hover:bg-primary-navy/5 rounded-lg"
                  >
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
                      <div className="flex items-center space-x-2">
                        <Checkbox id="full-time" />
                        <label htmlFor="full-time" className="text-sm font-subheading text-slate-600">Full-time</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="part-time" />
                        <label htmlFor="part-time" className="text-sm font-subheading text-slate-600">Part-time</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="contract" />
                        <label htmlFor="contract" className="text-sm font-subheading text-slate-600">Contract</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="internship" />
                        <label htmlFor="internship" className="text-sm font-subheading text-slate-600">Internship</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="freelance" />
                        <label htmlFor="freelance" className="text-sm font-subheading text-slate-600">Freelance</label>
                      </div>
                    </div>
          </div>

                  <Separator />

                  {/* Experience Level */}
                      <div>
                    <h4 className="font-subheading font-medium text-primary-navy mb-3">Experience Level</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="entry-level" />
                        <label htmlFor="entry-level" className="text-sm font-subheading text-slate-600">Entry Level (0-2 years)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="mid-level" />
                        <label htmlFor="mid-level" className="text-sm font-subheading text-slate-600">Mid Level (3-5 years)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="senior-level" />
                        <label htmlFor="senior-level" className="text-sm font-subheading text-slate-600">Senior Level (6-10 years)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="executive" />
                        <label htmlFor="executive" className="text-sm font-subheading text-slate-600">Executive (10+ years)</label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Salary Range */}
                  <div>
                    <h4 className="font-subheading font-medium text-primary-navy mb-3">Salary Range</h4>
                    <div className="px-2">
                      <Slider
                        value={salaryRange}
                        onValueChange={setSalaryRange}
                        max={200000}
                        min={30000}
                        step={5000}
                        className="mb-3"
                      />
                      <div className="flex justify-between text-sm font-subheading text-slate-500">
                        <span>${salaryRange[0].toLocaleString()}</span>
                        <span>${salaryRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Work Mode */}
                  <div>
                    <h4 className="font-subheading font-medium text-primary-navy mb-3">Work Mode</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remote" />
                        <label htmlFor="remote" className="text-sm font-subheading text-slate-600">Remote</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="hybrid" />
                        <label htmlFor="hybrid" className="text-sm font-subheading text-slate-600">Hybrid</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="on-site" />
                        <label htmlFor="on-site" className="text-sm font-subheading text-slate-600">On-site</label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Company Size */}
                  <div>
                    <h4 className="font-subheading font-medium text-primary-navy mb-3">Company Size</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="startup" />
                        <label htmlFor="startup" className="text-sm font-subheading text-slate-600">Startup (1-50 employees)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="small" />
                        <label htmlFor="small" className="text-sm font-subheading text-slate-600">Small (51-200 employees)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="medium" />
                        <label htmlFor="medium" className="text-sm font-subheading text-slate-600">Medium (201-1000 employees)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="large" />
                        <label htmlFor="large" className="text-sm font-subheading text-slate-600">Large (1000+ employees)</label>
                      </div>
                </div>
              </div>

                  <Separator />

                  {/* Industry */}
                      <div>
                    <h4 className="font-subheading font-medium text-primary-navy mb-3">Industry</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="technology" />
                        <label htmlFor="technology" className="text-sm font-subheading text-slate-600">Technology</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="finance" />
                        <label htmlFor="finance" className="text-sm font-subheading text-slate-600">Finance & Banking</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="healthcare" />
                        <label htmlFor="healthcare" className="text-sm font-subheading text-slate-600">Healthcare</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="education" />
                        <label htmlFor="education" className="text-sm font-subheading text-slate-600">Education</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="marketing" />
                        <label htmlFor="marketing" className="text-sm font-subheading text-slate-600">Marketing & Advertising</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="retail" />
                        <label htmlFor="retail" className="text-sm font-subheading text-slate-600">Retail & E-commerce</label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Skills & Technologies */}
                  <div>
                    <h4 className="font-subheading font-medium text-primary-navy mb-3">Skills & Technologies</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="react" />
                        <label htmlFor="react" className="text-sm font-subheading text-slate-600">React</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="python" />
                        <label htmlFor="python" className="text-sm font-subheading text-slate-600">Python</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="javascript" />
                        <label htmlFor="javascript" className="text-sm font-subheading text-slate-600">JavaScript</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="aws" />
                        <label htmlFor="aws" className="text-sm font-subheading text-slate-600">AWS</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="figma" />
                        <label htmlFor="figma" className="text-sm font-subheading text-slate-600">Figma</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="sql" />
                        <label htmlFor="sql" className="text-sm font-subheading text-slate-600">SQL</label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Company Benefits */}
                  <div>
                    <h4 className="font-subheading font-medium text-primary-navy mb-3">Benefits</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="health-insurance" />
                        <label htmlFor="health-insurance" className="text-sm font-subheading text-slate-600">Health Insurance</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="401k" />
                        <label htmlFor="401k" className="text-sm font-subheading text-slate-600">401(k) Matching</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="equity" />
                        <label htmlFor="equity" className="text-sm font-subheading text-slate-600">Equity/Stock Options</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="pto" />
                        <label htmlFor="pto" className="text-sm font-subheading text-slate-600">Unlimited PTO</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="learning" />
                        <label htmlFor="learning" className="text-sm font-subheading text-slate-600">Learning & Development</label>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-primary-navy hover:bg-primary-navy/90 text-white rounded-lg font-subheading">
                    Apply Filters
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>
                </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-8">
          {/* Search and Filters */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search positions, companies, or keywords..."
                  className="pl-12 h-12 border-slate-200 focus:border-slate-300 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-subheading rounded-xl w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Basic Filter Examples - to be wired up or expanded later */}
              <div className="mt-4 flex gap-4">
                <Select onValueChange={(value) => {setJobTypeFilter(value); setCurrentPage(1);}}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Job Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => {setExperienceLevelFilter(value); setCurrentPage(1);}}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Experience Level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    <SelectItem value="entry-level">Entry Level</SelectItem>
                    <SelectItem value="mid-level">Mid Level</SelectItem>
                    <SelectItem value="senior-level">Senior Level</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                  </SelectContent>
                </Select>
                 <Input
                  placeholder="Location (e.g. city, country)"
                  className="h-10 border-slate-200 focus:border-slate-300 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-subheading rounded-xl w-[200px]"
                  value={locationFilter}
                  onChange={(e) => {setLocationFilter(e.target.value); setCurrentPage(1);}} // Basic, can be debounced too
                />
              </div>
            </CardContent>
          </Card>

          {/* Job Listings */}
          <div className="space-y-4">
            {isLoading && jobsData.length === 0 && (
              <>
                {[...Array(3)].map((_, i) => (
                  <Card key={`skeleton-${i}`} className="border-slate-200">
                    <CardContent className="p-6">
                      <div className="animate-pulse flex space-x-4">
                        <div className="rounded-lg bg-slate-200 h-16 w-16"></div>
                        <div className="flex-1 space-y-3 py-1">
                          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                          <div className="space-y-2">
                            <div className="h-3 bg-slate-200 rounded"></div>
                            <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                          </div>
                          <div className="h-8 bg-slate-200 rounded w-1/4 mt-3"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {!isLoading && error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                  <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-red-700">Error Fetching Jobs</h3>
                  <p className="text-red-600">{error}</p>
                  <Button onClick={fetchJobs} className="mt-4">Try Again</Button>
                </CardContent>
              </Card>
            )}

            {!isLoading && !error && jobsData.length === 0 && (
              <Card className="border-slate-200">
                <CardContent className="p-6 text-center">
                  <Search className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-slate-700">No Jobs Found</h3>
                  <p className="text-slate-500">Try adjusting your search terms or filters.</p>
                </CardContent>
              </Card>
            )}

            {!error && jobsData.map((job) => {
              // Determine remote badge color based on API's location_type
              const getLocationTypeColor = (locationType: string | null) => {
                switch (locationType?.toLowerCase()) {
                  case "remote":
                    return "bg-green-100 text-green-700";
                  case "hybrid":
                    return "bg-blue-100 text-blue-700";
                  case "on-site":
                  case "on_site": // handle potential API variations
                    return "bg-red-100 text-red-700";
                  default:
                    return "bg-slate-100 text-slate-700";
                }
              };
              const locationTypeLabel = job.location_type?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || "N/A";


              return (
                <Card
                  key={job.id} // API provides job.id
                  className="border-slate-200 hover:shadow-lg hover:border-primary-navy/30 transition-all duration-200 group cursor-pointer"
                  onClick={() => handleJobClick(job)} // handleJobClick will need to be adapted for API job structure
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                            <img src={job.company_logo_url || "/placeholder-logo.png"} alt={job.company_name || "Company"} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-heading text-primary-navy group-hover:text-primary-navy transition-colors line-clamp-1">{job.title}</h3>
                            <div className="flex items-center space-x-3 text-slate-600 mt-1 text-base">
                              <div className="flex items-center space-x-1">
                                <Building className="h-4 w-4" />
                                <span className="font-subheading truncate">{job.company_name || "N/A"}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span className="font-subheading truncate">{job.location_city && job.location_state ? `${job.location_city}, ${job.location_state}` : job.location_country || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {(job.skills || []).slice(0, 4).map((skill: string, index: number) => (
                            <span
                              key={index}
                              className={`px-3 py-1 rounded-full text-sm font-subheading bg-slate-100 text-slate-700`}
                            >
                              {skill}
                            </span>
                          ))}
                          {(job.skills || []).length > 4 && (
                            <span className="px-3 py-1 rounded-full text-sm font-subheading bg-slate-100 text-slate-700">
                              +{(job.skills || []).length - 4} more
                            </span>
                          )}
                        </div>

                        <p className="text-slate-600 font-subheading leading-relaxed mb-4 text-base line-clamp-3">
                          {job.description_short || job.description?.substring(0, 150) + "..." || "No description available."}
                        </p>

                        <div className="flex items-center justify-between text-base">
                          <div className="flex items-center space-x-4 text-slate-500">
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-subheading">{formatSalary(job)}</span>
                            </div>
                            <span className="font-subheading capitalize">{job.job_type?.replace("_", "-") || "N/A"}</span>
                             <span className={`px-3 py-1 rounded-full text-sm font-subheading ${getLocationTypeColor(job.location_type)}`}>
                              {locationTypeLabel}
                            </span>
                          </div>
                          <span className="text-sm text-slate-400 font-subheading">
                             {job.published_at ? formatDistanceToNow(new Date(job.published_at), { addSuffix: true }) : "N/A"}
                          </span>
                        </div>
                      </div>
                      <Button
                    variant="ghost"
                    size="icon"
                        className="text-slate-400 hover:text-primary-navy hover:bg-primary-navy/5 rounded-full flex-shrink-0"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    <BookmarkIcon className="h-4 w-4" />
                  </Button>
                </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          {/* Pagination Controls */}
          {!isLoading && !error && jobsData.length > 0 && totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
              >
                Previous
              </Button>
              <span className="text-sm font-subheading">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
                    </div>
                    </div>
                  </div>

    {/* Job Details Modal - Updated for API data and loading/error states */}
    {(selectedJob || detailedJobLoading || detailedJobError) && !showApplicationModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setSelectedJob(null); setDetailedJobError(null);}}
                  className="rounded-xl"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-heading text-primary-navy">Job Details</h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setSelectedJob(null); setDetailedJobError(null);}}
                className="rounded-xl"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Conditional Content: Loading, Error, or Job Details */}
            {detailedJobLoading && (
              <div className="text-center py-10">
                <Clock className="h-12 w-12 text-primary-navy mx-auto animate-spin mb-4" />
                <p className="text-lg font-semibold text-primary-navy">Loading job details...</p>
              </div>
            )}

            {!detailedJobLoading && detailedJobError && (
              <div className="text-center py-10">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-red-700">Error</p>
                <p className="text-red-600 mb-4">{detailedJobError}</p>
                <Button onClick={() => { setSelectedJob(null); setDetailedJobError(null); /* Optionally retry: handleJobClick(lastClickedJobSummary) */ }}>Close</Button>
              </div>
            )}

            {!detailedJobLoading && !detailedJobError && selectedJob && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="flex items-start space-x-6">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                    <img src={selectedJob.company?.logo_url || "/placeholder-logo.png"} alt={selectedJob.company?.name || "Company"} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-heading text-primary-navy">{selectedJob.title}</h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-subheading ${
                        selectedJob.location_type?.toLowerCase() === "remote" ? "bg-green-100 text-green-700" :
                        selectedJob.location_type?.toLowerCase() === "hybrid" ? "bg-blue-100 text-blue-700" :
                        selectedJob.location_type?.toLowerCase() === "on-site" || selectedJob.location_type?.toLowerCase() === "on_site" ? "bg-red-100 text-red-700" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {selectedJob.location_type?.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-6 text-slate-600 font-subheading mb-3">
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4" />
                        <span>{selectedJob.company?.name || "N/A"}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedJob.location || "N/A"}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-heading text-primary-navy">{formatSalary(selectedJob)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-slate-500 font-subheading">
                      <span className="capitalize">{selectedJob.job_type?.replace("_", "-") || "N/A"}</span>
                      <span>•</span>
                      <span>Posted {selectedJob.published_at ? formatDistanceToNow(new Date(selectedJob.published_at), { addSuffix: true }) : "N/A"}</span>
                      {selectedJob.application_deadline && (
                        <>
                          <span>•</span>
                          <span>Apply by {new Date(selectedJob.application_deadline).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Job Description */}
                <div>
                  <h3 className="text-lg font-heading text-primary-navy mb-3">Job Description</h3>
                  <div className="prose prose-sm max-w-none text-slate-600 font-subheading" dangerouslySetInnerHTML={{ __html: selectedJob.description || "<p>No description available.</p>" }} />
                </div>

                {/* Skills Required */}
                {selectedJob.skills && selectedJob.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-heading text-primary-navy mb-3">Skills Required</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.map((skill: string, index: number) => (
                        <Badge key={index} className="font-subheading bg-slate-100 text-slate-700">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-heading text-primary-navy mb-3">Requirements</h3>
                    <ul className="space-y-2">
                      {selectedJob.requirements.map((requirement: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-slate-600 font-subheading">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Responsibilities */}
                {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-heading text-primary-navy mb-3">Responsibilities</h3>
                    <ul className="space-y-2">
                      {selectedJob.responsibilities.map((responsibility: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-primary-navy mt-1 flex-shrink-0" />
                          <span className="text-slate-600 font-subheading">{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Benefits */}
                {selectedJob.benefits && (
                  <div>
                    <h3 className="text-lg font-heading text-primary-navy mb-3">Benefits</h3>
                    <p className="text-slate-600 font-subheading">{selectedJob.benefits}</p>
                  </div>
                )}


                {/* Company Information */}
                {selectedJob.company && (
                  <div>
                    <h3 className="text-lg font-heading text-primary-navy mb-3">About {selectedJob.company.name}</h3>
                    <Card className="border-slate-200">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-heading text-primary-navy">{selectedJob.company.name}</h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                              {selectedJob.company.size && <span>{selectedJob.company.size}</span>}
                              {selectedJob.company.industry && <><span>•</span><span>{selectedJob.company.industry}</span></>}
                            </div>
                          </div>
                          {selectedJob.company.description && <p className="text-slate-600 font-subheading">{selectedJob.company.description}</p>}
                          {selectedJob.company.website_url && (
                             <p className="text-sm">
                                <Link href={selectedJob.company.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  Visit website <Globe className="h-3 w-3 inline-block ml-1" />
                                </Link>
                              </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                <Button
                  className="flex-1 bg-primary-navy hover:bg-primary-navy/90 text-white rounded-xl font-subheading"
                  onClick={handleApplyClick}
                >
                  Apply for this Position
                </Button>
                <Button variant="outline" className="border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white rounded-xl font-subheading">
                  <BookmarkIcon className="h-4 w-4 mr-2" />
                  Save Job
                </Button>
              </div>
            </div>
                    </div>
                  </div>
                </div>
    )}

    {/* Application Modal */}
    <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-primary-navy">
            Apply for: {selectedJob?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Cover Letter */}
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

          {/* Expected Salary */}
          <div>
            <Label htmlFor="expectedSalary" className="font-subheading text-primary-navy">Expected Salary</Label>
            <Input
              id="expectedSalary"
              placeholder="e.g., $120,000 or Competitive"
              value={applicationData.expectedSalary}
              onChange={(e) => setApplicationData({...applicationData, expectedSalary: e.target.value})}
              className="mt-2 rounded-xl font-subheading"
            />
          </div>

          {/* Available Start Date */}
          <div>
            <Label htmlFor="availableStartDate" className="font-subheading text-primary-navy">Available Start Date</Label>
            <Input
              id="availableStartDate"
              placeholder="e.g., Immediately, 2 weeks notice, etc."
              value={applicationData.availableStartDate}
              onChange={(e) => setApplicationData({...applicationData, availableStartDate: e.target.value})}
              className="mt-2 rounded-xl font-subheading"
            />
          </div>

          {/* Resume Upload */}
          <div>
            <Label htmlFor="resume" className="font-subheading text-primary-navy">Resume/CV</Label>
            <div className="mt-2 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 font-subheading">
                Upload your resume or CV
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PDF, DOC, or DOCX files up to 5MB
              </p>
            </div>
              </div>

          {/* Portfolio/Additional Materials */}
          <div>
            <Label htmlFor="portfolio" className="font-subheading text-primary-navy">Portfolio/Additional Materials (Optional)</Label>
            <div className="mt-2 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 font-subheading">
                Upload portfolio, work samples, or additional documents
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PDF, DOC, images, or ZIP files up to 10MB
              </p>
            </div>
          </div>

          {/* Job Information Summary */}
          {selectedJob && (
            <Card className="border-slate-200 bg-slate-50">
              <CardContent className="p-4">
                <h4 className="font-heading text-primary-navy mb-2">Position Summary</h4>
                <div className="text-sm text-slate-600 font-subheading space-y-1">
                  <p><strong>Company:</strong> {selectedJob.company}</p>
                  <p><strong>Location:</strong> {selectedJob.location}</p>
                  <p><strong>Salary:</strong> {selectedJob.salary}</p>
                  <p><strong>Type:</strong> {selectedJob.type} • {selectedJob.remote}</p>
                  <p><strong>Application Deadline:</strong> {selectedJob.applicationDeadline}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button
              variant="outline"
              className="flex-1 border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white rounded-xl font-subheading"
              onClick={() => setShowApplicationModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary-navy hover:bg-primary-navy/90 text-white rounded-xl font-subheading"
              onClick={handleSubmitApplication}
              disabled={isSubmittingApplication}
            >
              {isSubmittingApplication ? (
                <>
                  <Send className="h-4 w-4 mr-2 animate-pulse" /> {/* Or a spinner */}
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
    </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
