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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// Zod schema for Experience Item form validation
// Matches table columns closely, transformation to API POST schema happens in parent
const experienceItemFormSchema = z.object({
  id: z.union([z.string().uuid(), z.number()]).optional(), // Existing ID or undefined for new
  title: z.string().min(1, "Job title is required."),
  company_name: z.string().min(1, "Company name is required."),
  employment_type: z.string().optional().nullable(),
  location_city: z.string().optional().nullable(),
  location_state: z.string().optional().nullable(),
  location_country: z.string().optional().nullable(),
  start_date: z.string().regex(/^\d{4}-\d{2}$/, "Start date must be YYYY-MM").or(z.literal("")),
  end_date: z.string().regex(/^\d{4}-\d{2}$/, "End date must be YYYY-MM").or(z.literal("")).optional().nullable(),
  current_job: z.boolean().default(false),
  description: z.string().optional().nullable(),
}).refine(data => !data.current_job ? !!data.end_date : true, {
  message: "End date is required if not current job",
  path: ["end_date"],
});

type ExperienceItemFormValues = z.infer<typeof experienceItemFormSchema>;

interface ExperienceItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  experienceData?: Partial<ExperienceItemFormValues> | null; // For editing
  onSave: (data: ExperienceItemFormValues) => void;
}

const employmentTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Internship", "Apprenticeship", "Seasonal"];


const ExperienceItemModal: React.FC<ExperienceItemModalProps> = ({ isOpen, onClose, experienceData, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExperienceItemFormValues>({
    resolver: zodResolver(experienceItemFormSchema),
    defaultValues: {
      title: '',
      company_name: '',
      employment_type: null,
      location_city: null,
      location_state: null,
      location_country: null,
      start_date: '',
      end_date: null,
      current_job: false,
      description: null,
      ...experienceData, // Spread existing data if editing
    },
  });

  const { register, handleSubmit, control, formState: { errors }, watch, setValue } = form;
  const isCurrentJob = watch("current_job");

  useEffect(() => {
    if (experienceData) {
      setValue("title", experienceData.title || "");
      setValue("company_name", experienceData.company_name || "");
      setValue("employment_type", experienceData.employment_type || null);
      setValue("location_city", experienceData.location_city || null);
      setValue("location_state", experienceData.location_state || null);
      setValue("location_country", experienceData.location_country || null);
      setValue("start_date", experienceData.start_date || "");
      setValue("end_date", experienceData.current_job ? null : experienceData.end_date || "");
      setValue("current_job", experienceData.current_job || false);
      setValue("description", experienceData.description || null);
      if (experienceData.id) {
        setValue("id", experienceData.id);
      }
    } else {
       form.reset({ // Reset to defaults for new entry
        title: '', company_name: '', employment_type: null, location_city: null,
        location_state: null, location_country: null, start_date: '', end_date: null,
        current_job: false, description: null, id: undefined
      });
    }
  }, [experienceData, isOpen, setValue, form]);


  const processSave = (values: ExperienceItemFormValues) => {
    setIsSubmitting(true);
    const dataToSave = {
      ...values,
      end_date: values.current_job ? null : values.end_date, // Ensure end_date is null if current job
    };
    onSave(dataToSave);
    setIsSubmitting(false);
    onClose(); // Close modal after save
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{experienceData?.id ? 'Edit' : 'Add'} Experience</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1">
          <form onSubmit={handleSubmit(processSave)} className="space-y-4 px-4 py-2">
            <div><Label htmlFor="title">Title*</Label><Input id="title" {...register("title")} />{errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}</div>
            <div><Label htmlFor="company_name">Company Name*</Label><Input id="company_name" {...register("company_name")} />{errors.company_name && <p className="text-red-500 text-xs">{errors.company_name.message}</p>}</div>

            <div>
              <Label htmlFor="employment_type">Employment Type</Label>
              <Controller name="employment_type" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {employmentTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
              {errors.employment_type && <p className="text-red-500 text-xs">{errors.employment_type.message}</p>}
            </div>

            <div><Label htmlFor="location_city">Location City</Label><Input id="location_city" {...register("location_city")} /></div>
            <div><Label htmlFor="location_state">Location State/Province</Label><Input id="location_state" {...register("location_state")} /></div>
            <div><Label htmlFor="location_country">Location Country</Label><Input id="location_country" {...register("location_country")} /></div>

            <div><Label htmlFor="start_date">Start Date (YYYY-MM)*</Label><Input id="start_date" type="month" {...register("start_date")} />{errors.start_date && <p className="text-red-500 text-xs">{errors.start_date.message}</p>}</div>

            <div className="flex items-center space-x-2">
              <Controller name="current_job" control={control} render={({ field }) => (
                  <Checkbox id="current_job" checked={field.value} onCheckedChange={field.onChange} />
              )}/>
              <Label htmlFor="current_job">I currently work here</Label>
            </div>

            {!isCurrentJob && (
              <div><Label htmlFor="end_date">End Date (YYYY-MM){!isCurrentJob ? '*' : ''}</Label><Input id="end_date" type="month" {...register("end_date")} disabled={isCurrentJob} />{errors.end_date && <p className="text-red-500 text-xs">{errors.end_date.message}</p>}</div>
            )}

            <div><Label htmlFor="description">Description</Label><Textarea id="description" {...register("description")} /></div>

            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" onClick={onClose}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Experience"}</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ExperienceItemModal;

[end of components/ExperienceItemModal.tsx]
