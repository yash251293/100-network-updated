"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Assuming Sonner is set up for toasts, otherwise replace with simple alert or message state
// import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/feed'; // Default redirect after login

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for error query parameters from NextAuth.js (e.g., ?error=CredentialsSignin)
  useEffect(() => {
    const nextAuthError = searchParams.get('error');
    if (nextAuthError) {
      if (nextAuthError === 'CredentialsSignin') {
        setError('Invalid email or password. Please try again.');
      } else if (nextAuthError === 'Callback') {
        // This can happen if there's an issue with the callback URL or during OAuth (not used here yet)
        setError('Login session error. Please try again.');
      }
      else {
        setError('An error occurred during login. Please try again.');
      }
      // Example: if sonner is available: toast.error(error || 'Login failed.');
    }
  }, [searchParams]);


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false, // We handle redirect manually to show errors on this page
        email,
        password,
        // callbackUrl: callbackUrl // NextAuth will handle redirect on success if redirect is true
      });

      if (result?.error) {
        console.error("Login failed from NextAuth:", result.error);
        // Error messages from NextAuth are usually error codes.
        // 'CredentialsSignin' is a common one for invalid credentials.
        if (result.error === 'CredentialsSignin') {
            setError('Invalid email or password.');
        } else {
            setError(`Login failed: ${result.error}. Please try again.`);
        }
        // Example: if sonner is available: toast.error(error || 'Login failed.');
      } else if (result?.ok) {
        console.log('Login successful! Redirecting...');
        // Example: if sonner is available: toast.success('Login successful!');
        router.push(callbackUrl); // Redirect to the intended page or default
      } else {
        // This case should ideally not be reached if result.error or result.ok is populated.
        setError('An unexpected situation occurred during login. Please check your credentials.');
      }
    } catch (err) {
      // This catch is for network errors or if signIn itself throws an unhandled error.
      console.error("Login submission system error:", err);
      setError('An unexpected network or system error occurred. Please try again.');
      // Example: if sonner is available: toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 py-12">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Log In</CardTitle>
          <CardDescription>Welcome back! Please enter your credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging In...' : 'Log In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
