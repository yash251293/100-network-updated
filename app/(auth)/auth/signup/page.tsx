"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { toast } from "@/components/ui/use-toast"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const nameParts = fullName.trim().split(/\s+/)
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ") || ""

    // Client-side validation checks
    if (!firstName || !lastName) {
      toast({
        title: "Validation Error",
        description: "Please enter both first and last names in the Full Name field.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!email) {
      toast({
        title: "Validation Error",
        description: "Email is required.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!password) {
      toast({
        title: "Validation Error",
        description: "Password is required.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      })

      if (response.ok) {
        toast({
          title: "Signup Successful!",
          description: "Please proceed to login.",
        })
        router.push("/auth/login")
      } else {
        const errorData = await response.json().catch(() => ({ message: "An unknown error occurred" }))
        toast({
          title: "Signup Failed",
          description: errorData.message || "Could not create account. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred during signup."
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast({
        title: "Signup Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex w-full max-w-6xl mx-auto rounded-2xl shadow-xl overflow-hidden border">
        {/* Left Side - Image and Text */}
        <div className="w-1/2 flex-col items-center justify-center bg-[#FFFCF6] p-12 hidden md:flex"> {/* Hidden on small screens */}
          <Image
            src="/imagex.png"
            alt="Decorative Abstract Pattern"
            width={400}
            height={400}
            className="mb-10"
            priority
          />
          <h2 className="text-3xl font-black text-brand-text-dark text-left w-full mb-2">
            Where Connections Spark Opportunities
          </h2>
          <p className="text-lg text-brand-text-medium text-left w-full">
            Real roles. Real startups.
          </p>
        </div>
        {/* Right Side - Card */}
        <div className="w-full md:w-1/2 flex flex-col justify-center bg-white p-8 sm:p-12 min-h-full">
          <div className="mb-8 text-center">
            <Logo className="justify-center" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-text-dark mb-8 text-center">Create Account</h1>
          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <Label htmlFor="fullName" className="text-base font-semibold text-brand-text-medium">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-2 bg-brand-bg-input border-brand-border placeholder-brand-text-light focus:border-brand-blue focus:ring-1 focus:ring-brand-blue py-4 px-4 text-lg"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-base font-semibold text-brand-text-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 bg-brand-bg-input border-brand-border placeholder-brand-text-light focus:border-brand-blue focus:ring-1 focus:ring-brand-blue py-4 px-4 text-lg"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-base font-semibold text-brand-text-medium">Password</Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-brand-bg-input border-brand-border placeholder-brand-text-light focus:border-brand-blue focus:ring-1 focus:ring-brand-blue py-4 px-4 text-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-4 flex items-center text-brand-text-medium hover:text-brand-blue"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-black hover:bg-brand-text-dark text-white py-4 font-bold text-lg rounded-lg mt-2 shadow-md" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "Sign Up"}
            </Button>
          </form>
          <div className="mt-8 text-center">
            <span className="text-base font-bold text-brand-text-dark">Already have an account? </span>
            <Link href="/auth/login" className="font-bold text-brand-blue underline ml-1">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
