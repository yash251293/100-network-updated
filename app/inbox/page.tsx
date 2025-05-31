import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function InboxPage() {
  return (
    <div className="container max-w-2xl py-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search messages" className="pl-10" />
      </div>

      <div className="space-y-1">
        <div className="flex items-center space-x-4 p-3 hover:bg-muted rounded-lg cursor-pointer border-l-4 border-blue-500">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Dr. Catrenia McLendon" />
            <AvatarFallback>CM</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">Dr. Catrenia McLendon</h3>
              <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">May 12</span>
            </div>
            <p className="text-sm text-muted-foreground truncate">Hello Anshuman, Just a quick reminder to RSVP f...</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-3 hover:bg-muted rounded-lg cursor-pointer">
          <Avatar>
            <AvatarFallback className="bg-gray-200 text-gray-500">NR</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">Nicole Rosales</h3>
              <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">Mar 25</span>
            </div>
            <p className="text-sm text-muted-foreground truncate">Hi Anshuman, Don't miss out on the opportunity...</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-3 hover:bg-muted rounded-lg cursor-pointer">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Courtney Aldaco" />
            <AvatarFallback>CA</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">Courtney Aldaco</h3>
              <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">Mar 11</span>
            </div>
            <p className="text-sm text-muted-foreground truncate">Hi, Anshuman! Are you ready to take your caree...</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-3 hover:bg-muted rounded-lg cursor-pointer">
          <Avatar>
            <AvatarFallback className="bg-gray-200 text-gray-500">CM</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">Corey Marasco</h3>
              <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">Mar 5</span>
            </div>
            <p className="text-sm text-muted-foreground truncate">Hi Anshuman, Are you ready to take the next ste...</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-3 hover:bg-muted rounded-lg cursor-pointer">
          <Avatar>
            <AvatarFallback className="bg-gray-200 text-gray-500">KA</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">Karen Adjaye</h3>
              <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">Feb 7</span>
            </div>
            <p className="text-sm text-muted-foreground truncate">Hi Anshuman, I am reaching out to let you know...</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-3 hover:bg-muted rounded-lg cursor-pointer">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Navi Singh" />
            <AvatarFallback>NS</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">Navi Singh</h3>
              <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">Feb 5</span>
            </div>
            <p className="text-sm text-muted-foreground truncate">Hey Anshuman, Want to master the art of AI pro...</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-3 hover:bg-muted rounded-lg cursor-pointer">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Viasat Early Careers" />
            <AvatarFallback>VE</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">Viasat Early Careers</h3>
              <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">Feb 5</span>
            </div>
            <p className="text-sm text-muted-foreground truncate">Hi Anshuman, We have exciting opportunities...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
