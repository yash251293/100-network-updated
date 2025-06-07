"use client"

// Remove useState for mock user, remove User interface if it was defined here
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { logout } from "@/lib/authClient"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useUser } from "@/contexts/UserContext" // Import useUser
import { useState } from "react" // Keep for notifications if separate

export default function Header() {
  const [notifications, setNotifications] = useState(18) // Keep for now, can be dynamic later
  const router = useRouter()
  const { user, isLoading } = useUser() // Use the UserContext

  const handleLogout = () => {
    logout()
    // Optionally, call fetchUserProfile from context if it should clear user state,
    // or UserProvider should react to auth changes.
    router.push('/auth/login')
  }

  const getInitials = (firstName?: string | null, lastName?: string | null): string => {
    if (isLoading) return ".."
    const firstInitial = firstName ? firstName[0] : ""
    const lastInitial = lastName ? lastName[0] : ""
    return (firstInitial + lastInitial).toUpperCase() || "U"
  }

  return (
    <header className="border-b bg-background">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          {/* Optional: Display user name or welcome message */}
          {/* {user && !isLoading && <span className="text-sm text-muted-foreground">Welcome, {user.firstName}</span>} */}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                {notifications} {/* This will be dynamic later */}
              </span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={isLoading ? "/placeholder-user.jpg" : user?.avatarUrl || "/placeholder-user.jpg"}
                    alt={user?.firstName || "User"}
                  />
                  <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/profile">My profile</Link>
              </DropdownMenuItem>
               <DropdownMenuItem asChild>
                <Link href="/jobs/saved">My jobs</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/meetings">My meetings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/documents">My documents</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/career-interests">My career interests</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/reviews">My reviews</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/notifications/preferences">Notification preferences</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/school/connections">School connections</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/help">Help center</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/terms">Terms of Service</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
