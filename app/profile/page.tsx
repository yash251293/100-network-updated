import Image from 'next/image';
// Removed ProtectedRoute, auth handled server-side
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Edit,
  Plus,
  Award,
  Briefcase,
  GraduationCap,
  Users,
  Eye,
  MessageCircle,
} from "lucide-react"
// Removed useEffect, useState, useRouter, getToken - not needed for RSC data fetching
import Link from "next/link";
import { cookies } from 'next/headers';
import { verifyAuthToken } from '@/lib/authUtils';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';

// Helper function for date formatting (copied from api/profile/route.ts)
function formatDateToYearMonth(dateString: string | null | Date): string | null {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        // console.warn("formatDateToYearMonth received invalid date string:", dateString); // Optional: server-side logging
        return null;
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  } catch (e) {
    // console.error("Error formatting date:", dateString, e); // Optional: server-side logging
    return null;
  }
}

export default async function ProfilePage() {
  const cookieStore = cookies();
  const token = cookieStore.get('authToken')?.value;
  const authResult = verifyAuthToken(token ? `Bearer ${token}` : null);
  const userId = authResult?.userId;

  if (!userId) {
    redirect('/auth/login?message=Please log in to view your profile.');
  }

  let profileData: any = null;
  let error: string | null = null;

  try {
    // Fetch profile data (adapted from /api/profile GET handler)
    const profileQuery = `
      SELECT
        id, first_name, last_name, avatar_url, headline, bio, location,
        linkedin_url, github_url, website_url, phone,
        job_type, experience_level, remote_work_preference, preferred_industries,
        is_available_for_freelance as "isAvailableForFreelance",
        freelance_headline as "freelanceHeadline",
        freelance_bio as "freelanceBio",
        portfolio_url as "portfolioUrl",
        preferred_freelance_rate_type as "preferredFreelanceRateType",
        freelance_rate_value as "freelanceRateValue"
      FROM profiles
      WHERE id = $1
    `;
    const profileRes = await query(profileQuery, [userId]);
    const baseProfile = profileRes.rows[0] || {};

    const skillsRes = await query(
      'SELECT s.id, s.name, us.proficiency_level FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = $1',
      [userId]
    );
    const skills = skillsRes.rows;

    const experienceRes = await query('SELECT * FROM user_experience WHERE user_id = $1 ORDER BY start_date DESC, id DESC', [userId]);
    const experiencesRaw = experienceRes.rows;

    const educationRes = await query('SELECT * FROM user_education WHERE user_id = $1 ORDER BY start_date DESC, id DESC', [userId]);
    const educationsRaw = educationRes.rows;

    const userEmailRes = await query('SELECT email FROM users WHERE id = $1', [userId]);
    const userEmail = userEmailRes.rows[0]?.email || null;

    profileData = {
      ...baseProfile,
      userId: userId,
      email: userEmail,
      skills: skills, // Skills are already in the desired format {id, name, proficiency_level}
      experience: experiencesRaw.map(exp => ({
        ...exp, // Spread raw experience
        company: exp.company_name, // Map company_name to company
        startDate: formatDateToYearMonth(exp.start_date),
        endDate: formatDateToYearMonth(exp.end_date),
        current: exp.current_job, // Map current_job to current
      })),
      education: educationsRaw.map(edu => ({
        ...edu, // Spread raw education
        school: edu.school_name, // Map school_name to school
        field: edu.field_of_study, // Map field_of_study to field
        startDate: formatDateToYearMonth(edu.start_date),
        endDate: formatDateToYearMonth(edu.end_date),
        current: edu.current_student, // Map current_student to current
      })),
      // Ensure all fields expected by the JSX are present, even if null/undefined
      avatar_url: baseProfile.avatar_url,
      first_name: baseProfile.first_name,
      last_name: baseProfile.last_name,
      headline: baseProfile.headline,
      location: baseProfile.location,
      phone: baseProfile.phone,
      website_url: baseProfile.website_url,
      bio: baseProfile.bio,
    };

    // Transform preferred_industries from JSON string to array if it exists
    if (profileData.preferred_industries && typeof profileData.preferred_industries === 'string') {
      try {
        profileData.preferred_industries = JSON.parse(profileData.preferred_industries);
      } catch (e) {
        // console.error("Failed to parse preferred_industries JSON:", e); // Optional server-side logging
        profileData.preferred_industries = []; // Default to empty array on parse error
      }
    } else if (!profileData.preferred_industries) {
        profileData.preferred_industries = []; // Default if not present
    }


  } catch (err: any) {
    // console.error("Error fetching profile data in RSC:", err); // Optional: server-side logging
    error = err.message || 'An unexpected error occurred while fetching profile data.';
  }

  // UI Rendering Logic (similar to before, but without isLoading)
  if (error) {
    return <div className="flex justify-center items-center min-h-screen">Error: {error}</div>;
  }
  if (!profileData) {
    return <div className="flex justify-center items-center min-h-screen">No profile data found or failed to load.</div>;
  }

  return (
    // Removed ProtectedRoute wrapper
      <div className="container max-w-4xl py-6">
        {/* Header Card */}
        <Card className="mb-6">
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg"></div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 mt-4">
              {/* Profile Picture */}
              <div className="relative -mt-20 mb-6 sm:mb-0">
                <Avatar className="h-32 w-32 border-4 border-white">
                  <AvatarImage src={profileData.avatar_url || "/placeholder-user.jpg"} alt={ (profileData.first_name && profileData.last_name) ? `${profileData.first_name} ${profileData.last_name}` : (profileData.first_name || profileData.last_name || 'User Avatar') } />
                  <AvatarFallback className="text-2xl">
                    {(profileData.first_name?.[0] || '') + (profileData.last_name?.[0] || '') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white"
                  asChild
                >
                  <Link href="/profile/complete">
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Name and Title */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{(profileData.first_name && profileData.last_name) ? `${profileData.first_name} ${profileData.last_name}` : (profileData.first_name || profileData.last_name || 'User Name')}</h1>
                    <p className="text-lg text-muted-foreground">{profileData.headline || 'No headline available'}</p>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profileData.location || 'Location not set'}
                    </div>
                  </div>
                  <Button variant="outline" className="ml-4" asChild>
                    <Link href="/profile/complete">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <div className="flex items-center text-blue-600">
                    <Mail className="h-4 w-4 mr-1" />
                    {profileData.email || 'Email not available'}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="h-4 w-4 mr-1" />
                    {profileData.phone || 'Phone not set'}
                  </div>
                  <div className="flex items-center text-blue-600">
                    <Globe className="h-4 w-4 mr-1" />
                    {profileData.website_url || 'Website not set'}
                  </div>
                </div>

                {/* Stats */}
                {/* Data for this section is not currently fetched from the API */}
                <div className="flex gap-6 mt-4 text-sm">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="font-medium">500+</span>
                    <span className="text-muted-foreground ml-1">connections</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="font-medium">1,234</span>
                    <span className="text-muted-foreground ml-1">profile views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold">About</h2>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile/complete">
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {profileData.bio || 'No bio available. Click edit to add one!'}
              </p>
            </CardContent>
          </Card>

          {/* Experience Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold">Experience</h2>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile/complete">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {(profileData.experience && profileData.experience.length > 0) ? (
                profileData.experience.map((exp: any, index: number) => (
                  <div key={index} className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{exp.title || 'N/A'}</h3>
                      <p className="text-muted-foreground">{exp.company || 'N/A'} • {exp.employment_type || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">
                        {exp.start_date ? new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'} -
                        {exp.current ? 'Present' : (exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A')}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{exp.location || 'N/A'}</p>
                      <p className="text-sm mt-2 whitespace-pre-line">{exp.description || 'No description provided.'}</p>
                      {/* Skills for this experience item - assuming exp.skills is an array of strings if it exists */}
                      {exp.skills && exp.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {exp.skills.map((skill: string, skillIndex: number) => (
                            <Badge key={skillIndex} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No professional experience added yet. Click the '+' icon to add your first experience!</p>
              )}
            </CardContent>
          </Card>

          {/* Education Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold">Education</h2>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile/complete">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {(profileData.education && profileData.education.length > 0) ? (
                profileData.education.map((edu: any, index: number) => (
                  <div key={index} className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{edu.degree || 'N/A'}</h3>
                      <p className="text-muted-foreground">{edu.school || 'N/A'} • {edu.field_of_study || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">
                        {edu.start_date ? new Date(edu.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'} -
                        {edu.current ? 'Present' : (edu.end_date ? new Date(edu.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A')}
                      </p>
                      <p className="text-sm mt-2 whitespace-pre-line">{edu.description || 'No description provided.'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No educational background added yet. Click the '+' icon to add your education!</p>
              )}
            </CardContent>
          </Card>

          {/* Projects Section */}
          {/* Data for this section is not currently fetched from the API */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold">Projects</h2>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile/complete">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium">AI-Powered Task Manager</h3>
                <p className="text-sm text-muted-foreground mb-2">Personal Project • 2024</p>
                <p className="text-sm mb-2">
                  Built a smart task management app using React and OpenAI API that automatically categorizes and
                  prioritizes tasks based on user behavior.
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">React</Badge>
                  <Badge variant="outline">OpenAI API</Badge>
                  <Badge variant="outline">Tailwind CSS</Badge>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium">E-commerce Analytics Dashboard</h3>
                <p className="text-sm text-muted-foreground mb-2">Freelance Project • 2023</p>
                <p className="text-sm mb-2">
                  Developed a real-time analytics dashboard for an e-commerce client, resulting in 25% increase in
                  conversion rates.
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">Vue.js</Badge>
                  <Badge variant="outline">D3.js</Badge>
                  <Badge variant="outline">Node.js</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Skills Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-semibold">Skills</h2>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile/complete">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {(profileData.skills && profileData.skills.length > 0) ? (
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill: any, index: number) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill.name || 'N/A'}
                      {skill.proficiency_level && ` (${skill.proficiency_level})`}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No skills added yet. Click the '+' icon to add your skills!</p>
              )}
            </CardContent>
          </Card>

          {/* Certifications Section */}
          {/* Data for this section is not currently fetched from the API */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-semibold">Certifications</h2>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile/complete">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <Award className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">AWS Certified Solutions Architect</h3>
                  <p className="text-xs text-muted-foreground">Amazon Web Services • 2023</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Award className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">React Developer Certification</h3>
                  <p className="text-xs text-muted-foreground">Meta • 2022</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Award className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">Scrum Master Certified</h3>
                  <p className="text-xs text-muted-foreground">Scrum Alliance • 2021</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Languages Section */}
          {/* Data for this section is not currently fetched from the API */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-semibold">Languages</h2>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile/complete">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">English</span>
                <span className="text-xs text-muted-foreground">Native</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Spanish</span>
                <span className="text-xs text-muted-foreground">Conversational</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">French</span>
                <span className="text-xs text-muted-foreground">Basic</span>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations Section */}
          {/* Data for this section is not currently fetched from the API */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-semibold">Recommendations</h2>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile/complete">
                  <MessageCircle className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm italic mb-2">
                    "Alex is an exceptional developer who consistently delivers high-quality code. Their leadership
                    skills and technical expertise make them invaluable to any team."
                  </p>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/manager-avatar.png" alt="Sarah Chen" />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-medium">Sarah Chen</p>
                      <p className="text-xs text-muted-foreground">Engineering Manager at TechCorp</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    // Removed ProtectedRoute wrapper
  )
}
