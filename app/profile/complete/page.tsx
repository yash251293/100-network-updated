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
      return (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-4 text-xl text-muted-foreground">Loading profile...</p>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Personal Details
                </h2>
                <p className="text-lg text-muted-foreground">Let's start with the essentials about you</p>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
                    <AvatarImage src={profileData.profilePicture || "/placeholder.svg"} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-100 to-purple-100">
                      <Camera className="h-12 w-12 text-blue-500" />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 h-10 w-10 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Upload className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-base font-semibold">
                  Professional Bio
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Share your professional story, passions, and what drives you..."
                  value={profileData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  rows={5}
                  className="resize-none border-2 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base font-semibold">
                    Location
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                    <Input
                      id="location"
                      placeholder="San Francisco, CA"
                      value={profileData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className="pl-11 border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-base font-semibold">
                    Website
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                    <Input
                      id="website"
                      placeholder="https://yourportfolio.com"
                      value={profileData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      className="pl-11 border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-semibold">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="border-2 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Skills & Expertise
                </h2>
                <p className="text-lg text-muted-foreground">Showcase the talents that make you unique</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold">Add Your Skills</Label>
                <div className="flex space-x-3">
                  <Input
                    placeholder="e.g., JavaScript, Leadership, Data Analysis"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    className="border-2 focus:border-purple-500 transition-colors"
                  />
                  <Button
                    onClick={addSkill}
                    type="button"
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-6"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="min-h-[200px] p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gradient-to-br from-purple-50/50 to-pink-50/50">
                {profileData.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {profileData.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 shadow-lg"
                      >
                        {skill}
                        <X
                          className="h-4 w-4 cursor-pointer hover:bg-white/20 rounded-full p-0.5"
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Sparkles className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                    <p className="text-lg font-medium text-purple-600 mb-2">No skills added yet</p>
                    <p className="text-muted-foreground">
                      Add skills to showcase your expertise and attract the right opportunities
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  Professional Experience
                </h2>
                <p className="text-lg text-muted-foreground">Share your career journey and achievements</p>
              </div>
            </div>

            <div className="space-y-8">
              {profileData.experience.map((exp, index) => (
                <Card
                  key={index}
                  className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                        <Briefcase className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-xl">Experience {index + 1}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Job Title</Label>
                        <Input
                          placeholder="Senior Software Engineer"
                          value={exp.title}
                          onChange={(e) => handleArrayChange("experience", index, "title", e.target.value)}
                          className="border-2 focus:border-emerald-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Company</Label>
                        <Input
                          placeholder="Google Inc."
                          value={exp.company}
                          onChange={(e) => handleArrayChange("experience", index, "company", e.target.value)}
                          className="border-2 focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Location</Label>
                      <Input
                        placeholder="San Francisco, CA"
                        value={exp.location}
                        onChange={(e) => handleArrayChange("experience", index, "location", e.target.value)}
                        className="border-2 focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Start Date</Label>
                        <Input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => handleArrayChange("experience", index, "startDate", e.target.value)}
                          className="border-2 focus:border-emerald-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">End Date</Label>
                        <Input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) => handleArrayChange("experience", index, "endDate", e.target.value)}
                          disabled={exp.current}
                          className="border-2 focus:border-emerald-500 transition-colors disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={`current-${index}`}
                        checked={exp.current}
                        onChange={(e) => handleArrayChange("experience", index, "current", e.target.checked)}
                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <Label htmlFor={`current-${index}`} className="text-base font-medium">
                        I currently work here
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Description</Label>
                      <Textarea
                        placeholder="Describe your role, responsibilities, and key achievements..."
                        value={exp.description}
                        onChange={(e) => handleArrayChange("experience", index, "description", e.target.value)}
                        rows={4}
                        className="resize-none border-2 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                onClick={addExperience}
                variant="outline"
                className="w-full py-6 border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Another Experience
              </Button>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full mb-4">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  Educational Background
                </h2>
                <p className="text-lg text-muted-foreground">Highlight your academic achievements</p>
              </div>
            </div>

            <div className="space-y-8">
              {profileData.education.map((edu, index) => (
                <Card
                  key={index}
                  className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-xl">Education {index + 1}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">School/University</Label>
                      <Input
                        placeholder="Stanford University"
                        value={edu.school}
                        onChange={(e) => handleArrayChange("education", index, "school", e.target.value)}
                        className="border-2 focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Degree</Label>
                        <Input
                          placeholder="Bachelor of Science"
                          value={edu.degree}
                          onChange={(e) => handleArrayChange("education", index, "degree", e.target.value)}
                          className="border-2 focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Field of Study</Label>
                        <Input
                          placeholder="Computer Science"
                          value={edu.field}
                          onChange={(e) => handleArrayChange("education", index, "field", e.target.value)}
                          className="border-2 focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Start Date</Label>
                        <Input
                          type="month"
                          value={edu.startDate}
                          onChange={(e) => handleArrayChange("education", index, "startDate", e.target.value)}
                          className="border-2 focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">End Date</Label>
                        <Input
                          type="month"
                          value={edu.endDate}
                          onChange={(e) => handleArrayChange("education", index, "endDate", e.target.value)}
                          disabled={edu.current}
                          className="border-2 focus:border-indigo-500 transition-colors disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={`current-edu-${index}`}
                        checked={edu.current}
                        onChange={(e) => handleArrayChange("education", index, "current", e.target.checked)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <Label htmlFor={`current-edu-${index}`} className="text-base font-medium">
                        I currently study here
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                onClick={addEducation}
                variant="outline"
                className="w-full py-6 border-2 border-dashed border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Another Education
              </Button>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-4">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                  Career Preferences
                </h2>
                <p className="text-lg text-muted-foreground">Define your ideal career opportunities</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Job Type</Label>
                  <Select value={profileData.jobType} onValueChange={(value) => handleInputChange("jobType", value)}>
                    <SelectTrigger className="border-2 focus:border-amber-500 transition-colors">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">Experience Level</Label>
                  <Select
                    value={profileData.experienceLevel}
                    onValueChange={(value) => handleInputChange("experienceLevel", value)}
                  >
                    <SelectTrigger className="border-2 focus:border-amber-500 transition-colors">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="lead">Lead/Principal</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Remote Work Preference</Label>
                <Select
                  value={profileData.remoteWork}
                  onValueChange={(value) => handleInputChange("remoteWork", value)}
                >
                  <SelectTrigger className="border-2 focus:border-amber-500 transition-colors">
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

              <div className="space-y-4">
                <Label className="text-base font-semibold">Industries of Interest</Label>
                <div className="flex space-x-3">
                  <Input
                    placeholder="e.g., Technology, Healthcare, Finance"
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addIndustry()}
                    className="border-2 focus:border-amber-500 transition-colors"
                  />
                  <Button
                    onClick={addIndustry}
                    type="button"
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-6"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                <div className="min-h-[120px] p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gradient-to-br from-amber-50/50 to-orange-50/50">
                  {profileData.industries.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {profileData.industries.map((industry, index) => (
                        <Badge
                          key={index}
                          className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-lg"
                        >
                          {industry}
                          <X
                            className="h-4 w-4 cursor-pointer hover:bg-white/20 rounded-full p-0.5"
                            onClick={() => removeIndustry(industry)}
                          />
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Crown className="h-10 w-10 text-amber-300 mx-auto mb-3" />
                      <p className="text-base font-medium text-amber-600 mb-1">No industries selected</p>
                      <p className="text-sm text-muted-foreground">
                        Add industries to help us match you with relevant opportunities
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

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
            <div>Initial content commented out for debugging.</div>
            {/* {renderStep()} */}

            {/* Enhanced Navigation Buttons */}
            {/* <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
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
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
