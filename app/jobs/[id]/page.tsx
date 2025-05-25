import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

export default function JobApplicationPage({ params }: { params: { id: string } }) {
  return (
    <div className="container max-w-2xl py-6">
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Apply to COWI North America</h1>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-medium mb-2">Details from COWI North America:</h2>
            <p className="text-muted-foreground mb-4">
              Applying requires a few documents. Attach them below and get one step closer to your next job!
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium mb-4">Attach your transcript</h3>
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Input placeholder="Search your transcripts" className="pr-10" />
                  <Button variant="ghost" size="icon" className="absolute right-0 top-0">
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
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </Button>
                </div>
                <span className="text-sm">or</span>
                <Button variant="outline">Upload new</Button>
              </div>
              <div className="mt-2 p-3 border rounded-md bg-gray-50">
                <p className="text-sm font-medium">SSR_TSRPT.pdf</p>
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium mb-4">Attach your cover letter</h3>
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Input placeholder="Search your cover letters" className="pr-10" />
                  <Button variant="ghost" size="icon" className="absolute right-0 top-0">
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
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </Button>
                </div>
                <span className="text-sm">or</span>
                <Button variant="outline">Upload new</Button>
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium mb-4">Attach your resume</h3>
              <div className="p-4 border rounded-md bg-green-100 flex items-start space-x-3 mb-2">
                <div className="text-green-600 mt-1">
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
                    className="h-5 w-5"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Resume for Jobs.pdf</p>
                  <Button variant="link" className="h-auto p-0 text-sm">
                    Preview document
                  </Button>
                </div>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button className="w-full" size="lg">
                Submit Application
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
