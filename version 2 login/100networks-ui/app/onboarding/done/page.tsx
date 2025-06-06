"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, SparklesIcon, UserIcon, BriefcaseIcon, GraduationCapIcon, StarIcon } from "lucide-react"
import { OnboardingStepper } from "@/components/onboarding-stepper"

export default function OnboardingDonePage() {
  return (
    <div className="min-h-screen bg-brand-bg-light-gray py-8">
      <OnboardingStepper />
      
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-brand-text-dark mb-3">Basic Profile Setup Complete!</h1>
          <p className="text-brand-text-medium leading-relaxed">
            Great start! Your basic profile is ready, but let's make it stand out with detailed information 
            that will help you get noticed by top employers.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-brand-text-dark">Profile Completion Status</h2>
            <span className="text-2xl font-bold text-black">35%</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm text-brand-text-dark font-medium">Basic Information</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm text-brand-text-dark font-medium">Job Preferences</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm text-brand-text-dark font-medium">Culture Fit</span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className="h-3 bg-gradient-to-r from-black to-green-500 rounded-full transition-all duration-700 ease-out w-[35%]" />
          </div>
        </div>

        {/* What's Missing */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-brand-text-dark mb-6 flex items-center">
            <SparklesIcon className="w-5 h-5 text-black mr-2" />
            Complete Your Profile to Stand Out
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3 mb-2">
                <BriefcaseIcon className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-brand-text-dark">Work Experience</span>
              </div>
              <p className="text-sm text-brand-text-medium">Add your professional experience to showcase your expertise</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3 mb-2">
                <GraduationCapIcon className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-brand-text-dark">Education</span>
              </div>
              <p className="text-sm text-brand-text-medium">Share your educational background and achievements</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3 mb-2">
                <StarIcon className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-brand-text-dark">Skills & Certifications</span>
              </div>
              <p className="text-sm text-brand-text-medium">Highlight your technical and soft skills</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3 mb-2">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-brand-text-dark">Professional Summary</span>
              </div>
              <p className="text-sm text-brand-text-medium">Write a compelling professional summary</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-black to-gray-800 p-6 rounded-xl text-white text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Ready to make your profile irresistible?</h3>
          <p className="text-blue-100 mb-4">
            Complete profiles receive 5x more views from recruiters and hiring managers.
          </p>
          <Button
            className="w-full bg-black hover:bg-gray-900 text-white py-4 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            asChild
          >
            <Link href="/profile/complete">
              <SparklesIcon className="w-6 h-6 mr-3" />
              Complete Your Full Profile
            </Link>
          </Button>
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <Button
            variant="outline"
            className="border-brand-border text-brand-text-medium hover:bg-brand-bg-light-gray font-medium"
            asChild
          >
            <Link href="/dashboard">Skip for now, go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
