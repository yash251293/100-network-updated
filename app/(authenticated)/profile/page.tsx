"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Trash2, // Added for delete icon
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Added for explicit close button
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


interface ProfileSkill {
  user_skill_id: string; // Changed from id to user_skill_id to match API response for clarity
  skill_name: string;
  proficiency_level: string | null;
}

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
  skills: ProfileSkill[];
  // Add experiences, educations arrays if fetched
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
  skills: [],
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(initialProfileData);
  // Separate state for managing skill input form if we add "Add Skill" directly on this page
  // const [newSkillName, setNewSkillName] = useState("");
  // const [newSkillProficiency, setNewSkillProficiency] = useState("");
  // const [isAddingSkill, setIsAddingSkill] = useState(false);

  const [editableProfile, setEditableProfile] = useState<Partial<ProfileData>>(initialProfileData);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);

  // State for "Add Skill" modal
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillProficiency, setNewSkillProficiency] = useState("");
  const [addSkillMessage, setAddSkillMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);
  const [isSavingSkill, setIsSavingSkill] = useState(false);

  // State for "Edit Skill" modal
  const [isEditSkillModalOpen, setIsEditSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<ProfileSkill | null>(null);
  const [editedSkillName, setEditedSkillName] = useState("");
  const [editedSkillProficiency, setEditedSkillProficiency] = useState("");
  const [editSkillMessage, setEditSkillMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);
  const [isUpdatingSkill, setIsUpdatingSkill] = useState(false);

  // State for "Delete Skill" confirmation
  const [isDeleteSkillConfirmOpen, setIsDeleteSkillConfirmOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<ProfileSkill | null>(null);
  // General page message will be used for delete success/error for now
  // const [deleteSkillMessage, setDeleteSkillMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);
  const [isDeletingSkill, setIsDeletingSkill] = useState(false);


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
          const responseData = await response.json();
          if (responseData.success && responseData.data) {
            // Ensure skills is always an array, even if API returns null for it
            const fetchedProfile = { ...responseData.data, skills: responseData.data.skills || [] };
            setProfile(fetchedProfile);
            setEditableProfile(fetchedProfile);
          } else {
            setMessage({ type: 'error', content: responseData.error || 'Failed to parse profile data.' });
          }
        } else {
          // Use .error from standardized API error response
          const errorData = await response.json();
          setMessage({ type: 'error', content: errorData.error || 'Failed to fetch profile.' });
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

  const handleAddSkillSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSavingSkill(true);
    setAddSkillMessage(null);
    const token = localStorage.getItem('authToken');

    if (!token) {
      setAddSkillMessage({ type: 'error', content: 'Authentication token not found.' });
      setIsSavingSkill(false);
      return;
    }
    if (!newSkillName.trim()) {
      setAddSkillMessage({ type: 'error', content: 'Skill name is required.' });
      setIsSavingSkill(false);
      return;
    }

    try {
      const response = await fetch('/api/profile/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          skill_name: newSkillName,
          proficiency_level: newSkillProficiency || null,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setProfile(prevProfile => ({
          ...prevProfile,
          skills: [...prevProfile.skills, data.skill],
        }));
        setAddSkillMessage({ type: 'success', content: data.message || 'Skill added successfully!' });
        setNewSkillName("");
        setNewSkillProficiency("");
        setIsAddSkillModalOpen(false); // Close modal on success
      } else {
        setAddSkillMessage({ type: 'error', content: data.error || data.details?.join(', ') || 'Failed to add skill.' });
      }
    } catch (error) {
      console.error("Add skill error:", error);
      setAddSkillMessage({ type: 'error', content: 'An error occurred while adding the skill.' });
    } finally {
      setIsSavingSkill(false);
    }
  };

  const handleOpenEditSkillModal = (skill: ProfileSkill) => {
    setEditingSkill(skill);
    setEditedSkillName(skill.skill_name);
    setEditedSkillProficiency(skill.proficiency_level || "");
    setEditSkillMessage(null);
    setIsEditSkillModalOpen(true);
  };

  const handleEditSkillSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;

    setIsUpdatingSkill(true);
    setEditSkillMessage(null);
    const token = localStorage.getItem('authToken');

    if (!token) {
      setEditSkillMessage({ type: 'error', content: 'Authentication token not found.' });
      setIsUpdatingSkill(false);
      return;
    }
    if (!editedSkillName.trim()) {
      setEditSkillMessage({ type: 'error', content: 'Skill name is required.' });
      setIsUpdatingSkill(false);
      return;
    }

    // Check if there are actual changes
    if (editedSkillName === editingSkill.skill_name && (editedSkillProficiency || "") === (editingSkill.proficiency_level || "")) {
      setEditSkillMessage({ type: 'error', content: 'No changes detected.' });
      setIsUpdatingSkill(false);
      return;
    }


    try {
      const response = await fetch(`/api/profile/skills/${editingSkill.user_skill_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          skill_name: editedSkillName,
          proficiency_level: editedSkillProficiency || null,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setProfile(prevProfile => ({
          ...prevProfile,
          skills: prevProfile.skills.map(s =>
            s.user_skill_id === editingSkill.user_skill_id ? data.skill : s
          ),
        }));
        setEditSkillMessage({ type: 'success', content: data.message || 'Skill updated successfully!' });
        setIsEditSkillModalOpen(false);
      } else {
        setEditSkillMessage({ type: 'error', content: data.error || data.details?.join(', ') || 'Failed to update skill.' });
      }
    } catch (error) {
      console.error("Update skill error:", error);
      setEditSkillMessage({ type: 'error', content: 'An error occurred while updating the skill.' });
    } finally {
      setIsUpdatingSkill(false);
    }
  };

  const handleOpenDeleteSkillConfirm = (skill: ProfileSkill) => {
    setSkillToDelete(skill);
    setMessage(null); // Clear previous page-level messages
    setIsDeleteSkillConfirmOpen(true);
  };

  const handleConfirmDeleteSkill = async () => {
    if (!skillToDelete) return;

    setIsDeletingSkill(true);
    setMessage(null);
    const token = localStorage.getItem('authToken');

    if (!token) {
      setMessage({ type: 'error', content: 'Authentication token not found.' });
      setIsDeletingSkill(false);
      setIsDeleteSkillConfirmOpen(false);
      return;
    }

    try {
      const response = await fetch(`/api/profile/skills/${skillToDelete.user_skill_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) { // Status 200 or 204
        setProfile(prevProfile => ({
          ...prevProfile,
          skills: prevProfile.skills.filter(s => s.user_skill_id !== skillToDelete.user_skill_id),
        }));
        setMessage({ type: 'success', content: `Skill "${skillToDelete.skill_name}" deleted successfully.` });
      } else {
        const data = await response.json().catch(() => ({ error: "Failed to delete skill and parse error response."})); // Catch if response is not JSON
        setMessage({ type: 'error', content: data.error || 'Failed to delete skill.' });
      }
    } catch (error) {
      console.error("Delete skill error:", error);
      setMessage({ type: 'error', content: 'An error occurred while deleting the skill.' });
    } finally {
      setIsDeletingSkill(false);
      setIsDeleteSkillConfirmOpen(false);
      setSkillToDelete(null);
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
              <Dialog open={isAddSkillModalOpen} onOpenChange={setIsAddSkillModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => { setIsAddSkillModalOpen(true); setAddSkillMessage(null); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Skill</DialogTitle>
                    <DialogDescription>
                      Showcase your expertise by adding a new skill to your profile.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddSkillSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="newSkillName" className="text-right">
                          Skill Name
                        </Label>
                        <Input
                          id="newSkillName"
                          value={newSkillName}
                          onChange={(e) => setNewSkillName(e.target.value)}
                          className="col-span-3"
                          placeholder="e.g. React, Python, Project Management"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="newSkillProficiency" className="text-right">
                          Proficiency
                        </Label>
                        <Select
                          value={newSkillProficiency}
                          onValueChange={setNewSkillProficiency}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select level (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value=""><em>None</em></SelectItem>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                            <SelectItem value="Expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {addSkillMessage && (
                      <div className={`mb-3 text-sm ${addSkillMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {addSkillMessage.content}
                      </div>
                    )}
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline" onClick={() => { setNewSkillName(""); setNewSkillProficiency(""); setAddSkillMessage(null);}}>
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit" disabled={isSavingSkill}>
                        {isSavingSkill ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Skill
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill.user_skill_id} variant="secondary" className="text-sm py-1 px-3">
                      {skill.skill_name}
                      {skill.proficiency_level && (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          ({skill.proficiency_level})
                        </span>
                      )}
                      {isEditing && ( // Show Edit button only when main profile is in edit mode
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 h-6 w-6 hover:text-blue-700"
                          onClick={() => handleOpenEditSkillModal(skill)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-1 h-6 w-6 text-red-500 hover:text-red-700"
                              onClick={(e) => { e.stopPropagation(); /* Prevents triggering badge click if any */ }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          {/*
                            The AlertDialogContent for delete confirmation will be placed outside the loop,
                            its visibility controlled by isDeleteSkillConfirmOpen and skillToDelete.
                            This is because nesting interactive components like Dialogs/AlertDialogs inside
                            loops or other interactive components can sometimes lead to issues.
                            We will call handleOpenDeleteSkillConfirm here to set the state.
                          */}
                           <span onClick={(e) => {e.stopPropagation(); handleOpenDeleteSkillConfirm(skill);}} className="cursor-pointer"></span>
                        </AlertDialog>
                      </span>
                      )}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isEditing
                    ? "You can add, edit, or delete skills via dedicated buttons/forms (not fully implemented in this view)."
                    : "No skills added yet. Click 'Edit Profile', then use the 'Add Skill' (+) button or manage skills in the dedicated section."}
                </p>
              )}
              {/*
                Placeholder for "Add Skill" form - could be a modal triggered by the Plus button.
                This form would need its own state for skill_name, proficiency_level,
                and a submit handler that calls POST /api/profile/skills.
                After successful addition, the profile.skills state would need to be updated
                (either by re-fetching the whole profile or by adding the new skill to the existing state).
              */}

              {/* Edit Skill Modal */}
              {editingSkill && (
                <Dialog open={isEditSkillModalOpen} onOpenChange={setIsEditSkillModalOpen}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Skill</DialogTitle>
                      <DialogDescription>
                        Update your skill name and proficiency level.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSkillSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="editedSkillName" className="text-right">
                            Skill Name
                          </Label>
                          <Input
                            id="editedSkillName"
                            value={editedSkillName}
                            onChange={(e) => setEditedSkillName(e.target.value)}
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="editedSkillProficiency" className="text-right">
                            Proficiency
                          </Label>
                          <Select
                            value={editedSkillProficiency}
                            onValueChange={setEditedSkillProficiency}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select level (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value=""><em>None</em></SelectItem>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                              <SelectItem value="Expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {editSkillMessage && (
                        <div className={`mb-3 text-sm ${editSkillMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {editSkillMessage.content}
                        </div>
                      )}
                      <DialogFooter>
                        <DialogClose asChild>
                           <Button type="button" variant="outline" onClick={() => setIsEditSkillModalOpen(false)}>
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isUpdatingSkill}>
                          {isUpdatingSkill ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          {/* Certifications Section */}
          <Card>
            {/* Delete Skill Confirmation Dialog (Placed once outside the loop) */}
            {skillToDelete && (
              <AlertDialog open={isDeleteSkillConfirmOpen} onOpenChange={setIsDeleteSkillConfirmOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the skill
                      "<strong>{skillToDelete.skill_name}</strong>" from your profile.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => { setIsDeleteSkillConfirmOpen(false); setSkillToDelete(null); }}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDeleteSkill} disabled={isDeletingSkill} className="bg-red-600 hover:bg-red-700">
                      {isDeletingSkill ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
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
