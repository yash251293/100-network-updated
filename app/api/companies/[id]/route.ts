import { NextResponse } from 'next/server';
import type { Company } from '@/lib/types';

const sampleCompanies: Company[] = [
  {
    id: "comp1",
    name: "Innovatech Solutions",
    industry: "Technology",
    logo: "/placeholder-logo.svg",
    size: "50-200 employees",
    location: "San Francisco, CA",
    founded: 2015,
    website: "https://innovatech.example.com",
    description: "Innovatech Solutions is a dynamic and forward-thinking technology company specializing in cloud computing, AI-driven analytics, and custom software development. We empower businesses to transform and thrive in the digital age.",
    mission: "To provide cutting-edge technology solutions that drive innovation and efficiency for our clients.",
    vision: "To be a global leader in technology innovation, shaping the future of business.",
    values: ["Innovation", "Customer Centricity", "Integrity", "Collaboration"],
    benefits: ["Comprehensive health, dental, and vision insurance", "Generous PTO and flexible work hours", "Stock options and performance bonuses", "Continuous learning and development programs", "Modern and collaborative workspace"],
    culture: "We foster a culture of creativity, continuous learning, and mutual respect. Our team is passionate about technology and solving complex challenges.",
    verified: true,
    companyType: "Private",
    jobOpeningsCount: 5, // Example: could be dynamically calculated
    contactEmail: "careers@innovatech.example.com",
  },
  {
    id: "comp2",
    name: "Synergy Corp",
    industry: "Software",
    logo: "/tech-startup-logo.png",
    size: "200-500 employees",
    location: "New York, NY",
    founded: "2010",
    website: "https://synergycorp.example.com",
    description: "Synergy Corp develops enterprise software solutions that streamline operations and enhance productivity for businesses across various sectors. Our flagship product is a leader in its market segment.",
    mission: "To create powerful and intuitive software that simplifies complex business processes.",
    benefits: ["Competitive salaries", "Health and wellness programs", "Retirement savings plan", "Paid parental leave"],
    culture: "A fast-paced yet supportive environment where innovation is encouraged and collaboration is key.",
    verified: true,
    companyType: "Startup",
    jobOpeningsCount: 12,
    contactEmail: "hr@synergycorp.example.com",
  },
  {
    id: "comp3",
    name: "HealthTrack Inc.",
    industry: "Healthcare Technology",
    logo: "/finance-company-logo.png", // Placeholder, ideally a health-related logo
    size: "100-250 employees",
    location: "Boston, MA",
    founded: 2018,
    website: "https://healthtrack.example.com",
    description: "HealthTrack Inc. is dedicated to developing innovative digital health solutions that empower individuals to take control of their well-being. We specialize in wearable technology and health data analytics.",
    mission: "To make health tracking accessible and actionable for everyone.",
    verified: false,
    companyType: "Startup",
    jobOpeningsCount: 3,
    contactEmail: "info@healthtrack.example.com",
    contactPhone: "1-800-555-1234"
  }
];

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const company = sampleCompanies.find(c => c.id === params.id);
  if (company) {
    return NextResponse.json(company);
  }
  return NextResponse.json({ error: 'Company not found' }, { status: 404 });
}
