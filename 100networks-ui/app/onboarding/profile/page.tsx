"use client" // For form handling state

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchIcon, XIcon, MapPinIcon, BriefcaseIcon, LinkIcon, UserIcon, GraduationCapIcon } from "lucide-react"
import Link from "next/link"
import { OnboardingStepper } from "@/components/onboarding-stepper"

export default function ProfilePage() {
  const [location, setLocation] = useState("Noida, Uttar Pradesh")
  const [searchLocation, setSearchLocation] = useState("")

  return (
    <div className="min-h-screen bg-brand-bg-light-gray py-8">
      <OnboardingStepper />
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-black to-gray-800 rounded-2xl shadow-lg mb-4">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-brand-text-dark mb-3">Tell us about yourself</h1>
          <p className="text-brand-text-medium leading-relaxed">
            Share your background to help us connect you with opportunities that match your experience and aspirations.
          </p>
        </div>

        <form className="space-y-10">
          {/* Location Section */}
          <div className="space-y-5">
            <div className="flex items-center space-x-2 mb-3">
              <MapPinIcon className="h-5 w-5 text-black" />
              <Label htmlFor="location" className="text-base font-semibold text-brand-text-dark">
                Where are you based? <span className="text-brand-red">*</span>
              </Label>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>💡 Location Benefits:</strong> Your location helps us show relevant opportunities in your area, 
                remote positions, and calculate accurate salary ranges for your region.
              </p>
            </div>
            
            {location && (
              <div className="animate-in slide-in-from-left duration-300">
                <div className="inline-flex items-center bg-gradient-to-r from-black to-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-md">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  {location}
                  <button
                    type="button"
                    onClick={() => setLocation("")}
                    className="ml-2 text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="relative">
              <Input
                id="searchLocation"
                type="text"
                placeholder="Search for a city, state, or country"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="bg-brand-bg-input border-brand-border placeholder-brand-text-light focus:border-black focus:ring-2 focus:ring-black/20 pl-10"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-light" />
            </div>
          </div>

          {/* Professional Background Section */}
          <div className="border-t border-brand-border pt-8 space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <BriefcaseIcon className="h-5 w-5 text-black" />
              <h2 className="text-xl font-semibold text-brand-text-dark">Professional Background</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="currentRole" className="block text-base font-semibold text-brand-text-dark mb-3">
                  What's your primary area of expertise? <span className="text-brand-red">*</span>
                </Label>
                <p className="text-sm text-brand-text-medium mb-4">
                  This helps us understand your skill set and match you with relevant opportunities.
                </p>
                <Select>
                  <SelectTrigger className="w-full bg-brand-bg-input border-brand-border focus:border-black focus:ring-2 focus:ring-black/20 h-12">
                    <SelectValue placeholder="Choose your primary expertise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software-engineer">🖥️ Software Engineering</SelectItem>
                    <SelectItem value="product-manager">📊 Product Management</SelectItem>
                    <SelectItem value="designer">🎨 Design (UI/UX)</SelectItem>
                    <SelectItem value="data-scientist">📈 Data Science & Analytics</SelectItem>
                    <SelectItem value="marketing">📢 Marketing & Growth</SelectItem>
                    <SelectItem value="sales">💼 Sales & Business Development</SelectItem>
                    <SelectItem value="operations">⚙️ Operations & Strategy</SelectItem>
                    <SelectItem value="finance">💰 Finance & Accounting</SelectItem>
                    <SelectItem value="hr">👥 Human Resources</SelectItem>
                    <SelectItem value="other">🔧 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experience" className="block text-base font-semibold text-brand-text-dark mb-3">
                  How many years of professional experience do you have? <span className="text-brand-red">*</span>
                </Label>
                <p className="text-sm text-brand-text-medium mb-4">
                  Include internships, freelance work, and any relevant professional experience.
                </p>
                <Select>
                  <SelectTrigger className="w-full bg-brand-bg-input border-brand-border focus:border-black focus:ring-2 focus:ring-black/20 h-12">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">🌱 Entry Level (0-1 years)</SelectItem>
                    <SelectItem value="junior">📚 Junior (1-3 years)</SelectItem>
                    <SelectItem value="mid">🚀 Mid-Level (3-5 years)</SelectItem>
                    <SelectItem value="senior">⭐ Senior (5-8 years)</SelectItem>
                    <SelectItem value="lead">👑 Lead/Principal (8+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Current Employment Section */}
          <div className="border-t border-brand-border pt-8 space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <GraduationCapIcon className="h-5 w-5 text-black" />
              <h2 className="text-xl font-semibold text-brand-text-dark">Current Role</h2>
            </div>

            <div>
              <Label className="block text-base font-semibold text-brand-text-dark mb-3">
                Tell us about your current role <span className="text-brand-red">*</span>
              </Label>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                <p className="text-sm text-green-700">
                  <strong>🔒 Privacy guaranteed:</strong> Your current employer will never see that you're exploring new opportunities. 
                  This information is used solely for matching you with relevant roles.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="jobTitle" className="block text-sm font-medium text-brand-text-medium mb-2">
                    Current Position
                  </Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g. Senior Software Engineer"
                    className="bg-brand-bg-input border-brand-border focus:border-black focus:ring-2 focus:ring-black/20 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="company" className="block text-sm font-medium text-brand-text-medium mb-2">
                    Company Name
                  </Label>
                  <Input 
                    id="company" 
                    placeholder="e.g. TechCorp Inc." 
                    className="bg-brand-bg-input border-brand-border focus:border-black focus:ring-2 focus:ring-black/20 h-12" 
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <Checkbox id="notEmployed" />
                <Label htmlFor="notEmployed" className="text-sm font-medium text-brand-text-medium">
                  I'm currently between roles or seeking my first position
                </Label>
              </div>
            </div>
          </div>

          {/* Professional Links Section */}
          <div className="border-t border-brand-border pt-8 space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <LinkIcon className="h-5 w-5 text-black" />
              <h2 className="text-xl font-semibold text-brand-text-dark">Professional Presence</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="linkedin" className="block text-base font-semibold text-brand-text-dark mb-2">
                  LinkedIn Profile
                </Label>
                <p className="text-sm text-brand-text-medium mb-3">
                  A complete LinkedIn profile significantly increases your chances of getting noticed by recruiters.
                </p>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="bg-brand-bg-input border-brand-border focus:border-black focus:ring-2 focus:ring-black/20 h-12"
                />
              </div>

              <div>
                <Label htmlFor="website" className="block text-base font-semibold text-brand-text-dark mb-2">
                  Portfolio or Personal Website
                </Label>
                <p className="text-sm text-brand-text-medium mb-3">
                  Showcase your work, projects, or professional blog to stand out from the crowd.
                </p>
                <Input
                  id="website"
                  placeholder="https://yourportfolio.com"
                  className="bg-brand-bg-input border-brand-border focus:border-black focus:ring-2 focus:ring-black/20 h-12"
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-900 text-white py-3 font-medium text-base rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              asChild
            >
              <Link href="/onboarding/preferences">Continue to Preferences →</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
