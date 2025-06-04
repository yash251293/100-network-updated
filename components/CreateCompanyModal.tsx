"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getToken } from '@/lib/authClient';

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompanyCreated: (company: { id: string, name: string }) => void;
}

const companySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters."),
  websiteUrl: z.string().url("Invalid website URL.").optional().or(z.literal('')),
  logoUrl: z.string().url("Invalid logo URL.").optional().or(z.literal('')),
  industry: z.string().optional(),
  description: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function CreateCompanyModal({ isOpen, onClose, onCompanyCreated }: CreateCompanyModalProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset(); // Reset form when modal opens
    }
  }, [isOpen, reset]);

  const processSubmit = async (data: CompanyFormData) => {
    const token = getToken();
    if (!token) {
      toast.error("Authentication required to create a company.");
      return;
    }

    toast.info("Creating company...");
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Company created successfully!");
        onCompanyCreated({ id: result.data.id, name: result.data.name });
        onClose(); // Close modal
      } else {
        toast.error(result.message || "Failed to create company.");
      }
    } catch (error) {
      console.error("Create company error:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Company</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Company Name <span className="text-red-500">*</span></Label>
            <Input id="name" {...register("name")} placeholder="e.g., Acme Innovations Inc." />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input id="websiteUrl" type="url" {...register("websiteUrl")} placeholder="https://example.com" />
            {errors.websiteUrl && <p className="text-sm text-red-500 mt-1">{errors.websiteUrl.message}</p>}
          </div>
          <div>
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input id="logoUrl" type="url" {...register("logoUrl")} placeholder="https://example.com/logo.png" />
            {errors.logoUrl && <p className="text-sm text-red-500 mt-1">{errors.logoUrl.message}</p>}
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" {...register("industry")} placeholder="e.g., Technology, Healthcare" />
            {errors.industry && <p className="text-sm text-red-500 mt-1">{errors.industry.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} placeholder="Briefly describe the company..." />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Company'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
