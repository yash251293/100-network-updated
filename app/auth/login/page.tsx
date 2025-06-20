"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button" // Main project's components
import { Input } from "@/components/ui/input"   // Main project's components
import { Label } from "@/components/ui/label"   // Main project's components
// Logo component from new login signup is used as a placeholder if not available in main
// For now, the new login page uses a span for the logo text directly.
import { ChromeIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { login as authLogin } from "@/lib/authClient"
import { toast } from "sonner"
import type React from "react" // For event types

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value, // Changed from e.target.name to e.target.id to match new HTML
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) { // Check if token exists
          authLogin(data.token);
          toast.success("Login Successful", { description: "Welcome back!" });
          router.push("/feed");
        } else {
          // Handle cases where token is not in response, though API should provide it on success
          toast.error("Login Failed", { description: "Authentication successful but no token received." });
        }
      } else {
        const errorData = await response.json();
        toast.error("Login Failed", { description: errorData.message || "Invalid credentials or server error." });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login Failed", { description: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex justify-center bg-white py-8">
      <div className="flex flex-1 w-full max-w-6xl mx-auto rounded-2xl shadow-xl border">
        {/* Left Side - Image and Text from new login page */}
        <div className="w-1/2 flex-col items-center justify-center bg-[#FFFCF6] p-12 hidden md:flex">
          <Image
            src="/imagex.png" // This path needs to be valid in the main project. Assuming it is or will be.
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
        {/* Right Side - Card from new login page */}
        <div className="w-full md:w-1/2 flex flex-col bg-white p-6 sm:p-12 overflow-y-auto">
          <div className="mb-8 text-center">
            <span className="text-2xl font-black text-brand-text-dark" style={{fontFamily: 'Inter, sans-serif'}}>100</span>
            <span className="text-2xl font-black text-brand-blue ml-1" style={{fontFamily: 'Inter, sans-serif'}}>Networks</span>
          </div>
          <h1 className="text-4xl font-black text-brand-text-dark mb-8 text-center" style={{fontFamily: 'Inter, sans-serif'}}>Login</h1>
          <Button
            variant="outline"
            className="w-full mb-6 border-brand-border text-brand-text-dark hover:bg-brand-bg-light-gray font-medium py-4 text-lg shadow-sm"
          >
            <ChromeIcon className="mr-2 h-6 w-6 text-brand-red" />
            Sign in with Google {/* Functionality not implemented in this step */}
          </Button>
          <div className="flex items-center my-6">
            <hr className="flex-grow border-brand-border" />
            <span className="mx-4 text-base text-brand-text-medium font-medium">or Sign in with Mail</span>
            <hr className="flex-grow border-brand-border" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-base font-semibold text-brand-text-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                className="mt-2 bg-brand-bg-input border-brand-border placeholder-brand-text-light focus:border-brand-blue focus:ring-1 focus:ring-brand-blue py-4 px-4 text-lg font-bold"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-base font-semibold text-brand-text-medium">Password</Label>
                <Link href="/auth/forgot-password" className="text-sm text-brand-blue hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  className="mt-2 bg-brand-bg-input border-brand-border placeholder-brand-text-light focus:border-brand-blue focus:ring-1 focus:ring-brand-blue py-4 px-4 text-lg font-bold"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-4 flex items-center text-brand-text-medium hover:text-brand-blue"
                >
                  {showPassword ? <EyeOffIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-black hover:bg-brand-text-dark text-white py-4 font-bold text-lg rounded-lg mt-2 shadow-md" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-8 text-center">
            <span className="text-base font-bold text-brand-text-dark">Don&apos;t have an account? </span>
            <Link href="/auth/signup" className="font-bold text-brand-blue underline ml-1">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
