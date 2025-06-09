"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  PlusIcon, 
  XIcon, 
  BriefcaseIcon, 
  GraduationCapIcon, 
  StarIcon, 
  UserIcon,
  CalendarIcon,
  BuildingIcon,
  AwardIcon,
  LinkIcon
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ExperienceEntry {
  id: string
  title: string
  company: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

interface EducationEntry {
  id: string
  degree: string
  school: string
  location: string
  startDate: string
  endDate: string
  gpa: string
  description: string
}

export default function CompleteProfilePage() {
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([
    {
      id: "1",
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: ""
    }
  ])

  const [education, setEducation] = useState<EducationEntry[]>([
    {
      id: "1",
      degree: "",
      school: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: "",
      description: ""
    }
  ])

  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [professionalSummary, setProfessionalSummary] = useState("")

  const addExperience = () => {
    const newExp: ExperienceEntry = {
      id: Date.now().toString(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: ""
    }
    setExperiences([...experiences, newExp])
  }

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id))
  }

  const updateExperience = (id: string, field: keyof ExperienceEntry, value: string | boolean) => {
    setExperiences(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ))
  }

  const addEducation = () => {
    const newEdu: EducationEntry = {
      id: Date.now().toString(),
      degree: "",
      school: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: "",
      description: ""
    }
    setEducation([...education, newEdu])
  }

  const removeEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id))
  }

  const updateEducation = (id: string, field: keyof EducationEntry, value: string) => {
    setEducation(education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ))
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill))
  }

  return (
    <div className="min-h-screen bg-brand-bg-light-gray py-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-blue-light rounded-2xl shadow-lg mb-4">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-brand-text-dark mb-3">Complete Your Professional Profile</h1>
          <p className="text-brand-text-medium leading-relaxed">
            Add detailed information about your experience, education, and skills to create a compelling profile that stands out to employers.
          </p>
        </div>

        <form className="space-y-12">
          {/* Professional Summary */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <UserIcon className="h-6 w-6 text-brand-blue" />
              <h2 className="text-2xl font-semibold text-brand-text-dark">Professional Summary</h2>
            </div>
            
            <div>
              <Label htmlFor="summary" className="block text-base font-semibold text-brand-text-dark mb-3">
                Write a compelling professional summary <span className="text-brand-red">*</span>
              </Label>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                <p className="text-sm text-blue-700">
                  <strong>💡 Pro Tip:</strong> Write 3-4 sentences that highlight your key strengths, experience, and what makes you unique. 
                  This is often the first thing recruiters read!
                </p>
              </div>
              <Textarea
                id="summary"
                value={professionalSummary}
                onChange={(e) => setProfessionalSummary(e.target.value)}
                placeholder="e.g., Experienced software engineer with 5+ years developing scalable web applications. Passionate about clean code, team collaboration, and solving complex problems. Proven track record of delivering high-quality products that drive business growth..."
                maxLength={500}
                className="bg-brand-bg-input border-brand-border min-h-[120px] focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
              />
              <div className="flex justify-between items-center text-xs mt-2">
                <p className="text-brand-text-medium">Make it personal and specific to your expertise</p>
                <p className={cn(
                  "font-medium",
                  professionalSummary.length > 450 ? "text-amber-600" : "text-brand-text-light"
                )}>
                  {professionalSummary.length} / 500
                </p>
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div className="space-y-6 border-t border-brand-border pt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BriefcaseIcon className="h-6 w-6 text-brand-blue" />
                <h2 className="text-2xl font-semibold text-brand-text-dark">Work Experience</h2>
              </div>
              <Button
                type="button"
                onClick={addExperience}
                className="bg-brand-blue hover:bg-brand-blue-light text-white font-medium"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </div>

            {experiences.map((exp, index) => (
              <div key={exp.id} className="p-6 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-brand-text-dark">Experience {index + 1}</h3>
                  {experiences.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeExperience(exp.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <XIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-brand-text-medium mb-2">
                      Job Title <span className="text-brand-red">*</span>
                    </Label>
                    <Input
                      value={exp.title}
                      onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                      className="bg-white border-brand-border focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-brand-text-medium mb-2">
                      Company <span className="text-brand-red">*</span>
                    </Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                      placeholder="e.g. TechCorp Inc."
                      className="bg-white border-brand-border focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-brand-text-medium mb-2">Location</Label>
                    <Input
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      className="bg-white border-brand-border focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-brand-text-medium mb-2">Start Date</Label>
                    <Input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                      className="bg-white border-brand-border focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`current-${exp.id}`}
                      checked={exp.current}
                      onCheckedChange={(checked) => updateExperience(exp.id, "current", checked as boolean)}
                    />
                    <Label htmlFor={`current-${exp.id}`} className="text-sm font-medium text-brand-text-medium">
                      I currently work here
                    </Label>
                  </div>
                  {!exp.current && (
                    <div className="flex-1 max-w-xs">
                      <Label className="block text-sm font-medium text-brand-text-medium mb-2">End Date</Label>
                      <Input
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                        className="bg-white border-brand-border focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label className="block text-sm font-medium text-brand-text-medium mb-2">
                    Description
                  </Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                    placeholder="Describe your key responsibilities, achievements, and impact. Use bullet points and quantify results when possible."
                    className="bg-white border-brand-border min-h-[100px] focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="space-y-6 border-t border-brand-border pt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GraduationCapIcon className="h-6 w-6 text-brand-blue" />
                <h2 className="text-2xl font-semibold text-brand-text-dark">Education</h2>
              </div>
              <Button
                type="button"
                onClick={addEducation}
                className="bg-brand-blue hover:bg-brand-blue-light text-white font-medium"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Education
              </Button>
            </div>

            {education.map((edu, index) => (
              <div key={edu.id} className="p-6 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-brand-text-dark">Education {index + 1}</h3>
                  {education.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEducation(edu.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <XIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-brand-text-medium mb-2">
                      Degree <span className="text-brand-red">*</span>
                    </Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                      placeholder="e.g. Bachelor of Science in Computer Science"
                      className="bg-white border-brand-border focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-brand-text-medium mb-2">
                      School <span className="text-brand-red">*</span>
                    </Label>
                    <Input
                      value={edu.school}
                      onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                      placeholder="e.g. Stanford University"
                      className="bg-white border-brand-border focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-brand-text-medium mb-2">Location</Label>
                    <Input
                      value={edu.location}
                      onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
                      placeholder="e.g. Stanford, CA"
                      className="bg-white border-brand-border focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-brand-text-medium mb-2">GPA (Optional)</Label>
                    <Input
                      value={edu.gpa}
                      onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                      placeholder="e.g. 3.8/4.0"
                      className="bg-white border-brand-border focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-brand-text-medium mb-2">Start Date</Label>
                    <Input
                      type="month"
                      value={edu.startDate}
                      onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                      className="bg-white border-brand-border focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-brand-text-medium mb-2">End Date</Label>
                    <Input
                      type="month"
                      value={edu.endDate}
                      onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                      className="bg-white border-brand-border focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium text-brand-text-medium mb-2">
                    Additional Details (Optional)
                  </Label>
                  <Textarea
                    value={edu.description}
                    onChange={(e) => updateEducation(edu.id, "description", e.target.value)}
                    placeholder="Relevant coursework, honors, activities, or achievements"
                    className="bg-white border-brand-border min-h-[80px] focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="space-y-6 border-t border-brand-border pt-8">
            <div className="flex items-center space-x-2 mb-6">
              <StarIcon className="h-6 w-6 text-brand-blue" />
              <h2 className="text-2xl font-semibold text-brand-text-dark">Skills & Technologies</h2>
            </div>

            <div>
              <Label className="block text-base font-semibold text-brand-text-dark mb-3">
                Add your key skills and technologies
              </Label>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
                <p className="text-sm text-amber-700">
                  <strong>💼 Tip:</strong> Include both technical skills (programming languages, tools) and soft skills (leadership, communication). 
                  Focus on skills relevant to your target roles.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center bg-brand-blue text-white text-sm font-medium px-3 py-1.5 rounded-full"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-white hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex space-x-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Type a skill and press Enter"
                  className="bg-brand-bg-input border-brand-border focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                />
                <Button
                  type="button"
                  onClick={addSkill}
                  className="bg-brand-blue hover:bg-brand-blue-light text-white font-medium"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-8 border-t border-brand-border">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                className="flex-1 bg-brand-blue hover:bg-brand-blue-light text-white py-3 font-medium text-base rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Save Complete Profile
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-brand-border text-brand-text-medium hover:bg-brand-bg-light-gray font-medium"
                asChild
              >
                <Link href="/dashboard">Save for Later</Link>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 