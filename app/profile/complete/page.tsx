"use client"
import { useState, useEffect } from "react" // Added useEffect
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Upload,
  MapPin,
  Globe,
  Plus,
  X,
  Briefcase,
  GraduationCap,
  ArrowRight,
  Camera,
  Star,
  Sparkles,
  Crown,
} from "lucide-react"

export default function CompleteProfilePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false) // For form submission
  const [isFetchingProfile, setIsFetchingProfile] = useState(true); // For initial data fetch

  const [profileData, setProfileData] = useState({
    // Basic Info
    profilePicture: "",
    bio: "",
    location: "",
    website: "",
    phone: "",

    // Skills
    skills: [] as string[],

    // Experience
    experience: [
      {
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ],

    // Education
    education: [
      {
        school: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        current: false,
      },
    ],

    // Preferences
    jobType: "",
    experienceLevel: "",
    industries: [] as string[],
    remoteWork: "",
  })

  const [newSkill, setNewSkill] = useState("")
  const [newIndustry, setNewIndustry] = useState("")

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsFetchingProfile(true);
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const fetched = await response.json();
          setProfileData(prev => ({
            ...prev,
            profilePicture: fetched.avatar_url || "",
            bio: fetched.bio || "",
            location: fetched.location || "",
            website: fetched.website_url || "",
            // phone: fetched.phone || "", // Assuming phone might be added to profiles table later
            skills: fetched.skills ? fetched.skills.map((s: any) => s.name) : [],
            experience: fetched.experience && fetched.experience.length > 0 ? fetched.experience : [{ title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" }],
            education: fetched.education && fetched.education.length > 0 ? fetched.education : [{ school: "", degree: "", field: "", startDate: "", endDate: "", current: false }],
            // jobType, experienceLevel, industries, remoteWork are not fetched by current GET API
            // but if they were, they'd be set here too e.g. jobType: fetched.job_type || ""
          }));
        } else {
          console.error("Failed to fetch profile data:", response.statusText);
          // Optionally, set an error state here to show a message to the user
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        // Optionally, set an error state here
      } finally {
        setIsFetchingProfile(false);
      }
    };

    fetchProfileData();
  }, []); // Empty dependency array to run once on mount

  const totalSteps = 5

  const handleInputChange = (field: string, value: any) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleArrayChange = (field: string, index: number, subField: string, value: any) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].map((item: any, i: number) =>
        i === index ? { ...item, [subField]: value } : item,
      ),
    }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const addIndustry = () => {
    if (newIndustry.trim() && !profileData.industries.includes(newIndustry.trim())) {
      setProfileData((prev) => ({
        ...prev,
        industries: [...prev.industries, newIndustry.trim()],
      }))
      setNewIndustry("")
    }
  }

  const removeIndustry = (industryToRemove: string) => {
    setProfileData((prev) => ({
      ...prev,
      industries: prev.industries.filter((industry) => industry !== industryToRemove),
    }))
  }

  const addExperience = () => {
    setProfileData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          title: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        },
      ],
    }))
  }

  const addEducation = () => {
    setProfileData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          school: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
          current: false,
        },
      ],
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData), // profileData is already in component's state
      });

      if (response.ok) {
        // const result = await response.json(); // Optional: if backend sends data
        alert('Profile updated successfully!'); // Or use a toast notification
        router.push("/profile");
      } else {
        const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty obj
        console.error("Failed to update profile:", errorData);
        alert(`Failed to update profile: ${errorData.message || errorData.error || response.statusText}`);
      }
    } catch (error: any) { // Added : any for error.message
      console.error("Error submitting profile:", error);
      alert(`An unexpected error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const stepTitles = [
    { title: "Personal Details", subtitle: "Tell us about yourself", icon: Star },
    { title: "Skills & Expertise", subtitle: "Showcase your talents", icon: Sparkles },
    { title: "Professional Experience", subtitle: "Your career journey", icon: Briefcase },
    { title: "Educational Background", subtitle: "Your academic achievements", icon: GraduationCap },
    { title: "Career Preferences", subtitle: "Your ideal opportunities", icon: Crown },
  ]

  const renderStep = () => {
    if (isFetchingProfile) {
      return <div className="p-8">Loading profile data... (Simplified)</div>;
    }
    switch (currentStep) {
      case 1: return <div className="p-8">Step 1: Personal Details Placeholder (Simplified)</div>;
      case 2: return <div className="p-8">Step 2: Skills & Expertise Placeholder (Simplified)</div>;
      case 3: return <div className="p-8">Step 3: Professional Experience Placeholder (Simplified)</div>;
      case 4: return <div className="p-8">Step 4: Educational Background Placeholder (Simplified)</div>;
      case 5: return <div className="p-8">Step 5: Career Preferences Placeholder (Simplified)</div>;
      default: return <div className="p-8">Invalid Step (Simplified)</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/100N%20logo-hXZbA69LLfyoIxuGBxaKL2lq5TY9q7.png"
              alt="100N"
              className="h-12 w-auto filter brightness-0 invert"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Complete Your Profile
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create a compelling professional profile that showcases your unique talents and attracts the right
            opportunities
          </p>
        </div>

        {/* Progress Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold">
                Step {currentStep} of {totalSteps}
              </span>
              <div className="flex items-center space-x-2">
                {stepTitles[currentStep - 1].icon &&
                  (() => {
                    const IconComponent = stepTitles[currentStep - 1].icon
                    return <IconComponent className="h-5 w-5 text-blue-600" />
                  })()}
                <span className="text-base text-muted-foreground">{stepTitles[currentStep - 1].title}</span>
              </div>
            </div>
            <span className="text-lg font-medium text-blue-600">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {stepTitles.map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      index + 1 <= currentStep
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 text-center max-w-20">
                    {step.title.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 md:p-12">
            {renderStep()}

            {/* Enhanced Navigation Buttons */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || isLoading}
                className="px-8 py-3 border-2 hover:bg-gray-50 disabled:opacity-50 transition-all duration-300"
              >
                Previous
              </Button>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-muted-foreground">
                  {currentStep === totalSteps ? "Ready to launch your profile?" : "Continue to next step"}
                </div>
                <Button
                  onClick={nextStep}
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : currentStep === totalSteps ? (
                    <div className="flex items-center space-x-2">
                      <Crown className="h-4 w-4" />
                      <span>Complete Profile</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Next</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
