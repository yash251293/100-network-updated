import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookmarkIcon, Search, Briefcase, Users, PlusCircle } from "lucide-react"
import Link from "next/link"

export default function FreelancePage() {
  return (
    <div className="container max-w-5xl py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Freelance Marketplace</h1>
          <p className="text-muted-foreground">Find work or hire talented professionals</p>
        </div>
        <Link href="/jobs/freelance/post">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Post a Project
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="gigs" className="mb-8">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="gigs" className="text-base py-3">
            <Briefcase className="h-4 w-4 mr-2" />
            Gigs & Projects
          </TabsTrigger>
          <TabsTrigger value="freelancers" className="text-base py-3">
            <Users className="h-4 w-4 mr-2" />
            Hire Freelancers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gigs">
          <div className="flex space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search projects by title, skills, or keywords" className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web Development</SelectItem>
                <SelectItem value="mobile">Mobile Development</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="writing">Content Writing</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="data">Data Analysis</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Under $500</SelectItem>
                <SelectItem value="medium">$500-$2,000</SelectItem>
                <SelectItem value="high">$2,000-$5,000</SelectItem>
                <SelectItem value="enterprise">$5,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {/* Project 1 */}
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <img src="/abstract-tech-logo.png" alt="TechVision" className="h-10 w-10 rounded" />
                    <div>
                      <h3 className="font-medium">React Native Developer for Fitness App</h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">$2,000-3,000 fixed price</p>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Mobile Dev</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mb-2">
                    Looking for an experienced React Native developer to build a fitness tracking app with workout
                    plans, progress tracking, and social features.
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">React Native</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Firebase</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">UI/UX</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">API Integration</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Estimated duration: 4-6 weeks • Posted 2 days ago</p>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon">
                        <BookmarkIcon className="h-4 w-4" />
                      </Button>
                      <Button size="sm">Apply</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project 2 */}
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <img src="/marketing-agency-logo.png" alt="GrowthBoost" className="h-10 w-10 rounded" />
                    <div>
                      <h3 className="font-medium">Content Writer for SaaS Blog Articles</h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">$50-75 per article</p>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Content</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mb-2">
                    We need a skilled content writer to create engaging, SEO-optimized blog articles for our SaaS
                    clients in the marketing technology space.
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">SEO</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">B2B</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">SaaS</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Marketing</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Ongoing work • Posted 1 week ago</p>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon">
                        <BookmarkIcon className="h-4 w-4" />
                      </Button>
                      <Button size="sm">Apply</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project 3 */}
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <img src="/data-company-logo.png" alt="DataInsight" className="h-10 w-10 rounded" />
                    <div>
                      <h3 className="font-medium">Data Visualization Expert for Financial Dashboard</h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">$100 - $200/hr</p>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                          Data Science
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mb-2">
                    We are seeking a skilled data visualization expert to create an interactive financial dashboard
                    using tools like Tableau or Power BI.
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Tableau</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Power BI</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Data Visualization</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Financial Analysis</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Part-time • Posted 3 days ago</p>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon">
                        <BookmarkIcon className="h-4 w-4" />
                      </Button>
                      <Button size="sm">Apply</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button variant="outline">Load More Projects</Button>
          </div>
        </TabsContent>

        <TabsContent value="freelancers">
          <div className="flex space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search freelancers by name, skills, or expertise" className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Expertise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web Development</SelectItem>
                <SelectItem value="mobile">Mobile Development</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="writing">Content Writing</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="data">Data Analysis</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Hourly Rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Under $25/hr</SelectItem>
                <SelectItem value="medium">$25-$50/hr</SelectItem>
                <SelectItem value="high">$50-$100/hr</SelectItem>
                <SelectItem value="expert">$100+/hr</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {/* Freelancer 1 */}
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <img src="/professional-man-headshot.png" alt="David Chen" className="h-20 w-20 rounded-full mr-4" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-lg">David Chen</h3>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="font-medium">4.9</span>
                      <span className="text-muted-foreground text-sm">/5 (42 reviews)</span>
                    </div>
                  </div>
                  <p className="font-medium text-sm text-muted-foreground mb-2">
                    Full Stack Developer | React | Node.js | AWS
                  </p>
                  <p className="text-sm mb-3">
                    I build scalable web applications with modern JavaScript frameworks. Specialized in React, Node.js,
                    and cloud infrastructure.
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">React</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Node.js</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">TypeScript</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">AWS</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">MongoDB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">$65/hr</p>
                    <Button size="sm">Contact</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Freelancer 2 */}
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <img src="/professional-woman-headshot.png" alt="Sarah Johnson" className="h-20 w-20 rounded-full mr-4" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-lg">Sarah Johnson</h3>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="font-medium">4.8</span>
                      <span className="text-muted-foreground text-sm">/5 (36 reviews)</span>
                    </div>
                  </div>
                  <p className="font-medium text-sm text-muted-foreground mb-2">
                    UI/UX Designer | Brand Identity | Mobile Apps
                  </p>
                  <p className="text-sm mb-3">
                    I create beautiful, intuitive interfaces for web and mobile applications with a focus on user
                    experience and conversion.
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">UI Design</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">UX Research</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Figma</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Adobe XD</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Prototyping</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">$75/hr</p>
                    <Button size="sm">Contact</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Freelancer 3 */}
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <img src="/professional-man-glasses.png" alt="Michael Rodriguez" className="h-20 w-20 rounded-full mr-4" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-lg">Michael Rodriguez</h3>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="font-medium">4.7</span>
                      <span className="text-muted-foreground text-sm">/5 (29 reviews)</span>
                    </div>
                  </div>
                  <p className="font-medium text-sm text-muted-foreground mb-2">
                    Content Strategist | SEO Writer | B2B SaaS
                  </p>
                  <p className="text-sm mb-3">
                    I help B2B SaaS companies increase organic traffic and conversions with strategic content that ranks
                    and converts.
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">SEO</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Content Strategy</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Blog Writing</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Copywriting</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">SaaS</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">$45/hr</p>
                    <Button size="sm">Contact</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button variant="outline">Load More Freelancers</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
