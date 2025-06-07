import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookmarkIcon, Calendar, Search, Users } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EventsPage() {
  return (
    <div className="container max-w-5xl py-6">
      <h1 className="text-2xl font-bold mb-6">Events</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search events" className="pl-10" />
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex space-x-4">
          <Select>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Arizona State collections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asu">Arizona State University</SelectItem>
              <SelectItem value="all">All collections</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="career">Career</SelectItem>
              <SelectItem value="networking">Networking</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="info">Information Session</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Medium" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="virtual">Virtual</SelectItem>
              <SelectItem value="in-person">In-Person</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Employer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employers</SelectItem>
              <SelectItem value="following">Employers I Follow</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">More filters</Button>
        </div>
        <Button variant="ghost" size="icon">
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
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
          </svg>
        </Button>
      </div>

      <Tabs defaultValue="saved" className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <BookmarkIcon className="h-5 w-5 text-muted-foreground" />
          <TabsList>
            <TabsTrigger value="saved">Saved · 0</TabsTrigger>
          </TabsList>
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <TabsList>
            <TabsTrigger value="registered">Registered · 0</TabsTrigger>
          </TabsList>
          <Users className="h-5 w-5 text-muted-foreground" />
          <TabsList>
            <TabsTrigger value="check-ins">Check-ins · 0</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <div className="grid grid-cols-4 gap-8 mb-12">
        <Link
          href="/events/career-fairs"
          className="flex flex-col items-center text-center p-4 hover:bg-muted rounded-lg transition-colors"
        >
          <div className="text-green-500 mb-2">
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
              className="h-8 w-8"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <h3 className="font-medium mb-1">Career fairs</h3>
          <p className="text-sm text-muted-foreground">at your school →</p>
        </Link>

        <Link
          href="/events/career-center"
          className="flex flex-col items-center text-center p-4 hover:bg-muted rounded-lg transition-colors"
        >
          <div className="text-yellow-500 mb-2">
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
              className="h-8 w-8"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <h3 className="font-medium mb-1">Career center</h3>
          <p className="text-sm text-muted-foreground">employer events →</p>
        </Link>

        <Link
          href="/events/guidance"
          className="flex flex-col items-center text-center p-4 hover:bg-muted rounded-lg transition-colors"
        >
          <div className="text-blue-500 mb-2">
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
              className="h-8 w-8"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <h3 className="font-medium mb-1">Career center</h3>
          <p className="text-sm text-muted-foreground">guidance events →</p>
        </Link>

        <Link
          href="/events/employers"
          className="flex flex-col items-center text-center p-4 hover:bg-muted rounded-lg transition-colors"
        >
          <div className="text-purple-500 mb-2">
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
              className="h-8 w-8"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <h3 className="font-medium mb-1">Events hosted</h3>
          <p className="text-sm text-muted-foreground">by employers →</p>
        </Link>
      </div>

      <h2 className="text-2xl font-medium mb-6">All events</h2>

      <div className="grid grid-cols-3 gap-6">
        <div className="border rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <img
                  src="/placeholder.svg?height=40&width=40&query=mckinsey logo"
                  alt="McKinsey & Company"
                  className="h-10 w-10 rounded"
                />
                <h3 className="font-medium">McKinsey & Company</h3>
              </div>
              <Button variant="ghost" size="icon">
                <BookmarkIcon className="h-4 w-4" />
              </Button>
            </div>
            <h3 className="text-lg font-medium mb-2">Connect with McKinsey - Spring 2025 Edition</h3>
            <p className="text-sm text-muted-foreground mb-4">Virtual · Wed, Jan 1-Sun, Jun 1</p>
            <div className="flex space-x-2">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">HIRING</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">EMPLOYER INFO</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <img
                  src="/placeholder.svg?height=40&width=40&query=usps logo"
                  alt="United States Postal Service"
                  className="h-10 w-10 rounded"
                />
                <h3 className="font-medium">United States Postal Service</h3>
              </div>
              <Button variant="ghost" size="icon">
                <BookmarkIcon className="h-4 w-4" />
              </Button>
            </div>
            <h3 className="text-lg font-medium mb-2">USPS VIRTUAL JOB FAIR MAINE-NEW HAMPSHIRE-VERMONT</h3>
            <p className="text-sm text-muted-foreground mb-4">Virtual · Wed, Mar 26-Wed, Jun 25</p>
            <div className="flex space-x-2">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">HIRING</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">GUIDANCE</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <img
                  src="/placeholder.svg?height=40&width=40&query=kroger logo"
                  alt="Kroger Co."
                  className="h-10 w-10 rounded"
                />
                <h3 className="font-medium">Kroger Co.</h3>
              </div>
              <Button variant="ghost" size="icon">
                <BookmarkIcon className="h-4 w-4" />
              </Button>
            </div>
            <h3 className="text-lg font-medium mb-2">Game Changers 2025 Scholarship</h3>
            <p className="text-sm text-muted-foreground mb-4">Virtual · Tue, Apr 22-Sat, May 24</p>
            <div className="flex space-x-2">
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">GUIDANCE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
