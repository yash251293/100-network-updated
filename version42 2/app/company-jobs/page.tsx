"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { 
  Users, 
  Eye, 
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Briefcase,
  Plus,
  Search,
  Filter,
  Edit,
  MoreHorizontal,
  XCircle,
  Target,
  ChevronRight,
  FileText,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Clock,
  Building2,
  Settings
} from "lucide-react"

export default function CompanyJobs() {
  const [showNewJobForm, setShowNewJobForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [salaryRange, setSalaryRange] = useState([50000, 200000])
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    location: "",
    type: "",
    salary: "",
    experience: "",
    department: ""
  })

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creating job:", jobData)
    setShowNewJobForm(false)
    setJobData({
      title: "",
      description: "",
      location: "",
      type: "",
      salary: "",
      experience: "",
      department: ""
    })
  }

  const jobMetrics = [
    {
      title: "Total Job Posts",
      value: "12",
      change: "+3",
      isPositive: true,
      icon: Briefcase,
      period: "vs last month"
    },
    {
      title: "Total Applications", 
      value: "342",
      change: "+18.2%",
      isPositive: true,
      icon: Users,
      period: "vs last month"
    },
    {
      title: "Average Views per Job",
      value: "1,247", 
      change: "+12.5%",
      isPositive: true,
      icon: Eye,
      period: "vs last month"
    },
    {
      title: "Application Rate",
      value: "4.8%",
      change: "+0.3%",
      isPositive: true,
      icon: Target,
      period: "vs last month"
    }
  ]

  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$120K - $150K",
      status: "Active",
      applicants: 45,
      views: 892,
      posted: "5 days ago",
      applications: [
        { name: "Sarah Johnson", match: 95, status: "new" },
        { name: "Michael Chen", match: 88, status: "reviewing" },
        { name: "David Kim", match: 97, status: "shortlisted" }
      ]
    },
    {
      id: 2,
      title: "Product Manager",
      department: "Product",
      location: "Remote",
      type: "Full-time", 
      salary: "$130K - $160K",
      status: "Active",
      applicants: 28,
      views: 654,
      posted: "1 week ago",
      applications: [
        { name: "Emily Rodriguez", match: 92, status: "interviewed" },
        { name: "Lisa Wang", match: 85, status: "reviewing" }
      ]
    },
    {
      id: 3,
      title: "UX Designer",
      department: "Design",
      location: "New York, NY",
      type: "Full-time",
      salary: "$90K - $120K",
      status: "Draft",
      applicants: 0,
      views: 0,
      posted: "Draft",
      applications: []
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-50 text-green-600 border-green-200"
      case "Draft":
        return "bg-yellow-50 text-yellow-600 border-yellow-200"
      case "Closed":
        return "bg-red-50 text-red-600 border-red-200"
      default:
        return "bg-slate-50 text-slate-600 border-slate-200"
    }
  }

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-50 text-blue-600 border-blue-200"
      case "reviewing":
        return "bg-yellow-50 text-yellow-600 border-yellow-200"
      case "shortlisted":
        return "bg-green-50 text-green-600 border-green-200"
      case "interviewed":
        return "bg-purple-50 text-purple-600 border-purple-200"
      default:
        return "bg-slate-50 text-slate-600 border-slate-200"
    }
  }

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-[65%] mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-navy mb-2">Job Management</h1>
            <p className="text-lg font-semibold text-slate-600">
              Manage your job postings, track applications, and analyze performance.
            </p>
          </div>
          <Button 
            onClick={() => setShowNewJobForm(true)}
            className="bg-primary-navy hover:bg-primary-navy/90 text-white rounded-lg font-bold text-sm px-4 py-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* Job Analytics Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {jobMetrics.map((metric, index) => (
          <Card key={index} className="p-6 border border-slate-200 rounded-lg hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${metric.isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
                  <metric.icon className={`h-5 w-5 ${metric.isPositive ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div className={`flex items-center text-sm font-bold ${metric.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {metric.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{metric.value}</h3>
              <p className="text-sm font-semibold text-slate-600">{metric.title}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">{metric.period}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="space-y-6">
            {/* Job Management */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-primary-navy flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Job Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-between border-slate-200 hover:border-primary-navy hover:text-primary-navy rounded-lg font-semibold text-sm"
                >
                  <span className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Active Jobs
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between border-slate-200 hover:border-primary-navy hover:text-primary-navy rounded-lg font-semibold text-sm"
                >
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Draft Jobs
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between border-slate-200 hover:border-primary-navy hover:text-primary-navy rounded-lg font-semibold text-sm"
                >
                  <span className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Closed Jobs
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="text-sm text-slate-500 font-semibold text-center py-2">
                  <p>12 total job posts</p>
                  <p>342 applications</p>
                </div>
              </CardContent>
            </Card>



            {/* Advanced Filters */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-primary-navy flex items-center justify-between">
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
                  {/* Job Status */}
                  <div>
                    <h4 className="font-semibold text-primary-navy mb-3 text-sm">Job Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="active-jobs" />
                        <label htmlFor="active-jobs" className="text-sm font-semibold text-slate-600">Active</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="draft-jobs" />
                        <label htmlFor="draft-jobs" className="text-sm font-semibold text-slate-600">Draft</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="closed-jobs" />
                        <label htmlFor="closed-jobs" className="text-sm font-semibold text-slate-600">Closed</label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Department */}
                  <div>
                    <h4 className="font-semibold text-primary-navy mb-3 text-sm">Department</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="engineering" />
                        <label htmlFor="engineering" className="text-sm font-semibold text-slate-600">Engineering</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="product" />
                        <label htmlFor="product" className="text-sm font-semibold text-slate-600">Product</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="design" />
                        <label htmlFor="design" className="text-sm font-semibold text-slate-600">Design</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="marketing" />
                        <label htmlFor="marketing" className="text-sm font-semibold text-slate-600">Marketing</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="sales" />
                        <label htmlFor="sales" className="text-sm font-semibold text-slate-600">Sales</label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Job Type */}
                  <div>
                    <h4 className="font-semibold text-primary-navy mb-3 text-sm">Job Type</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="full-time" />
                        <label htmlFor="full-time" className="text-sm font-semibold text-slate-600">Full-time</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="part-time" />
                        <label htmlFor="part-time" className="text-sm font-semibold text-slate-600">Part-time</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="contract" />
                        <label htmlFor="contract" className="text-sm font-semibold text-slate-600">Contract</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remote" />
                        <label htmlFor="remote" className="text-sm font-semibold text-slate-600">Remote</label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Salary Range */}
                  <div>
                    <h4 className="font-semibold text-primary-navy mb-3 text-sm">Salary Range</h4>
                    <div className="px-2">
                      <Slider
                        value={salaryRange}
                        onValueChange={setSalaryRange}
                        max={200000}
                        min={50000}
                        step={5000}
                        className="mb-3"
                      />
                      <div className="flex justify-between text-sm font-semibold text-slate-500">
                        <span>${salaryRange[0].toLocaleString()}</span>
                        <span>${salaryRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Experience Level */}
                  <div>
                    <h4 className="font-semibold text-primary-navy mb-3 text-sm">Experience Level</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="entry-level" />
                        <label htmlFor="entry-level" className="text-sm font-semibold text-slate-600">Entry Level</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="mid-level" />
                        <label htmlFor="mid-level" className="text-sm font-semibold text-slate-600">Mid Level</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="senior-level" />
                        <label htmlFor="senior-level" className="text-sm font-semibold text-slate-600">Senior Level</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="lead-principal" />
                        <label htmlFor="lead-principal" className="text-sm font-semibold text-slate-600">Lead/Principal</label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Application Count */}
                  <div>
                    <h4 className="font-semibold text-primary-navy mb-3 text-sm">Application Count</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="high-volume" />
                        <label htmlFor="high-volume" className="text-sm font-semibold text-slate-600">50+ applications</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="medium-volume" />
                        <label htmlFor="medium-volume" className="text-sm font-semibold text-slate-600">10-49 applications</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="low-volume" />
                        <label htmlFor="low-volume" className="text-sm font-semibold text-slate-600">1-9 applications</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="no-applications" />
                        <label htmlFor="no-applications" className="text-sm font-semibold text-slate-600">No applications</label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Settings */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-primary-navy flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-between border-slate-200 hover:border-primary-navy hover:text-primary-navy rounded-lg font-semibold text-sm"
                >
                  <span className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Company Profile
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between border-slate-200 hover:border-primary-navy hover:text-primary-navy rounded-lg font-semibold text-sm"
                >
                  <span className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Job Preferences
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Filter */}
          <Card className="mb-8 border border-slate-200 rounded-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search jobs by title or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-lg font-semibold text-sm"
                  />
                </div>
                <Button variant="outline" className="font-semibold text-sm px-4 py-2">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Jobs List */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="border border-slate-200 rounded-lg hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-primary-navy">{job.title}</h3>
                        <Badge className={`${getStatusColor(job.status)} text-xs font-bold px-2 py-1`}>
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm font-semibold text-slate-600 mb-3">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </span>
                        <span>•</span>
                        <span>{job.department}</span>
                        <span>•</span>
                        <span>{job.type}</span>
                        <span>•</span>
                        <span className="font-bold text-primary-navy">{job.salary}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-500">Posted {job.posted}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="font-semibold">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="font-semibold">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Job Stats */}
                  <div className="grid grid-cols-3 gap-6 mb-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-slate-500 mr-1" />
                        <span className="text-lg font-bold text-slate-900">{job.applicants}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-600">Applicants</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Eye className="h-4 w-4 text-slate-500 mr-1" />
                        <span className="text-lg font-bold text-slate-900">{job.views}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-600">Views</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Target className="h-4 w-4 text-slate-500 mr-1" />
                        <span className="text-lg font-bold text-slate-900">{job.views > 0 ? ((job.applicants / job.views) * 100).toFixed(1) : '0'}%</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-600">Conversion</p>
                    </div>
                  </div>

                  {/* Recent Applications */}
                  {job.applications.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-3">Recent Applications</h4>
                      <div className="space-y-2">
                        {job.applications.slice(0, 3).map((application, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                            <span className="text-sm font-semibold text-slate-900">{application.name}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-900">{application.match}% match</span>
                              <Badge className={`${getApplicationStatusColor(application.status)} text-xs font-bold px-2 py-1`}>
                                {application.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* New Job Modal */}
      {showNewJobForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-primary-navy">Post New Job</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNewJobForm(false)}
                  className="rounded-xl"
                >
                  <XCircle className="h-6 w-6" />
                </Button>
              </div>
            </div>
            
            <form onSubmit={handleCreateJob} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="job-title" className="font-bold text-primary-navy text-base">Job Title *</Label>
                  <Input
                    id="job-title"
                    placeholder="e.g. Software Engineer, Product Designer, etc."
                    value={jobData.title}
                    onChange={(e) => setJobData({...jobData, title: e.target.value})}
                    className="rounded-xl font-semibold text-base py-3"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="font-bold text-primary-navy text-base">Department</Label>
                  <Select value={jobData.department} onValueChange={(value) => setJobData({...jobData, department: value})}>
                    <SelectTrigger className="rounded-xl font-semibold text-base py-3">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="engineering" className="font-semibold">Engineering</SelectItem>
                      <SelectItem value="product" className="font-semibold">Product</SelectItem>
                      <SelectItem value="design" className="font-semibold">Design</SelectItem>
                      <SelectItem value="marketing" className="font-semibold">Marketing</SelectItem>
                      <SelectItem value="sales" className="font-semibold">Sales</SelectItem>
                      <SelectItem value="operations" className="font-semibold">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="font-bold text-primary-navy text-base">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g. San Francisco, CA or Remote"
                    value={jobData.location}
                    onChange={(e) => setJobData({...jobData, location: e.target.value})}
                    className="rounded-xl font-semibold text-base py-3"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-type" className="font-bold text-primary-navy text-base">Job Type *</Label>
                  <Select value={jobData.type} onValueChange={(value) => setJobData({...jobData, type: value})}>
                    <SelectTrigger className="rounded-xl font-semibold text-base py-3">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="full-time" className="font-semibold">Full-time</SelectItem>
                      <SelectItem value="part-time" className="font-semibold">Part-time</SelectItem>
                      <SelectItem value="contract" className="font-semibold">Contract</SelectItem>
                      <SelectItem value="freelance" className="font-semibold">Freelance</SelectItem>
                      <SelectItem value="internship" className="font-semibold">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary" className="font-bold text-primary-navy text-base">Salary Range</Label>
                  <Input
                    id="salary"
                    placeholder="e.g. $80K - $120K"
                    value={jobData.salary}
                    onChange={(e) => setJobData({...jobData, salary: e.target.value})}
                    className="rounded-xl font-semibold text-base py-3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="font-bold text-primary-navy text-base">Experience Level</Label>
                  <Select value={jobData.experience} onValueChange={(value) => setJobData({...jobData, experience: value})}>
                    <SelectTrigger className="rounded-xl font-semibold text-base py-3">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="entry" className="font-semibold">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid" className="font-semibold">Mid Level (2-5 years)</SelectItem>
                      <SelectItem value="senior" className="font-semibold">Senior Level (5+ years)</SelectItem>
                      <SelectItem value="lead" className="font-semibold">Lead/Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-bold text-primary-navy text-base">Job Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the responsibilities of the position. You can always change this later."
                  value={jobData.description}
                  onChange={(e) => setJobData({...jobData, description: e.target.value})}
                  className="min-h-32 rounded-xl font-semibold text-base"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex-1 border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white rounded-xl font-bold text-base py-3"
                  onClick={() => setShowNewJobForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary-navy hover:bg-primary-navy/90 text-white rounded-xl font-bold text-base py-3"
                >
                  Post Job
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
 