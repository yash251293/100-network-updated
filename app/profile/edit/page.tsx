"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types'; // Using the main User type
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// import { toast } from "sonner"; // Assuming Sonner is available for notifications

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState<Partial<User>>({
    name: '', // name is not typically edited here, but prefill if available
    headline: '',
    summary: '',
    location: '',
    profilePictureUrl: '',
    linkedInProfileUrl: '',
    githubProfileUrl: '',
    personalWebsiteUrl: '',
    skills: [], // Handled as comma-separated string in UI
  });
  const [skillsInput, setSkillsInput] = useState(''); // For comma-separated skills
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const userId = (session?.user as any)?.id;

  useEffect(() => {
    if (status === 'authenticated' && userId) {
      setIsLoading(true);
      fetch(`/api/users/${userId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch profile data.');
          return res.json();
        })
        .then((data: User) => {
          setFormData({
            name: data.name || '',
            headline: data.headline || '',
            summary: data.summary || '',
            location: data.location || '',
            profilePictureUrl: data.profilePictureUrl || '',
            linkedInProfileUrl: data.linkedInProfileUrl || '',
            githubProfileUrl: data.githubProfileUrl || '',
            personalWebsiteUrl: data.personalWebsiteUrl || '',
            // skills are handled separately by skillsInput
          });
          setSkillsInput(data.skills?.join(', ') || '');
        })
        .catch(err => {
          setError(err.message);
          // toast.error(err.message || "Could not load profile data.");
        })
        .finally(() => setIsLoading(false));
    } else if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/profile/edit');
    }
  }, [status, userId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillsInput(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      setError("User not authenticated.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const profileDataToUpdate = {
      ...formData,
      skills: skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill),
    };
    // Remove name from update payload if it's not meant to be editable here or is empty
    // For this form, we'll allow sending it if it was prefilled.
    // The API's updateUserProfile function should prevent changing email/id/password.

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileDataToUpdate),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update profile.');
      }
      setSuccessMessage('Profile updated successfully!');
      // toast.success('Profile updated successfully!');
      router.push(`/profile/${userId}`); // Or just stay and show success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      // toast.error(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || (status === 'authenticated' && isLoading && !formData.name)) {
    return <div className="container mx-auto p-4 text-center">Loading profile data...</div>;
  }

  if (status === 'unauthenticated') {
     // Should have been redirected by useEffect, but as a fallback
    return <div className="container mx-auto p-4 text-center">Please <Link href="/auth/login" className="underline">log in</Link> to edit your profile.</div>;
  }

  if (!userId) {
    return <div className="container mx-auto p-4 text-center text-red-500">Could not identify user. Please try logging in again.</div>;
  }


  return (
    <div className="container mx-auto p-4 flex justify-center py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Your Profile</CardTitle>
          <CardDescription>Update your personal information. Current User: {formData.name || 'Loading...'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" name="headline" value={formData.headline || ''} onChange={handleInputChange} placeholder="e.g., Senior Software Engineer at Innovatech" />
            </div>
            <div>
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" name="summary" value={formData.summary || ''} onChange={handleInputChange} placeholder="A brief professional summary about yourself..." rows={5} />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" value={formData.location || ''} onChange={handleInputChange} placeholder="e.g., San Francisco, CA" />
            </div>
            <div>
              <Label htmlFor="profilePictureUrl">Profile Picture URL</Label>
              <Input id="profilePictureUrl" name="profilePictureUrl" type="url" value={formData.profilePictureUrl || ''} onChange={handleInputChange} placeholder="https://example.com/your-image.png" />
            </div>
            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input id="skills" name="skills" value={skillsInput} onChange={handleSkillsChange} placeholder="e.g., React, Node.js, TypeScript" />
            </div>
            <h3 className="text-lg font-medium pt-2 border-b">Social Links</h3>
            <div>
              <Label htmlFor="personalWebsiteUrl">Personal Website URL</Label>
              <Input id="personalWebsiteUrl" name="personalWebsiteUrl" type="url" value={formData.personalWebsiteUrl || ''} onChange={handleInputChange} placeholder="https://your-website.com" />
            </div>
            <div>
              <Label htmlFor="linkedInProfileUrl">LinkedIn Profile URL</Label>
              <Input id="linkedInProfileUrl" name="linkedInProfileUrl" type="url" value={formData.linkedInProfileUrl || ''} onChange={handleInputChange} placeholder="https://linkedin.com/in/yourprofile" />
            </div>
            <div>
              <Label htmlFor="githubProfileUrl">GitHub Profile URL</Label>
              <Input id="githubProfileUrl" name="githubProfileUrl" type="url" value={formData.githubProfileUrl || ''} onChange={handleInputChange} placeholder="https://github.com/yourusername" />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
            {successMessage && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">{successMessage}</p>}

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={isLoading || status !== 'authenticated'}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
