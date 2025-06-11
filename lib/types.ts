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

export interface Experience {
  id: string;
  title: string;
  companyName: string;
  location?: string;
  startDate: string; // Consider using Date type or ISO string
  endDate?: string;   // null if current / undefined
  description?: string;
}

export interface Education {
  id: string;
  schoolName: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string; // null if current / undefined
  description?: string;
}

export interface User {
  id: string;
  name: string; // Full name, or can be split into firstName/lastName if preferred
  email: string;
  password?: string; // Should NOT be sent to client, but needed for auth store logic
  headline?: string; // e.g., "Senior Software Engineer at Google"
  summary?: string; // Professional summary
  location?: string; // e.g., "San Francisco Bay Area"
  profilePictureUrl?: string; // URL
  linkedInProfileUrl?: string;
  githubProfileUrl?: string;
  personalWebsiteUrl?: string;
  skills?: string[]; // List of skills
  experience?: Experience[];
  education?: Education[];
  // avatarUrl and title from the previous User interface can be mapped to profilePictureUrl and headline
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

export interface Post {
  id: string;
  authorId: string; // References User.id
  authorName: string; // Denormalized for easy display
  authorProfilePictureUrl?: string; // Denormalized
  content: string; // Text content of the post
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  linkPreview?: { // Optional: for rich link previews
    title?: string;
    description?: string;
    image?: string;
    url?: string;
  };
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  likesCount: number;
  commentsCount: number;
  // We can add 'tags?: string[]' or 'mentions?: User[]' later
}
