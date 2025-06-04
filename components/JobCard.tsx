import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark as BookmarkIcon, Briefcase, MapPin, DollarSign, Building, BarChartBig } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton"; // Added missing import

interface Company {
  name: string;
  logo_url: string | null;
}

export interface Job {
  id: string;
  title: string;
  location: string | null;
  job_type: string;
  experience_level: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_period: string | null;
  published_at: string; // ISO date string
  description: string; // Potentially truncated
  company: Company;
  skills: string[]; // Array of skill names
}

interface JobCardProps {
  job: Job;
  onBookmarkToggle: (jobId: string) => void;
  isBookmarked: boolean;
  className?: string;
}

export default function JobCard({ job, onBookmarkToggle, isBookmarked, className = "" }: JobCardProps) {
  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;

    const min = job.salary_min ? `$${(job.salary_min / 1000).toFixed(0)}K` : '';
    const max = job.salary_max ? `$${(job.salary_max / 1000).toFixed(0)}K` : '';
    const currency = job.salary_currency || '';
    const period = job.salary_period ? ` ${job.salary_period}` : '';

    if (min && max) {
      return `${min} - ${max} ${currency}${period}`;
    }
    return `${min || max} ${currency}${period}`;
  };

  const postedAt = job.published_at
    ? formatDistanceToNow(new Date(job.published_at), { addSuffix: true })
    : 'N/A';

  return (
    <div className={`border rounded-lg p-4 md:p-6 space-y-3 bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md ${className}`}>
      <div className="flex items-start">
        <Link href={`/jobs/${job.id}`} className="flex-shrink-0 mr-4">
          {job.company.logo_url ? (
            <Image
              src={job.company.logo_url}
              alt={`${job.company.name} logo`}
              width={50}
              height={50}
              className="rounded-md object-contain h-[50px] w-[50px]"
            />
          ) : (
            <div className="h-[50px] w-[50px] bg-muted rounded-md flex items-center justify-center text-muted-foreground">
              <Building size={24} />
            </div>
          )}
        </Link>
        <div className="flex-1">
          <Link href={`/jobs/${job.id}`} className="hover:underline">
            <h3 className="text-lg md:text-xl font-semibold text-primary">{job.title}</h3>
          </Link>
          <p className="text-sm text-muted-foreground">{job.company.name}</p>
          {job.location && (
            <p className="text-xs text-muted-foreground flex items-center mt-0.5">
              <MapPin size={12} className="mr-1" /> {job.location}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation(); // Stop propagation to prevent Link navigation
            onBookmarkToggle(job.id);
          }}
          className="ml-2 shrink-0"
          aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          <BookmarkIcon
            className={`h-5 w-5 ${isBookmarked ? 'text-yellow-500 fill-yellow-400 stroke-yellow-500' : 'text-gray-400 hover:text-gray-600'}`}
            strokeWidth={isBookmarked ? 2.5 : 1.5} // Example: thicker stroke when bookmarked
          />
        </Button>
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 py-1">
          {job.skills.slice(0, 5).map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {job.skills.length > 5 && (
             <Badge variant="outline" className="text-xs">+{job.skills.length - 5} more</Badge>
          )}
        </div>
      )}

      <Link href={`/jobs/${job.id}`} className="block">
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {job.description || 'No description available.'}
        </p>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground pt-2 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-3 flex-wrap gap-y-1">
          {job.job_type && (
            <div className="flex items-center">
              <Briefcase size={12} className="mr-1" /> {job.job_type}
            </div>
          )}
          {job.experience_level && (
             <div className="flex items-center">
                <BarChartBig size={12} className="mr-1" /> {job.experience_level}
             </div>
          )}
          {formatSalary() && (
            <div className="flex items-center">
              <DollarSign size={12} className="mr-1" /> {formatSalary()}
            </div>
          )}
        </div>
        <p className="shrink-0 sm:ml-auto mt-2 sm:mt-0">{`Posted ${postedAt}`}</p>
      </div>
    </div>
  );
}

// Skeleton component for JobCard
export function JobCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 md:p-6 space-y-3 bg-card text-card-foreground shadow-sm">
      <div className="flex items-start">
        <Skeleton className="h-[50px] w-[50px] rounded-md mr-4 shrink-0" /> {/* Logo */}
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-6 w-3/4" /> {/* Title */}
          <Skeleton className="h-4 w-1/2" /> {/* Company */}
          <Skeleton className="h-3 w-1/3 mt-0.5" /> {/* Location */}
        </div>
        <Skeleton className="h-8 w-8 ml-2 shrink-0 rounded-md" /> {/* Bookmark Icon */}
      </div>
      <div className="flex flex-wrap gap-1.5 py-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="space-y-1.5 pt-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}
