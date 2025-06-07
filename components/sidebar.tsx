"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Briefcase, Calendar, Globe, Inbox, LayoutDashboard,
  MessageSquare, Users, Building2, ClipboardList, PlusSquare
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { isAuthenticated } from "@/lib/authClient"
import { useEffect, useState } from "react"
import { useUser } from "@/contexts/UserContext" // Import useUser

// Nav items (keep as is for now)
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
  // isUserAuthenticated for showing "Post a Job" can still rely on isAuthenticated()
  // or be derived from useUser().user object.
  // For simplicity, keeping the existing auth check for nav items for now.
  const [isUserAuthenticatedForNav, setIsUserAuthenticatedForNav] = useState(false);
  const [displayNavItems, setDisplayNavItems] = useState(baseNavItems);

  const { user, isLoading } = useUser(); // Use the UserContext

  useEffect(() => {
    const authStatus = isAuthenticated(); // Client-side check for nav item
    setIsUserAuthenticatedForNav(authStatus);

    let newNavItems = [...baseNavItems];
    const postJobExists = newNavItems.some(item => item.href === "/post-job");

    if (authStatus) {
      if (!postJobExists) {
        const freelanceIndex = baseNavItems.findIndex(item => item.href === "/jobs/freelance");
        if (freelanceIndex !== -1) {
          newNavItems.splice(freelanceIndex + 1, 0, postJobItem);
        } else {
          // Fallback: add after "Jobs" or at a specific position if "Freelance" is not found
          const jobsIndex = newNavItems.findIndex(item => item.href === "/jobs");
          if (jobsIndex !== -1) {
            newNavItems.splice(jobsIndex + 1, 0, postJobItem);
          } else {
            newNavItems.splice(5, 0, postJobItem); // Default position if no other landmarks found
          }
        }
      }
    } else {
      newNavItems = baseNavItems.filter(item => item.href !== "/post-job");
    }
    setDisplayNavItems(newNavItems);
  }, [pathname, user]); // Re-evaluate if auth status (derived from user) or path changes.

  const getInitials = (firstName?: string | null, lastName?: string | null): string => {
    if (isLoading) return "..";
    const firstInitial = firstName ? firstName[0] : "";
    const lastInitial = lastName ? lastName[0] : "";
    return (firstInitial + lastInitial).toUpperCase() || "U";
  };

  const profileName = isLoading ? "Loading..." : (user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Your Profile" : "Your Profile");

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
            <AvatarImage
              src={isLoading ? "/placeholder-user.jpg" : user?.avatarUrl || "/placeholder-user.jpg"}
              alt={user?.firstName || "User"}
            />
            <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profileName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {isLoading ? "Loading profile..." : (user && user.firstName ? `View ${user.firstName}'s profile` : "View and edit profile")}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
