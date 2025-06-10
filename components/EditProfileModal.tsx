"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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

// Adapted Zod schema for the form (focus on editable scalar fields)
// Omitting direct editing of complex arrays like skills, experience, education in this modal
const modalProfileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required.").max(100).optional().nullable(),
  lastName: z.string().min(1, "Last name is required.").max(100).optional().nullable(),
  avatarUrl: z.string().max(255).optional().nullable(),
  headline: z.string().max(255).optional().nullable(),
  bio: z.string().optional().nullable(),
  location: z.string().max(255).optional().nullable(), // Combined location field for simplicity in modal
  linkedinUrl: z.preprocess((val) => (val === "" ? null : val), z.string().url({ message: "Invalid LinkedIn URL." }).optional().nullable()),
  githubUrl: z.preprocess((val) => (val === "" ? null : val), z.string().url({ message: "Invalid GitHub URL." }).optional().nullable()),
  websiteUrl: z.preprocess((val) => (val === "" ? null : val), z.string().url({ message: "Invalid website URL." }).optional().nullable()),
  phone: z.string().max(50).optional().nullable(),

  jobType: z.string().max(100).optional().nullable(), // Consider Select component
  experienceLevel: z.string().max(100).optional().nullable(), // Consider Select
  remoteWorkPreference: z.string().max(100).optional().nullable(), // Consider Select
  preferredIndustries: z.string().optional().nullable(), // Simple text input for now

  isAvailableForFreelance: z.boolean().optional(),
  freelanceHeadline: z.string().max(255).optional().nullable(),
  freelanceBio: z.string().optional().nullable(),
  portfolioUrl: z.preprocess((val) => (val === "" ? null : val), z.string().url({ message: "Invalid portfolio URL." }).optional().nullable()),
  preferredFreelanceRateType: z.string().max(50).optional().nullable(), // Enum: 'hourly', 'fixed'
  freelanceRateValue: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : parseFloat(String(val))),
    z.number().positive("Rate must be a positive number.").optional().nullable()
  ),
});

type ModalProfileFormValues = z.infer<typeof modalProfileFormSchema>;

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: any; // Current full profile data
  onProfileUpdate: () => void; // Callback to refresh profile on parent
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, profileData, onProfileUpdate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        location: profileData.location || "", // Assuming combined location for now
        linkedinUrl: profileData.linkedin_url || "",
        githubUrl: profileData.github_url || "",
        websiteUrl: profileData.website_url || "",
        phone: profileData.phone || "",
        jobType: profileData.job_type || "",
        experienceLevel: profileData.experience_level || "",
        remoteWorkPreference: profileData.remote_work_preference || "",
        preferredIndustries: profileData.preferred_industries || "", // Assuming string for now
        isAvailableForFreelance: profileData.isAvailableForFreelance || false,
        freelanceHeadline: profileData.freelanceHeadline || "",
        freelanceBio: profileData.freelanceBio || "",
        portfolioUrl: profileData.portfolioUrl || "",
        preferredFreelanceRateType: profileData.preferredFreelanceRateType || "",
        freelanceRateValue: profileData.freelanceRateValue || null,
      });
    }
  }, [profileData, isOpen, form]);

  const onSubmit = async (values: ModalProfileFormValues) => {
    setIsSubmitting(true);
    const token = getToken();
    if (!token) {
      toast.error("Authentication required.");
      setIsSubmitting(false);
      return;
    }

    // Construct payload, ensuring to pass through original complex arrays
    const payload = {
      ...values,
      // Pass through original arrays for fields not edited in this modal
      skills: profileData?.skills?.map((s: any) => s.name) || [], // API expects array of skill names
      experience: profileData?.experience || [], // Pass original experience array
      education: profileData?.education || [],   // Pass original education array
    };

    // Convert empty strings to null for optional fields, matching API expectation
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        toast.success("Profile updated successfully!");
        onProfileUpdate();
        onClose();
      } else {
        toast.error(result.message || "Failed to update profile.", {
          description: result.errors ? JSON.stringify(result.errors) : undefined
        });
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const rateTypes = ['hourly', 'fixed', 'per_project']; // Example rate types

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
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
            <div className="flex items-center space-x-2"><Switch id="isAvailableForFreelance" {...form.register("isAvailableForFreelance")} checked={form.watch("isAvailableForFreelance")} onCheckedChange={(checked) => form.setValue("isAvailableForFreelance", checked)} /><Label htmlFor="isAvailableForFreelance">Available for Freelance?</Label></div>
            {form.watch("isAvailableForFreelance") && (
              <>
                <div><Label htmlFor="freelanceHeadline">Freelance Headline</Label><Input id="freelanceHeadline" {...form.register("freelanceHeadline")} />{form.formState.errors.freelanceHeadline && <p className="text-red-500 text-xs">{form.formState.errors.freelanceHeadline.message}</p>}</div>
                <div><Label htmlFor="freelanceBio">Freelance Bio</Label><Textarea id="freelanceBio" {...form.register("freelanceBio")} />{form.formState.errors.freelanceBio && <p className="text-red-500 text-xs">{form.formState.errors.freelanceBio.message}</p>}</div>
                <div><Label htmlFor="portfolioUrl">Portfolio URL</Label><Input id="portfolioUrl" {...form.register("portfolioUrl")} placeholder="https://myportfolio.com"/>{form.formState.errors.portfolioUrl && <p className="text-red-500 text-xs">{form.formState.errors.portfolioUrl.message}</p>}</div>
                <div>
                  <Label htmlFor="preferredFreelanceRateType">Preferred Rate Type</Label>
                  <Controller name="preferredFreelanceRateType" control={form.control} render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <SelectTrigger><SelectValue placeholder="Select rate type" /></SelectTrigger>
                      <SelectContent>
                        {rateTypes.map(type => <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ")}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                  {form.formState.errors.preferredFreelanceRateType && <p className="text-red-500 text-xs">{form.formState.errors.preferredFreelanceRateType.message}</p>}
                </div>
                <div><Label htmlFor="freelanceRateValue">Rate Value (e.g., 75 if $75/hr)</Label><Input type="number" id="freelanceRateValue" {...form.register("freelanceRateValue")} />{form.formState.errors.freelanceRateValue && <p className="text-red-500 text-xs">{form.formState.errors.freelanceRateValue.message}</p>}</div>
              </>
            )}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;

// Need to add Controller for Select if not using native select.
// For now, using native select with register for simplicity.
// If using shadcn/ui Select, it needs Controller from react-hook-form.
// Added Controller for preferredFreelanceRateType as an example.
// Other Selects (jobType, experienceLevel, remoteWorkPreference) are simple text inputs for now.
// They can be converted to Selects with Controller similarly if predefined options are available.

[end of components/EditProfileModal.tsx]
