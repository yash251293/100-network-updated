"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookmarkIcon, Filter, Search, Clock, CheckCircle, XCircle, Calendar, Briefcase } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
      return <Clock className="h-4 w-4 text-blue-600" />
    case "under_review":
      return <Clock className="h-4 w-4 text-orange-600" />
    case "interview_scheduled":
      return <Calendar className="h-4 w-4 text-green-600" />
    case "rejected":
      return <XCircle className="h-4 w-4 text-red-600" />
    case "accepted":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-600" />
  }
}

const getStatusBadge = (status: string, statusText: string) => {
  const variants = {
    applied: "bg-blue-100 text-blue-800",
    under_review: "bg-orange-100 text-orange-800",
    interview_scheduled: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    accepted: "bg-green-100 text-green-800",
  }

  return <Badge className={`${variants[status as keyof typeof variants]} border-0`}>{statusText}</Badge>
}

export default function JobsPage() {
  return (
    <div className="container max-w-5xl py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="applied">Applied Jobs ({appliedJobs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search jobs" className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entry level</SelectItem>
                <SelectItem value="mid">Mid level</SelectItem>
                <SelectItem value="senior">Senior level</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="space-y-4">
            <Link href="/jobs/1">
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <img src="/abstract-tech-logo.png" alt="TechVision" className="h-10 w-10" />
                      <div>
                        <h3 className="font-medium">Senior Frontend Developer</h3>
                        <p className="text-sm text-muted-foreground">TechVision • San Francisco, CA</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">React</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">TypeScript</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Redux</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">5+ years</span>
                    </div>
                    <p className="text-sm mb-2">
                      We're looking for a senior frontend developer to lead our web application development team and
                      architect scalable solutions.
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">$120K - $150K • Full-time • Remote</p>
                      <p className="text-xs text-muted-foreground">Posted 3 days ago</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // Handle bookmark logic
                    }}
                  >
                    <BookmarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>

            <Link href="/jobs/2">
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <img src="/flexbone-logo.png" alt="Flexbone" className="h-10 w-10" />
                      <div>
                        <h3 className="font-medium">Python AI Engineer</h3>
                        <p className="text-sm text-muted-foreground">Flexbone • Atlanta, GA</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Python</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">TensorFlow</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Machine Learning</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">3+ years</span>
                    </div>
                    <p className="text-sm mb-2">
                      Join our AI team to develop cutting-edge machine learning solutions for healthcare applications.
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">$90K - $110K • Contract • Hybrid</p>
                      <p className="text-xs text-muted-foreground">Posted 1 week ago</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // Handle bookmark logic
                    }}
                  >
                    <BookmarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>

            <Link href="/jobs/3">
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <img src="/generic-company-logo.png" alt="Source" className="h-10 w-10" />
                      <div>
                        <h3 className="font-medium">Full Stack Developer</h3>
                        <p className="text-sm text-muted-foreground">Source • Chicago, IL</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">JavaScript</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Node.js</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">React</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">MongoDB</span>
                    </div>
                    <p className="text-sm mb-2">
                      We need a talented full stack developer to build and maintain web applications for our clients in
                      the construction industry.
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">$85K - $105K • Full-time • On-site</p>
                      <p className="text-xs text-muted-foreground">Posted 2 weeks ago</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // Handle bookmark logic
                    }}
                  >
                    <BookmarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>

            <Link href="/jobs/4">
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <img src="/marketing-agency-logo.png" alt="GrowthBoost" className="h-10 w-10" />
                      <div>
                        <h3 className="font-medium">Digital Marketing Manager</h3>
                        <p className="text-sm text-muted-foreground">GrowthBoost • New York, NY</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">SEO</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">SEM</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Social Media</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Analytics</span>
                    </div>
                    <p className="text-sm mb-2">
                      Lead our digital marketing efforts across multiple channels to drive growth for our B2B clients.
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">$75K - $95K • Full-time • Hybrid</p>
                      <p className="text-xs text-muted-foreground">Posted 5 days ago</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // Handle bookmark logic
                    }}
                  >
                    <BookmarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>

            <Link href="/jobs/5">
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <img src="/finance-company-logo.png" alt="FinTech Solutions" className="h-10 w-10" />
                      <div>
                        <h3 className="font-medium">Product Manager - Fintech</h3>
                        <p className="text-sm text-muted-foreground">FinTech Solutions • Boston, MA</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Product Management</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Fintech</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Agile</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">5+ years</span>
                    </div>
                    <p className="text-sm mb-2">
                      Drive the product roadmap for our financial technology solutions, working closely with engineering
                      and design teams.
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">$110K - $140K • Full-time • Hybrid</p>
                      <p className="text-xs text-muted-foreground">Posted 1 week ago</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // Handle bookmark logic
                    }}
                  >
                    <BookmarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="applied" className="space-y-6">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search applied jobs" className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="applied">Application Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                <SelectItem value="rejected">Not Selected</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {appliedJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <img src={job.logo || "/placeholder.svg"} alt={job.company} className="h-10 w-10" />
                          <div>
                            <h3 className="font-medium">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {job.company} • {job.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(job.status)}
                          {getStatusBadge(job.status, job.statusText)}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {job.skills.map((skill, index) => (
                          <span key={index} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <p className="text-sm mb-3">{job.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <p className="text-xs text-muted-foreground">
                            {job.salary} • {job.type} • {job.remote}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">Applied {job.appliedDate}</p>
                      </div>

                      {job.status === "interview_scheduled" && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              Interview scheduled for tomorrow at 2:00 PM
                            </span>
                          </div>
                          <p className="text-xs text-green-700 mt-1">Check your email for meeting details</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {appliedJobs.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No applications yet</h3>
              <p className="text-muted-foreground mb-4">Start applying to jobs to track your applications here</p>
              <Button asChild>
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
