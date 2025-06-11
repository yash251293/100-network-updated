"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Shield,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Star,
  MapPin,
  Clock,
  Users,
  FileText,
  Lock,
  Eye,
  Banknote,
  TrendingUp,
  Award,
  MessageCircle,
  Check,
  X,
  PlusCircle,
  Building2,
  Briefcase,
  Phone,
  Mail,
  ExternalLink
} from "lucide-react"

export default function CompanyHireFreelancerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('project')
  const applicantId = searchParams.get('applicant')

  const [paymentType, setPaymentType] = useState("escrow")
  const [paymentOption, setPaymentOption] = useState("full")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("1")
  const [contractTerms, setContractTerms] = useState("")
  const [projectStartDate, setProjectStartDate] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentPortal, setShowPaymentPortal] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [paymentStep, setPaymentStep] = useState(1)

  // Mock data - in real app, fetch based on projectId and applicantId
  const project = {
    id: parseInt(projectId || "1"),
    title: "React Native Mobile App Development",
    description: "We are looking for an experienced React Native developer to build a cross-platform mobile application for our e-commerce platform. The app should include user authentication, product browsing, shopping cart functionality, payment integration, and real-time notifications.",
    budget: "$8,000 - $12,000",
    agreedAmount: 9500,
    timeline: "2-3 months",
    skills: ["React Native", "TypeScript", "API Integration", "Firebase", "Redux"],
    category: "Mobile Development",
    experience: "Expert",
    company: "TechCorp Inc."
  }

  const freelancer = {
    id: parseInt(applicantId || "1"),
    name: "Alex Rivera",
    avatar: "/api/placeholder/64/64",
    title: "Senior React Native Developer",
    rating: 4.9,
    reviews: 127,
    hourlyRate: 65,
    proposalAmount: "$9,500",
    location: "San Francisco, CA",
    completedProjects: 89,
    successRate: "98%",
    responseTime: "1 hour",
    availability: "Available now",
    skills: ["React Native", "TypeScript", "Redux", "Firebase", "API Integration", "Payment Integration"],
    email: "alex.rivera@email.com",
    phone: "+1 (555) 123-4567",
    portfolio: [
      { title: "E-commerce Mobile App", description: "Built for retail client", link: "#" },
      { title: "Food Delivery App", description: "React Native + Firebase", link: "#" },
    ],
    experience: "6+ years",
    education: "B.S. Computer Science, Stanford University",
    certifications: ["React Native Certified Developer", "Firebase Certified"]
  }

  const paymentMethods = [
    {
      id: "1",
      type: "Corporate Visa",
      lastFour: "8842",
      isDefault: true,
      cardholderName: "TechCorp Inc."
    },
    {
      id: "2",
      type: "Corporate Mastercard",
      lastFour: "6555",
      isDefault: false,
      cardholderName: "TechCorp Inc."
    }
  ]

  const handleHireFreelancer = async () => {
    setIsProcessing(true)

    if (paymentType === "direct") {
      // For direct payments, skip payment portal and go directly to success
      await new Promise(resolve => setTimeout(resolve, 1500)) // Brief processing time
      setIsProcessing(false)
      setShowSuccessPopup(true)
    } else {
      // For escrow payments, show payment portal
      setShowPaymentPortal(true)
      setIsProcessing(false)
    }
  }

  const processPayment = async () => {
    setPaymentStep(2)
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    setPaymentStep(3)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setShowPaymentPortal(false)
    setIsProcessing(false)
    setShowSuccessPopup(true)
  }

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false)
    router.push(`/company-freelance/${projectId}`)
  }

  const milestonePayments = {
    first: paymentOption === "milestone" ? Math.round(project.agreedAmount * 0.5) : 0,
    second: paymentOption === "milestone" ? project.agreedAmount - Math.round(project.agreedAmount * 0.5) : 0
  }

  const platformFee = paymentType === "escrow" ? Math.round(project.agreedAmount * 0.05) : 0
  const totalAmount = project.agreedAmount + platformFee

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="w-[65%] mx-auto py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <Button
                variant="ghost"
                size="icon"
                className="p-2 hover:bg-slate-100 rounded-xl"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </Button>
              <div>
                <h1 className="text-4xl font-heading text-primary-navy">Hire Freelancer</h1>
                <p className="text-xl text-slate-600 font-subheading">
                  Complete your hiring process with secure payment protection
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Project & Freelancer Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Information */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-heading text-primary-navy">Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-heading text-slate-900 mb-2">{project.title}</h3>
                    <p className="text-slate-600 leading-relaxed font-subheading">{project.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="bg-slate-50 border-slate-200 text-slate-700 font-subheading">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-slate-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span className="font-subheading">Budget Range: {project.budget}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="font-subheading">Timeline: {project.timeline}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Briefcase className="h-4 w-4 mr-2" />
                        <span className="font-subheading">Experience: {project.experience}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 font-subheading">Agreed Amount</p>
                      <p className="text-3xl font-heading text-green-600">${project.agreedAmount.toLocaleString()}</p>
                      <p className="text-sm text-slate-500 font-subheading">for {freelancer.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Freelancer Information */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-heading text-primary-navy">Selected Freelancer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4 mb-6">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={freelancer.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-primary-navy to-slate-700 text-white text-lg font-heading">
                        {freelancer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-2xl font-heading text-slate-900">{freelancer.name}</h3>
                        <Badge className="bg-green-100 text-green-800 border-green-200 font-subheading">
                          <Award className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                      <p className="text-lg font-subheading text-slate-600 mb-3">{freelancer.title}</p>
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 fill-amber-400 text-amber-400" />
                          <span className="font-subheading">{freelancer.rating} ({freelancer.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="font-subheading">{freelancer.location}</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span className="font-subheading">${freelancer.hourlyRate}/hr</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {freelancer.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50 font-subheading">
                            {skill}
                          </Badge>
                        ))}
                        {freelancer.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs border-slate-200 text-slate-600 font-subheading">
                            +{freelancer.skills.length - 4} more
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center text-sm text-slate-600">
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="font-subheading">{freelancer.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Phone className="h-4 w-4 mr-2" />
                          <span className="font-subheading">{freelancer.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Freelancer Stats */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-heading text-primary-navy">{freelancer.completedProjects}</p>
                      <p className="text-xs text-slate-600 font-subheading">Projects Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-heading text-primary-navy">{freelancer.successRate}</p>
                      <p className="text-xs text-slate-600 font-subheading">Success Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-heading text-primary-navy">{freelancer.responseTime}</p>
                      <p className="text-xs text-slate-600 font-subheading">Response Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Type Selection */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-heading text-primary-navy">Payment Method</CardTitle>
                  <CardDescription className="font-subheading">
                    Choose your preferred payment method for this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentType} onValueChange={setPaymentType}>
                    <div className="space-y-4">
                      {/* 100Networks Escrow Option */}
                      <div className="flex items-start space-x-3 p-4 border-2 border-green-200 rounded-lg bg-green-50 hover:border-green-300 transition-colors">
                        <RadioGroupItem value="escrow" id="escrow" className="mt-1" />
                        <Label htmlFor="escrow" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-5 w-5 text-green-600" />
                              <h4 className="font-heading text-green-900">100Networks Secure Escrow</h4>
                              <Badge className="bg-green-600 text-white font-subheading">Recommended</Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-green-700 font-subheading">5% Platform Fee</p>
                              <p className="text-xs text-green-600 font-subheading">${platformFee}</p>
                            </div>
                          </div>
                          <p className="text-sm text-green-700 mb-3 font-subheading">
                            Your payment is held securely by 100Networks until project completion. Funds are only released when you approve the deliverables.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                              <div>
                                <p className="text-xs font-subheading text-green-800">Corporate Protection</p>
                                <p className="text-xs text-green-600 font-subheading">Enterprise-grade security</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                              <div>
                                <p className="text-xs font-subheading text-green-800">Dispute Resolution</p>
                                <p className="text-xs text-green-600 font-subheading">Business mediation support</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                              <div>
                                <p className="text-xs font-subheading text-green-800">Quality Guarantee</p>
                                <p className="text-xs text-green-600 font-subheading">Full refund protection</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                              <div>
                                <p className="text-xs font-subheading text-green-800">Milestone Management</p>
                                <p className="text-xs text-green-600 font-subheading">Structured payment releases</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-xs">
                            <div className="flex items-center text-green-600">
                              <Building2 className="h-3 w-3 mr-1" />
                              <span className="font-subheading">Enterprise verified</span>
                            </div>
                            <div className="flex items-center text-green-600">
                              <Lock className="h-3 w-3 mr-1" />
                              <span className="font-subheading">SOC 2 compliant</span>
                            </div>
                            <div className="flex items-center text-green-600">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              <span className="font-subheading">Dedicated support</span>
                            </div>
                          </div>
                        </Label>
                      </div>

                      {/* Direct Payment Option */}
                      <div className="flex items-start space-x-3 p-4 border-2 border-orange-200 rounded-lg bg-orange-50 hover:border-orange-300 transition-colors">
                        <RadioGroupItem value="direct" id="direct" className="mt-1" />
                        <Label htmlFor="direct" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Banknote className="h-5 w-5 text-orange-600" />
                              <h4 className="font-heading text-orange-900">Direct Corporate Payment</h4>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-orange-700 font-subheading">No Platform Fee</p>
                              <p className="text-xs text-orange-600 font-subheading">Save ${platformFee}</p>
                            </div>
                          </div>
                          <p className="text-sm text-orange-700 mb-3 font-subheading">
                            Pay the freelancer directly without 100Networks holding the funds. You save on platform fees but lose protection benefits.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                              <div>
                                <p className="text-xs font-subheading text-orange-800">No Payment Protection</p>
                                <p className="text-xs text-orange-600 font-subheading">Funds released immediately</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                              <div>
                                <p className="text-xs font-subheading text-orange-800">Limited Dispute Support</p>
                                <p className="text-xs text-orange-600 font-subheading">Handle issues independently</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                              <div>
                                <p className="text-xs font-subheading text-orange-800">No Refund Guarantee</p>
                                <p className="text-xs text-orange-600 font-subheading">No automatic refund protection</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2">
                              <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5" />
                              <div>
                                <p className="text-xs font-subheading text-orange-800">Cost Savings</p>
                                <p className="text-xs text-orange-600 font-subheading">No additional charges</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-2 bg-orange-100 rounded border-l-4 border-orange-400">
                            <p className="text-xs text-orange-700 font-subheading">
                              ⚠️ Warning: Limited protection available with direct payment option
                            </p>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Structure Options - Only show for escrow */}
              {paymentType === "escrow" && (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-heading text-primary-navy">Payment Structure</CardTitle>
                    <CardDescription className="font-subheading">
                      Choose how you want to structure the payment release
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentOption} onValueChange={setPaymentOption}>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-4 border-2 border-blue-200 rounded-lg bg-blue-50 hover:border-blue-300 transition-colors">
                          <RadioGroupItem value="full" id="full" className="mt-1" />
                          <Label htmlFor="full" className="flex-1 cursor-pointer">
                            <div className="flex items-center space-x-2 mb-2">
                              <Banknote className="h-5 w-5 text-blue-600" />
                              <h4 className="font-heading text-blue-900">Full Payment on Completion</h4>
                            </div>
                            <p className="text-sm text-blue-700 font-subheading">
                              Pay the entire amount when the project is completed and delivered to your satisfaction.
                            </p>
                          </Label>
                        </div>

                        <div className="flex items-start space-x-3 p-4 border-2 border-purple-200 rounded-lg bg-purple-50 hover:border-purple-300 transition-colors">
                          <RadioGroupItem value="milestone" id="milestone" className="mt-1" />
                          <Label htmlFor="milestone" className="flex-1 cursor-pointer">
                            <div className="flex items-center space-x-2 mb-2">
                              <CheckCircle className="h-5 w-5 text-purple-600" />
                              <h4 className="font-heading text-purple-900">Milestone-Based Payment</h4>
                            </div>
                            <p className="text-sm text-purple-700 mb-3 font-subheading">
                              Split payment into milestones to ensure consistent progress and reduce risk.
                            </p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="p-2 bg-white rounded border">
                                <p className="font-subheading text-purple-800">Milestone 1 (50%)</p>
                                <p className="font-heading text-purple-600">${milestonePayments.first.toLocaleString()}</p>
                              </div>
                              <div className="p-2 bg-white rounded border">
                                <p className="font-subheading text-purple-800">Milestone 2 (50%)</p>
                                <p className="font-heading text-purple-600">${milestonePayments.second.toLocaleString()}</p>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              )}

              {/* Contract Terms */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-heading text-primary-navy">Project Details & Timeline</CardTitle>
                  <CardDescription className="font-subheading">
                    Add any additional project requirements or timeline specifics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="start-date" className="font-heading text-slate-700">Project Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={projectStartDate}
                      onChange={(e) => setProjectStartDate(e.target.value)}
                      className="mt-2 font-subheading"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contract-terms" className="font-heading text-slate-700">Additional Project Requirements</Label>
                    <Textarea
                      id="contract-terms"
                      placeholder="Add any specific requirements, deliverables, or expectations for this project..."
                      value={contractTerms}
                      onChange={(e) => setContractTerms(e.target.value)}
                      rows={4}
                      className="mt-2 font-subheading"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Payment Summary */}
            <div className="space-y-6">
              {/* Hire Summary */}
              <Card className="border-slate-200 shadow-sm sticky top-8">
                <CardHeader>
                  <CardTitle className="text-xl font-heading text-primary-navy">Hiring Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-subheading text-slate-600">Project Amount</span>
                      <span className="font-heading text-slate-900">${project.agreedAmount.toLocaleString()}</span>
                    </div>

                    {paymentType === "escrow" && (
                      <div className="flex justify-between">
                        <span className="font-subheading text-slate-600">Platform Fee (5%)</span>
                        <span className="font-heading text-slate-900">${platformFee.toLocaleString()}</span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between">
                      <span className="font-heading text-slate-900">Total Amount</span>
                      <span className="font-heading text-2xl text-green-600">${totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {paymentType === "escrow" && paymentOption === "milestone" && (
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <p className="font-heading text-slate-900 text-sm">Milestone Breakdown:</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-subheading text-slate-600">Milestone 1</span>
                          <span className="font-heading text-slate-900">${milestonePayments.first.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-subheading text-slate-600">Milestone 2</span>
                          <span className="font-heading text-slate-900">${milestonePayments.second.toLocaleString()}</span>
                        </div>
                        {paymentType === "escrow" && (
                          <div className="flex justify-between">
                            <span className="font-subheading text-slate-600">Platform Fee</span>
                            <span className="font-heading text-slate-900">${platformFee.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 space-y-3">
                    <Button
                      onClick={handleHireFreelancer}
                      disabled={isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg font-subheading py-3 text-lg"
                    >
                      {isProcessing ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5" />
                          <span>Hire {freelancer.name}</span>
                        </div>
                      )}
                    </Button>

                    <p className="text-xs text-slate-500 font-subheading text-center">
                      By proceeding, you agree to 100Networks Terms of Service and Privacy Policy
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Freelancer Portfolio Quick View */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-heading text-primary-navy">Portfolio Highlights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {freelancer.portfolio.map((item, index) => (
                    <div key={index} className="p-3 border border-slate-200 rounded-lg">
                      <h4 className="font-heading text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-600 font-subheading mb-2">{item.description}</p>
                      <Button variant="outline" size="sm" className="font-subheading text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Project
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Portal Modal */}
      {showPaymentPortal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6">
              <h3 className="text-2xl font-heading text-primary-navy mb-6">Complete Payment</h3>

              {paymentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label className="font-heading text-slate-700">Select Payment Method</Label>
                    <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} className="mt-2">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <RadioGroupItem value={method.id} />
                          <CreditCard className="h-5 w-5 text-slate-500" />
                          <div className="flex-1">
                            <p className="font-subheading text-slate-900">{method.type} •••• {method.lastFour}</p>
                            <p className="text-sm text-slate-500 font-subheading">{method.cardholderName}</p>
                          </div>
                          {method.isDefault && (
                            <Badge variant="outline" className="font-subheading">Default</Badge>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="font-subheading text-slate-600">Project Amount</span>
                      <span className="font-heading text-slate-900">${project.agreedAmount.toLocaleString()}</span>
                    </div>
                    {paymentType === "escrow" && (
                      <div className="flex justify-between mb-2">
                        <span className="font-subheading text-slate-600">Platform Fee</span>
                        <span className="font-heading text-slate-900">${platformFee.toLocaleString()}</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between">
                      <span className="font-heading text-slate-900">Total</span>
                      <span className="font-heading text-xl text-green-600">${totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={() => setShowPaymentPortal(false)} className="flex-1 font-subheading">
                      Cancel
                    </Button>
                    <Button onClick={processPayment} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-subheading">
                      Confirm Payment
                    </Button>
                  </div>
                </div>
              )}

              {paymentStep === 2 && (
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <h4 className="text-lg font-heading text-slate-900">Processing Payment</h4>
                  <p className="font-subheading text-slate-600">Please wait while we process your payment...</p>
                </div>
              )}

              {paymentStep === 3 && (
                <div className="text-center space-y-4">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                  <h4 className="text-lg font-heading text-slate-900">Payment Successful</h4>
                  <p className="font-subheading text-slate-600">Your payment has been processed successfully!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-heading text-slate-900 mb-2">Freelancer Hired Successfully!</h3>
              <p className="font-subheading text-slate-600 mb-6">
                {freelancer.name} has been notified and will start working on your project soon.
              </p>
              <div className="space-y-3">
                <Button onClick={closeSuccessPopup} className="w-full bg-primary-navy hover:bg-primary-navy/90 text-white font-subheading">
                  Return to Project
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/company-freelance')}
                  className="w-full font-subheading"
                >
                  View All Projects
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}