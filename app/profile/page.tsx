"use client"; // Added

import { useEffect, useState, Suspense } from "react"; // Added useEffect, useState, Suspense
import { getToken } from "@/lib/authClient"; // Added
import { toast } from "sonner"; // Added
import ProtectedRoute from "@/components/ProtectedRoute"; // Added
import EditProfileModal from "@/components/EditProfileModal"; // Added
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
  Star,
  Calendar,
  ExternalLink,
  Download,
  Camera,
  Verified
} from "lucide-react"

// Helper to format YYYY-MM dates
const formatMonthYear = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'N/A';
  const [year, month] = dateStr.split('-');
  if (!year || !month) return dateStr; // Fallback if format is unexpected
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};


function ProfilePageContent() {
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false); // Added for modal

  const fetchProfile = async () => { // Renamed for clarity and to pass as prop
    setIsLoading(true);
    setError(null);
      const token = getToken();

      if (!token) {
        setError("Authentication required to view profile.");
        toast.error("Authentication required.");
        setIsLoading(false);
        // ProtectedRoute should handle redirect, but good to stop here.
        return;
      }

      try {
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to fetch profile" }));
          throw new Error(errorData.message || "Failed to fetch profile");
        }
        const data = await response.json();
        setProfileData(data);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message || "Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <Briefcase className="h-12 w-12 text-primary-navy mx-auto animate-pulse mb-4" />
          <p className="text-xl font-semibold text-primary-navy">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center p-6 bg-red-50 rounded-lg shadow-md">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Profile</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p>No profile data available.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6">
      {/* Enhanced Header Card */}
      <Card className="mb-8 border-slate-200 shadow-lg overflow-hidden">
        <div className="relative">
          {/* Modern Cover Photo */}
          <div className="h-56 bg-gradient-to-br from-primary-navy via-[#0056B3] to-slate-600 relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-700 rounded-lg font-subheading"
            >
              <Camera className="h-4 w-4 mr-2" />
              Edit Cover
            </Button>
          </div>

          {/* Enhanced Profile Section */}
          <div className="relative px-8 pb-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-8">
              {/* Profile Picture */}
              <div className="relative mb-6 lg:mb-0 -mt-16">
                <Avatar className="h-36 w-36 border-4 border-white shadow-xl">
                  <AvatarImage src={profileData.avatar_url || "/placeholder-user.jpg"} alt={`${profileData.first_name} ${profileData.last_name}`} />
                  <AvatarFallback className="text-2xl font-heading bg-gradient-to-br from-primary-navy to-[#0056B3] text-white">
                    {profileData.first_name?.[0]}{profileData.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-white shadow-lg hover:shadow-xl border-2 border-slate-100"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 mt-8">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-3xl font-heading text-primary-navy">{profileData.first_name || ""} {profileData.last_name || ""}</h1>
                      {/* Assuming verified status might come from API later */}
                      {/* <Verified className="h-6 w-6 text-[#0056B3]" /> */}
                    </div>
                    <p className="text-xl font-subheading text-slate-600 mb-2">{profileData.headline || "No headline provided"}</p>
                    <div className="flex items-center text-slate-500 font-subheading">
                      <MapPin className="h-4 w-4 mr-2" />
                      {profileData.location_city && profileData.location_state ? `${profileData.location_city}, ${profileData.location_state}` : profileData.location_country || "Location not specified"}
                      {/* Availability needs API field */}
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button variant="outline" className="border-slate-200 hover:border-primary-navy hover:text-primary-navy rounded-lg font-subheading">
                      <Download className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                    <Button
                      className="bg-primary-navy hover:bg-primary-navy/90 text-white rounded-lg font-subheading"
                      onClick={() => setShowEditModal(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </div>

                {/* Contact & Links */}
                <div className="flex flex-wrap gap-6 mt-6 text-sm">
                  {profileData.email && (
                    <a href={`mailto:${profileData.email}`} className="flex items-center text-[#0056B3] hover:text-primary-navy transition-colors font-subheading">
                      <Mail className="h-4 w-4 mr-2" />
                      {profileData.email}
                    </a>
                  )}
                  {profileData.phone_number && (
                    <div className="flex items-center text-slate-500 font-subheading">
                      <Phone className="h-4 w-4 mr-2" />
                      {profileData.phone_number}
                    </div>
                  )}
                  {profileData.website_url && (
                    <a href={profileData.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-[#0056B3] hover:text-primary-navy transition-colors font-subheading">
                      <Globe className="h-4 w-4 mr-2" />
                      {profileData.website_url.replace(/^https?:\/\//, '')}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>

                {/* Enhanced Stats - Placeholder, API doesn't provide this */}
                <div className="flex flex-wrap gap-8 mt-6 opacity-50" title="Profile stats not yet available">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-slate-400" />
                    <div>
                      <span className="font-heading text-lg text-slate-500">---</span>
                      <span className="text-slate-400 font-subheading ml-1">followers</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-slate-400" />
                    <div>
                      <span className="font-heading text-lg text-slate-500">---</span>
                      <span className="text-slate-400 font-subheading ml-1">profile views</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-slate-400" />
                    <div>
                      <span className="font-heading text-lg text-slate-500">--</span>
                      <span className="text-slate-400 font-subheading ml-1">rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Enhanced About Section */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-heading text-primary-navy">About</h2>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary-navy hover:bg-primary-navy/5 rounded-full">
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-slate-600 font-subheading leading-relaxed text-lg">
                {profileData.bio || "No biography provided."}
              </p>
              {/* Badges for open to work etc. need API fields */}
              {/* <div className="flex flex-wrap gap-2 mt-6"> ... </div> */}
            </CardContent>
          </Card>

          {/* Enhanced Experience Section */}
          {profileData.experiences && profileData.experiences.length > 0 && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-heading text-primary-navy">Experience</h2>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary-navy hover:bg-primary-navy/5 rounded-full" onClick={() => setShowEditModal(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-6 space-y-8">
                {profileData.experiences.map((exp: any, index: number) => (
                  <div key={index} className="flex space-x-6">
                    <div className="flex-shrink-0">
                      <div className={`h-16 w-16 bg-gradient-to-br ${index % 2 === 0 ? 'from-primary-navy to-[#0056B3]' : 'from-green-500 to-green-600'} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Briefcase className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-heading text-primary-navy">{exp.title}</h3>
                          <p className="text-slate-600 font-subheading text-lg">{exp.company_name} • {exp.employment_type || 'N/A'}</p>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span className="font-subheading">{formatMonthYear(exp.start_date)} - {exp.current_job ? 'Present' : formatMonthYear(exp.end_date)}</span>
                            </div>
                            {exp.location_city && exp.location_state && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span className="font-subheading">{exp.location_city}, {exp.location_state}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary-navy hover:bg-primary-navy/5 rounded-full">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-slate-600 font-subheading leading-relaxed mb-4">
                        {exp.description || "No description provided."}
                      </p>
                      {/* Skills for experience item not directly available, could be inferred or added to API */}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Enhanced Education Section */}
          {profileData.educations && profileData.educations.length > 0 && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-heading text-primary-navy">Education</h2>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary-navy hover:bg-primary-navy/5 rounded-full" onClick={() => setShowEditModal(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {profileData.educations.map((edu: any, index: number) => (
                  <div key={index} className="flex space-x-6">
                    <div className="flex-shrink-0">
                      <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <GraduationCap className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-heading text-primary-navy mb-1">{edu.degree || "N/A"}</h3>
                      <p className="text-slate-600 font-subheading text-lg mb-2">{edu.school_name || "N/A"}{edu.field_of_study ? ` - ${edu.field_of_study}` : ""}</p>
                      <p className="text-slate-500 font-subheading mb-3">{formatMonthYear(edu.start_date)} - {formatMonthYear(edu.end_date)}</p>
                      <p className="text-slate-600 font-subheading leading-relaxed">
                        {edu.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Enhanced Projects Section - Placeholder */}
          <Card className="border-slate-200 shadow-sm opacity-50">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-heading text-primary-navy">Featured Projects <span className="text-sm text-slate-400">(Not Available)</span></h2>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary-navy hover:bg-primary-navy/5 rounded-full">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <Card className="border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-heading text-primary-navy">AI-Powered Task Manager</h3>
                      <p className="text-slate-500 font-subheading">Personal Project • 2024</p>
                    </div>
                    <ExternalLink className="h-5 w-5 text-slate-400 hover:text-primary-navy cursor-pointer" />
                  </div>
                  <p className="text-slate-600 font-subheading leading-relaxed mb-4">
                    Built a smart task management app using React and OpenAI API that automatically categorizes and
                    prioritizes tasks based on user behavior. Features real-time collaboration and AI-driven insights.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-slate-100 text-slate-700 font-subheading">React</Badge>
                    <Badge className="bg-slate-100 text-slate-700 font-subheading">OpenAI API</Badge>
                    <Badge className="bg-slate-100 text-slate-700 font-subheading">Tailwind CSS</Badge>
                    <Badge className="bg-[#0056B3]/10 text-[#0056B3] font-subheading">AI/ML</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-heading text-primary-navy">E-commerce Analytics Dashboard</h3>
                      <p className="text-slate-500 font-subheading">Freelance Project • 2023</p>
                    </div>
                    <ExternalLink className="h-5 w-5 text-slate-400 hover:text-primary-navy cursor-pointer" />
                  </div>
                  <p className="text-slate-600 font-subheading leading-relaxed mb-4">
                    Developed a real-time analytics dashboard for an e-commerce client, resulting in 25% increase in
                    conversion rates. Featured advanced data visualization and custom metrics.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-slate-100 text-slate-700 font-subheading">Vue.js</Badge>
                    <Badge className="bg-slate-100 text-slate-700 font-subheading">D3.js</Badge>
                    <Badge className="bg-slate-100 text-slate-700 font-subheading">Node.js</Badge>
                    <Badge className="bg-green-100 text-green-700 font-subheading">Analytics</Badge>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Enhanced Skills Section */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-heading text-primary-navy">Technical Skills</h2>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary-navy hover:bg-primary-navy/5 rounded-full" onClick={() => setShowEditModal(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {profileData.skills && profileData.skills.length > 0 ? (
                <div className="space-y-4">
                  {profileData.skills.map((skill: any, index: number) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-subheading font-medium text-primary-navy">{skill.name}</span>
                        {skill.proficiency_level && <span className="text-xs font-subheading text-slate-500 capitalize">{skill.proficiency_level.replace("_", " ")}</span>}
                      </div>
                      {/* Basic representation if proficiency is a range or not easily mapped to percentage */}
                       <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-[#0056B3] h-2 rounded-full" style={{ width: `${skill.proficiency_level === 'expert' ? 90 : skill.proficiency_level === 'advanced' ? 75 : skill.proficiency_level === 'intermediate' ? 50 : skill.proficiency_level === 'beginner' ? 25 : 30}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 font-subheading">No skills listed.</p>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Certifications Section - Placeholder */}
          <Card className="border-slate-200 shadow-sm opacity-50">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-heading text-primary-navy">Certifications <span className="text-sm text-slate-400">(Not Available)</span></h2>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary-navy hover:bg-primary-navy/5 rounded-full">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start space-x-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <Award className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-subheading font-medium text-primary-navy">AWS Certified Solutions Architect</h3>
                  <p className="text-sm font-subheading text-slate-600">Amazon Web Services • 2023</p>
                  <Badge className="bg-yellow-100 text-yellow-800 font-subheading text-xs mt-2">Active</Badge>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <Award className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-subheading font-medium text-primary-navy">React Developer Certification</h3>
                  <p className="text-sm font-subheading text-slate-600">Meta • 2022</p>
                  <Badge className="bg-blue-100 text-blue-800 font-subheading text-xs mt-2">Active</Badge>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-3 rounded-lg bg-green-50 border border-green-200">
                <Award className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-subheading font-medium text-primary-navy">Scrum Master Certified</h3>
                  <p className="text-sm font-subheading text-slate-600">Scrum Alliance • 2021</p>
                  <Badge className="bg-green-100 text-green-800 font-subheading text-xs mt-2">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Languages Section */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-heading text-primary-navy">Languages <span className="text-sm text-slate-400">(Not Available)</span></h2>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary-navy hover:bg-primary-navy/5 rounded-full">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <p className="text-slate-500 font-subheading">Language information not available.</p>
            </CardContent>
          </Card>

          {/* Enhanced Recommendations Section - Placeholder */}
          <Card className="border-slate-200 shadow-sm opacity-50">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-heading text-primary-navy">Recommendations <span className="text-sm text-slate-400">(Not Available)</span></h2>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary-navy hover:bg-primary-navy/5 rounded-full">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="border-l-4 border-[#0056B3] pl-6 py-4 bg-slate-50 rounded-r-lg">
                  <p className="font-subheading text-slate-700 italic leading-relaxed mb-4">
                    "Alex is an exceptional developer who consistently delivers high-quality code. Their leadership
                    skills and technical expertise make them invaluable to any team. I highly recommend Alex for senior engineering roles."
                  </p>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/manager-avatar.png" alt="Sarah Chen" />
                      <AvatarFallback className="font-heading text-xs bg-primary-navy text-white">SC</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-subheading font-medium text-primary-navy">Sarah Chen</p>
                      <p className="text-sm font-subheading text-slate-500">Engineering Manager at TechCorp</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
      {showEditModal && profileData && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          profileData={profileData}
          onProfileUpdate={fetchProfile}
        />
      )}
    </>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-screen">
          <Briefcase className="h-12 w-12 text-primary-navy mx-auto animate-pulse mb-4" />
           <p className="text-xl font-semibold text-primary-navy">Loading Profile...</p>
        </div>
      }>
        <ProfilePageContent />
      </Suspense>
    </ProtectedRoute>
  );
}
