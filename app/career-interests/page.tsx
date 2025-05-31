"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Target, Briefcase, MapPin, DollarSign, Plus, X, Save, Sparkles, TrendingUp } from "lucide-react"

export default function CareerInterestsPage() {
  const [interests, setInterests] = useState({
    jobTitles: [] as string[],
    industries: [] as string[],
    companies: [] as string[],
    skills: [] as string[],
    locations: [] as string[],
    jobTypes: [] as string[],
    experienceLevel: "",
    salaryRange: { min: "", max: "" },
    remotePreference: "",
    workEnvironment: "",
    careerGoals: "",
    availability: "",
  })

  const [newInputs, setNewInputs] = useState({
    jobTitle: "",
    industry: "",
    company: "",
    skill: "",
    location: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const predefinedOptions = {
    industries: [
      "Technology",
      "Healthcare",
      "Finance",
      "Education",
      "Marketing",
      "Design",
      "Sales",
      "Engineering",
      "Consulting",
      "Media",
      "Non-profit",
      "Government",
      "Retail",
      "Manufacturing",
      "Real Estate",
    ],
    jobTypes: ["Full-time", "Part-time", "Contract", "Freelance", "Internship", "Temporary"],
    skills: [
      "JavaScript",
      "Python",
      "React",
      "Node.js",
      "Data Analysis",
      "Project Management",
      "Digital Marketing",
      "UI/UX Design",
      "Machine Learning",
      "Sales",
      "Leadership",
      "Communication",
    ],
    companies: [
      "Google",
      "Microsoft",
      "Apple",
      "Amazon",
      "Meta",
      "Netflix",
      "Tesla",
      "Spotify",
      "Airbnb",
      "Uber",
      "Stripe",
      "Figma",
    ],
  }

  const addItem = (category: keyof typeof interests, value: string) => {
    if (value.trim() && !interests[category].includes(value.trim())) {
      setInterests((prev) => ({
        ...prev,
        [category]: [...prev[category], value.trim()],
      }))
    }
  }

  const removeItem = (category: keyof typeof interests, item: string) => {
    setInterests((prev) => ({
      ...prev,
      [category]: prev[category].filter((i) => i !== item),
    }))
  }

  const addFromInput = (category: string) => {
    const inputKey = category as keyof typeof newInputs
    const value = newInputs[inputKey]
    if (value) {
      addItem(category as keyof typeof interests, value)
      setNewInputs((prev) => ({ ...prev, [inputKey]: "" }))
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    // TODO: Save career interests to backend
    console.log("Saving career interests:", interests)

    setTimeout(() => {
      setIsLoading(false)
      // Show success message or redirect
    }, 1000)
  }

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Career Interests</h1>
            <p className="text-muted-foreground">Help us match you with the perfect opportunities</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preferences" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Job Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="interests" className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4" />
            <span>Interests</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Career Goals</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Job Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select
                    value={interests.experienceLevel}
                    onValueChange={(value) => setInterests((prev) => ({ ...prev, experienceLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                      <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                      <SelectItem value="lead">Lead/Principal (10+ years)</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Remote Work Preference</Label>
                  <Select
                    value={interests.remotePreference}
                    onValueChange={(value) => setInterests((prev) => ({ ...prev, remotePreference: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote Only</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site Only</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Job Types</Label>
                <div className="flex flex-wrap gap-2">
                  {predefinedOptions.jobTypes.map((type) => (
                    <Badge
                      key={type}
                      variant={interests.jobTypes.includes(type) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (interests.jobTypes.includes(type)) {
                          removeItem("jobTypes", type)
                        } else {
                          addItem("jobTypes", type)
                        }
                      }}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Salary Range (Annual)</span>
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Minimum</Label>
                    <Input
                      placeholder="$50,000"
                      value={interests.salaryRange.min}
                      onChange={(e) =>
                        setInterests((prev) => ({
                          ...prev,
                          salaryRange: { ...prev.salaryRange, min: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Maximum</Label>
                    <Input
                      placeholder="$100,000"
                      value={interests.salaryRange.max}
                      onChange={(e) =>
                        setInterests((prev) => ({
                          ...prev,
                          salaryRange: { ...prev.salaryRange, max: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Availability</Label>
                <Select
                  value={interests.availability}
                  onValueChange={(value) => setInterests((prev) => ({ ...prev, availability: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="When can you start?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediately">Immediately</SelectItem>
                    <SelectItem value="2weeks">2 weeks notice</SelectItem>
                    <SelectItem value="1month">1 month</SelectItem>
                    <SelectItem value="3months">3 months</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interests" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Titles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="e.g., Software Engineer"
                    value={newInputs.jobTitle}
                    onChange={(e) => setNewInputs((prev) => ({ ...prev, jobTitle: e.target.value }))}
                    onKeyPress={(e) => e.key === "Enter" && addFromInput("jobTitles")}
                  />
                  <Button onClick={() => addFromInput("jobTitles")} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[100px] p-3 border rounded-md">
                  {interests.jobTitles.map((title, index) => (
                    <Badge key={index} className="flex items-center gap-1">
                      {title}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem("jobTitles", title)} />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Industries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="e.g., Technology"
                    value={newInputs.industry}
                    onChange={(e) => setNewInputs((prev) => ({ ...prev, industry: e.target.value }))}
                    onKeyPress={(e) => e.key === "Enter" && addFromInput("industries")}
                  />
                  <Button onClick={() => addFromInput("industries")} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Popular Industries:</Label>
                  <div className="flex flex-wrap gap-1">
                    {predefinedOptions.industries.map((industry) => (
                      <Badge
                        key={industry}
                        variant="outline"
                        className="cursor-pointer text-xs"
                        onClick={() => addItem("industries", industry)}
                      >
                        + {industry}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border rounded-md">
                  {interests.industries.map((industry, index) => (
                    <Badge key={index} className="flex items-center gap-1">
                      {industry}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem("industries", industry)} />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Companies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="e.g., Google"
                    value={newInputs.company}
                    onChange={(e) => setNewInputs((prev) => ({ ...prev, company: e.target.value }))}
                    onKeyPress={(e) => e.key === "Enter" && addFromInput("companies")}
                  />
                  <Button onClick={() => addFromInput("companies")} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Popular Companies:</Label>
                  <div className="flex flex-wrap gap-1">
                    {predefinedOptions.companies.map((company) => (
                      <Badge
                        key={company}
                        variant="outline"
                        className="cursor-pointer text-xs"
                        onClick={() => addItem("companies", company)}
                      >
                        + {company}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border rounded-md">
                  {interests.companies.map((company, index) => (
                    <Badge key={index} className="flex items-center gap-1">
                      {company}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem("companies", company)} />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Locations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="e.g., San Francisco, CA"
                    value={newInputs.location}
                    onChange={(e) => setNewInputs((prev) => ({ ...prev, location: e.target.value }))}
                    onKeyPress={(e) => e.key === "Enter" && addFromInput("locations")}
                  />
                  <Button onClick={() => addFromInput("locations")} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[100px] p-3 border rounded-md">
                  {interests.locations.map((location, index) => (
                    <Badge key={index} className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {location}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem("locations", location)} />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Career Goals & Aspirations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>What are your career goals?</Label>
                <Textarea
                  placeholder="Describe your short-term and long-term career aspirations, what you want to achieve, and how you want to grow professionally..."
                  value={interests.careerGoals}
                  onChange={(e) => setInterests((prev) => ({ ...prev, careerGoals: e.target.value }))}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label>Work Environment Preference</Label>
                <Select
                  value={interests.workEnvironment}
                  onValueChange={(value) => setInterests((prev) => ({ ...prev, workEnvironment: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select work environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup (Fast-paced, innovative)</SelectItem>
                    <SelectItem value="corporate">Corporate (Structured, stable)</SelectItem>
                    <SelectItem value="agency">Agency (Creative, client-focused)</SelectItem>
                    <SelectItem value="nonprofit">Non-profit (Mission-driven)</SelectItem>
                    <SelectItem value="government">Government (Public service)</SelectItem>
                    <SelectItem value="freelance">Freelance (Independent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Skills You Want to Develop</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="e.g., Machine Learning"
                    value={newInputs.skill}
                    onChange={(e) => setNewInputs((prev) => ({ ...prev, skill: e.target.value }))}
                    onKeyPress={(e) => e.key === "Enter" && addFromInput("skills")}
                  />
                  <Button onClick={() => addFromInput("skills")} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Popular Skills:</Label>
                  <div className="flex flex-wrap gap-1">
                    {predefinedOptions.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="cursor-pointer text-xs"
                        onClick={() => addItem("skills", skill)}
                      >
                        + {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border rounded-md">
                  {interests.skills.map((skill, index) => (
                    <Badge key={index} className="flex items-center gap-1">
                      {skill}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem("skills", skill)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave} disabled={isLoading} className="px-8">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Save Career Interests</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}
