"use client";

import { useState, FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { getToken } from '@/lib/authClient'; // Added

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

export default function JobApplicationModal({ isOpen, onClose, jobId, jobTitle }: JobApplicationModalProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit an application.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Added Authorization header
        },
        body: JSON.stringify({ coverLetter, resumeUrl }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Application Submitted!",
          description: `Your application for "${jobTitle}" has been submitted.`,
          variant: "default",
        });
        setCoverLetter("");
        setResumeUrl("");
        onClose(); // Close modal on success
      } else {
        toast({
          title: "Application Failed",
          description: result.message || "Could not submit your application. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Application submission error:", error);
      toast({
        title: "Application Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Apply for: {jobTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-center gap-2">
              <Label htmlFor="coverLetter" className="text-left mb-1">
                Cover Letter (Optional)
              </Label>
              <Textarea
                id="coverLetter"
                placeholder="Briefly explain why you're a good fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 items-center gap-2">
              <Label htmlFor="resumeUrl" className="text-left mb-1">
                Resume URL (Optional)
              </Label>
              <Input
                id="resumeUrl"
                placeholder="https://linkedin.com/in/yourprofile or link to your resume PDF"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                type="url"
                className="col-span-3"
              />
              <p className="text-xs text-muted-foreground col-span-3">
                Link to your online resume (e.g., LinkedIn profile, Google Drive, Dropbox). Ensure sharing settings allow viewing.
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
