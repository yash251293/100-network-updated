import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

export default function EmployersPage() {
  return (
    <div className="container max-w-5xl py-6">
      <h1 className="text-2xl font-bold mb-6">Employers</h1>

      <div className="flex space-x-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search" className="pl-10" />
        </div>
        <Button variant="outline">Employers you follow</Button>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us">United States</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
            <SelectItem value="uk">United Kingdom</SelectItem>
            <SelectItem value="au">Australia</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tech">Technology</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="education">Education</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Employer size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small (1-50)</SelectItem>
            <SelectItem value="medium">Medium (51-500)</SelectItem>
            <SelectItem value="large">Large (501-5000)</SelectItem>
            <SelectItem value="enterprise">Enterprise (5000+)</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="space-y-6">
        <div className="border-b pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="/placeholder.svg?height=48&width=48&query=amazon logo"
                alt="Amazon"
                className="h-12 w-12 rounded"
              />
              <div>
                <h2 className="font-medium">Amazon</h2>
                <p className="text-sm text-muted-foreground">Internet & Software · 145K followers</p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                  <span>Seattle, WA</span>
                  <span>·</span>
                  <span>25,000+</span>
                  <span>·</span>
                  <span>Public</span>
                </div>
              </div>
            </div>
            <Button>Follow</Button>
          </div>
        </div>

        <div className="border-b pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded bg-green-500 flex items-center justify-center text-white font-bold">
                1N
              </div>
              <div>
                <h2 className="font-medium">100 Networks</h2>
                <p className="text-sm text-muted-foreground">Internet & Software · 2.08M followers</p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                  <span>San Francisco, CA</span>
                  <span>·</span>
                  <span>250 - 1,000</span>
                  <span>·</span>
                  <span>Private</span>
                </div>
              </div>
            </div>
            <Button variant="outline">Unfollow</Button>
          </div>
        </div>

        <div className="border-b pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="/placeholder.svg?height=48&width=48&query=cognizant logo"
                alt="Cognizant"
                className="h-12 w-12 rounded"
              />
              <div>
                <h2 className="font-medium">Cognizant</h2>
                <p className="text-sm text-muted-foreground">Internet & Software · 8.72K followers</p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                  <span>Teaneck, NJ</span>
                  <span>·</span>
                  <span>25,000+</span>
                  <span>·</span>
                  <span>Public</span>
                </div>
              </div>
            </div>
            <Button>Follow</Button>
          </div>
        </div>

        <div className="border-b pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="/placeholder.svg?height=48&width=48&query=factset logo"
                alt="FactSet"
                className="h-12 w-12 rounded"
              />
              <div>
                <h2 className="font-medium">FactSet</h2>
                <p className="text-sm text-muted-foreground">Internet & Software · 5.35K followers</p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                  <span>45 Glover Avenue, 7th Floor, Norwalk, CO...</span>
                  <span>·</span>
                  <span>10,000 - 25,000</span>
                  <span>·</span>
                  <span>Public</span>
                </div>
              </div>
            </div>
            <Button>Follow</Button>
          </div>
        </div>

        <div className="border-b pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="/placeholder.svg?height=48&width=48&query=netapp logo"
                alt="NetApp"
                className="h-12 w-12 rounded"
              />
              <div>
                <h2 className="font-medium">NetApp</h2>
                <p className="text-sm text-muted-foreground">Internet & Software · 10.3K followers</p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                  <span>San Jose, CA</span>
                  <span>·</span>
                  <span>10,000 - 25,000</span>
                  <span>·</span>
                  <span>Not available</span>
                </div>
              </div>
            </div>
            <Button>Follow</Button>
          </div>
        </div>

        <div className="border-b pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="/placeholder.svg?height=48&width=48&query=google logo"
                alt="Google, Inc."
                className="h-12 w-12 rounded"
              />
              <div>
                <h2 className="font-medium">Google, Inc.</h2>
                <p className="text-sm text-muted-foreground">Internet & Software · 71.6K followers</p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                  <span>1600 Amphitheatre Parkway, Mountain View...</span>
                  <span>·</span>
                  <span>25,000+</span>
                  <span>·</span>
                  <span>Public</span>
                </div>
              </div>
            </div>
            <Button>Follow</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
