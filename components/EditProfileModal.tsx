"use client";

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getToken } from '@/lib/authClient';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { XIcon, PlusCircleIcon, EditIcon, Trash2Icon } from 'lucide-react';
import ExperienceItemModal from './ExperienceItemModal';
import EducationItemModal from './EducationItemModal';

// Adapted Zod schema for the form
const modalProfileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required.").max(100).optional().nullable(),
  lastName: z.string().min(1, "Last name is required.").max(100).optional().nullable(),
  avatarUrl: z.string().max(255).optional().nullable(),
  headline: z.string().max(255).optional().nullable(),
  bio: z.string().optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  linkedinUrl: z.preprocess((val) => (val === "" ? null : val), z.string().url({ message: "Invalid LinkedIn URL." }).optional().nullable()),
  githubUrl: z.preprocess((val) => (val === "" ? null : val), z.string().url({ message: "Invalid GitHub URL." }).optional().nullable()),
  websiteUrl: z.preprocess((val) => (val === "" ? null : val), z.string().url({ message: "Invalid website URL." }).optional().nullable()),
  phone: z.string().max(50).optional().nullable(),
  jobType: z.string().max(100).optional().nullable(),
  experienceLevel: z.string().max(100).optional().nullable(),
  remoteWorkPreference: z.string().max(100).optional().nullable(),
  preferredIndustries: z.string().optional().nullable(),
  isAvailableForFreelance: z.boolean().optional(),
  freelanceHeadline: z.string().max(255).optional().nullable(),
  freelanceBio: z.string().optional().nullable(),
  portfolioUrl: z.preprocess((val) => (val === "" ? null : val), z.string().url({ message: "Invalid portfolio URL." }).optional().nullable()),
  preferredFreelanceRateType: z.string().max(50).optional().nullable(),
  freelanceRateValue: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : parseFloat(String(val))),
    z.number().positive("Rate must be a positive number.").optional().nullable()
  ),
});

type ModalProfileFormValues = z.infer<typeof modalProfileFormSchema>;

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: any;
  onProfileUpdate: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, profileData, onProfileUpdate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editableSkills, setEditableSkills] = useState<{ name: string; proficiency_level: string; }[]>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillProficiency, setNewSkillProficiency] = useState("");
  const [editableExperience, setEditableExperience] = useState<any[]>([]);
  const [showExperienceItemModal, setShowExperienceItemModal] = useState(false);
  const [currentExperienceItem, setCurrentExperienceItem] = useState<any | null>(null);
  const [editableEducation, setEditableEducation] = useState<any[]>([]);
  const [showEducationItemModal, setShowEducationItemModal] = useState(false);
  const [currentEducationItem, setCurrentEducationItem] = useState<any | null>(null);

  const form = useForm<ModalProfileFormValues>({
    resolver: zodResolver(modalProfileFormSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (profileData && isOpen) {
      form.reset({
        firstName: profileData.first_name || "",
        lastName: profileData.last_name || "",
        avatarUrl: profileData.avatar_url || "",
        headline: profileData.headline || "",
        bio: profileData.bio || "",
        location: profileData.location || "",
        linkedinUrl: profileData.linkedin_url || "",
        githubUrl: profileData.github_url || "",
        websiteUrl: profileData.website_url || "",
        phone: profileData.phone || "",
        jobType: profileData.job_type || "",
        experienceLevel: profileData.experience_level || "",
        remoteWorkPreference: profileData.remote_work_preference || "",
        preferredIndustries: profileData.preferred_industries || "",
        isAvailableForFreelance: profileData.isAvailableForFreelance || false,
        freelanceHeadline: profileData.freelanceHeadline || "",
        freelanceBio: profileData.freelanceBio || "",
        portfolioUrl: profileData.portfolioUrl || "",
        preferredFreelanceRateType: profileData.preferredFreelanceRateType || "",
        freelanceRateValue: profileData.freelanceRateValue || null,
      });
      setEditableSkills(profileData.skills?.map((s: any) => ({ name: s.name, proficiency_level: s.proficiency_level || 'N/A' })) || []);
      setEditableExperience(profileData.experience?.map((exp: any) => ({
        id: exp.id,
        title: exp.title,
        company_name: exp.company_name || exp.company,
        employment_type: exp.employment_type || null,
        location_city: exp.location_city || null,
        location_state: exp.location_state || null,
        location_country: exp.location_country || null,
        start_date: exp.start_date,
        end_date: exp.end_date,
        current_job: exp.current_job || false,
        description: exp.description || null,
      })) || []);
      setEditableEducation(profileData.education?.map((edu: any) => ({
        id: edu.id,
        school_name: edu.school_name || edu.school,
        degree: edu.degree,
        field_of_study: edu.field_of_study || edu.field,
        start_date: edu.start_date,
        end_date: edu.end_date,
        current_student: edu.current_student || edu.current || false,
        description: edu.description,
      })) || []);
    }
  }, [profileData, isOpen, form]);

  const handleAddSkill = () => {
    if (newSkillName.trim() === "") { toast.error("Skill name cannot be empty."); return; }
    if (editableSkills.find(skill => skill.name.toLowerCase() === newSkillName.trim().toLowerCase())) { toast.error("Skill already exists."); return; }
    setEditableSkills([...editableSkills, { name: newSkillName.trim(), proficiency_level: newSkillProficiency.trim() || 'N/A' }]);
    setNewSkillName(""); setNewSkillProficiency("");
  };
  const handleRemoveSkill = (skillNameToRemove: string) => {
    setEditableSkills(editableSkills.filter(skill => skill.name !== skillNameToRemove));
  };

  const handleSaveExperienceItem = (itemData: any) => {
    if (itemData.id && (typeof itemData.id === 'number' || (typeof itemData.id === 'string' && !itemData.id.startsWith('temp-')))) {
        setEditableExperience(editableExperience.map(exp => exp.id === itemData.id ? {...itemData } : exp));
    } else {
        const existingIndex = editableExperience.findIndex(exp => exp.id === itemData.id);
        if (existingIndex > -1) {
             setEditableExperience(editableExperience.map((exp, idx) => idx === existingIndex ? {...itemData, id: exp.id} : exp ));
        } else {
             setEditableExperience([...editableExperience, { ...itemData, id: `temp-${Date.now()}` }]);
        }
    }
    setCurrentExperienceItem(null);
  };

  const handleSaveEducationItem = (itemData: any) => {
    if (itemData.id && (typeof itemData.id === 'number' || (typeof itemData.id === 'string' && !itemData.id.startsWith('temp-')))) {
        setEditableEducation(editableEducation.map(edu => edu.id === itemData.id ? {...itemData} : edu));
    } else {
        const existingIndex = editableEducation.findIndex(edu => edu.id === itemData.id);
        if (existingIndex > -1) {
             setEditableEducation(editableEducation.map((edu, idx) => idx === existingIndex ? {...itemData, id: edu.id} : edu ));
        } else {
             setEditableEducation([...editableEducation, { ...itemData, id: `temp-${Date.now()}` }]);
        }
    }
    setCurrentEducationItem(null);
  };

  const onSubmit = async (values: ModalProfileFormValues) => {
    setIsSubmitting(true);
    const token = getToken();
    if (!token) { toast.error("Authentication required."); setIsSubmitting(false); return; }

    const transformedExperience = editableExperience.map(exp => ({
      id: typeof exp.id === 'string' && exp.id.startsWith('temp-') ? undefined : exp.id,
      title: exp.title,
      company: exp.company_name,
      location: [exp.location_city, exp.location_state, exp.location_country].filter(Boolean).join(', ') || null,
      employmentType: exp.employment_type, // Ensure API schema expects/handles this or map to job_type if needed
      startDate: exp.start_date || null,
      endDate: exp.current_job ? null : (exp.end_date || null),
      current: exp.current_job || false,
      description: exp.description || null,
    }));

    const transformedEducation = editableEducation.map(edu => ({
      id: typeof edu.id === 'string' && edu.id.startsWith('temp-') ? undefined : edu.id,
      school: edu.school_name,
      degree: edu.degree,
      field: edu.field_of_study,
      startDate: edu.start_date || null,
      endDate: edu.current_student ? null : (edu.end_date || null),
      current: edu.current_student || false,
      description: edu.description || null,
    }));

    const payload = {
      ...values,
      skills: editableSkills, // Send array of objects {name, proficiency_level}
      experience: transformedExperience,
      education: transformedEducation,
    };

    // Convert empty strings in top-level payload properties to null
    (Object.keys(payload) as Array<keyof typeof payload>).forEach(key => {
      if (payload[key] === "") {
        // @ts-ignore
        payload[key] = null;
      }
    });
    if (payload.freelanceRateValue === "") payload.freelanceRateValue = null;


    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success("Profile updated successfully!");
        onProfileUpdate();
        onClose();
      } else {
        toast.error(result.message || "Failed to update profile.", { description: result.errors ? JSON.stringify(result.errors) : undefined });
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const rateTypes = ['hourly', 'fixed', 'per_project'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
        <ScrollArea className="max-h-[70vh] p-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="firstName">First Name</Label><Input id="firstName" {...form.register("firstName")} />{form.formState.errors.firstName && <p className="text-red-500 text-xs">{form.formState.errors.firstName.message}</p>}</div>
              <div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" {...form.register("lastName")} />{form.formState.errors.lastName && <p className="text-red-500 text-xs">{form.formState.errors.lastName.message}</p>}</div>
            </div>
            <div><Label htmlFor="avatarUrl">Avatar URL</Label><Input id="avatarUrl" {...form.register("avatarUrl")} placeholder="https://example.com/avatar.png"/>{form.formState.errors.avatarUrl && <p className="text-red-500 text-xs">{form.formState.errors.avatarUrl.message}</p>}</div>
            <div><Label htmlFor="headline">Headline</Label><Input id="headline" {...form.register("headline")} />{form.formState.errors.headline && <p className="text-red-500 text-xs">{form.formState.errors.headline.message}</p>}</div>
            <div><Label htmlFor="bio">Bio</Label><Textarea id="bio" {...form.register("bio")} />{form.formState.errors.bio && <p className="text-red-500 text-xs">{form.formState.errors.bio.message}</p>}</div>
            <div><Label htmlFor="location">Location (e.g. City, State, Country)</Label><Input id="location" {...form.register("location")} />{form.formState.errors.location && <p className="text-red-500 text-xs">{form.formState.errors.location.message}</p>}</div>

            <h3 className="text-lg font-medium pt-2 border-b">Contact</h3>
            <div><Label htmlFor="phone">Phone Number</Label><Input id="phone" {...form.register("phone")} />{form.formState.errors.phone && <p className="text-red-500 text-xs">{form.formState.errors.phone.message}</p>}</div>
            <div><Label htmlFor="websiteUrl">Website URL</Label><Input id="websiteUrl" {...form.register("websiteUrl")} placeholder="https://example.com" />{form.formState.errors.websiteUrl && <p className="text-red-500 text-xs">{form.formState.errors.websiteUrl.message}</p>}</div>
            <div><Label htmlFor="linkedinUrl">LinkedIn URL</Label><Input id="linkedinUrl" {...form.register("linkedinUrl")} placeholder="https://linkedin.com/in/..." />{form.formState.errors.linkedinUrl && <p className="text-red-500 text-xs">{form.formState.errors.linkedinUrl.message}</p>}</div>
            <div><Label htmlFor="githubUrl">GitHub URL</Label><Input id="githubUrl" {...form.register("githubUrl")} placeholder="https://github.com/..." />{form.formState.errors.githubUrl && <p className="text-red-500 text-xs">{form.formState.errors.githubUrl.message}</p>}</div>

            <h3 className="text-lg font-medium pt-2 border-b">Job Preferences</h3>
            <div><Label htmlFor="jobType">Preferred Job Type(s)</Label><Input id="jobType" {...form.register("jobType")} placeholder="e.g., Full-time, Contract"/>{form.formState.errors.jobType && <p className="text-red-500 text-xs">{form.formState.errors.jobType.message}</p>}</div>
            <div><Label htmlFor="experienceLevel">Preferred Experience Level(s)</Label><Input id="experienceLevel" {...form.register("experienceLevel")} placeholder="e.g., Senior, Mid-level"/>{form.formState.errors.experienceLevel && <p className="text-red-500 text-xs">{form.formState.errors.experienceLevel.message}</p>}</div>
            <div><Label htmlFor="remoteWorkPreference">Remote Work Preference</Label><Input id="remoteWorkPreference" {...form.register("remoteWorkPreference")} placeholder="e.g., Remote, Hybrid, On-site"/>{form.formState.errors.remoteWorkPreference && <p className="text-red-500 text-xs">{form.formState.errors.remoteWorkPreference.message}</p>}</div>
            <div><Label htmlFor="preferredIndustries">Preferred Industries (comma-separated)</Label><Input id="preferredIndustries" {...form.register("preferredIndustries")} placeholder="e.g., Tech, Healthcare, Finance"/>{form.formState.errors.preferredIndustries && <p className="text-red-500 text-xs">{form.formState.errors.preferredIndustries.message}</p>}</div>

            <h3 className="text-lg font-medium pt-2 border-b">Freelance Availability</h3>
            <div className="flex items-center space-x-2">
              <Controller name="isAvailableForFreelance" control={form.control} render={({ field }) => (<Switch id="isAvailableForFreelance" checked={field.value || false} onCheckedChange={field.onChange} />)} />
              <Label htmlFor="isAvailableForFreelance">Available for Freelance?</Label>
            </div>
            {form.watch("isAvailableForFreelance") && ( <>
                <div><Label htmlFor="freelanceHeadline">Freelance Headline</Label><Input id="freelanceHeadline" {...form.register("freelanceHeadline")} />{form.formState.errors.freelanceHeadline && <p className="text-red-500 text-xs">{form.formState.errors.freelanceHeadline.message}</p>}</div>
                <div><Label htmlFor="freelanceBio">Freelance Bio</Label><Textarea id="freelanceBio" {...form.register("freelanceBio")} />{form.formState.errors.freelanceBio && <p className="text-red-500 text-xs">{form.formState.errors.freelanceBio.message}</p>}</div>
                <div><Label htmlFor="portfolioUrl">Portfolio URL</Label><Input id="portfolioUrl" {...form.register("portfolioUrl")} placeholder="https://myportfolio.com"/>{form.formState.errors.portfolioUrl && <p className="text-red-500 text-xs">{form.formState.errors.portfolioUrl.message}</p>}</div>
                <div><Label htmlFor="preferredFreelanceRateType">Preferred Rate Type</Label><Controller name="preferredFreelanceRateType" control={form.control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value || ""}><SelectTrigger><SelectValue placeholder="Select rate type" /></SelectTrigger><SelectContent>{rateTypes.map(type => <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ")}</SelectItem>)}</SelectContent></Select>)} />{form.formState.errors.preferredFreelanceRateType && <p className="text-red-500 text-xs">{form.formState.errors.preferredFreelanceRateType.message}</p>}</div>
                <div><Label htmlFor="freelanceRateValue">Rate Value (e.g., 75 if $75/hr)</Label><Input type="number" id="freelanceRateValue" {...form.register("freelanceRateValue")} />{form.formState.errors.freelanceRateValue && <p className="text-red-500 text-xs">{form.formState.errors.freelanceRateValue.message}</p>}</div>
            </>)}

            <h3 className="text-lg font-medium pt-2 border-b">Skills</h3>
            <div className="space-y-2">{editableSkills.map((skill, index) => (<div key={index} className="flex items-center justify-between p-2 border rounded-md"><div><p className="font-medium">{skill.name}</p><p className="text-xs text-gray-500">{skill.proficiency_level}</p></div><Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSkill(skill.name)}><XIcon className="h-4 w-4 text-red-500" /></Button></div>))}</div>
            <div className="flex items-end space-x-2 pt-2"><div className="flex-grow"><Label htmlFor="newSkillName">New Skill Name</Label><Input id="newSkillName" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} placeholder="e.g., React" /></div><div className="w-1/3"><Label htmlFor="newSkillProficiency">Proficiency</Label><Input id="newSkillProficiency" value={newSkillProficiency} onChange={(e) => setNewSkillProficiency(e.target.value)} placeholder="e.g., Expert" /></div><Button type="button" variant="outline" onClick={handleAddSkill} className="h-10"><PlusCircleIcon className="h-4 w-4 mr-2" /> Add</Button></div>

            <h3 className="text-lg font-medium pt-4 mt-4 border-b">Work Experience</h3>
            <div className="space-y-2">{editableExperience.map((exp, index) => (<div key={exp.id || `exp-${index}`} className="flex items-center justify-between p-2 border rounded-md"><div><p className="font-medium">{exp.title} at {exp.company_name}</p><p className="text-xs text-gray-500">{exp.start_date} - {exp.current_job ? 'Present' : (exp.end_date || 'N/A')}</p></div><div className="space-x-1"><Button type="button" variant="ghost" size="icon" onClick={() => { setCurrentExperienceItem(exp); setShowExperienceItemModal(true); }}><EditIcon className="h-4 w-4 text-blue-500" /></Button><Button type="button" variant="ghost" size="icon" onClick={() => {if (window.confirm("Are you sure?")) {setEditableExperience(editableExperience.filter((_, i) => i !== index));}}}><Trash2Icon className="h-4 w-4 text-red-500" /></Button></div></div>))}</div>
            <Button type="button" variant="outline" className="mt-2 w-full" onClick={() => { setCurrentExperienceItem(null); setShowExperienceItemModal(true); }}><PlusCircleIcon className="h-4 w-4 mr-2" /> Add New Experience</Button>

            <h3 className="text-lg font-medium pt-4 mt-4 border-b">Education</h3>
            <div className="space-y-2">{editableEducation.map((edu, index) => (<div key={edu.id || `edu-${index}`} className="flex items-center justify-between p-2 border rounded-md"><div><p className="font-medium">{edu.degree || 'Degree'} at {edu.school_name || edu.school}</p><p className="text-xs text-gray-500">{edu.start_date} - {edu.current_student || edu.current ? 'Present' : (edu.end_date || 'N/A')}</p></div><div className="space-x-1"><Button type="button" variant="ghost" size="icon" onClick={() => { setCurrentEducationItem(edu); setShowEducationItemModal(true); }}><EditIcon className="h-4 w-4 text-blue-500" /></Button><Button type="button" variant="ghost" size="icon" onClick={() => {if (window.confirm("Are you sure you want to remove this education entry?")) {setEditableEducation(editableEducation.filter((_, i) => i !== index));}}}><Trash2Icon className="h-4 w-4 text-red-500" /></Button></div></div>))}</div>
            <Button type="button" variant="outline" className="mt-2 w-full" onClick={() => { setCurrentEducationItem(null); setShowEducationItemModal(true); }}><PlusCircleIcon className="h-4 w-4 mr-2" /> Add New Education</Button>

            <DialogFooter className="mt-6">
              <DialogClose asChild><Button type="button" variant="outline" onClick={onClose}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
      {showExperienceItemModal && ( <ExperienceItemModal isOpen={showExperienceItemModal} onClose={() => setShowExperienceItemModal(false)} experienceData={currentExperienceItem} onSave={handleSaveExperienceItem} /> )}
      {showEducationItemModal && ( <EducationItemModal isOpen={showEducationItemModal} onClose={() => setShowEducationItemModal(false)} educationData={currentEducationItem} onSave={handleSaveEducationItem} /> )}
    </Dialog>
  );
};

export default EditProfileModal;
[end of components/EditProfileModal.tsx]
