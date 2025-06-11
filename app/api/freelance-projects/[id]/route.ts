import { NextResponse } from 'next/server';
import type { FreelanceProject } from '@/lib/types';

const sampleFreelanceProjects: FreelanceProject[] = [
  {
    id: "fp1",
    title: "E-commerce Website Redesign",
    clientId: "user123",
    clientName: "GreenLeaf Organics",
    clientLogo: "/generic-company-logo.png",
    industry: "Retail",
    budget: "$5,000 - $8,000",
    duration: "2 months",
    postedDate: "2024-04-20T11:00:00Z",
    description: "We are looking to redesign our existing Shopify store to improve user experience and conversion rates. Seeking a freelancer with strong e-commerce design and development skills.",
    requirements: ["Proven experience with Shopify theme customization", "Strong portfolio of e-commerce websites", "Understanding of UX best practices for online retail", "Ability to integrate custom features"],
    deliverables: ["Full website redesign mockups", "Developed and tested Shopify theme", "Documentation for custom features"],
    skills: ["Shopify", "UX Design", "Frontend Development", "E-commerce"],
  },
  {
    id: "fp2",
    title: "Mobile App Development (iOS & Android)",
    clientId: "comp3",
    clientName: "HealthTrack Inc.",
    clientLogo: "/finance-company-logo.png", // Placeholder
    industry: "Healthcare Technology",
    budget: "$15,000 - $25,000",
    duration: "4-6 months",
    postedDate: "2024-05-05T16:00:00Z",
    description: "Develop a cross-platform mobile application for tracking fitness and health metrics. The app should include user authentication, data synchronization, and progress visualization.",
    requirements: ["Experience with React Native or Flutter", "Portfolio of published mobile apps", "Knowledge of API integration for data storage", "Familiarity with health data privacy regulations (HIPAA) is a plus"],
    deliverables: ["Functional iOS and Android applications", "Source code and documentation", "App store submission assistance"],
    skills: ["React Native", "Flutter", "Mobile App Development", "API Integration", "Firebase"],
  },
  {
    id: "fp3",
    title: "Content Writing for Tech Blog",
    clientId: "user456",
    clientName: "TechForward Blog",
    industry: "Technology Media",
    budget: "$500 per article (5 articles)",
    duration: "1 month",
    postedDate: "2024-05-18T09:00:00Z",
    description: "Seeking skilled tech writers to produce high-quality, engaging articles on topics such as AI, cybersecurity, and software development trends. Articles should be well-researched and SEO-friendly.",
    requirements: ["Excellent writing and editing skills", "Proven experience in tech writing (portfolio required)", "Ability to explain complex topics clearly", "Understanding of SEO best practices"],
    deliverables: ["Five 1500-word articles", "Keyword research for each article"],
    skills: ["Content Writing", "SEO", "Technical Writing", "Blogging"],
  }
];

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const project = sampleFreelanceProjects.find(p => p.id === params.id);
  if (project) {
    return NextResponse.json(project);
  }
  return NextResponse.json({ error: 'Freelance project not found' }, { status: 404 });
}
