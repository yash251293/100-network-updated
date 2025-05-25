import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PostFreelanceProjectPage() {
  return (
    <div className="container max-w-3xl py-6">
      <div className="flex items-center mb-6">
        <Link href="/jobs/freelance" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Post a Freelance Project</h1>
          <p className="text-muted-foreground">Create a project to find the perfect freelancer</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Provide information about your project to attract the right freelancers</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input id="title" placeholder="e.g., 'Mobile App Developer for Fitness Application'" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web Development</SelectItem>
                  <SelectItem value="mobile">Mobile Development</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="writing">Content Writing</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="data">Data Analysis</SelectItem>
                  <SelectItem value="ai">AI & Machine Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your project in detail, including goals, requirements, and deliverables..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Required Skills</Label>
              <Input id="skills" placeholder="e.g., React Native, Firebase, UI/UX, API Integration" />
              <p className="text-xs text-muted-foreground">Separate skills with commas</p>
            </div>

            <div className="space-y-2">
              <Label>Project Budget</Label>
              <RadioGroup defaultValue="fixed">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label htmlFor="fixed">Fixed Price</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hourly" id="hourly" />
                  <Label htmlFor="hourly">Hourly Rate</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-budget">Minimum Budget</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">$</span>
                  <Input id="min-budget" className="pl-6" placeholder="e.g., 500" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-budget">Maximum Budget</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">$</span>
                  <Input id="max-budget" className="pl-6" placeholder="e.g., 2000" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="less-than-week">Less than 1 week</SelectItem>
                  <SelectItem value="1-2-weeks">1-2 weeks</SelectItem>
                  <SelectItem value="2-4-weeks">2-4 weeks</SelectItem>
                  <SelectItem value="1-3-months">1-3 months</SelectItem>
                  <SelectItem value="3-6-months">3-6 months</SelectItem>
                  <SelectItem value="ongoing">Ongoing project</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments (Optional)</Label>
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Drag and drop files here, or click to browse files</p>
                <Button variant="outline" size="sm">
                  Browse Files
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Max file size: 10MB. Supported formats: PDF, DOC, DOCX, JPG, PNG
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline">Save as Draft</Button>
              <Button>Post Project</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
