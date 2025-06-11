"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChromeIcon, EyeIcon, EyeOffIcon, Check, X } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type React from "react"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "", // Changed to fullName
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData({
      ...formData,
      [id]: value,
    })

    if (id === "password") {
      setPasswordValidation({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
      })
    }
  }

  const isPasswordStrong = Object.values(passwordValidation).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return; // No need to set isLoading if validation fails early
    }

    if (!isPasswordStrong) {
      toast.error("Password does not meet requirements.");
      return; // No need to set isLoading
    }

    setIsLoading(true)

    // Split fullName into firstName and lastName
    let firstName = formData.fullName;
    let lastName = "";
    const nameParts = formData.fullName.trim().split(/\s+/);
    if (nameParts.length > 1) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(" ");
    } else {
      // If only one word, it's firstName, lastName remains empty or could be same as firstName
      // Backend should handle empty lastName if that's acceptable.
      // For this example, lastName will be empty if no space.
    }


    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName, // Use split firstName
          lastName: lastName,   // Use split lastName
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        toast.success("Signup Successful!", { description: "Please proceed to login." });
        router.push("/auth/login");
      } else {
        const errorData = await response.json();
        toast.error("Signup Failed", { description: errorData.message || "Could not create account. Please try again." });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Signup Failed", { description: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex w-full max-w-6xl mx-auto rounded-2xl shadow-xl overflow-hidden border">
        <div className="w-1/2 flex flex-col items-center justify-center bg-[#FFFCF6] p-12">
          <Image
            src="/imagex.png"
            alt="Decorative Abstract Pattern"
            width={400}
            height={400}
            className="mb-10"
            priority
          />
          <h2 className="text-3xl font-black text-brand-text-dark text-left w-full mb-2" style={{fontFamily: 'Inter, sans-serif'}}>
            Where Connections Spark Opportunities
          </h2>
          <p className="text-lg text-brand-text-medium text-left w-full" style={{fontFamily: 'Inter, sans-serif'}}>
            Real roles. Real startups.
          </p>
        </div>
        <div className="w-1/2 flex flex-col justify-center bg-white p-12 min-h-full">
          <div className="mb-8 text-center">
            <span className="text-2xl font-black text-brand-text-dark" style={{fontFamily: 'Inter, sans-serif'}}>100</span>
            <span className="text-2xl font-black text-brand-blue ml-1" style={{fontFamily: 'Inter, sans-serif'}}>Networks</span>
          </div>
          <h1 className="text-4xl font-black text-brand-text-dark mb-8 text-center" style={{fontFamily: 'Inter, sans-serif'}}>Create Account</h1>
          <Button
            variant="outline"
            className="w-full mb-6 border-brand-border text-brand-text-dark hover:bg-brand-bg-light-gray font-medium py-4 text-lg shadow-sm"
          >
            <ChromeIcon className="mr-2 h-6 w-6 text-brand-red" />
            Sign up with Google
          </Button>
          <div className="flex items-center my-6">
            <hr className="flex-grow border-brand-border" />
            <span className="mx-4 text-base text-brand-text-medium font-medium">or Sign up with Mail</span>
            <hr className="flex-grow border-brand-border" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Changed to Full Name */}
            <div>
              <Label htmlFor="fullName" className="text-base font-semibold text-brand-text-medium">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your Full Name"
                className="mt-2 bg-brand-bg-input border-brand-border placeholder-brand-text-light focus:border-brand-blue focus:ring-1 focus:ring-brand-blue py-3 px-4 text-base font-bold"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-base font-semibold text-brand-text-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                className="mt-2 bg-brand-bg-input border-brand-border placeholder-brand-text-light focus:border-brand-blue focus:ring-1 focus:ring-brand-blue py-3 px-4 text-base font-bold"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-base font-semibold text-brand-text-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  className="mt-2 bg-brand-bg-input border-brand-border placeholder-brand-text-light focus:border-brand-blue focus:ring-1 focus:ring-brand-blue py-3 px-4 text-base font-bold"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-brand-text-medium hover:text-brand-blue"
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="text-xs space-y-0.5 mt-2">
                  <div className={`flex items-center ${passwordValidation.length ? "text-green-600" : "text-red-600"}`}>
                    {passwordValidation.length ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                    At least 8 characters
                  </div>
                  <div className={`flex items-center ${passwordValidation.uppercase ? "text-green-600" : "text-red-600"}`}>
                    {passwordValidation.uppercase ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                    One uppercase letter
                  </div>
                  <div className={`flex items-center ${passwordValidation.lowercase ? "text-green-600" : "text-red-600"}`}>
                    {passwordValidation.lowercase ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                    One lowercase letter
                  </div>
                  <div className={`flex items-center ${passwordValidation.number ? "text-green-600" : "text-red-600"}`}>
                    {passwordValidation.number ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                    One number
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-base font-semibold text-brand-text-medium">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  className="mt-2 bg-brand-bg-input border-brand-border placeholder-brand-text-light focus:border-brand-blue focus:ring-1 focus:ring-brand-blue py-3 px-4 text-base font-bold"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-brand-text-medium hover:text-brand-blue"
                >
                  {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">Passwords don't match</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-black hover:bg-brand-text-dark text-white py-3 font-bold text-base rounded-lg mt-2 shadow-md"
              disabled={isLoading || !isPasswordStrong || formData.password !== formData.confirmPassword}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <span className="text-base font-bold text-brand-text-dark">Already have an account? </span>
            <Link href="/auth/login" className="font-bold text-brand-blue underline ml-1">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
