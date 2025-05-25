import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookmarkIcon, Filter, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function JobsPage() {
  return (
    <div className="container max-w-5xl py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
      </div>

      <Tabs defaultValue="search" className="mb-8">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="search">Search Jobs</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>
        <TabsContent value="search">
          <div className="space-y-6">
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

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Want to see more relevant jobs?</p>
                  <p className="text-sm text-muted-foreground">Update your preferences to get better matches</p>
                </div>
                <Button variant="outline">Update preferences</Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
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
                  <Button variant="ghost" size="icon">
                    <BookmarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
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
                  <Button variant="ghost" size="icon">
                    <BookmarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
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
                  <Button variant="ghost" size="icon">
                    <BookmarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
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
                  <Button variant="ghost" size="icon">
                    <BookmarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
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
                  <Button variant="ghost" size="icon">
                    <BookmarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No saved jobs</h3>
            <p className="text-muted-foreground mb-4">Jobs you save will appear here</p>
            <Button>Find jobs</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
