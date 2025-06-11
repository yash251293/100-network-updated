"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { CheckIcon, UserIcon, HeartIcon, SettingsIcon, FileTextIcon, SparklesIcon } from "lucide-react"

const stepsData = [
  { 
    name: "Verify Email", 
    href: "/onboarding/verify-email", 
    shortName: "Email",
    icon: SparklesIcon,
    description: "Confirm your account"
  },
  { 
    name: "Profile", 
    href: "/onboarding/profile", 
    shortName: "Profile",
    icon: UserIcon,
    description: "Basic information"
  },
  { 
    name: "Preferences", 
    href: "/onboarding/preferences", 
    shortName: "Preferences",
    icon: SettingsIcon,
    description: "Job preferences"
  },
  { 
    name: "Culture", 
    href: "/onboarding/culture", 
    shortName: "Culture",
    icon: HeartIcon,
    description: "Work culture fit"
  },
  { 
    name: "Resume/CV", 
    href: "/onboarding/resume", 
    shortName: "Resume",
    icon: FileTextIcon,
    description: "Upload documents"
  },
  { 
    name: "Complete", 
    href: "/onboarding/done", 
    shortName: "Done",
    icon: CheckIcon,
    description: "All set!"
  },
]

export function OnboardingStepper() {
  const pathname = usePathname()
  const currentStepIndex = stepsData.findIndex((step) => pathname.startsWith(step.href))

  // For this example, let's assume email is verified if we are past the verify-email step or on it.
  // In a real app, this would come from user state.
  const emailVerified = currentStepIndex >= 0

  // Calculate progress percentage
  const completedSteps = currentStepIndex >= 0 ? currentStepIndex + 1 : 0
  const progressPercentage = (completedSteps / stepsData.length) * 100

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-blue-light rounded-2xl shadow-lg mb-4">
          <SparklesIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-brand-text-dark mb-1">Profile Setup</h2>
        <p className="text-sm text-brand-text-medium">Complete your profile to get matched with amazing opportunities</p>
      </div>

      {/* Progress Bar Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-brand-blue/10 rounded-full">
              <span className="text-sm font-bold text-brand-blue">
                {Math.max(completedSteps, 1)}
              </span>
            </div>
            <div>
              <span className="text-sm font-semibold text-brand-text-dark">
                Step {Math.max(completedSteps, 1)} of {stepsData.length}
              </span>
              <p className="text-xs text-brand-text-medium">
                {stepsData[currentStepIndex]?.description || "Getting started"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-brand-blue">
              {Math.round(progressPercentage)}%
            </span>
            <p className="text-xs text-brand-text-medium">Complete</p>
          </div>
        </div>
        
        {/* Enhanced Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="h-3 bg-gradient-to-r from-brand-blue via-blue-500 to-brand-blue-light rounded-full transition-all duration-700 ease-out shadow-sm relative overflow-hidden"
              style={{ width: `${Math.max(progressPercentage, 5)}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
          {/* Progress dots */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-1">
            {stepsData.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  idx < completedSteps
                    ? "bg-white shadow-md scale-110"
                    : "bg-gray-300"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <nav aria-label="Progress">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {stepsData.map((step, stepIdx) => {
            let status = "upcoming"
            if (step.name === "Verify Email" && emailVerified && currentStepIndex > 0) {
              status = "complete"
            } else if (currentStepIndex > stepIdx) {
              status = "complete"
            } else if (currentStepIndex === stepIdx) {
              status = "current"
            }

            // Special handling for Email Verification if it's the current step
            if (step.name === "Verify Email" && currentStepIndex === stepIdx) {
              status = "current"
            }

            const IconComponent = step.icon

            return (
              <Link
                key={step.name}
                href={step.href}
                className={cn(
                  "group flex flex-col items-center p-4 rounded-xl transition-all duration-200 border",
                  "focus:outline-none focus:ring-4 focus:ring-brand-blue/20",
                  status === "complete"
                    ? "bg-gradient-to-br from-brand-blue to-brand-blue-light border-brand-blue text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                    : status === "current"
                      ? "bg-blue-50 border-brand-blue text-brand-blue shadow-md ring-2 ring-brand-blue/20"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:shadow-sm",
                )}
                aria-current={status === "current" ? "step" : undefined}
              >
                {/* Step Icon/Number */}
                <div className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-xl mb-3 transition-all duration-200",
                  status === "complete"
                    ? "bg-white/20 backdrop-blur-sm"
                    : status === "current"
                      ? "bg-brand-blue/10"
                      : "bg-gray-100 group-hover:bg-gray-200",
                )}>
                  {status === "complete" ? (
                    <CheckIcon className="w-6 h-6 text-white" />
                  ) : (
                    <IconComponent className={cn(
                      "w-6 h-6",
                      status === "current" ? "text-brand-blue" : "text-gray-400"
                    )} />
                  )}
                </div>
                
                {/* Step Label */}
                <div className="text-center">
                  <span className={cn(
                    "block text-xs font-semibold mb-1 transition-colors duration-200",
                    status === "complete" 
                      ? "text-white" 
                      : status === "current"
                        ? "text-brand-blue"
                        : "text-gray-600"
                  )}>
                    <span className="hidden sm:block">{step.name}</span>
                    <span className="sm:hidden">{step.shortName}</span>
                  </span>
                  <span className={cn(
                    "text-xs transition-colors duration-200",
                    status === "complete" 
                      ? "text-white/80" 
                      : status === "current"
                        ? "text-brand-blue/70"
                        : "text-gray-400"
                  )}>
                    {step.description}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
