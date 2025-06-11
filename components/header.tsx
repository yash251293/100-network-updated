"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Bell, Briefcase, Globe, Inbox, LayoutDashboard, MessageSquare, Users, Building2, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
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
  },
  {
    name: "Jobs",
    href: "/jobs",
    icon: Briefcase,
  },
  {
    name: "Freelance",
    href: "/jobs/freelance",
    icon: Globe,
  },
  {
    name: "Network",
    href: "/people",
    icon: Users,
  },
  {
    name: "Companies",
    href: "/employers",
    icon: Building2,
  },
]

export default function Header() {
  const [notifications, setNotifications] = useState(18) // Example notification count
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' }); // Redirect to login after logout
  };

  return (
    <header className="border-b bg-background">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="font-logo text-2xl font-bold">
              100<span className="text-[#0056B3]">Networks</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors relative",
                pathname === item.href
                  ? "bg-primary-navy text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-primary-navy",
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right side - Notifications, Profile and Settings */}
        <div className="flex items-center space-x-1">
          {status === "loading" ? (
            <div className="px-3 py-2 text-sm font-medium">Loading...</div>
          ) : session ? (
            <>
              <Link
                href="/notifications"
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors relative",
                  pathname === "/notifications"
                    ? "bg-primary-navy text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-primary-navy",
                )}
              >
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
                      <AvatarFallback className="text-xs">
                        {session.user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden md:block">
                      <p className="text-xs font-medium">{session.user?.name || "User"}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    {/* Link to the user's specific profile page */}
                    <Link href={`/profile/${(session.user as any)?.id}`} className="font-subheading">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="font-subheading">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/billing" className="font-subheading">Billing</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/company-profile" className="font-subheading">Switch to Company Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/help" className="font-subheading">Help center</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleLogout} className="font-subheading cursor-pointer">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
