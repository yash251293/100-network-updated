"use client"
import { toast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Upload, MapPin, Globe, Plus, X, Briefcase, GraduationCap, ArrowRight, Camera,
  Star, Sparkles, Crown, DollarSign, FileText, Trash2
} from "lucide-react"
import { getToken } from "@/lib/authClient";

interface ExperienceEntry {
  id?: string | number;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface EducationEntry {
  id?: string | number;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description?: string;
}

interface UserProfileFormData {
  firstName: string; // From API: firstName (used for Avatar fallback)
  lastName: string;  // From API: lastName (used for Avatar fallback)
  profilePicture: string;
  bio: string;
  location: string;
  website: string;
  phone: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  industries: string[];
  jobType: string;
  experienceLevel: string;
  remoteWork: string;

  isAvailableForFreelance: boolean;
  freelanceHeadline: string;
  freelanceBio: string;
  portfolioUrl: string;
  preferredFreelanceRateType: string;
  freelanceRateValue: string;
}

function formatDateToYearMonth(dateString: string | null | Date): string | null {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  } catch (e) { return null; }
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  const initialProfileData: UserProfileFormData = {
    firstName: "",
    lastName: "",
    profilePicture: "",
    bio: "",
    location: "",
    website: "",
    phone: "",
    skills: [],
    experience: [{ title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" }],
    education: [{ school: "", degree: "", field: "", startDate: "", endDate: "", current: false, description: "" }],
    industries: [],
    jobType: "",
    experienceLevel: "",
    remoteWork: "",
    isAvailableForFreelance: false,
    freelanceHeadline: "",
    freelanceBio: "",
    portfolioUrl: "",
    preferredFreelanceRateType: "",
    freelanceRateValue: "",
  };
  const [profileData, setProfileData] = useState<UserProfileFormData>(initialProfileData);

  const [newSkill, setNewSkill] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const handleImageUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicturePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setProfilePicturePreview(null);
      setSelectedImageFile(null);
    }
  };

  useEffect(() => {
    let isActive = true;
    const fetchProfileData = async () => {
      if (isActive) setIsFetchingProfile(true);
      try {
        const token = getToken();
        const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch('/api/profile', { headers });

        if (!isActive) return;
        if (response.ok) {
          const fetched = await response.json();
          if (!isActive) return;

          setProfileData(prev => {
            if (!isActive) return prev;
            const getSafeArray = (fetchedArr: any, defaultArr: any[] = []) => Array.isArray(fetchedArr) ? fetchedArr : defaultArr;

            const processedExperience = (Array.isArray(fetched.experience) && fetched.experience.length > 0)
              ? fetched.experience.map((exp: any) => ({
                  id: exp.id,
                  title: exp.title || "",
                  company: exp.company_name || exp.company || "",
                  location: exp.location || "",
                  description: exp.description || "",
                  startDate: formatDateToYearMonth(exp.startDate) || "",
                  endDate: formatDateToYearMonth(exp.endDate) || "",
                  current: exp.currentJob || exp.current || false,
                }))
              : [{ title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" }];

            const processedEducation = (Array.isArray(fetched.education) && fetched.education.length > 0)
              ? fetched.education.map((edu: any) => ({
                  id: edu.id,
                  school: edu.school_name || edu.schoolName || "",
                  degree: edu.degree || "",
                  field: edu.field_of_study || edu.fieldOfStudy || "",
                  startDate: formatDateToYearMonth(edu.startDate) || "",
                  endDate: formatDateToYearMonth(edu.endDate) || "",
                  current: edu.currentStudent || edu.current || false,
                  description: edu.description || "",
                }))
              : [{ school: "", degree: "", field: "", startDate: "", endDate: "", current: false, description: "" }];

            const industriesArray = fetched.preferredIndustries
              ? (typeof fetched.preferredIndustries === 'string' ? JSON.parse(fetched.preferredIndustries) : fetched.preferredIndustries)
              : [];

            const newData: UserProfileFormData = {
              ...initialProfileData, // Start with defaults for all fields
              ...prev, // Spread previous state to keep any unchanged parts
              firstName: fetched.first_name || prev.firstName || "", // API uses first_name
              lastName: fetched.last_name || prev.lastName || "",   // API uses last_name
              profilePicture: fetched.avatarUrl || prev.profilePicture || "",
              bio: fetched.bio || prev.bio || "",
              location: fetched.location || prev.location || "",
              website: fetched.websiteUrl || prev.website || "",
              phone: fetched.phone || prev.phone || "",
              skills: getSafeArray(fetched.skills?.map((s: any) => typeof s === 'object' ? s.name : s), prev.skills),
              experience: processedExperience,
              education: processedEducation,
              industries: getSafeArray(industriesArray, prev.industries),
              jobType: fetched.jobType || prev.jobType || "",
              experienceLevel: fetched.experienceLevel || prev.experienceLevel || "",
              remoteWork: fetched.remoteWorkPreference || prev.remoteWork || "",
              isAvailableForFreelance: fetched.isAvailableForFreelance || false,
              freelanceHeadline: fetched.freelanceHeadline || "",
              freelanceBio: fetched.freelanceBio || "",
              portfolioUrl: fetched.portfolioUrl || "",
              preferredFreelanceRateType: fetched.preferredFreelanceRateType || "",
              freelanceRateValue: fetched.freelanceRateValue?.toString() || "",
            };
            setProfilePicturePreview(fetched.avatarUrl || null);
            return newData;
          });
        } else {
          setProfileData(initialProfileData);
        }
      } catch (error) {
        if (!isActive) return;
        setProfileData(initialProfileData);
      } finally {
        if (isActive) setIsFetchingProfile(false);
      }
    };
    fetchProfileData();
    return () => { isActive = false; };
  }, []);

  const totalSteps = 6;

  const handleInputChange = (field: keyof UserProfileFormData, value: any, type?: string) => {
    if (type === 'checkbox') {
      setProfileData(prev => ({ ...prev, [field]: (value as unknown as React.ChangeEvent<HTMLInputElement>).target.checked }));
    } else {
      setProfileData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSelectChange = (field: keyof UserProfileFormData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: "experience" | "education", index: number, subField: string, value: any, type?: string) => {
    setProfileData(prev => {
      const currentArray = prev[field] as any[];
      return {
        ...prev,
        [field]: currentArray.map((item, i) =>
          i === index ? { ...item, [subField]: type === 'checkbox' ? (value as React.ChangeEvent<HTMLInputElement>).target.checked : value } : item
        ),
      };
    });
  };

  const addSkill = () => { if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) { setProfileData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] })); setNewSkill(""); } };
  const removeSkill = (skillToRemove: string) => setProfileData(prev => ({ ...prev, skills: prev.skills.filter(skill => skill !== skillToRemove) }));
  const addIndustry = () => { if (newIndustry.trim() && !profileData.industries.includes(newIndustry.trim())) { setProfileData(prev => ({ ...prev, industries: [...prev.industries, newIndustry.trim()] })); setNewIndustry(""); } };
  const removeIndustry = (industryToRemove: string) => setProfileData(prev => ({ ...prev, industries: prev.industries.filter(ind => ind !== industryToRemove) }));

  const addArrayItem = (field: "experience" | "education") => {
    const newItem = field === "experience"
      ? { id: Date.now(), title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" }
      : { id: Date.now(), school: "", degree: "", field: "", startDate: "", endDate: "", current: false, description: "" };
    setProfileData(prev => ({ ...prev, [field]: [...(prev[field] as any[]), newItem] }));
  };

  const removeArrayItem = (field: "experience" | "education", index: number) => {
    setProfileData(prev => ({ ...prev, [field]: (prev[field] as any[]).filter((_, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) { toast({ variant: "destructive", title: "Authentication Error" }); setIsLoading(false); return; }

      let finalApiProfileData: any = { ...profileData };
      if (selectedImageFile) {
        const formDataForImage = new FormData();
        formDataForImage.append('avatar', selectedImageFile);
        const uploadResponse = await fetch('/api/upload-avatar', { method: 'POST', body: formDataForImage, headers: { 'Authorization': `Bearer ${token}` }}); // Add Auth to upload
        if (uploadResponse.ok) {
          finalApiProfileData.avatarUrl = (await uploadResponse.json()).url;
        } else {
          toast({ variant: "destructive", title: "Image Upload Failed" }); setIsLoading(false); return;
        }
      } else {
        finalApiProfileData.avatarUrl = profileData.profilePicture;
      }
      delete finalApiProfileData.profilePicture;

      finalApiProfileData.freelanceRateValue = finalApiProfileData.freelanceRateValue ? parseFloat(finalApiProfileData.freelanceRateValue) : null;
      if (isNaN(finalApiProfileData.freelanceRateValue)) finalApiProfileData.freelanceRateValue = null;

      finalApiProfileData.preferredIndustries = JSON.stringify(profileData.industries);
      finalApiProfileData.websiteUrl = profileData.website;
      delete finalApiProfileData.website;
      finalApiProfileData.remoteWorkPreference = profileData.remoteWork;
      delete finalApiProfileData.remoteWork;

      // Map experience and education items to match API expected field names (e.g. companyName)
      finalApiProfileData.experience = profileData.experience.map(exp => ({ ...exp, companyName: exp.company, currentJob: exp.current }));
      finalApiProfileData.education = profileData.education.map(edu => ({ ...edu, schoolName: edu.school, fieldOfStudy: edu.field, currentStudent: edu.current }));


      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(finalApiProfileData),
      });

      if (response.ok) {
        toast({ title: "Profile Updated" });
        router.push("/profile");
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({ variant: "destructive", title: "Update Failed", description: errorData.message || errorData.error });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsLoading(false);
      setSelectedImageFile(null);
    }
  };

  const nextStep = () => currentStep < totalSteps ? setCurrentStep(currentStep + 1) : handleSubmit();
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const stepTitles = [
    { title: "Personal Details", subtitle: "Tell us about yourself", icon: Star },
    { title: "Skills & Expertise", subtitle: "Showcase your talents", icon: Sparkles },
    { title: "Professional Experience", subtitle: "Your career journey", icon: Briefcase },
    { title: "Educational Background", subtitle: "Your academic achievements", icon: GraduationCap },
    { title: "Freelancer Profile", subtitle: "Your freelance service details", icon: DollarSign },
    { title: "Career Preferences", subtitle: "Your ideal opportunities", icon: Crown },
  ];

  const renderFormStep = () => {
    if (isFetchingProfile) {
      return <div className="flex justify-center items-center min-h-[300px]"><div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div><p className="ml-4 text-xl text-muted-foreground">Loading profile...</p></div>;
    }
    switch (currentStep) {
      case 1: // Personal Details
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div><h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Personal Details</h2><p className="text-lg text-muted-foreground">Tell us about yourself.</p></div>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <Label htmlFor="profilePictureUploadInput" className="text-base font-semibold">Profile Picture</Label>
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={profilePicturePreview || profileData.profilePicture || undefined} alt="Profile Preview" />
                <AvatarFallback className="text-3xl">
                  {(profileData.firstName?.[0] || '').toUpperCase()}
                  {(profileData.lastName?.[0] || '').toUpperCase()}
                  {!profileData.firstName && !profileData.lastName && <Camera className="h-10 w-10 text-gray-400" />}
                </AvatarFallback>
              </Avatar>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" style={{ display: 'none' }} id="profilePictureUploadInput" />
              <Button type="button" variant="outline" onClick={handleImageUploadClick}><Upload className="mr-2 h-4 w-4" /> Change Picture</Button>
              {selectedImageFile && <p className="text-sm text-muted-foreground">New image: {selectedImageFile.name}</p>}
            </div>
            <div className="space-y-6 pt-4">
              <div><Label htmlFor="bio" className="text-base font-semibold">Professional Bio</Label><Textarea id="bio" name="bio" value={profileData.bio} onChange={(e) => handleInputChange("bio", e.target.value)} placeholder="Share a brief summary..." rows={5} className="border-2 focus:border-blue-500"/></div>
              <div><Label htmlFor="location" className="text-base font-semibold">Location</Label><Input id="location" name="location" value={profileData.location} onChange={(e) => handleInputChange("location", e.target.value)} placeholder="e.g., San Francisco, CA" className="border-2 focus:border-blue-500"/></div>
              <div><Label htmlFor="website" className="text-base font-semibold">Website/Portfolio</Label><Input id="website" name="website" type="url" value={profileData.website} onChange={(e) => handleInputChange("website", e.target.value)} placeholder="https://yourpersonalwebsite.com" className="border-2 focus:border-blue-500"/></div>
              <div><Label htmlFor="phone" className="text-base font-semibold">Phone Number</Label><Input id="phone" name="phone" type="tel" value={profileData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} placeholder="(123) 456-7890" className="border-2 focus:border-blue-500"/></div>
            </div>
          </div>
        );
      case 2: // Skills & Expertise
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4"><div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4"><Sparkles className="h-8 w-8 text-white" /></div><div><h2 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-2">Skills & Expertise</h2><p className="text-lg text-muted-foreground">Showcase your talents.</p></div></div>
            <div className="space-y-4">
              <div><Label htmlFor="newSkill" className="text-base font-semibold">Add Skill</Label><div className="flex space-x-2 mt-1"><Input id="newSkill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="e.g., React" className="border-2 focus:border-green-500"/><Button type="button" onClick={addSkill} variant="outline" className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white"><Plus className="mr-2 h-4 w-4" /> Add</Button></div></div>
              {profileData.skills && profileData.skills.length > 0 && (<div><Label className="text-base font-semibold mb-2 block">Your Skills</Label><div className="flex flex-wrap gap-2 p-3 border-2 border-dashed rounded-md min-h-[40px]">{profileData.skills.map((skill, index) => (<Badge key={index} variant="secondary" className="text-sm py-1 px-3 bg-emerald-100 text-emerald-700 border-emerald-300">{skill}<button type="button" onClick={() => removeSkill(skill)} className="ml-2 text-emerald-700 hover:text-emerald-900" aria-label={`Remove ${skill}`}><X className="h-3 w-3" /></button></Badge>))}</div></div>)}
              {(!profileData.skills || profileData.skills.length === 0) && (<p className="text-sm text-muted-foreground text-center py-4">No skills added yet.</p>)}
            </div>
          </div>
        );
      case 3: // Professional Experience
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4"><div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full mb-4"><Briefcase className="h-8 w-8 text-white" /></div><div><h2 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent mb-2">Professional Experience</h2><p className="text-lg text-muted-foreground">Share your career journey.</p></div></div>
            {profileData.experience.map((exp, index) => (
              <Card key={index} className="border-2 shadow-sm"><CardHeader><CardTitle>Experience {index + 1}</CardTitle>{index > 0 && <Button type="button" variant="ghost" size="sm" onClick={() => removeArrayItem("experience", index)} className="float-right text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4 mr-1"/>Remove</Button>}</CardHeader><CardContent className="space-y-4">
                <div><Label htmlFor={`exp-title-${index}`}>Title</Label><Input id={`exp-title-${index}`} value={exp.title} onChange={(e) => handleArrayChange("experience", index, "title", e.target.value)} /></div>
                <div><Label htmlFor={`exp-company-${index}`}>Company</Label><Input id={`exp-company-${index}`} value={exp.company} onChange={(e) => handleArrayChange("experience", index, "company", e.target.value)} /></div>
                <div><Label htmlFor={`exp-location-${index}`}>Location</Label><Input id={`exp-location-${index}`} value={exp.location} onChange={(e) => handleArrayChange("experience", index, "location", e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4"><div><Label htmlFor={`exp-startDate-${index}`}>Start Date</Label><Input type="month" id={`exp-startDate-${index}`} value={exp.startDate} onChange={(e) => handleArrayChange("experience", index, "startDate", e.target.value)} /></div><div><Label htmlFor={`exp-endDate-${index}`}>End Date</Label><Input type="month" id={`exp-endDate-${index}`} value={exp.endDate} onChange={(e) => handleArrayChange("experience", index, "endDate", e.target.value)} disabled={exp.current} /></div></div>
                <div className="flex items-center"><Input type="checkbox" id={`exp-current-${index}`} checked={exp.current} onChange={(e) => handleArrayChange("experience", index, "current", e.target.checked, 'checkbox')} className="h-4 w-4 mr-2"/><Label htmlFor={`exp-current-${index}`}>I currently work here</Label></div>
                <div><Label htmlFor={`exp-desc-${index}`}>Description</Label><Textarea id={`exp-desc-${index}`} value={exp.description} onChange={(e) => handleArrayChange("experience", index, "description", e.target.value)} /></div>
              </CardContent></Card>
            ))}
            <Button type="button" variant="outline" onClick={() => addArrayItem("experience")} className="w-full"><Plus className="mr-2 h-4 w-4"/>Add Experience</Button>
          </div>
        );
      case 4: // Educational Background
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4"><div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4"><GraduationCap className="h-8 w-8 text-white" /></div><div><h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Educational Background</h2><p className="text-lg text-muted-foreground">Your academic achievements.</p></div></div>
            {profileData.education.map((edu, index) => (
              <Card key={index} className="border-2 shadow-sm"><CardHeader><CardTitle>Education {index + 1}</CardTitle>{index > 0 && <Button type="button" variant="ghost" size="sm" onClick={() => removeArrayItem("education", index)} className="float-right text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4 mr-1"/>Remove</Button>}</CardHeader><CardContent className="space-y-4">
                <div><Label htmlFor={`edu-school-${index}`}>School/University</Label><Input id={`edu-school-${index}`} value={edu.school} onChange={(e) => handleArrayChange("education", index, "school", e.target.value)} /></div>
                <div><Label htmlFor={`edu-degree-${index}`}>Degree</Label><Input id={`edu-degree-${index}`} value={edu.degree} onChange={(e) => handleArrayChange("education", index, "degree", e.target.value)} /></div>
                <div><Label htmlFor={`edu-field-${index}`}>Field of Study</Label><Input id={`edu-field-${index}`} value={edu.field} onChange={(e) => handleArrayChange("education", index, "field", e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4"><div><Label htmlFor={`edu-startDate-${index}`}>Start Date</Label><Input type="month" id={`edu-startDate-${index}`} value={edu.startDate} onChange={(e) => handleArrayChange("education", index, "startDate", e.target.value)} /></div><div><Label htmlFor={`edu-endDate-${index}`}>End Date</Label><Input type="month" id={`edu-endDate-${index}`} value={edu.endDate} onChange={(e) => handleArrayChange("education", index, "endDate", e.target.value)} disabled={edu.current} /></div></div>
                <div className="flex items-center"><Input type="checkbox" id={`edu-current-${index}`} checked={edu.current} onChange={(e) => handleArrayChange("education", index, "current", e.target.checked, 'checkbox')} className="h-4 w-4 mr-2"/><Label htmlFor={`edu-current-${index}`}>I currently study here</Label></div>
                <div><Label htmlFor={`edu-desc-${index}`}>Description/Activities</Label><Textarea id={`edu-desc-${index}`} value={edu.description || ''} onChange={(e) => handleArrayChange("education", index, "description", e.target.value)} /></div>
              </CardContent></Card>
            ))}
            <Button type="button" variant="outline" onClick={() => addArrayItem("education")} className="w-full"><Plus className="mr-2 h-4 w-4"/>Add Education</Button>
          </div>
        );
      case 5: // Freelancer Profile
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4"><div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full mb-4"><DollarSign className="h-8 w-8 text-white" /></div><div><h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">Freelancer Profile</h2><p className="text-lg text-muted-foreground">Detail your freelance services.</p></div></div>
            <div className="space-y-6">
              <div className="flex items-center space-x-3 p-3 border rounded-md"><Input type="checkbox" id="isAvailableForFreelance" name="isAvailableForFreelance" checked={profileData.isAvailableForFreelance} onChange={(e) => handleInputChange("isAvailableForFreelance", e, 'checkbox')} className="h-5 w-5 accent-teal-600"/><Label htmlFor="isAvailableForFreelance" className="text-base font-medium cursor-pointer">Available for Freelance</Label></div>
              {profileData.isAvailableForFreelance && (
                <>
                  <div><Label htmlFor="freelanceHeadline" className="text-base font-semibold">Freelance Headline</Label><Input id="freelanceHeadline" name="freelanceHeadline" value={profileData.freelanceHeadline} onChange={(e) => handleInputChange("freelanceHeadline", e.target.value)} placeholder="e.g., Expert Full-Stack Developer" className="border-2 focus:border-teal-500"/></div>
                  <div><Label htmlFor="freelanceBio" className="text-base font-semibold">Freelance Bio</Label><Textarea id="freelanceBio" name="freelanceBio" value={profileData.freelanceBio} onChange={(e) => handleInputChange("freelanceBio", e.target.value)} placeholder="Describe your services..." rows={4} className="resize-none border-2 focus:border-teal-500"/></div>
                  <div><Label htmlFor="portfolioUrl" className="text-base font-semibold">Portfolio URL</Label><Input id="portfolioUrl" name="portfolioUrl" type="url" value={profileData.portfolioUrl} onChange={(e) => handleInputChange("portfolioUrl", e.target.value)} placeholder="https://yourportfolio.com" className="border-2 focus:border-teal-500"/></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><Label htmlFor="preferredFreelanceRateType" className="text-base font-semibold">Rate Type</Label><Select value={profileData.preferredFreelanceRateType} onValueChange={(value) => handleSelectChange('preferredFreelanceRateType', value)}><SelectTrigger className="border-2 focus:border-teal-500"><SelectValue placeholder="Select rate type" /></SelectTrigger><SelectContent><SelectItem value="hourly">Hourly</SelectItem><SelectItem value="fixed">Fixed Project</SelectItem><SelectItem value="negotiable">Negotiable</SelectItem></SelectContent></Select></div>
                    <div><Label htmlFor="freelanceRateValue" className="text-base font-semibold">Rate (USD)</Label><Input id="freelanceRateValue" name="freelanceRateValue" type="number" step="0.01" value={profileData.freelanceRateValue} onChange={(e) => handleInputChange("freelanceRateValue", e.target.value)} placeholder="e.g., 75" className="border-2 focus:border-teal-500"/></div>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      case 6: // Career Preferences
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4"><div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-4"><Crown className="h-8 w-8 text-white" /></div><div><h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">Career Preferences</h2><p className="text-lg text-muted-foreground">Define your ideal opportunities.</p></div></div>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><Label className="text-base font-semibold">Job Type</Label><Select value={profileData.jobType} onValueChange={(value) => handleSelectChange("jobType", value)}><SelectTrigger className="border-2 focus:border-amber-500"><SelectValue placeholder="Select job type" /></SelectTrigger><SelectContent><SelectItem value="full-time">Full-time</SelectItem><SelectItem value="part-time">Part-time</SelectItem><SelectItem value="contract">Contract</SelectItem><SelectItem value="freelance">Freelance</SelectItem><SelectItem value="internship">Internship</SelectItem></SelectContent></Select></div>
                <div><Label className="text-base font-semibold">Experience Level</Label><Select value={profileData.experienceLevel} onValueChange={(value) => handleSelectChange("experienceLevel", value)}><SelectTrigger className="border-2 focus:border-amber-500"><SelectValue placeholder="Select level" /></SelectTrigger><SelectContent><SelectItem value="entry">Entry Level</SelectItem><SelectItem value="mid">Mid Level</SelectItem><SelectItem value="senior">Senior Level</SelectItem><SelectItem value="lead">Lead/Principal</SelectItem><SelectItem value="executive">Executive</SelectItem></SelectContent></Select></div>
              </div>
              <div><Label className="text-base font-semibold">Remote Work Preference</Label><Select value={profileData.remoteWork} onValueChange={(value) => handleSelectChange("remoteWork", value)}><SelectTrigger className="border-2 focus:border-amber-500"><SelectValue placeholder="Select preference" /></SelectTrigger><SelectContent><SelectItem value="remote">Remote Only</SelectItem><SelectItem value="hybrid">Hybrid</SelectItem><SelectItem value="onsite">On-site Only</SelectItem><SelectItem value="flexible">Flexible</SelectItem></SelectContent></Select></div>
              <div className="space-y-4">
                <Label className="text-base font-semibold">Industries of Interest</Label><div className="flex space-x-3"><Input placeholder="e.g., Technology, Healthcare" value={newIndustry} onChange={(e) => setNewIndustry(e.target.value)} onKeyPress={(e) => e.key === "Enter" && addIndustry()} className="border-2 focus:border-amber-500"/><Button type="button" onClick={addIndustry} variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white"><Plus className="mr-2 h-4 w-4"/>Add</Button></div>
                {profileData.industries.length > 0 && (<div className="flex flex-wrap gap-3 p-3 border-2 border-dashed rounded-md min-h-[40px]">{profileData.industries.map((industry, index) => (<Badge key={index} className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg">{industry}<X className="h-4 w-4 cursor-pointer hover:bg-white/20 rounded-full p-0.5" onClick={() => removeIndustry(industry)}/></Badge>))}</div>)}
                {profileData.industries.length === 0 && (<p className="text-sm text-muted-foreground text-center py-4">No industries added yet.</p>)}
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="relative container max-w-4xl mx-auto px-4 py-12">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 md:p-12">
            {renderFormStep()}
          </CardContent>
          <div className="px-8 md:px-12 pb-8 pt-4">
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Step {currentStep} of {totalSteps}: <span className="font-semibold text-gray-800">{stepTitles[currentStep - 1]?.title || ''}</span></p>
                <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div></div>
              </div>
              <div className="flex space-x-3 ml-6">
                {currentStep > 1 && (<Button variant="outline" onClick={prevStep} disabled={isLoading || isFetchingProfile}>Previous</Button>)}
                {currentStep < totalSteps && (<Button onClick={nextStep} disabled={isLoading || isFetchingProfile} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">Next<ArrowRight className="ml-2 h-4 w-4" /></Button>)}
                {currentStep === totalSteps && (<Button onClick={handleSubmit} disabled={isLoading || isFetchingProfile} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">{isLoading ? "Submitting..." : "Submit Profile"}</Button>)}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
