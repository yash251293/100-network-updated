"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar'; // For DatePicker
import { CalendarIcon, ArrowLeft, Search, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getToken } from '@/lib/authClient';
import dynamic from 'next/dynamic'; // Import dynamic
const CreateCompanyModal = dynamic(() => import('@/components/CreateCompanyModal'), { ssr: false }); // Import the modal dynamically

// Zod Schema for the main job posting form
const jobPostingSchema = z.object({
  title: z.string().min(5, "Job title must be at least 5 characters."),
  location: z.string().min(2, "Location is required."),
  jobType: z.string().min(1, "Job type is required."),
  companyId: z.string().uuid("Valid company selection is required."),
  companyNameDisplay: z.string().optional(), // For display purposes, not part of job submission if companyId is set
  description: z.string().min(50, "Description must be at least 50 characters."),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  experienceLevel: z.string().optional(),
  skills: z.string().min(1, "At least one skill is required."), // Comma-separated string
  salaryMin: z.coerce.number().positive("Minimum salary must be positive.").optional().nullable(),
  salaryMax: z.coerce.number().positive("Maximum salary must be positive.").optional().nullable(),
  salaryCurrency: z.string().optional().default("USD"),
  salaryPeriod: z.string().optional().default("Annual"),
  applicationMethod: z.enum(["email", "url"], { required_error: "Application method is required." }),
  applicationEmail: z.string().email("Invalid email format.").optional(),
  applicationUrl: z.string().url("Invalid URL format.").optional(),
  applicationDeadline: z.date().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.salaryMin && data.salaryMax && data.salaryMax < data.salaryMin) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Maximum salary cannot be less than minimum salary.",
      path: ["salaryMax"],
    });
  }
  if (data.applicationMethod === "email" && !data.applicationEmail) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Application email is required when method is 'Email'.",
      path: ["applicationEmail"],
    });
  }
  if (data.applicationMethod === "url" && !data.applicationUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Application URL is required when method is 'URL'.",
      path: ["applicationUrl"],
    });
  }
});

type JobPostingFormData = z.infer<typeof jobPostingSchema>;

interface CompanySearchResult {
  id: string;
  name: string;
  logo_url?: string | null;
}

export default function PostJobPage() {
  const router = useRouter();
  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      jobType: "Full-time",
      salaryCurrency: "USD",
      salaryPeriod: "Annual",
      applicationMethod: "url",
    }
  });

  const applicationMethod = watch("applicationMethod");

  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [debouncedCompanySearchTerm, setDebouncedCompanySearchTerm] = useState("");
  const [companySearchResults, setCompanySearchResults] = useState<CompanySearchResult[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<{ id: string, name: string } | null>(null);
  const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);

  // Debounce company search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedCompanySearchTerm(companySearchTerm), 500);
    return () => clearTimeout(handler);
  }, [companySearchTerm]);

  // Fetch company search results
  useEffect(() => {
    if (debouncedCompanySearchTerm.length < 2) {
      setCompanySearchResults([]);
      return;
    }
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      const token = getToken();
      if (!token) { /* Handle appropriately, maybe disable search */ return; }
      try {
        const response = await fetch(`/api/companies?search=${encodeURIComponent(debouncedCompanySearchTerm)}&limit=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCompanySearchResults(data.data || []);
        } else {
          setCompanySearchResults([]);
        }
      } catch (error) {
        console.error("Failed to search companies:", error);
        setCompanySearchResults([]);
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, [debouncedCompanySearchTerm]);

  const handleCompanySelect = (company: CompanySearchResult) => {
    setSelectedCompany({ id: company.id, name: company.name });
    setValue("companyId", company.id, { shouldValidate: true });
    setValue("companyNameDisplay", company.name); // For display
    setCompanySearchTerm(company.name); // Fill search box with selected company name
    setCompanySearchResults([]); // Close dropdown
  };

  const onSubmit = async (data: JobPostingFormData, jobStatus: "Open" | "Draft" = "Open") => {
    const token = getToken();
    if (!token) {
      toast.error("Authentication required to post a job.");
      return;
    }
    if (!data.companyId) {
        toast.error("Please select or create a company.");
        return;
    }

    toast.info(jobStatus === "Draft" ? "Saving draft..." : "Posting job...");

    const skillsArray = data.skills.split(',').map(skill => skill.trim()).filter(skill => skill);

    const apiRequestBody = {
      ...data,
      skills: skillsArray,
      status: jobStatus,
      applicationDeadline: data.applicationDeadline ? data.applicationDeadline.toISOString() : null,
      // companyNameDisplay is not sent, only companyId
    };
    delete (apiRequestBody as any).companyNameDisplay;

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
        throw new Error(errorData.message || "Failed to post job.");
      }
      const result = await response.json();
      toast.success(jobStatus === "Draft" ? "Job draft saved!" : "Job posted successfully!");
      router.push(`/jobs/${result.jobId}`);
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred while posting the job.");
    }
  };

  return (
    <>
      <div className="container max-w-3xl py-6">
        <div className="flex items-center mb-6">
          <Link href="/jobs" className="mr-4" aria-label="Back to jobs">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Post a New Job</h1>
            <p className="text-muted-foreground">Fill in the details to find your next hire.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(data => onSubmit(data, "Open"))} className="space-y-8">
          {/* Company Selection Section */}
          <Card>
            <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companySearch">Search and Select Company</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companySearch"
                    placeholder="Start typing company name..."
                    value={companySearchTerm}
                    onChange={(e) => {
                      setCompanySearchTerm(e.target.value);
                      setSelectedCompany(null); // Clear selection if user types again
                      setValue("companyId", ""); // Clear hidden companyId
                    }}
                    className="pl-10"
                  />
                  {errors.companyId && !selectedCompany && <p className="text-sm text-red-500 mt-1">{errors.companyId.message}</p>}
                </div>
                {isLoadingCompanies && <p className="text-sm text-muted-foreground mt-1">Searching...</p>}
                {companySearchResults.length > 0 && !selectedCompany && (
                  <ul className="border rounded-md max-h-40 overflow-y-auto mt-1">
                    {companySearchResults.map(company => (
                      <li
                        key={company.id}
                        onClick={() => handleCompanySelect(company)}
                        className="p-2 hover:bg-muted cursor-pointer"
                      >
                        {company.name}
                      </li>
                    ))}
                  </ul>
                )}
                 {!isLoadingCompanies && debouncedCompanySearchTerm.length >= 2 && companySearchResults.length === 0 && !selectedCompany && (
                    <p className="text-sm text-muted-foreground mt-1">No companies found. You can create one.</p>
                )}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateCompanyModal(true)}>
                <PlusCircle className="h-4 w-4 mr-2" /> Create New Company
              </Button>
              {selectedCompany && <p className="text-sm text-green-600 mt-1">Selected: {selectedCompany.name}</p>}
            </CardContent>
          </Card>

          {/* Job Details Section */}
          <Card>
            <CardHeader><CardTitle>Job Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title <span className="text-red-500">*</span></Label>
                  <Input id="title" {...register("title")} placeholder="e.g., Software Engineer" />
                  {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                  <Input id="location" {...register("location")} placeholder="e.g., San Francisco, CA or Remote" />
                  {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type <span className="text-red-500">*</span></Label>
                <Controller name="jobType" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="jobType"><SelectValue placeholder="Select job type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem><SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
                {errors.jobType && <p className="text-sm text-red-500">{errors.jobType.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Job Description <span className="text-red-500">*</span></Label>
                <Textarea id="description" {...register("description")} rows={5} placeholder="Detailed description of the job role..." />
                {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
              </div>
              {/* Optional fields: Responsibilities, Requirements, Benefits as Textareas */}
              <div className="space-y-2"><Label htmlFor="responsibilities">Responsibilities</Label><Textarea id="responsibilities" {...register("responsibilities")} rows={3} placeholder="e.g., Develop new features..." /></div>
              <div className="space-y-2"><Label htmlFor="requirements">Requirements</Label><Textarea id="requirements" {...register("requirements")} rows={3} placeholder="e.g., 3+ years of experience in..." /></div>
              <div className="space-y-2"><Label htmlFor="benefits">Benefits</Label><Textarea id="benefits" {...register("benefits")} rows={3} placeholder="e.g., Health insurance, Unlimited PTO..." /></div>
            </CardContent>
          </Card>

          {/* Skills & Experience Section */}
          <Card>
            <CardHeader><CardTitle>Skills & Experience</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skills">Required Skills <span className="text-red-500">*</span></Label>
                <Input id="skills" {...register("skills")} placeholder="e.g., JavaScript, React, Node.js" />
                <p className="text-xs text-muted-foreground">Enter skills separated by commas.</p>
                {errors.skills && <p className="text-sm text-red-500">{errors.skills.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Controller name="experienceLevel" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="experienceLevel"><SelectValue placeholder="Select experience level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entry">Entry</SelectItem><SelectItem value="Mid-level">Mid-level</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem><SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem><SelectItem value="Director">Director</SelectItem>
                      <SelectItem value="Executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
                {errors.experienceLevel && <p className="text-sm text-red-500">{errors.experienceLevel.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Salary & Application Section */}
          <Card>
            <CardHeader><CardTitle>Salary & Application</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="salaryMin">Minimum Salary</Label><Input id="salaryMin" type="number" {...register("salaryMin")} placeholder="e.g., 60000" />{errors.salaryMin && <p className="text-sm text-red-500">{errors.salaryMin.message}</p>}</div>
                <div className="space-y-2"><Label htmlFor="salaryMax">Maximum Salary</Label><Input id="salaryMax" type="number" {...register("salaryMax")} placeholder="e.g., 90000" />{errors.salaryMax && <p className="text-sm text-red-500">{errors.salaryMax.message}</p>}</div>
                <div className="space-y-2"><Label htmlFor="salaryCurrency">Currency</Label>
                  <Controller name="salaryCurrency" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="salaryCurrency"><SelectValue placeholder="Select currency" /></SelectTrigger>
                      <SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem><SelectItem value="CAD">CAD</SelectItem><SelectItem value="AUD">AUD</SelectItem></SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="space-y-2"><Label htmlFor="salaryPeriod">Salary Period</Label>
                  <Controller name="salaryPeriod" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="salaryPeriod"><SelectValue placeholder="Select period" /></SelectTrigger>
                      <SelectContent><SelectItem value="Annual">Annual</SelectItem><SelectItem value="Monthly">Monthly</SelectItem><SelectItem value="Hourly">Hourly</SelectItem></SelectContent>
                    </Select>
                  )} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Application Method <span className="text-red-500">*</span></Label>
                <Controller name="applicationMethod" control={control} render={({ field }) => (
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="url" id="appUrl" /><Label htmlFor="appUrl">Apply via URL</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="email" id="appEmail" /><Label htmlFor="appEmail">Apply via Email</Label></div>
                  </RadioGroup>
                )} />
                {errors.applicationMethod && <p className="text-sm text-red-500">{errors.applicationMethod.message}</p>}
              </div>
              {applicationMethod === "url" && (
                <div className="space-y-2"><Label htmlFor="applicationUrl">Application URL <span className="text-red-500">*</span></Label><Input id="applicationUrl" type="url" {...register("applicationUrl")} placeholder="https://yourcompany.com/apply/job123" />{errors.applicationUrl && <p className="text-sm text-red-500">{errors.applicationUrl.message}</p>}</div>
              )}
              {applicationMethod === "email" && (
                <div className="space-y-2"><Label htmlFor="applicationEmail">Application Email <span className="text-red-500">*</span></Label><Input id="applicationEmail" type="email" {...register("applicationEmail")} placeholder="careers@example.com" />{errors.applicationEmail && <p className="text-sm text-red-500">{errors.applicationEmail.message}</p>}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="applicationDeadline">Application Deadline (Optional)</Label>
                <Controller name="applicationDeadline" control={control} render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button id="applicationDeadline" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus /></PopoverContent>
                  </Popover>
                )} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => onSubmit(watch(), "Draft")} disabled={isSubmitting}>
              Save as Draft
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Posting Job...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </div>

      <CreateCompanyModal
        isOpen={showCreateCompanyModal}
        onClose={() => setShowCreateCompanyModal(false)}
        onCompanyCreated={(company) => {
          setSelectedCompany(company);
          setValue("companyId", company.id, { shouldValidate: true });
          setValue("companyNameDisplay", company.name);
          setCompanySearchTerm(company.name); // Update search term to reflect created company
          setShowCreateCompanyModal(false);
          setCompanySearchResults([]); // Clear search results
        }}
      />
    </>
  );
}
