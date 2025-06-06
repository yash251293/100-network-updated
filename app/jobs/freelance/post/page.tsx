"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, UploadCloud } from "lucide-react"; // Added UploadCloud
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Using sonner for toasts
import { getToken } from "@/lib/authClient"; // Add this if not already present

// Zod Schema for form validation
const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  category: z.string().min(1, "Category is required."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
  skills: z.string().min(1, "At least one skill is required."),
  budgetType: z.enum(["fixed", "hourly"], { required_error: "Budget type is required." }),
  minBudget: z.coerce.number().positive("Minimum budget must be positive.").optional().nullable(),
  maxBudget: z.coerce.number().positive("Maximum budget must be positive.").optional().nullable(),
  duration: z.string().min(1, "Duration is required."),
  attachments: z.any().optional(), // For now, just acknowledge files
}).refine(data => {
  if (data.budgetType === "fixed" && (data.minBudget === null || data.minBudget === undefined)) {
    return false; // Fixed price must have at least minBudget (which can be the fixed price itself)
  }
  if (data.minBudget && data.maxBudget && data.maxBudget < data.minBudget) {
    return false;
  }
  return true;
}, {
  message: "Max budget cannot be less than min budget. For fixed price, specify at least a minimum budget.",
  path: ["maxBudget"], // Path to show error for maxBudget refinement
});

type ProjectFormData = z.infer<typeof projectSchema>;

// Placeholder Company ID for freelance projects
// In a real app, this might be a specific "Freelance Platform" company record
// or a system to allow users to post under their own (verified) company.
const FREELANCE_PLATFORM_COMPANY_ID = process.env.NEXT_PUBLIC_FREELANCE_PLATFORM_COMPANY_ID;

export default function PostFreelanceProjectPage() {
  const router = useRouter();
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      budgetType: "fixed", // Default budget type
    }
  });

  const onSubmit = async (data: ProjectFormData) => {
    const token = getToken();
    if (!token) {
      toast.error("Authentication Error: You must be logged in to post a project.");
      return;
    }

    toast.info("Submitting project...");
    console.log("Form data:", data);

    // **Assumption**: Using a placeholder companyId for all freelance projects posted through this form.
    // This ID should correspond to a generic "company" entry in the database representing the freelance platform itself,
    // or a dedicated entity for freelance listings if the schema supports it differently.
    if (!FREELANCE_PLATFORM_COMPANY_ID || FREELANCE_PLATFORM_COMPANY_ID === "your-placeholder-company-id-for-freelance") { // Second part of condition is fallback if someone forgets to remove placeholder from env
        toast.error("Configuration Error: NEXT_PUBLIC_FREELANCE_PLATFORM_COMPANY_ID is not properly set in your environment variables.");
        console.error("CRITICAL: NEXT_PUBLIC_FREELANCE_PLATFORM_COMPANY_ID is not configured in .env.local (or other relevant .env file) or is still set to the placeholder value. Cannot post job.");
        return;
    }

    const apiRequestBody = {
      companyId: FREELANCE_PLATFORM_COMPANY_ID,
      title: data.title,
      description: data.description,
      // responsibilities, requirements, benefits might not be directly applicable or can be part of description for freelance
      location: "Remote", // Freelance projects often default to Remote
      jobType: "Freelance Project", // Hardcoded for this form
      experienceLevel: data.category, // Using category as a proxy for experience/field, can be adjusted
      salaryMin: data.minBudget,
      salaryMax: data.maxBudget,
      salaryCurrency: "USD", // Default currency
      salaryPeriod: data.budgetType === "hourly" ? "Hourly" : "Project", // Set period based on budget type
      applicationDeadline: null, // Typically not applicable for freelance projects in this manner
      status: "Open", // Default status
      skills: data.skills.split(',').map(skill => skill.trim()).filter(skill => skill), // Parse skills
      // attachments are not being uploaded in this version
    };

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(apiRequestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to post project.");
      }

      const result = await response.json();
      toast.success("Project posted successfully!");
      reset(); // Reset form fields
      router.push(`/jobs/${result.jobId}`); // Redirect to the newly created job's detail page
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
      console.error("Submission error:", error);
    }
  };

  const handleSaveAsDraft = () => {
    // TODO: Implement "Save as Draft" functionality
    // This would typically involve:
    // 1. An API endpoint that accepts partial job data and a 'Draft' status.
    // 2. Storing drafts associated with the user.
    // 3. A UI section for users to view and resume their drafts.
    console.log("Save as Draft clicked. Data:", control._formValues); // Log current form values
    toast.info("Save as Draft functionality is not yet implemented.");
  };


  return (
    <div className="container max-w-3xl py-6">
      <div className="flex items-center mb-6">
        <Link href="/jobs/freelance" className="mr-4" aria-label="Back to freelance jobs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Post a Freelance Project</h1>
          <p className="text-muted-foreground">Create a project to find the perfect freelancer</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Provide information about your project to attract the right freelancers</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Project Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input id="title" placeholder="e.g., 'Mobile App Developer for Fitness Application'" {...register("title")} />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Content Writing">Content Writing</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Data Analysis">Data Analysis</SelectItem>
                      <SelectItem value="AI & Machine Learning">AI & Machine Learning</SelectItem>
                      <SelectItem value="Consulting">Consulting</SelectItem>
                      <SelectItem value="Video & Animation">Video & Animation</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea id="description" placeholder="Describe your project in detail..." rows={6} {...register("description")} />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            {/* Required Skills */}
            <div className="space-y-2">
              <Label htmlFor="skills">Required Skills</Label>
              <Input id="skills" placeholder="e.g., React Native, Firebase, UI/UX" {...register("skills")} />
              <p className="text-xs text-muted-foreground">Separate skills with commas</p>
              {errors.skills && <p className="text-sm text-red-500">{errors.skills.message}</p>}
            </div>

            {/* Project Budget Type */}
            <div className="space-y-2">
              <Label>Project Budget</Label>
              <Controller
                name="budgetType"
                control={control}
                render={({ field }) => (
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="fixed" id="fixed" /><Label htmlFor="fixed">Fixed Price</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="hourly" id="hourly" /><Label htmlFor="hourly">Hourly Rate</Label></div>
                  </RadioGroup>
                )}
              />
              {errors.budgetType && <p className="text-sm text-red-500">{errors.budgetType.message}</p>}
            </div>

            {/* Budget Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-budget">Minimum Budget / Rate per hour ($)</Label>
                <Input id="min-budget" type="number" placeholder="e.g., 500 or 50" {...register("minBudget")} />
                {errors.minBudget && <p className="text-sm text-red-500">{errors.minBudget.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-budget">Maximum Budget / Rate per hour ($)</Label>
                <Input id="max-budget" type="number" placeholder="e.g., 2000 or 100" {...register("maxBudget")} />
              </div>
            </div>
            {/* Combined error for budget refinement */}
            {errors.maxBudget && typeof errors.maxBudget.message === 'string' && errors.maxBudget.type === 'custom' && <p className="text-sm text-red-500">{errors.maxBudget.message}</p>}


            {/* Estimated Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration</Label>
               <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="duration"><SelectValue placeholder="Select duration" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Less than 1 week">Less than 1 week</SelectItem>
                      <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                      <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
                      <SelectItem value="1-3 months">1-3 months</SelectItem>
                      <SelectItem value="3-6 months">3-6 months</SelectItem>
                      <SelectItem value="Ongoing project">Ongoing project</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.duration && <p className="text-sm text-red-500">{errors.duration.message}</p>}
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments (Optional)</Label>
              <Input id="attachments" type="file" multiple {...register("attachments")} className="pt-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"/>
              <p className="text-xs text-muted-foreground">Max file size: 10MB each. Supported formats: PDF, DOC, DOCX, JPG, PNG.</p>
              {errors.attachments && <p className="text-sm text-red-500">{errors.attachments.message}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleSaveAsDraft} disabled={isSubmitting}>Save as Draft</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Posting Project..." : "Post Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
