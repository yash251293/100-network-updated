"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { XIcon, CheckIcon, DollarSignIcon, BriefcaseIcon, MapPinIcon, BuildingIcon } from "lucide-react"
import Link from "next/link"
import { OnboardingStepper } from "@/components/onboarding-stepper"

interface ToggleButtonProps {
  value: string
  selectedValue: string
  onSelect: (value: string) => void
  children: React.ReactNode
  className?: string
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ value, selectedValue, onSelect, children, className }) => (
  <button
    type="button"
    onClick={() => onSelect(value)}
    className={cn(
      "px-4 py-2 text-sm font-medium border rounded-lg transition-all duration-200",
      selectedValue === value
        ? "bg-black text-white border-black shadow-md"
        : "bg-white text-brand-text-medium border-brand-border hover:border-black hover:text-black hover:shadow-sm",
      className,
    )}
  >
    {children}
  </button>
)

export default function PreferencesPage() {
  const [jobSearchStatus, setJobSearchStatus] = useState("open-to-offers")
  const [jobType, setJobType] = useState("intern")
  const [roles, setRoles] = useState<string[]>(["Marketing"])
  const [locations, setLocations] = useState<string[]>(["Noida"])

  const companySizes = [
    { name: "Startup (1-10 employees)", id: "startup", desc: "Early stage, high growth potential" },
    { name: "Small Company (11-50 employees)", id: "small", desc: "Agile teams, direct impact" },
    { name: "Medium Company (51-200 employees)", id: "medium", desc: "Established processes, good benefits" },
    { name: "Large Company (201-500 employees)", id: "large", desc: "Structured environment, career paths" },
    { name: "Enterprise (500+ employees)", id: "enterprise", desc: "Stability, comprehensive benefits" },
  ]
  const [companySizePrefs, setCompanySizePrefs] = useState<Record<string, string>>({})

  return (
    <div className="min-h-screen bg-brand-bg-light-gray py-8">
      <OnboardingStepper />
      
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-text-dark mb-3">What are you looking for?</h1>
          <p className="text-brand-text-medium leading-relaxed">
            Help us understand your career goals and preferences to match you with the perfect opportunities.
          </p>
        </div>
        
        <form className="space-y-10">
          {/* Job Search Status */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <BriefcaseIcon className="h-5 w-5 text-black" />
              <Label className="text-base font-semibold text-brand-text-dark">
                What's your current job search status? <span className="text-brand-red">*</span>
              </Label>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  value: "ready",
                  label: "Actively Job Searching",
                  desc: "I'm ready to interview and can start soon. Show my profile to potential employers.",
                },
                {
                  value: "open-to-offers",
                  label: "Open to Opportunities",
                  desc: "I'm happy in my current role but interested in hearing about great opportunities.",
                },
                {
                  value: "closed",
                  label: "Not Looking Right Now",
                  desc: "I'm not seeking new opportunities and prefer to keep my profile private.",
                },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setJobSearchStatus(item.value)}
                  className={cn(
                    "p-5 border rounded-xl text-left transition-all duration-200",
                    jobSearchStatus === item.value
                      ? "border-black ring-2 ring-black/20 bg-gray-50 shadow-md"
                      : "border-brand-border hover:border-gray-400 bg-white hover:shadow-sm",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="font-semibold text-brand-text-dark block mb-1">{item.label}</span>
                      <p className="text-sm text-brand-text-medium leading-relaxed">{item.desc}</p>
                    </div>
                    {jobSearchStatus === item.value && (
                      <CheckIcon className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Job Type */}
          <div className="space-y-4">
            <Label className="block text-base font-semibold text-brand-text-dark">
              What type of employment are you seeking? <span className="text-brand-red">*</span>
            </Label>
            <p className="text-sm text-brand-text-medium">
              You can always update this preference later as your situation changes.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { id: "full-time", label: "Full-time Position" },
                { id: "part-time", label: "Part-time Position" },
                { id: "contract", label: "Contract Work" },
                { id: "freelance", label: "Freelance Projects" },
                { id: "intern", label: "Internship" },
                { id: "co-founder", label: "Co-founder Role" }
              ].map((type) => (
                <ToggleButton
                  key={type.id}
                  value={type.id}
                  selectedValue={jobType}
                  onSelect={setJobType}
                >
                  {type.label}
                </ToggleButton>
              ))}
            </div>
          </div>

          {/* Desired Salary */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSignIcon className="h-5 w-5 text-black" />
              <Label htmlFor="salary" className="text-base font-semibold text-brand-text-dark">
                What's your target compensation range?
              </Label>
            </div>
            <p className="text-sm text-brand-text-medium bg-amber-50 p-3 rounded-lg border border-amber-200">
              <strong>Confidential:</strong> This information is private and helps us filter opportunities within your range
            </p>
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <DollarSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-light" />
                <Input
                  id="salaryAmount"
                  type="number"
                  placeholder="e.g. 75000"
                  className="bg-brand-bg-input border-brand-border pl-9 focus:border-black focus:ring-2 focus:ring-black/20"
                />
              </div>
              <Select defaultValue="usd">
                <SelectTrigger className="w-48 bg-brand-bg-input border-brand-border focus:border-black focus:ring-2 focus:ring-black/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="gbp">GBP (£)</SelectItem>
                  <SelectItem value="inr">INR (₹)</SelectItem>
                  <SelectItem value="cad">CAD ($)</SelectItem>
                  <SelectItem value="aud">AUD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Role Looking For */}
          <div className="space-y-4">
            <Label className="block text-base font-semibold text-brand-text-dark">
              Which roles interest you most?
            </Label>
            <p className="text-sm text-brand-text-medium">
              Select all roles you're interested in. We'll show you opportunities across these areas.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {roles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center bg-black text-white text-sm font-medium px-4 py-2 rounded-full"
                >
                  {role}
                  <button
                    type="button"
                    onClick={() => setRoles((r) => r.filter((item) => item !== role))}
                    className="ml-2 text-white hover:bg-gray-900 rounded-full p-0.5 transition-colors"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <Select onValueChange={(newRole) => !roles.includes(newRole) && setRoles((r) => [...r, newRole])}>
              <SelectTrigger className="w-full bg-brand-bg-input border-brand-border focus:border-black focus:ring-2 focus:ring-black/20">
                <SelectValue placeholder="Add a role you're interested in" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                <SelectItem value="Product Management">Product Management</SelectItem>
                <SelectItem value="Design & UX">Design & UX</SelectItem>
                <SelectItem value="Data Science">Data Science & Analytics</SelectItem>
                <SelectItem value="Marketing">Marketing & Growth</SelectItem>
                <SelectItem value="Sales">Sales & Business Development</SelectItem>
                <SelectItem value="Operations">Operations & Strategy</SelectItem>
                <SelectItem value="Finance">Finance & Accounting</SelectItem>
                <SelectItem value="Human Resources">Human Resources</SelectItem>
                <SelectItem value="Customer Success">Customer Success</SelectItem>
                <SelectItem value="DevOps">DevOps & Infrastructure</SelectItem>
                <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Locations to Work In */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <MapPinIcon className="h-5 w-5 text-black" />
              <Label className="block text-base font-semibold text-brand-text-dark">
                Where would you like to work?
              </Label>
            </div>
            <p className="text-sm text-brand-text-medium">
              Include all locations you're willing to work in, including remote opportunities.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {locations.map((location) => (
                <span
                  key={location}
                  className="inline-flex items-center bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-full"
                >
                  <MapPinIcon className="h-3 w-3 mr-1.5" />
                  {location}
                  <button
                    type="button"
                    onClick={() => setLocations((l) => l.filter((item) => item !== location))}
                    className="ml-2 text-white hover:bg-green-600 rounded-full p-0.5 transition-colors"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <Select onValueChange={(newLocation) => !locations.includes(newLocation) && setLocations((l) => [...l, newLocation])}>
              <SelectTrigger className="w-full bg-brand-bg-input border-brand-border focus:border-black focus:ring-2 focus:ring-black/20">
                <SelectValue placeholder="Add a preferred work location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Remote">Remote (Work from anywhere)</SelectItem>
                <SelectItem value="Hybrid">Hybrid (Remote + Office)</SelectItem>
                <SelectItem value="New York">New York, NY</SelectItem>
                <SelectItem value="San Francisco">San Francisco, CA</SelectItem>
                <SelectItem value="Los Angeles">Los Angeles, CA</SelectItem>
                <SelectItem value="Chicago">Chicago, IL</SelectItem>
                <SelectItem value="Austin">Austin, TX</SelectItem>
                <SelectItem value="Seattle">Seattle, WA</SelectItem>
                <SelectItem value="Boston">Boston, MA</SelectItem>
                <SelectItem value="Mumbai">Mumbai, India</SelectItem>
                <SelectItem value="Bangalore">Bangalore, India</SelectItem>
                <SelectItem value="Delhi">Delhi, India</SelectItem>
                <SelectItem value="London">London, UK</SelectItem>
                <SelectItem value="Berlin">Berlin, Germany</SelectItem>
                <SelectItem value="Toronto">Toronto, Canada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Company Size Preferences */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <BuildingIcon className="h-5 w-5 text-black" />
              <Label className="text-base font-semibold text-brand-text-dark">
                What company sizes appeal to you?
              </Label>
            </div>
            <p className="text-sm text-brand-text-medium">
              Different company sizes offer different experiences. Select your preference for each type.
            </p>
            <div className="space-y-4">
              {companySizes.map((size) => (
                <div key={size.id} className="flex items-center justify-between p-4 border border-brand-border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-brand-text-dark">{size.name}</div>
                    <div className="text-sm text-brand-text-medium">{size.desc}</div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {["Interested", "Maybe", "Not for me"].map((preference) => (
                      <button
                        key={preference}
                        type="button"
                        onClick={() => setCompanySizePrefs((prev) => ({ ...prev, [size.id]: preference }))}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                          companySizePrefs[size.id] === preference
                            ? preference === "Interested"
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : preference === "Maybe"
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                              : "bg-red-100 text-red-700 border border-red-300"
                            : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200",
                        )}
                      >
                        {preference}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-900 text-white py-3 font-medium text-base rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              asChild
            >
              <Link href="/onboarding/culture">Continue to Culture Fit →</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
