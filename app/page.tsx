// app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assuming Button component exists
import { ArrowRight } from 'lucide-react'; // For icons on buttons

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.20))] text-center p-4">
      {/* Adjust min-h if header height is different. theme(spacing.20) is approx 5rem for h-20 header */}
      <main className="max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold font-heading text-primary-navy mb-6">
          Welcome to 100<span className="text-[#0056B3]">Networks</span>
        </h1>
        <p className="text-xl text-muted-foreground font-subheading mb-10">
          Connect with professionals, discover new opportunities, and build your career network.
          Join a community dedicated to growth and collaboration.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button asChild size="lg" className="bg-primary-navy hover:bg-primary-navy/90 text-white w-full sm:w-auto">
            <Link href="/auth/signup">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white w-full sm:w-auto">
            <Link href="/auth/login">
              Sign In
            </Link>
          </Button>
        </div>
        <p className="mt-12 text-sm text-muted-foreground">
          Explore <Link href="/explore" className="underline hover:text-primary-navy">job opportunities</Link> and
          find <Link href="/jobs/freelance" className="underline hover:text-primary-navy">freelance projects</Link> once you sign in.
        </p>
      </main>
    </div>
  );
}
