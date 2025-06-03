"use client"

// import { useState } from "react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { Bell } from "lucide-react"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { logout } from "@/lib/authClient"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Button } from "@/components/ui/button"

export default function Header() {
  // const [notifications, setNotifications] = useState(18)
  // const router = useRouter()

  // const handleLogout = () => {
  //   logout()
  //   router.push('/auth/login')
  // }
  console.log("Rendering Header (Completely Static - No Hooks)");
  return (
    <header className="border-b bg-background p-4">
      Static Header (No Hooks Test)
    </header>
  );
}
