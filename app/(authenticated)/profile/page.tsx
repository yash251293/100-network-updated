import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
"use client"

import { useState, useEffect, FormEvent, ChangeEvent } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
  Save,
  Loader2,
} from "lucide-react"

interface ProfileData {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_photo_url: string | null;
  location: string | null;
  phone_number: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  // Add skills, experiences, educations arrays if fetched
}

const initialProfileData: ProfileData = {
  user_id: "",
  email: "",
  first_name: "",
  last_name: "",
  headline: "",
  bio: "",
  avatar_url: "/placeholder-user.jpg", // Default placeholder
  cover_photo_url: "/placeholder-cover.png", // Default placeholder
  location: "",
  phone_number: "",
  website_url: "",
  linkedin_url: "",
  github_url: "",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(initialProfileData);
  const [editableProfile, setEditableProfile] = useState<Partial<ProfileData>>(initialProfileData);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setMessage(null);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setMessage({ type: 'error', content: 'Authentication token not found. Please login again.' });
        setIsLoading(false);
        // router.push('/auth/login'); // Redirect if no token
        return;
      }

      try {
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setEditableProfile(data); // Initialize editable profile with fetched data
        } else {
          const errorData = await response.json();
          setMessage({ type: 'error', content: errorData.message || 'Failed to fetch profile.' });
        }
      } catch (error) {
        console.error("Fetch profile error:", error);
        setMessage({ type: 'error', content: 'An error occurred while fetching your profile.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setMessage({ type: 'error', content: 'Authentication token not found. Please login again.' });
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editableProfile),
      });

      const data = await response.json();
      if (response.ok) {
        setProfile(prev => ({ ...prev, ...editableProfile })); // Update displayed profile
        setMessage({ type: 'success', content: data.message || 'Profile updated successfully!' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', content: data.message || 'Failed to update profile.' });
      }
    } catch (error) {
      console.error("Update profile error:", error);
      setMessage({ type: 'error', content: 'An error occurred while updating your profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-6 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-4 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6">
      {message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.content}
        </div>
      )}
      {/* Header Card */}
      <Card className="mb-6">
        <div className="relative">
          {/* Cover Photo */}
          <div
            className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg bg-cover bg-center"
            style={{ backgroundImage: `url(${profile.cover_photo_url || '/placeholder-cover.png'})` }}
          ></div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 mt-4">
              {/* Profile Picture */}
              <div className="relative -mt-20 mb-6 sm:mb-0">
                <Avatar className="h-32 w-32 border-4 border-white">
                  <AvatarImage src={profile.avatar_url || "/placeholder-user.jpg"} alt={profile.first_name || "User"} />
                  <AvatarFallback className="text-2xl">
                    {profile.first_name?.[0] || ""}{profile.last_name?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                   <Input type="text" name="avatar_url" value={editableProfile.avatar_url || ""} onChange={handleInputChange} placeholder="Avatar URL" className="mt-2 text-xs" />
                )}
              </div>

              {/* Name and Title */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input name="first_name" value={editableProfile.first_name || ""} onChange={handleInputChange} placeholder="First Name" />
                        <Input name="last_name" value={editableProfile.last_name || ""} onChange={handleInputChange} placeholder="Last Name" />
                      </div>
                      <Input name="headline" value={editableProfile.headline || ""} onChange={handleInputChange} placeholder="Headline (e.g. Software Engineer at X)" />
                      <Input name="location" value={editableProfile.location || ""} onChange={handleInputChange} placeholder="Location (e.g. San Francisco, CA)" />
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-2xl font-bold">{profile.first_name || "Your"} {profile.last_name || "Name"}</h1>
                      <p className="text-lg text-muted-foreground">{profile.headline || "Your headline"}</p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {profile.location || "Your location"}
                      </div>
                    </div>
                  )}
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => { setIsEditing(true); setEditableProfile(profile); setMessage(null); }} className="ml-4">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                       <Button variant="outline" onClick={() => { setIsEditing(false); setMessage(null); }} disabled={isSaving}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmit} disabled={isSaving} className="ml-2">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                {!isEditing ? (
                  <div className="flex flex-wrap gap-4 mt-4 text-sm">
                    <div className="flex items-center text-blue-600">
                      <Mail className="h-4 w-4 mr-1" />
                      {profile.email}
                    </div>
                    {profile.phone_number && (
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="h-4 w-4 mr-1" />
                        {profile.phone_number}
                      </div>
                    )}
                    {profile.website_url && (
                      <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                        <Globe className="h-4 w-4 mr-1" />
                        {profile.website_url.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                     {profile.linkedin_url && (
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                        <Users className="h-4 w-4 mr-1" /> LinkedIn
                      </a>
                    )}
                    {profile.github_url && (
                      <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                        <Globe className="h-4 w-4 mr-1" /> GitHub
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Input name="phone_number" value={editableProfile.phone_number || ""} onChange={handleInputChange} placeholder="Phone Number" />
                    <Input name="website_url" value={editableProfile.website_url || ""} onChange={handleInputChange} placeholder="Website URL" />
                    <Input name="linkedin_url" value={editableProfile.linkedin_url || ""} onChange={handleInputChange} placeholder="LinkedIn URL" />
                    <Input name="github_url" value={editableProfile.github_url || ""} onChange={handleInputChange} placeholder="GitHub URL" />
                    <Input name="cover_photo_url" value={editableProfile.cover_photo_url || ""} onChange={handleInputChange} placeholder="Cover Photo URL" />
                  </div>
                )}

                {/* Stats - These are usually not directly editable */}
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
              {!isEditing && (
                <Button variant="ghost" size="icon" onClick={() => { setIsEditing(true); setEditableProfile(profile); setMessage(null); }}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea name="bio" value={editableProfile.bio || ""} onChange={handleInputChange} placeholder="Tell us about yourself..." className="min-h-[120px]" />
              ) : (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {profile.bio || "No bio provided yet."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Experience Section - Placeholder for future implementation */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold">Experience</h2>
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Senior Software Engineer</h3>
                  <p className="text-muted-foreground">TechCorp • Full-time</p>
                  <p className="text-sm text-muted-foreground">Jan 2022 - Present • 3 yrs</p>
                  <p className="text-sm text-muted-foreground mt-1">San Francisco, CA</p>
                  <p className="text-sm mt-2">
                    Lead development of microservices architecture serving 1M+ users. Mentored 5 junior developers and
                    improved team productivity by 40%.
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="secondary">React</Badge>
                    <Badge variant="secondary">Node.js</Badge>
                    <Badge variant="secondary">AWS</Badge>
                    <Badge variant="secondary">TypeScript</Badge>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Software Engineer</h3>
                  <p className="text-muted-foreground">StartupXYZ • Full-time</p>
                  <p className="text-sm text-muted-foreground">Jun 2019 - Dec 2021 • 2 yrs 7 mos</p>
                  <p className="text-sm text-muted-foreground mt-1">Remote</p>
                  <p className="text-sm mt-2">
                    Built and maintained e-commerce platform handling $10M+ in annual revenue. Implemented CI/CD
                    pipelines and reduced deployment time by 60%.
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="secondary">Vue.js</Badge>
                    <Badge variant="secondary">Python</Badge>
                    <Badge variant="secondary">Docker</Badge>
                    <Badge variant="secondary">PostgreSQL</Badge>
                  </div>
                </div>
              </div>
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
              <div className="flex space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Bachelor of Science in Computer Science</h3>
                  <p className="text-muted-foreground">University of California, Berkeley</p>
                  <p className="text-sm text-muted-foreground">2015 - 2019</p>
                  <p className="text-sm mt-2">
                    Graduated Magna Cum Laude. Relevant coursework: Data Structures, Algorithms, Software Engineering,
                    Database Systems.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Section */}
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
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">JavaScript</span>
                    <span className="text-xs text-muted-foreground">Expert</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "95%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">React</span>
                    <span className="text-xs text-muted-foreground">Expert</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "90%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Node.js</span>
                    <span className="text-xs text-muted-foreground">Advanced</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">AWS</span>
                    <span className="text-xs text-muted-foreground">Advanced</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "80%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Python</span>
                    <span className="text-xs text-muted-foreground">Intermediate</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "70%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certifications Section */}
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
  )
}
