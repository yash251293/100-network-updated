// Placeholder for the "Email Verification" page
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MailCheck } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
      <MailCheck className="mx-auto h-16 w-16 text-brand-blue mb-6" />
      <h1 className="text-2xl font-bold text-brand-text-dark mb-4">Verify Your Email</h1>
      <p className="text-brand-text-medium mb-6">
        We've sent a verification link to your email address. Please check your inbox and click the link to activate
        your account.
      </p>
      <p className="text-sm text-brand-text-light mb-8">
        If you haven&apos;t received the email, please check your spam folder or request a new link.
      </p>
      <div className="space-y-4">
        <Button className="w-full bg-brand-blue hover:bg-brand-blue-light text-white font-medium">
          Resend Verification Link
        </Button>
        <Button
          variant="outline"
          className="w-full border-brand-border text-brand-text-medium hover:bg-brand-bg-light-gray font-medium"
          asChild
        >
          <Link href="/onboarding/profile">Continue (Already Verified)</Link>
        </Button>
      </div>
    </div>
  )
}
