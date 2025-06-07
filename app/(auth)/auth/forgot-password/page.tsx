"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "If your email is registered, you will receive a password reset link shortly (check server console for development).");
        setIsSubmitted(true);
      } else {
        setMessage(data.message || "An error occurred. Please try again.");
        setIsSubmitted(false);
        alert(`Error: ${data.message || response.statusText}`);
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      setMessage("An unexpected error occurred. Please try again.");
      setIsSubmitted(false);
      alert(`An unexpected error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Processing Request</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              For development, the reset link is logged in your server console.
            </p>
            <div className="space-y-3">
              {/* <Button onClick={() => setIsSubmitted(false)} variant="outline" className="w-full">
                Try another email?
              </Button> */}
              {/* Commenting out "Try again" as the generic success message means they should check console/email */}
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/100N%20logo-hXZbA69LLfyoIxuGBxaKL2lq5TY9q7.png"
              alt="100N"
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Forgot your password?</CardTitle>
          <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send reset link"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="inline-flex items-center text-sm text-blue-600 hover:underline">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
