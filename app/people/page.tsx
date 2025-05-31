import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

export default function PeoplePage() {
  return (
    <div className="container max-w-5xl py-6">
      <h1 className="text-2xl font-bold mb-6">Network</h1>

      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Grow your professional network</h2>
        <p className="text-muted-foreground mb-6">
          Connect with professionals from various industries to expand your opportunities.
        </p>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, company, industry, or skills" className="pl-10" />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="outline" className="rounded-full">
            All
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Technology
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Finance
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Marketing
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Design
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Healthcare
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Education
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/professional-man-1.png" alt="David Chen" />
                <AvatarFallback>DC</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-lg">David Chen</h3>
                <p className="text-sm text-muted-foreground">Senior Software Engineer at TechVision</p>
                <p className="text-sm text-muted-foreground mb-2">San Francisco, CA</p>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="flex items-center space-x-2 text-sm mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                        <path d="M8 14h.01" />
                        <path d="M12 14h.01" />
                        <path d="M16 14h.01" />
                        <path d="M8 18h.01" />
                        <path d="M12 18h.01" />
                        <path d="M16 18h.01" />
                      </svg>
                      <span>7 years of experience in web development</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                      <span>React, Node.js, TypeScript, AWS</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 text-sm mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>Open to freelance opportunities</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Button>Connect</Button>
          </div>
        </div>

        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/professional-woman-1.png" alt="Sarah Johnson" />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-lg">Sarah Johnson</h3>
                <p className="text-sm text-muted-foreground">Marketing Director at GlobalBrands</p>
                <p className="text-sm text-muted-foreground mb-2">New York, NY</p>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="flex items-center space-x-2 text-sm mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                        <path d="M8 14h.01" />
                        <path d="M12 14h.01" />
                        <path d="M16 14h.01" />
                        <path d="M8 18h.01" />
                        <path d="M12 18h.01" />
                        <path d="M16 18h.01" />
                      </svg>
                      <span>10+ years in digital marketing</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                      <span>Brand Strategy, Content Marketing, SEO</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 text-sm mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>Looking to mentor new marketers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Button>Connect</Button>
          </div>
        </div>

        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/professional-man-2.png" alt="Michael Rodriguez" />
                <AvatarFallback>MR</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-lg">Michael Rodriguez</h3>
                <p className="text-sm text-muted-foreground">UX/UI Designer at DesignLabs</p>
                <p className="text-sm text-muted-foreground mb-2">Austin, TX</p>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="flex items-center space-x-2 text-sm mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                        <path d="M8 14h.01" />
                        <path d="M12 14h.01" />
                        <path d="M16 14h.01" />
                        <path d="M8 18h.01" />
                        <path d="M12 18h.01" />
                        <path d="M16 18h.01" />
                      </svg>
                      <span>5 years of product design experience</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                      <span>Figma, Adobe XD, Sketch, Prototyping</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 text-sm mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>Available for freelance projects</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Button>Connect</Button>
          </div>
        </div>

        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/professional-woman-2.png" alt="Jennifer Lee" />
                <AvatarFallback>JL</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-lg">Jennifer Lee</h3>
                <p className="text-sm text-muted-foreground">Data Scientist at AnalyticsPro</p>
                <p className="text-sm text-muted-foreground mb-2">Seattle, WA</p>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="flex items-center space-x-2 text-sm mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                        <path d="M8 14h.01" />
                        <path d="M12 14h.01" />
                        <path d="M16 14h.01" />
                        <path d="M8 18h.01" />
                        <path d="M12 18h.01" />
                        <path d="M16 18h.01" />
                      </svg>
                      <span>4 years in data science and analytics</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                      <span>Python, R, Machine Learning, SQL</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 text-sm mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>Open to consulting opportunities</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Button>Connect</Button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button variant="outline">Load More</Button>
      </div>
    </div>
  )
}
