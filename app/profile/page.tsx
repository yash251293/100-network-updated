"use client"; // Added

import ProtectedRoute from "../../components/ProtectedRoute"; // Added
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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/authClient";
import Link from "next/link";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      const token = getToken();

      if (!token) {
        console.warn("[ProfilePage] No auth token found. API request will likely fail or be unauthorized.");
        setError("Authentication token not found. Please log in.");
        setIsLoading(false);
        // Optionally, redirect: router.push('/auth/login');
        return;
      }

      const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };

      try {
        const response = await fetch('/api/profile', { headers });
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Failed to fetch profile data, status:", response.status, "body:", errorData);
          setError(errorData.error || errorData.message || 'Failed to fetch profile data');
        }
      } catch (err: any) {
        console.error("Error fetching profile data:", err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]); // Added router to dependency array if it's used for navigation

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading profile...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center min-h-screen">Error: {error}</div>;
  }
  if (!profileData) {
    return <div className="flex justify-center items-center min-h-screen">No profile data found.</div>;
  }

  return (
    <ProtectedRoute>
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
                  <AvatarImage src={profileData.avatar_url || "/placeholder-user.jpg"} alt={profileData.user?.email || 'User'} />
                  <AvatarFallback className="text-2xl">
                    {profileData.user?.first_name?.[0] || ''}{profileData.user?.last_name?.[0] || ''}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              {/* Name and Title */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{profileData.user?.first_name || ''} {profileData.user?.last_name || profileData.user?.email || 'User'}</h1>
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
                    {profileData.user?.email || 'Email not available'}
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
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
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
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
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
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
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
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
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
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
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
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
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
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
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
              <Button variant="ghost" size="icon">
                <MessageCircle className="h-4 w-4" />
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
    </ProtectedRoute>
  )
}
