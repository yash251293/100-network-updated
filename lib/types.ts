export interface Job {
  id: string;
  title: string;
  companyId: string; // reference to Company
  companyName: string; // denormalized for display
  companyLogo: string; // URL
  industry: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  location: string;
  remote: "Remote" | "Hybrid" | "On-site";
  salaryRange: string; // e.g., "$120,000 - $150,000" or could be structured
  postedDate: string; // ISO date string preferably
  description: string;
  requirements: string[];
  responsibilities: string[];
  niceToHave?: string[];
  benefits?: string[];
  skills?: string[];
  experienceLevel?: string;
  applicantsCount?: number;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  logo: string; // URL
  size: string; // e.g., "50-200 employees"
  location: string;
  founded: number | string;
  website: string;
  description: string;
  mission?: string;
  vision?: string;
  values?: string[];
  benefits?: string[];
  culture?: string;
  verified?: boolean;
  companyType?: string; // e.g., "Startup", "Agency", "Public", "Private"
  jobOpeningsCount?: number; // derived, or could list `Job[]` if embedding
  contactEmail?: string;
  contactPhone?: string;
}

export interface FreelanceProject {
  id: string;
  title: string;
  clientId: string; // could be a User ID or a Company ID
  clientName: string; // denormalized
  clientLogo?: string; // URL
  industry: string;
  budget: string; // e.g., "$3,000-5,000" or could be structured
  duration: string;
  postedDate: string; // ISO date string
  description: string;
  requirements: string[];
  deliverables: string[];
  skills: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  title?: string; // e.g., "Software Engineer"
  location?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  applicantName: string; // denormalized
  applicantEmail: string; // denormalized
  coverLetter?: string;
  resumeUrl?: string; // URL to stored resume
  portfolioUrl?: string;
  expectedSalary?: string;
  availableStartDate?: string; // ISO date string
  status: "submitted" | "viewed" | "interviewing" | "offered" | "rejected" | "hired";
  appliedDate: string; // ISO date string
}
