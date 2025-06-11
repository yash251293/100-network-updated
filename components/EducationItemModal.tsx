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
import { ScrollArea } from '@/components/ui/scroll-area';

// Zod schema for Education Item form validation
const educationItemFormSchema = z.object({
  id: z.union([z.string().uuid(), z.number(), z.string().startsWith('temp-')]).optional(), // Existing ID, DB ID (number) or temp ID
  school: z.string().min(1, "School name is required."),
  degree: z.string().optional().nullable(),
  field_of_study: z.string().optional().nullable(), // Matching DB column name for clarity in modal
  start_date: z.string().regex(/^\d{4}-\d{2}$/, "Start date must be YYYY-MM").or(z.literal("")),
  end_date: z.string().regex(/^\d{4}-\d{2}$/, "End date must be YYYY-MM").or(z.literal("")).optional().nullable(),
  current_student: z.boolean().default(false),
  description: z.string().optional().nullable(),
}).refine(data => !data.current_student ? !!data.end_date && data.end_date.match(/^\d{4}-\d{2}$/) : true, {
  message: "End date (YYYY-MM) is required if not current student",
  path: ["end_date"],
});

type EducationItemFormValues = z.infer<typeof educationItemFormSchema>;

interface EducationItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  educationData?: Partial<EducationItemFormValues> | null; // For editing
  onSave: (data: EducationItemFormValues) => void;
}

const EducationItemModal: React.FC<EducationItemModalProps> = ({ isOpen, onClose, educationData, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EducationItemFormValues>({
    resolver: zodResolver(educationItemFormSchema),
    defaultValues: {
      school: '',
      degree: null,
      field_of_study: null,
      start_date: '',
      end_date: null,
      current_student: false,
      description: null,
      ...educationData,
    },
  });

  const { register, handleSubmit, control, formState: { errors }, watch, setValue } = form;
  const isCurrentStudent = watch("current_student");

  useEffect(() => {
    if (educationData) {
      setValue("school", educationData.school || educationData.school_name || ""); // API GET might send school_name
      setValue("degree", educationData.degree || null);
      setValue("field_of_study", educationData.field_of_study || educationData.field || null); // API GET might send field
      setValue("start_date", educationData.start_date || "");
      setValue("end_date", educationData.current_student ? "" : educationData.end_date || "");
      setValue("current_student", educationData.current_student || false);
      setValue("description", educationData.description || null);
      if (educationData.id) {
        setValue("id", educationData.id);
      }
    } else {
       form.reset({
        school: '', degree: null, field_of_study: null, start_date: '',
        end_date: null, current_student: false, description: null, id: undefined
      });
    }
  }, [educationData, isOpen, setValue, form]);

  const processSave = (values: EducationItemFormValues) => {
    setIsSubmitting(true);
    const dataToSave = {
      ...values,
      end_date: values.current_student ? null : values.end_date,
    };
    onSave(dataToSave);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{educationData?.id ? 'Edit' : 'Add'} Education</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1">
          <form onSubmit={handleSubmit(processSave)} className="space-y-4 px-4 py-2">
            <div><Label htmlFor="school">School Name*</Label><Input id="school" {...register("school")} />{errors.school && <p className="text-red-500 text-xs">{errors.school.message}</p>}</div>
            <div><Label htmlFor="degree">Degree</Label><Input id="degree" {...register("degree")} />{errors.degree && <p className="text-red-500 text-xs">{errors.degree.message}</p>}</div>
            <div><Label htmlFor="field_of_study">Field of Study</Label><Input id="field_of_study" {...register("field_of_study")} />{errors.field_of_study && <p className="text-red-500 text-xs">{errors.field_of_study.message}</p>}</div>

            <div><Label htmlFor="start_date">Start Date (YYYY-MM)*</Label><Input id="start_date" type="month" {...register("start_date")} />{errors.start_date && <p className="text-red-500 text-xs">{errors.start_date.message}</p>}</div>

            <div className="flex items-center space-x-2">
               <Controller name="current_student" control={control} render={({ field }) => (
                  <Checkbox id="current_student" checked={field.value} onCheckedChange={field.onChange} />
              )}/>
              <Label htmlFor="current_student">I currently study here</Label>
            </div>

            {!isCurrentStudent && (
              <div><Label htmlFor="end_date">End Date (YYYY-MM){!isCurrentStudent ? '*' : ''}</Label><Input id="end_date" type="month" {...register("end_date")} disabled={isCurrentStudent} />{errors.end_date && <p className="text-red-500 text-xs">{errors.end_date.message}</p>}</div>
            )}

            <div><Label htmlFor="description">Description</Label><Textarea id="description" {...register("description")} /></div>

            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" onClick={onClose}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Education"}</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EducationItemModal;

[end of components/EducationItemModal.tsx]
