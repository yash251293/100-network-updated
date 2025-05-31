"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookmarkIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ExplorePage() {
  return (
    <div className="container max-w-5xl py-6">
      <h1 className="text-2xl font-bold mb-6">Explore</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Welcome to 100 Networks</h2>
            <p className="text-muted-foreground mb-4">
              Connect with professionals, find opportunities, and grow your career with our global network.
            </p>
            <div className="flex space-x-2">
              <Button size="sm" asChild>
                <Link href="/profile/complete">Complete Profile</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/jobs">Explore Jobs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Get Discovered</h2>
            <p className="text-muted-foreground mb-4">
              Update your skills and preferences to get matched with the right opportunities.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/career-interests">Update Career Interests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommended" className="mb-8">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="nearby">Nearby</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">
                Opportunities for <span className="text-purple-500">software developers</span>
              </h2>
              <Link href="/jobs" className="text-sm text-blue-600 hover:underline">
                View more
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Link href="/jobs/1">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start space-x-2">
                        <img src="/abstract-tech-logo.png" alt="Atreyus Ai" className="h-10 w-10 rounded" />
                        <div>
                          <p className="font-medium">Atreyus Ai</p>
                          <p className="text-xs text-muted-foreground">Information Technology</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          // Handle bookmark logic
                        }}
                      >
                        <BookmarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="font-medium mb-1">Senior Frontend Developer</h3>
                    <p className="text-sm text-muted-foreground mb-2">Full-time • Remote</p>
                    <p className="text-xs text-muted-foreground mb-4">$120K - $150K • Posted 3 days ago</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/jobs/2">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start space-x-2">
                        <img src="/flexbone-logo.png" alt="Flexbone" className="h-10 w-10 rounded" />
                        <div>
                          <p className="font-medium">Flexbone</p>
                          <p className="text-xs text-muted-foreground">Healthcare</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          // Handle bookmark logic
                        }}
                      >
                        <BookmarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="font-medium mb-1">Python AI Engineer</h3>
                    <p className="text-sm text-muted-foreground mb-2">Contract • Hybrid</p>
                    <p className="text-xs text-muted-foreground mb-4">$90K - $110K • Posted 1 week ago</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/jobs/3">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start space-x-2">
                        <img src="/generic-company-logo.png" alt="Source" className="h-10 w-10 rounded" />
                        <div>
                          <p className="font-medium">Source</p>
                          <p className="text-xs text-muted-foreground">Engineering & Construction</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          // Handle bookmark logic
                        }}
                      >
                        <BookmarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="font-medium mb-1">Full Stack Developer</h3>
                    <p className="text-sm text-muted-foreground mb-2">Full-time • On-site</p>
                    <p className="text-xs text-muted-foreground mb-4">$85K - $105K • Posted 2 weeks ago</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">
                Freelance projects in <span className="text-purple-500">web development</span>
              </h2>
              <Link href="/jobs/freelance" className="text-sm text-blue-600 hover:underline">
                View more
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-2">
                      <img src="/placeholder.svg?height=40&width=40" alt="Ra Labs" className="h-10 w-10 rounded" />
                      <div>
                        <p className="font-medium">Ra Labs</p>
                        <p className="text-xs text-muted-foreground">Internet & Software</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <BookmarkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="font-medium mb-1">E-commerce Website Redesign</h3>
                  <p className="text-sm text-muted-foreground mb-2">$3,000-5,000 • 4 weeks</p>
                  <p className="text-xs text-muted-foreground mb-4">Posted 2 days ago</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-2">
                      <img
                        src="/placeholder.svg?height=40&width=40"
                        alt="Instalify, Inc."
                        className="h-10 w-10 rounded"
                      />
                      <div>
                        <p className="font-medium">Instalify, Inc.</p>
                        <p className="text-xs text-muted-foreground">Internet & Software</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <BookmarkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="font-medium mb-1">React Dashboard Development</h3>
                  <p className="text-sm text-muted-foreground mb-2">$50/hr • 2-3 months</p>
                  <p className="text-xs text-muted-foreground mb-4">Posted 5 days ago</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-2">
                      <img
                        src="/placeholder.svg?height=40&width=40"
                        alt="Dynex Capital"
                        className="h-10 w-10 rounded"
                      />
                      <div>
                        <p className="font-medium">Dynex Capital</p>
                        <p className="text-xs text-muted-foreground">Investment / Portfolio Management</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <BookmarkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="font-medium mb-1">Financial App UI/UX Design</h3>
                  <p className="text-sm text-muted-foreground mb-2">$2,500-4,000 • 3 weeks</p>
                  <p className="text-xs text-muted-foreground mb-4">Posted 1 week ago</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trending">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Trending content coming soon</h3>
            <p className="text-muted-foreground">We're gathering the most popular opportunities for you</p>
          </div>
        </TabsContent>

        <TabsContent value="nearby">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Enable location services</h3>
            <p className="text-muted-foreground mb-4">Allow location access to see opportunities near you</p>
            <Button>Enable Location</Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Upcoming events</h2>
          <Link href="/events" className="text-sm text-blue-600 hover:underline">
            View all events
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-2">
                  <img
                    src="/placeholder.svg?height=40&width=40"
                    alt="McKinsey & Company"
                    className="h-10 w-10 rounded"
                  />
                  <div>
                    <p className="font-medium">McKinsey & Company</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <BookmarkIcon className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-medium mb-1">Tech Industry Insights Webinar</h3>
              <p className="text-sm text-muted-foreground mb-2">Virtual • Jun 15, 2025</p>
              <Button size="sm" variant="outline" className="w-full">
                Register
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-2">
                  <img src="/placeholder.svg?height=40&width=40" alt="Google" className="h-10 w-10 rounded" />
                  <div>
                    <p className="font-medium">Google</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <BookmarkIcon className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-medium mb-1">Cloud Computing Workshop</h3>
              <p className="text-sm text-muted-foreground mb-2">Hybrid • Jul 8, 2025</p>
              <Button size="sm" variant="outline" className="w-full">
                Register
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-2">
                  <img src="/placeholder.svg?height=40&width=40" alt="TechConnect" className="h-10 w-10 rounded" />
                  <div>
                    <p className="font-medium">TechConnect 2025</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <BookmarkIcon className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-medium mb-1">Global Networking Conference</h3>
              <p className="text-sm text-muted-foreground mb-2">In-person • Aug 22-24, 2025</p>
              <Button size="sm" variant="outline" className="w-full">
                Register
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
