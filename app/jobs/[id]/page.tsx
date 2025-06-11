import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  BookmarkIcon,
  Share2,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Building2,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { notFound } from "next/navigation"
import type { Job } from "@/lib/types"

async function getJobData(id: string): Promise<Job | null> {
  // In a real app, consider using environment variables for the base URL
  const res = await fetch(`http://localhost:3000/api/jobs/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary or return a 404 page
    // if notFound() is used. For simplicity, returning null and letting the page handle it.
    return null;
  }
  return res.json() as Promise<Job>;
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await getJobData(params.id);

  if (!job) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link href="/jobs" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Job Details</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <BookmarkIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4 mb-6">
                <img src={job.companyLogo || "/placeholder.svg"} alt={job.companyName} className="h-16 w-16 rounded-lg" />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
                  <div className="flex items-center space-x-4 text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-1" />
                      {job.companyName}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {job.postedDate}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{job.type}</Badge>
                    <Badge variant="secondary">{job.remote}</Badge>
                    {job.experienceLevel && <Badge variant="secondary">{job.experienceLevel}</Badge>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Salary</p>
                    <p className="font-medium">{job.salaryRange}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Applicants</p>
                    <p className="font-medium">{job.applicantsCount ? `${job.applicantsCount} applicants` : 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Posted</p>
                    <p className="font-medium">{job.postedDate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Key Responsibilities
                </h3>
                <ul className="space-y-2">
                  {job.responsibilities?.map((responsibility, index) => (
                    <li key={index} className="flex items-start">
                      <div className="h-2 w-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                  Requirements
                </h3>
                <ul className="space-y-2">
                  {job.requirements?.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <div className="h-2 w-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {job.niceToHave && job.niceToHave.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Nice to Have</h3>
                    <ul className="space-y-2">
                      {job.niceToHave.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="h-2 w-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {job.benefits && job.benefits.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Benefits & Perks</h3>
                    <ul className="space-y-2">
                      {job.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <div className="h-2 w-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <Button className="w-full mb-4" size="lg" asChild>
                <Link href={`/jobs/${job.id}/apply`}>Apply for this position</Link>
              </Button>
              <Button variant="outline" className="w-full mb-4">
                Save for later
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                By applying, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About {job.companyName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <img src={job.companyLogo || "/placeholder.svg"} alt={job.companyName} className="h-12 w-12 rounded" />
                <div>
                  <h3 className="font-medium">{job.companyName}</h3>
                  <p className="text-sm text-muted-foreground">{job.industry}</p>
                </div>
              </div>
              {/* Simplified Company Info - full details would require fetching from /api/companies/:companyId */}
              <p className="text-sm text-muted-foreground">
                More detailed information about {job.companyName} can be found on their company profile.
              </p>
              {/* This button would ideally link to a company profile page e.g. /companies/[companyId] */}
              <Button variant="outline" className="w-full" asChild>
                <Link href={`#`}> {/* Placeholder Link */}
                  View Company Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Similar Jobs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Similar Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 border rounded-lg hover:bg-muted cursor-pointer">
                  <h4 className="font-medium text-sm">Frontend Developer</h4>
                  <p className="text-xs text-muted-foreground">Google • Remote</p>
                  <p className="text-xs text-muted-foreground">$100K - $130K</p>
                </div>
                <div className="p-3 border rounded-lg hover:bg-muted cursor-pointer">
                  <h4 className="font-medium text-sm">React Developer</h4>
                  <p className="text-xs text-muted-foreground">Meta • San Francisco</p>
                  <p className="text-xs text-muted-foreground">$110K - $140K</p>
                </div>
                <div className="p-3 border rounded-lg hover:bg-muted cursor-pointer">
                  <h4 className="font-medium text-sm">Full Stack Engineer</h4>
                  <p className="text-xs text-muted-foreground">Stripe • Remote</p>
                  <p className="text-xs text-muted-foreground">$120K - $160K</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" size="sm">
                View More Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
