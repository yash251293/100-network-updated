"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Briefcase, Calendar, Globe, Inbox, LayoutDashboard,
  MessageSquare, Users, Building2, ClipboardList, PlusSquare // Added PlusSquare
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { isAuthenticated } from "@/lib/authClient" // Added for conditional rendering
import { useEffect, useState } from "react" // Added for managing client-side auth check

const baseNavItems = [
  {
    name: "Explore",
    href: "/explore",
    icon: LayoutDashboard,
  },
  {
    name: "Feed",
    href: "/feed",
    icon: MessageSquare,
  },
  {
    name: "Messages",
    href: "/inbox",
    icon: Inbox,
    badge: 24, // Example badge
  },
  {
    name: "Jobs",
    href: "/jobs",
    icon: Briefcase,
  },
  {
    name: "Freelance",
    href: "/jobs/freelance",
    icon: ClipboardList,
  },
  // "Post a Job" will be added dynamically if authenticated
  {
    name: "Events",
    href: "/events",
    icon: Calendar,
  },
  {
    name: "Network",
    href: "/people",
    icon: Users,
    badge: "New", // Example badge
  },
  {
    name: "Companies",
    href: "/employers",
    icon: Building2,
  },
];

const postJobItem = {
  name: "Post a Job",
  href: "/post-job",
  icon: PlusSquare,
};

export default function Sidebar() {
  const pathname = usePathname();
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [displayNavItems, setDisplayNavItems] = useState(baseNavItems);

  useEffect(() => {
    // isAuthenticated relies on localStorage, so it must run client-side
    const authStatus = isAuthenticated();
    setIsUserAuthenticated(authStatus);

    if (authStatus) {
      // Add "Post a Job" item if authenticated
      // Find index after "Freelance" to insert "Post a Job"
      const freelanceIndex = baseNavItems.findIndex(item => item.href === "/jobs/freelance");
      const newNavItems = [...baseNavItems];
      if (freelanceIndex !== -1) {
        newNavItems.splice(freelanceIndex + 1, 0, postJobItem);
      } else { // Fallback if "Freelance" isn't found, add towards the end or a sensible default
        newNavItems.splice(5, 0, postJobItem); // Default position
      }
      setDisplayNavItems(newNavItems);
    } else {
      setDisplayNavItems(baseNavItems); // Ensure it's the base list if not authenticated
    }
  }, []); // Run once on mount

  return (
    <div className="w-64 border-r bg-background h-full flex flex-col">
      <div className="p-4">
        <Link href="/feed" className="flex items-center gap-2">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/100N%20logo-hXZbA69LLfyoIxuGBxaKL2lq5TY9q7.png"
            alt="100N"
            className="h-20 w-auto"
          />
        </Link>
      </div>
      <nav className="flex-1 px-2 py-2 space-y-1">
        {displayNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-3 text-sm font-medium rounded-md",
              (pathname.startsWith(item.href) && item.href !== "/" || pathname === item.href)
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
            {item.badge && (
              <span
                className={cn(
                  "ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full",
                  typeof item.badge === "string" && item.badge === "New"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800",
                )}
              >
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <Link
          href="/profile"
          className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt="User" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Your Profile</p>
            <p className="text-xs text-muted-foreground truncate">View and edit profile</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
