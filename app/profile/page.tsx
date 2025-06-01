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

export default function ProfilePage() {
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
                  <AvatarImage src="/professional-user-avatar.png" alt="Your Name" />
                  <AvatarFallback className="text-2xl">YN</AvatarFallback>
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
                    <h1 className="text-2xl font-bold">Alex Johnson</h1>
                    <p className="text-lg text-muted-foreground">Senior Software Engineer at TechCorp</p>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      San Francisco, CA
                    </div>
                  </div>
                  <Button variant="outline" className="ml-4">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <div className="flex items-center text-blue-600">
                    <Mail className="h-4 w-4 mr-1" />
                    alex.johnson@email.com
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="h-4 w-4 mr-1" />
                    (555) 123-4567
                  </div>
                  <div className="flex items-center text-blue-600">
                    <Globe className="h-4 w-4 mr-1" />
                    alexjohnson.dev
                  </div>
                </div>

                {/* Stats */}
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
                Passionate software engineer with 7+ years of experience building scalable web applications. Specialized
                in React, Node.js, and cloud technologies. I love solving complex problems and mentoring junior
                developers. Currently focused on building AI-powered solutions that make a positive impact on people's
                lives.
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
    </ProtectedRoute>
  )
}
