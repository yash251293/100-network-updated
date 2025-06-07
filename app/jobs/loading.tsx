import { Skeleton } from "@/components/ui/skeleton";

export default function JobsLoading() {
  return (
    <div className="container max-w-5xl py-6 space-y-6">
      {/* Page Title Skeleton */}
      <Skeleton className="h-10 w-1/4 mb-4" />

      {/* Tabs Skeleton */}
      <div className="flex border-b">
        <Skeleton className="h-10 w-24 mr-2 rounded-t-md" /> {/* All Jobs Tab */}
        <Skeleton className="h-10 w-28 rounded-t-md" /> {/* Applied Jobs Tab / My Postings Tab */}
      </div>

      {/* Filters Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-4 py-4 border-b">
        <Skeleton className="h-10 w-full" /> {/* Search Input */}
        <Skeleton className="h-10 w-full" /> {/* Job Type Select */}
        <Skeleton className="h-10 w-full" /> {/* Experience Level Select */}
        <Skeleton className="h-10 w-full" /> {/* Location Input / Select */}
      </div>

      {/* Job Cards Skeleton List */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3 bg-card text-card-foreground shadow-sm">
            <div className="flex items-start">
              <Skeleton className="h-12 w-12 rounded-md mr-4 shrink-0" /> {/* Logo */}
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-6 w-3/4" /> {/* Title */}
                <Skeleton className="h-4 w-1/2" /> {/* Company & Location */}
              </div>
              <Skeleton className="h-6 w-6 ml-2 shrink-0" /> {/* Bookmark Icon */}
            </div>
            <div className="flex flex-wrap gap-2 py-1">
              <Skeleton className="h-5 w-16 rounded-full" /> {/* Skill */}
              <Skeleton className="h-5 w-20 rounded-full" /> {/* Skill */}
              <Skeleton className="h-5 w-12 rounded-full" /> {/* Skill */}
              <Skeleton className="h-5 w-24 rounded-full" /> {/* Skill */}
            </div>
            <div className="space-y-1.5 pt-1">
              <Skeleton className="h-4 w-full" /> {/* Description line 1 */}
              <Skeleton className="h-4 w-5/6" /> {/* Description line 2 */}
              <Skeleton className="h-4 w-3/4" /> {/* Description line 3 (optional) */}
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
              <Skeleton className="h-4 w-1/3" /> {/* Salary/Type */}
              <Skeleton className="h-4 w-1/4" /> {/* Posted Date */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
