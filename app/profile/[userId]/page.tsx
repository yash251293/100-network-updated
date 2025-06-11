import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { User, Experience, Education } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, GraduationCap, MapPin, Link as LinkIcon, Star, UserCircle, ExternalLink } from 'lucide-react';

// Helper function to fetch user profile
// In a real app, this might live in a dedicated 'lib/data-fetching.ts' or similar.
async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    // Ensure the URL is correct, especially if your app is not running at localhost:3000 during SSR.
    // Using a relative path or an environment variable for the base URL is better for production.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/users/${userId}`, {
      cache: 'no-store', // Fetch fresh data for each request
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null; // User not found
      }
      throw new Error(`Failed to fetch user profile: ${res.statusText}`);
    }
    return res.json() as Promise<User>;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    // Depending on error handling strategy, you might re-throw or return null
    return null;
  }
}

// Helper to format dates (optional)
const formatDate = (dateString?: string) => {
  if (!dateString) return 'Present';
  try {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch (e) { return dateString; } // Fallback to original string if date is invalid
};

export default async function UserProfilePage({ params }: { params: { userId: string } }) {
  const user = await fetchUserProfile(params.userId);

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader className="flex flex-col md:flex-row items-start gap-6">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-2 border-primary">
            <AvatarImage src={user.profilePictureUrl || undefined} alt={user.name} />
            <AvatarFallback className="text-4xl">
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold">{user.name}</h1>
            {user.headline && <p className="text-xl text-muted-foreground mt-1">{user.headline}</p>}
            {user.location && (
              <div className="flex items-center text-muted-foreground mt-2">
                <MapPin className="h-4 w-4 mr-2" />
                {user.location}
              </div>
            )}
            <div className="mt-4">
               {/* Simplified Edit Profile Link - Auth check will be on the edit page itself */}
               <Button asChild variant="outline">
                 <Link href={`/profile/edit`}>Edit Profile</Link>
               </Button>
            </div>
          </div>
        </CardHeader>
        {user.summary && (
          <CardContent>
            <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Summary</h2>
            <p className="text-muted-foreground whitespace-pre-line">{user.summary}</p>
          </CardContent>
        )}
      </Card>

      {(user.linkedInProfileUrl || user.githubProfileUrl || user.personalWebsiteUrl) && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center"><LinkIcon className="h-5 w-5 mr-2" />Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {user.personalWebsiteUrl && <p><Link href={user.personalWebsiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">Personal Website <ExternalLink className="h-4 w-4 ml-1" /></Link></p>}
            {user.linkedInProfileUrl && <p><Link href={user.linkedInProfileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">LinkedIn <ExternalLink className="h-4 w-4 ml-1" /></Link></p>}
            {user.githubProfileUrl && <p><Link href={user.githubProfileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">GitHub <ExternalLink className="h-4 w-4 ml-1" /></Link></p>}
          </CardContent>
        </Card>
      )}

      {user.skills && user.skills.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center"><Star className="h-5 w-5 mr-2" />Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {user.skills.map((skill, index) => (
              <Badge key={index} variant="secondary">{skill}</Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {user.experience && user.experience.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center"><Briefcase className="h-5 w-5 mr-2" />Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {user.experience.map((exp) => (
              <div key={exp.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-semibold">{exp.title}</h3>
                <p className="text-md text-primary">{exp.companyName}</p>
                {exp.location && <p className="text-sm text-muted-foreground">{exp.location}</p>}
                <p className="text-sm text-muted-foreground">
                  {formatDate(exp.startDate)} – {formatDate(exp.endDate) || 'Present'}
                </p>
                {exp.description && <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{exp.description}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {user.education && user.education.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><GraduationCap className="h-5 w-5 mr-2" />Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {user.education.map((edu) => (
              <div key={edu.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-semibold">{edu.schoolName}</h3>
                <p className="text-md text-primary">{edu.degree}</p>
                {edu.fieldOfStudy && <p className="text-sm text-muted-foreground">{edu.fieldOfStudy}</p>}
                <p className="text-sm text-muted-foreground">
                  {formatDate(edu.startDate)} – {formatDate(edu.endDate) || 'Graduated'}
                </p>
                {edu.description && <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{edu.description}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
