"use client"

import { useState } from "react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { logout } from "@/lib/authClient"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export default function Header() {
  const [notifications, setNotifications] = useState(18)
  // const router = useRouter()

  // const handleLogout = () => {
  //   logout()
  //   router.push('/auth/login')
  // }
  console.log("Rendering Header (DropdownMenu removed)");
  return (
    <header className="border-b bg-background">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <div className="text-sm text-muted-foreground">{/* URL path would go here */}</div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                {notifications}
              </span>
            )}
          </Button>
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback>UN</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <div className="px-2 py-1.5 text-sm outline-none cursor-default">My profile (Link disabled)</div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="px-2 py-1.5 text-sm outline-none cursor-default">My jobs (Link disabled)</div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="px-2 py-1.5 text-sm outline-none cursor-default">My meetings (Link disabled)</div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="px-2 py-1.5 text-sm outline-none cursor-default">My documents (Link disabled)</div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="px-2 py-1.5 text-sm outline-none cursor-default">My career interests (Link disabled)</div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="px-2 py-1.5 text-sm outline-none cursor-default">My reviews (Link disabled)</div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="px-2 py-1.5 text-sm outline-none cursor-default">Notification preferences (Link disabled)</div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="px-2 py-1.5 text-sm outline-none cursor-default">School connections (Link disabled)</div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="px-2 py-1.5 text-sm outline-none cursor-default">Settings (Link disabled)</div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="px-2 py-1.5 text-sm outline-none cursor-default">Help center (Link disabled)</div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="px-2 py-1.5 text-sm outline-none cursor-default">Terms of Service (Link disabled)</div>
              </DropdownMenuItem>
              <DropdownMenuSeparator /> {/* Optional: added for visual separation */}
              {/* <DropdownMenuItem className="cursor-default">
                <div className="px-2 py-1.5 text-sm outline-none">Log out (Logout disabled)</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
      </div>
    </header>
  )
}
