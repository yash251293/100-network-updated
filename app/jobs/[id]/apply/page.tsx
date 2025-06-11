"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Job } from '@/lib/types'; // JobApplication can be used if needed for typing form data

export default function ApplyJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [jobDetails, setJobDetails] = useState<Pick<Job, 'title' | 'companyName'> | null>(null);
  const [jobFetchError, setJobFetchError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    applicantName: '',
    applicantEmail: '',
    coverLetter: '',
    expectedSalary: '',
    availableStartDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      const fetchJobDetails = async () => {
        try {
          const res = await fetch(`/api/jobs/${jobId}`);
          if (!res.ok) {
            throw new Error('Failed to fetch job details');
          }
          const data: Job = await res.json();
          setJobDetails({ title: data.title, companyName: data.companyName });
        } catch (error) {
          setJobFetchError(error instanceof Error ? error.message : 'An unknown error occurred');
        }
      };
      fetchJobDetails();
    }
  }, [jobId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    if (!formData.applicantName || !formData.applicantEmail) {
      setSubmitError("Applicant Name and Email are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const applicationPayload = {
        jobId,
        ...formData,
      };

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      const result = await res.json();
      setSuccessMessage(`Application for ${jobDetails?.title || 'job'} submitted successfully! Application ID: ${result.id}`);
      setFormData({
        applicantName: '',
        applicantEmail: '',
        coverLetter: '',
        expectedSalary: '',
        availableStartDate: '',
      });
      // Optionally redirect after a delay
      // setTimeout(() => router.push(`/jobs/${jobId}`), 3000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (jobFetchError) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">Error: {jobFetchError}</p>
        <Link href="/jobs">
          <Button variant="link">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Apply for Job</CardTitle>
          {jobDetails ? (
            <CardDescription>
              You are applying for the position: <strong>{jobDetails.title}</strong> at <strong>{jobDetails.companyName}</strong> (Job ID: {jobId})
            </CardDescription>
          ) : jobId ? (
            <CardDescription>Loading job details for ID: {jobId}...</CardDescription>
          ) : (
             <CardDescription>Job ID not found in URL.</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {successMessage ? (
            <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
              {successMessage}
              <div className="mt-4">
                <Button onClick={() => router.push(`/jobs/${jobId}`)} className="mr-2">View Job</Button>
                <Button onClick={() => router.push('/jobs')} variant="outline">Explore More Jobs</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="applicantName">Full Name</Label>
                <Input
                  id="applicantName"
                  name="applicantName"
                  type="text"
                  value={formData.applicantName}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="applicantEmail">Email Address</Label>
                <Input
                  id="applicantEmail"
                  name="applicantEmail"
                  type="email"
                  value={formData.applicantEmail}
                  onChange={handleInputChange}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <Label htmlFor="coverLetter">Cover Letter</Label>
                <Textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  placeholder="Tell us why you're a great fit for this role..."
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="expectedSalary">Expected Salary (Optional)</Label>
                <Input
                  id="expectedSalary"
                  name="expectedSalary"
                  type="text"
                  value={formData.expectedSalary}
                  onChange={handleInputChange}
                  placeholder="$100,000 per year"
                />
              </div>
              <div>
                <Label htmlFor="availableStartDate">Available Start Date (Optional)</Label>
                <Input
                  id="availableStartDate"
                  name="availableStartDate"
                  type="date"
                  value={formData.availableStartDate}
                  onChange={handleInputChange}
                />
              </div>

              {submitError && (
                <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{submitError}</p>
              )}

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !jobId}>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
