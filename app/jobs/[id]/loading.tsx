import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Share2, Bookmark } from "lucide-react"; // For visual cue, not interactive

export default function JobDetailLoading() {
  return (
    <div className="container max-w-5xl py-8 px-4 md:px-6">
      {/* Header: Back button & Actions */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-9 w-24 rounded-md" /> {/* Back button placeholder */}
        <div className="flex items-center space-x-3">
          <Skeleton className="h-9 w-9 rounded-full" /> {/* Share Icon Placeholder */}
          <Skeleton className="h-9 w-9 rounded-full" /> {/* Bookmark Icon Placeholder */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column (Main Content) */}
        <div className="md:col-span-2 space-y-6">
          {/* Job Header Card Skeleton */}
          <div className="border rounded-lg p-6 shadow-sm bg-card">
            <div className="flex items-start mb-4">
              <Skeleton className="h-16 w-16 md:h-20 md:w-20 rounded-lg mr-4 shrink-0" /> {/* Company Logo */}
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-7 w-3/4 md:w-4/5" /> {/* Job Title */}
                <Skeleton className="h-5 w-1/2 md:w-3/5" /> {/* Company Name */}
                <Skeleton className="h-4 w-1/3 md:w-2/5" /> {/* Location */}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Skeleton className="h-11 w-full sm:w-36 rounded-md" /> {/* Apply Button */}
              <Skeleton className="h-11 w-full sm:w-32 rounded-md" /> {/* Save Button */}
            </div>
             <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
            </div>
          </div>

          {/* Job Description Sections Skeleton */}
          <div className="border rounded-lg p-6 shadow-sm bg-card space-y-6">
            <div>
              <Skeleton className="h-6 w-48 mb-4" /> {/* Section Title (e.g., Job Description) */}
              <Skeleton className="h-4 w-full mb-2.5" />
              <Skeleton className="h-4 w-full mb-2.5" />
              <Skeleton className="h-4 w-5/6 mb-2.5" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div>
              <Skeleton className="h-6 w-40 mb-4" /> {/* Section Title (e.g., Responsibilities) */}
              <Skeleton className="h-4 w-full mb-2.5" />
              <Skeleton className="h-4 w-5/6 mb-2.5" />
              <Skeleton className="h-4 w-full mb-2.5" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div>
              <Skeleton className="h-6 w-36 mb-4" /> {/* Section Title (e.g., Requirements) */}
              <Skeleton className="h-4 w-full mb-2.5" />
              <Skeleton className="h-4 w-full mb-2.5" />
              <Skeleton className="h-4 w-3/4" />
            </div>
             <div>
              <Skeleton className="h-6 w-32 mb-4" /> {/* Section Title (e.g., Benefits) */}
              <Skeleton className="h-4 w-5/6 mb-2.5" />
              <Skeleton className="h-4 w-full mb-2.5" />
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="md:col-span-1 space-y-6">
          {/* Required Skills Card Skeleton */}
          <div className="border rounded-lg p-6 shadow-sm bg-card">
            <Skeleton className="h-6 w-40 mb-4" /> {/* Card Title */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-7 w-20 rounded-md" />
              <Skeleton className="h-7 w-24 rounded-md" />
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="h-7 w-28 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-md" />
            </div>
          </div>

          {/* About Company Card Skeleton */}
          <div className="border rounded-lg p-6 shadow-sm bg-card">
            <Skeleton className="h-6 w-36 mb-4" /> {/* Card Title */}
            <Skeleton className="h-4 w-full mb-2.5" />
            <Skeleton className="h-4 w-5/6 mb-2.5" />
            <Skeleton className="h-4 w-full mb-2.5" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Similar Jobs Card Skeleton (Optional) */}
          <div className="border rounded-lg p-6 shadow-sm bg-card space-y-4">
            <Skeleton className="h-6 w-32 mb-3" /> {/* Card Title */}
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-md shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
