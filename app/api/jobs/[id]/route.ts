import { NextResponse } from 'next/server';
import type { Job } from '@/lib/types';

// Re-using the same sample data as in the /api/jobs route for consistency in this mock setup.
// In a real application, this data would likely come from a database.
const sampleJobs: Job[] = [
  {
    id: "1",
    title: "Software Engineer, Frontend",
    companyId: "comp1",
    companyName: "Innovatech Solutions",
    companyLogo: "/placeholder-logo.svg",
    industry: "Technology",
    type: "Full-time",
    location: "San Francisco, CA",
    remote: "Hybrid",
    salaryRange: "$120,000 - $150,000",
    postedDate: "2024-05-01T10:00:00Z",
    description: "Join our innovative team to build next-generation web applications. We are looking for a skilled frontend engineer passionate about creating amazing user experiences.",
    requirements: ["Bachelor's degree in Computer Science or related field", "3+ years of experience with React, Angular, or Vue.js", "Strong proficiency in HTML, CSS, and JavaScript/TypeScript", "Experience with RESTful APIs"],
    responsibilities: ["Develop and maintain user-facing features", "Build reusable code and libraries for future use", "Ensure the technical feasibility of UI/UX designs", "Collaborate with other team members and stakeholders"],
    niceToHave: ["Experience with GraphQL", "Knowledge of cloud platforms (AWS, Azure, GCP)", "Contributions to open-source projects"],
    benefits: ["Comprehensive health insurance", "401(k) matching", "Unlimited PTO", "Free gym membership"],
    skills: ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Next.js"],
    experienceLevel: "Mid-Senior Level",
    applicantsCount: 75,
  },
  {
    id: "2",
    title: "Product Manager",
    companyId: "comp2",
    companyName: "Synergy Corp",
    companyLogo: "/tech-startup-logo.png",
    industry: "Software",
    type: "Full-time",
    location: "New York, NY",
    remote: "Remote",
    salaryRange: "$140,000 - $170,000",
    postedDate: "2024-05-10T14:30:00Z",
    description: "We are seeking an experienced Product Manager to lead the development of our flagship product. You will be responsible for the product vision, strategy, and execution.",
    requirements: ["5+ years of experience in product management", "Proven track record of launching successful products", "Excellent communication and leadership skills", "Strong analytical and problem-solving abilities"],
    responsibilities: ["Define and prioritize product features", "Work closely with engineering, design, and marketing teams", "Conduct market research and competitor analysis", "Gather and analyze user feedback"],
    niceToHave: ["MBA or equivalent", "Experience with Agile methodologies"],
    skills: ["Product Management", "Agile", "Market Research", "Roadmapping"],
    experienceLevel: "Senior Level",
    applicantsCount: 120,
  },
  {
    id: "3",
    title: "UX Designer",
    companyId: "comp1",
    companyName: "Innovatech Solutions",
    companyLogo: "/placeholder-logo.svg",
    industry: "Technology",
    type: "Contract",
    location: "Remote",
    remote: "Remote",
    salaryRange: "$80 - $100 per hour",
    postedDate: "2024-05-15T09:00:00Z",
    description: "We're looking for a talented UX Designer to create intuitive and engaging user experiences for our web and mobile applications on a contract basis.",
    requirements: ["3+ years of UX design experience", "Strong portfolio showcasing user-centered design solutions", "Proficiency in Figma, Sketch, or Adobe XD", "Excellent understanding of usability principles"],
    responsibilities: ["Conduct user research and create user personas", "Design wireframes, mockups, and prototypes", "Collaborate with product managers and developers", "Iterate on designs based on user feedback and testing"],
    skills: ["UX Design", "Figma", "User Research", "Prototyping"],
    experienceLevel: "Mid Level",
  }
];

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const job = sampleJobs.find(j => j.id === params.id);
  if (job) {
    return NextResponse.json(job);
  }
  return NextResponse.json({ error: 'Job not found' }, { status: 404 });
}
