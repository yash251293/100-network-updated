"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { BookmarkIcon, ArrowLeft, X, Send, MessageCircle, Building2, MapPin, Calendar, DollarSign, Clock, Users, Star, Award, CheckCircle, Target, Upload } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Job, FreelanceProject, Company } from "@/lib/types"

export default function ExplorePage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [selectedProject, setSelectedProject] = useState<FreelanceProject | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [showProjectApplicationModal, setShowProjectApplicationModal] = useState(false)
  const [showJobsModal, setShowJobsModal] = useState(false)
  const [followedCompanies, setFollowedCompanies] = useState<string[]>([]) // Assuming company IDs are strings
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    expectedSalary: "",
    startDate: "",
    resume: null as File | null, // For file inputs
    portfolio: null as File | null,
  })
  const [projectApplicationData, setProjectApplicationData] = useState({
    proposal: "",
    estimatedBudget: "",
    timeline: "",
    portfolio: null as File | null,
    experience: ""
  })

  const [jobs, setJobs] = useState<Job[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [jobsError, setJobsError] = useState<string | null>(null)

  const [freelanceProjects, setFreelanceProjects] = useState<FreelanceProject[]>([])
  const [freelanceProjectsLoading, setFreelanceProjectsLoading] = useState(true)
  const [freelanceProjectsError, setFreelanceProjectsError] = useState<string | null>(null)

  const [companies, setCompanies] = useState<Company[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(true)
  const [companiesError, setCompaniesError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setJobsLoading(true);
        const res = await fetch('/api/jobs');
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data: Job[] = await res.json();
        setJobs(data);
        setJobsError(null);
      } catch (error) {
        setJobsError(error instanceof Error ? error.message : 'Unknown error fetching jobs');
      } finally {
        setJobsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchFreelanceProjects = async () => {
      try {
        setFreelanceProjectsLoading(true);
        const res = await fetch('/api/freelance-projects');
        if (!res.ok) throw new Error('Failed to fetch freelance projects');
        const data: FreelanceProject[] = await res.json();
        setFreelanceProjects(data);
        setFreelanceProjectsError(null);
      } catch (error) {
        setFreelanceProjectsError(error instanceof Error ? error.message : 'Unknown error fetching freelance projects');
      } finally {
        setFreelanceProjectsLoading(false);
      }
    };
    fetchFreelanceProjects();
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setCompaniesLoading(true);
        const res = await fetch('/api/companies');
        if (!res.ok) throw new Error('Failed to fetch companies');
        const data: Company[] = await res.json();
        setCompanies(data);
        setCompaniesError(null);
      } catch (error) {
        setCompaniesError(error instanceof Error ? error.message : 'Unknown error fetching companies');
      } finally {
        setCompaniesLoading(false);
      }
    };
    fetchCompanies();
  }, []);


  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
  }

  const handleProjectClick = (project: FreelanceProject) => {
    setSelectedProject(project)
  }

  const handleApplyClick = () => {
    setShowApplicationModal(true)
  }

  const handleProjectApplyClick = () => {
    setShowProjectApplicationModal(true)
  }

  const handleSubmitApplication = () => {
    // Actual submission logic would go here
    console.log("Job application submitted:", { job: selectedJob?.title, ...applicationData })
    setShowApplicationModal(false)
    setApplicationData({ coverLetter: "", expectedSalary: "", startDate: "", resume: null, portfolio: null })
  }

  const handleSubmitProjectApplication = () => {
    // Actual submission logic would go here
    console.log("Project application submitted:", { project: selectedProject?.title, ...projectApplicationData })
    setShowProjectApplicationModal(false)
    setProjectApplicationData({ proposal: "", estimatedBudget: "", timeline: "", portfolio: null, experience: "" })
  }

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company)
  }

  const handleViewJobsClick = () => {
    setShowJobsModal(true)
  }

  const handleFollowClick = (companyId: string) => {
    setFollowedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    )
  }

  const isFollowed = (companyId: string) => {
    return followedCompanies.includes(companyId);
  }

  return (
    <>
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
            {jobsLoading && <p>Loading jobs...</p>}
            {jobsError && <p className="text-red-500">{jobsError}</p>}
            {!jobsLoading && !jobsError && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map((job) => (
                  <Card
                    key={job.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
                    onClick={() => handleJobClick(job)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-start space-x-3">
                          <img src={job.companyLogo || '/placeholder.svg'} alt={job.companyName} className="h-12 w-12 rounded" />
                          <div>
                            <p className="font-subheading font-medium text-base">{job.companyName}</p>
                            <p className="text-sm text-muted-foreground">{job.industry}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 hover:bg-primary-navy/10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Handle bookmark logic
                          }}
                        >
                          <BookmarkIcon className="h-5 w-5" />
                        </Button>
                      </div>
                      <h3 className="font-heading text-primary-navy mb-2 text-lg">{job.title}</h3>
                      <p className="text-base text-muted-foreground mb-3 font-subheading">{job.type} • {job.location}</p>
                      <p className="text-sm text-muted-foreground mb-4">{job.salaryRange} • Posted {new Date(job.postedDate).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading text-primary-navy">
                Freelance projects in <span className="text-[#0056B3]">web development</span>
              </h2>
              <Link href="/jobs/freelance" className="text-base text-[#0056B3] hover:underline font-subheading">
                View more
              </Link>
            </div>
            {freelanceProjectsLoading && <p>Loading freelance projects...</p>}
            {freelanceProjectsError && <p className="text-red-500">{freelanceProjectsError}</p>}
            {!freelanceProjectsLoading && !freelanceProjectsError && (
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
                          <img src={project.clientLogo || '/placeholder.svg'} alt={project.clientName} className="h-12 w-12 rounded" />
                          <div>
                            <p className="font-subheading font-medium text-base">{project.clientName}</p>
                            <p className="text-sm text-muted-foreground">{project.industry}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 hover:bg-primary-navy/10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Handle bookmark logic
                          }}
                        >
                          <BookmarkIcon className="h-5 w-5" />
                        </Button>
                      </div>
                      <h3 className="font-heading text-primary-navy mb-2 text-lg">{project.title}</h3>
                      <p className="text-base text-muted-foreground mb-3 font-subheading">{project.budget} • {project.duration}</p>
                      <p className="text-sm text-muted-foreground mb-4">Posted {new Date(project.postedDate).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
            {companiesLoading && <p>Loading companies...</p>}
            {companiesError && <p className="text-red-500">{companiesError}</p>}
            {!companiesLoading && !companiesError && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map((company) => (
                  <Card
                    key={company.id}
                    className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleCompanyClick(company)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-start space-x-4">
                          <img src={company.logo || '/placeholder.svg'} alt={company.name} className="h-16 w-16 rounded" />
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <p className="font-subheading font-medium text-base">{company.name}</p>
                              {company.verified && (
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{company.industry}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 hover:bg-primary-navy/10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Handle bookmark logic
                          }}
                        >
                          <BookmarkIcon className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{company.location}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{company.size}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span>{company.jobOpeningsCount ?? 0} open position{company.jobOpeningsCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
    </div>

    {/* Job Details Modal */}
    {selectedJob && !showApplicationModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedJob(null)}
                  className="border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white rounded-xl font-subheading"
                >
                  <X className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-heading text-primary-navy">Job Details</h1>
              </div>
            </div>

            {/* Job Content */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-start space-x-4">
                <img src={selectedJob.companyLogo || '/placeholder.svg'} alt={selectedJob.companyName} className="h-16 w-16 rounded-xl" />
                <div className="flex-1">
                  <h2 className="text-2xl font-heading text-primary-navy mb-1">{selectedJob.title}</h2>
                  <p className="text-lg text-slate-600 font-subheading mb-2">{selectedJob.companyName}</p>
                  <div className="grid grid-cols-2 gap-4 text-slate-600 font-subheading mb-4">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      <span>{selectedJob.industry}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      <span>{selectedJob.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                      <span>{selectedJob.salaryRange}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span>{selectedJob.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>Posted {new Date(selectedJob.postedDate).toLocaleDateString()}</span>
                    </div>
                    {selectedJob.experienceLevel && (
                       <div className="flex items-center space-x-2">
                         <Award className="h-4 w-4 text-slate-500" />
                         <span>{selectedJob.experienceLevel}</span>
                       </div>
                    )}
                    {selectedJob.applicantsCount !== undefined && (
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span>{selectedJob.applicantsCount} applicants</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="text-lg font-heading text-primary-navy mb-3">Job Description</h3>
                <p className="text-slate-600 font-subheading leading-relaxed">{selectedJob.description}</p>
              </div>

              {/* Requirements */}
              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div>
                  <h3 className="text-lg font-heading text-primary-navy mb-3">Requirements</h3>
                  <div className="space-y-2">
                    {selectedJob.requirements.map((req: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-slate-600 font-subheading">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsibilities */}
              {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                <div>
                  <h3 className="text-lg font-heading text-primary-navy mb-3">Responsibilities</h3>
                  <div className="space-y-2">
                    {selectedJob.responsibilities.map((resp: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-[#0056B3] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-slate-600 font-subheading">{resp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nice to Have */}
              {selectedJob.niceToHave && selectedJob.niceToHave.length > 0 && (
                <div>
                  <h3 className="text-lg font-heading text-primary-navy mb-3">Nice to Have</h3>
                  <div className="space-y-2">
                    {selectedJob.niceToHave.map((item: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Star className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-slate-600 font-subheading">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {/* Company Info Simplified */}
              <div>
                <h3 className="text-lg font-heading text-primary-navy mb-3">About {selectedJob.companyName}</h3>
                <p className="text-slate-600 font-subheading leading-relaxed mb-3">
                  Further details about {selectedJob.companyName} can be found on their company profile page.
                  {/* Placeholder for link to company page: <Link href={`/companies/${selectedJob.companyId}`}>View Company Profile</Link> */}
                </p>
              </div>

              {/* Benefits */}
              {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                <div>
                  <h3 className="text-lg font-heading text-primary-navy mb-3">Benefits</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.benefits.map((benefit: string, index: number) => (
                      <Badge key={index} className="bg-green-100 text-green-700 font-subheading">
                        <Award className="h-3 w-3 mr-1" />
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {selectedJob.skills && selectedJob.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-heading text-primary-navy mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="font-subheading">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply Button */}
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
          </div>
        </div>
      </div>
    )}

    {/* Freelance Project Details Modal */}
    {selectedProject && !showProjectApplicationModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
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

            {/* Project Content */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-start space-x-4">
                <img src={selectedProject.clientLogo || '/placeholder.svg'} alt={selectedProject.clientName} className="h-16 w-16 rounded-xl" />
                <div className="flex-1">
                  <h2 className="text-2xl font-heading text-primary-navy mb-1">{selectedProject.title}</h2>
                  <p className="text-lg text-slate-600 font-subheading mb-2">{selectedProject.clientName}</p>
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
                      <span>Posted {new Date(selectedProject.postedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="text-lg font-heading text-primary-navy mb-3">Project Description</h3>
                <p className="text-slate-600 font-subheading leading-relaxed">{selectedProject.description}</p>
              </div>

              {/* Requirements */}
              {selectedProject.requirements && selectedProject.requirements.length > 0 && (
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
              )}

              {/* Deliverables */}
              {selectedProject.deliverables && selectedProject.deliverables.length > 0 && (
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
              )}

              {/* Required Skills */}
              {selectedProject.skills && selectedProject.skills.length > 0 && (
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
              )}

              {/* Client Info Simplified */}
              <div>
                <h3 className="text-lg font-heading text-primary-navy mb-3">About {selectedProject.clientName}</h3>
                <p className="text-slate-600 font-subheading leading-relaxed mb-3">
                  Information about the client.
                </p>
              </div>

              {/* Apply Button */}
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
          {/* Job Info */}
          {selectedJob && (
            <Card className="border-slate-200 bg-slate-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <img src={selectedJob.companyLogo || '/placeholder.svg'} alt={selectedJob.companyName} className="h-12 w-12 rounded" />
                  <div>
                    <h4 className="font-heading text-primary-navy">{selectedJob.title}</h4>
                    <p className="text-slate-600 font-subheading text-sm">{selectedJob.companyName} • {selectedJob.location}</p>
                  </div>
                </div>
            </CardContent>
          </Card>
          )}

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
            <Label htmlFor="salary" className="font-subheading text-primary-navy">Expected Salary</Label>
            <Input
              id="salary"
              placeholder="e.g., $120,000"
              value={applicationData.expectedSalary}
              onChange={(e) => setApplicationData({...applicationData, expectedSalary: e.target.value})}
              className="mt-2 rounded-xl font-subheading"
            />
          </div>

          {/* Start Date */}
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

          {/* Resume Upload */}
          <div>
            <Label className="font-subheading text-primary-navy">Resume</Label>
            <div className="mt-2 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 font-subheading">Click to upload your resume</p>
              <p className="text-slate-400 font-subheading text-sm">PDF, DOC, or DOCX (max 5MB)</p>
              {/* Basic file input, can be improved with actual upload handling */}
              <Input type="file" className="sr-only" onChange={(e) => setApplicationData({...applicationData, resume: e.target.files ? e.target.files[0] : null})} />
            </div>
          </div>

          {/* Action Buttons */}
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
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Application
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Project Application Modal */}
    <Dialog open={showProjectApplicationModal} onOpenChange={setShowProjectApplicationModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-primary-navy">
            Submit Proposal for {selectedProject?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Project Info */}
          {selectedProject && (
            <Card className="border-slate-200 bg-slate-50">
            <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <img src={selectedProject.clientLogo || '/placeholder.svg'} alt={selectedProject.clientName} className="h-12 w-12 rounded" />
                  <div>
                    <h4 className="font-heading text-primary-navy">{selectedProject.title}</h4>
                    <p className="text-slate-600 font-subheading text-sm">{selectedProject.clientName} • {selectedProject.budget}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Proposal */}
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

          {/* Budget */}
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

          {/* Timeline */}
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

          {/* Portfolio Upload */}
          <div>
            <Label className="font-subheading text-primary-navy">Portfolio/Previous Work</Label>
            <div className="mt-2 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 font-subheading">Upload portfolio or work samples</p>
              <p className="text-slate-400 font-subheading text-sm">PDF, Images, or ZIP (max 10MB)</p>
              <Input type="file" className="sr-only" onChange={(e) => setProjectApplicationData({...projectApplicationData, portfolio: e.target.files ? e.target.files[0] : null})} />
            </div>
          </div>

          {/* Action Buttons */}
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
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedCompany(null)}
                  className="rounded-xl"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-heading text-primary-navy">Company Profile</h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedCompany(null)}
                className="rounded-xl"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Company Content */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-start space-x-4">
                <img src={selectedCompany.logo || '/placeholder.svg'} alt={selectedCompany.name} className="h-20 w-20 rounded-xl" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h2 className="text-2xl font-heading text-primary-navy">{selectedCompany.name}</h2>
                    {selectedCompany.verified && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                    {selectedCompany.companyType && (
                      <Badge
                        className={`${
                          selectedCompany.companyType === 'Startup' ? 'bg-green-100 text-green-700' :
                          selectedCompany.companyType === 'Agency' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        } font-subheading`}
                      >
                        {selectedCompany.companyType}
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-slate-600 font-subheading mb-3">{selectedCompany.industry}</p>
                  <div className="grid grid-cols-2 gap-4 text-slate-600 font-subheading">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      <span>{selectedCompany.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span>{selectedCompany.size}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>Founded {selectedCompany.founded}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      <span>{selectedCompany.jobOpeningsCount ?? 0} open positions</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* About */}
              <div>
                <h3 className="text-lg font-heading text-primary-navy mb-3">About {selectedCompany.name}</h3>
                <p className="text-slate-600 font-subheading leading-relaxed">{selectedCompany.description}</p>
              </div>

              {/* Mission & Vision */}
              {selectedCompany.mission && selectedCompany.vision && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-heading text-primary-navy mb-2">Mission</h4>
                    <p className="text-slate-600 font-subheading">{selectedCompany.mission}</p>
                  </div>
                  <div>
                    <h4 className="font-heading text-primary-navy mb-2">Vision</h4>
                    <p className="text-slate-600 font-subheading">{selectedCompany.vision}</p>
                  </div>
                </div>
              )}

              {/* Values */}
              {selectedCompany.values && selectedCompany.values.length > 0 && (
                <div>
                  <h3 className="text-lg font-heading text-primary-navy mb-3">Our Values</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.values.map((value: string, index: number) => (
                      <Badge key={index} className="bg-blue-100 text-blue-700 font-subheading">
                        <Star className="h-3 w-3 mr-1" />
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {selectedCompany.benefits && selectedCompany.benefits.length > 0 && (
                <div>
                  <h3 className="text-lg font-heading text-primary-navy mb-3">Benefits & Perks</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.benefits.map((benefit: string, index: number) => (
                      <Badge key={index} className="bg-green-100 text-green-700 font-subheading">
                        <Award className="h-3 w-3 mr-1" />
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Culture */}
              {selectedCompany.culture && (
                <div>
                  <h3 className="text-lg font-heading text-primary-navy mb-3">Company Culture</h3>
                  <p className="text-slate-600 font-subheading leading-relaxed">{selectedCompany.culture}</p>
                </div>
              )}

              {/* Contact Info */}
              {(selectedCompany.website || selectedCompany.contactEmail || selectedCompany.contactPhone) && (
              <div>
                <h3 className="text-lg font-heading text-primary-navy mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {selectedCompany.website && (
                    <div>
                      <span className="text-slate-500">Website:</span>
                      <Link href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline font-subheading">
                        {selectedCompany.website}
                      </Link>
                    </div>
                  )}
                  {selectedCompany.contactEmail && (
                    <div>
                      <span className="text-slate-500">Email:</span>
                      <a href={`mailto:${selectedCompany.contactEmail}`} className="ml-2 text-blue-600 hover:underline font-subheading">
                        {selectedCompany.contactEmail}
                      </a>
                    </div>
                  )}
                  {selectedCompany.contactPhone && (
                    <div>
                      <span className="text-slate-500">Phone:</span>
                      <span className="ml-2 text-slate-700 font-subheading">{selectedCompany.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button
                  className="flex-1 bg-primary-navy hover:bg-slate-800 text-white rounded-xl font-subheading"
                  onClick={handleViewJobsClick}
                  disabled={(selectedCompany.jobOpeningsCount ?? 0) === 0}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  View Open Positions ({selectedCompany.jobOpeningsCount ?? 0})
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
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Jobs Modal for a specific company */}
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
                  <img src={selectedCompany.logo || '/placeholder.svg'} alt={selectedCompany.name} className="h-12 w-12 rounded" />
                  <div>
                    <h4 className="font-heading text-primary-navy">{selectedCompany.name}</h4>
                    <p className="text-slate-600 font-subheading text-sm">{selectedCompany.industry} • {selectedCompany.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <p className="text-center text-slate-600 font-subheading">
            Job listings for individual companies are not available in this view.
            Please check the main jobs page or the company's career page for more details.
          </p>

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
    </>
  )
}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="text-lg font-heading text-primary-navy mb-3">Job Description</h3>
                <p className="text-slate-600 font-subheading leading-relaxed">{selectedJob.description}</p>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-lg font-heading text-primary-navy mb-3">Requirements</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Freelance Project Details Modal */}
    {selectedProject && !showProjectApplicationModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
                    </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="text-lg font-heading text-primary-navy mb-3">Project Description</h3>
                <p className="text-slate-600 font-subheading leading-relaxed">{selectedProject.description}</p>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-lg font-heading text-primary-navy mb-3">Requirements</h3>
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
          {/* Job Info */}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Project Application Modal */}
    <Dialog open={showProjectApplicationModal} onOpenChange={setShowProjectApplicationModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-primary-navy">
            Submit Proposal for {selectedProject?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Project Info */}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Company Details Modal */}
    {selectedCompany && !showJobsModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
