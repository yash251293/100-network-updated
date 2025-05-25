import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InboxPage() {
  return (
    <div className="container max-w-5xl py-6">
      <h1 className="text-2xl font-bold mb-6">Inbox</h1>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 hover:bg-muted rounded-lg cursor-pointer border-l-4 border-blue-500">
              <Avatar>
                <AvatarImage
                  src="/placeholder.svg?height=40&width=40&query=professional woman"
                  alt="Dr. Catrenia McLendon"
                />
                <AvatarFallback>CM</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Dr. Catrenia McLendon</h3>
                  <span className="text-sm text-muted-foreground">May 12</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Academic Liaison/Project and Content Manager - IBM SkillsBuild
                </p>
                <p className="text-sm">Hello Anshuman,Just a quick reminder to RSVP f...</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 hover:bg-muted rounded-lg cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                NR
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Nicole Rosales</h3>
                  <span className="text-sm text-muted-foreground">Mar 25</span>
                </div>
                <p className="text-sm text-muted-foreground">ASML</p>
                <p className="text-sm">Hi Anshuman,Don't miss out on the opportunity...</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 hover:bg-muted rounded-lg cursor-pointer">
              <Avatar>
                <AvatarImage
                  src="/placeholder.svg?height=40&width=40&query=professional woman smiling"
                  alt="Courtney Aldaco"
                />
                <AvatarFallback>CA</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Courtney Aldaco</h3>
                  <span className="text-sm text-muted-foreground">Mar 11</span>
                </div>
                <p className="text-sm text-muted-foreground">Senior Campus Recruiter · McKinsey & Company</p>
                <p className="text-sm">Hi, Anshuman! Are you ready to take your caree...</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 hover:bg-muted rounded-lg cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                CM
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Corey Marasco</h3>
                  <span className="text-sm text-muted-foreground">Mar 5</span>
                </div>
                <p className="text-sm text-muted-foreground">University Relations Program Manager · ASML</p>
                <p className="text-sm">Hi Anshuman,Are you ready to take the next ste...</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 hover:bg-muted rounded-lg cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                KA
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Karen Adjaye</h3>
                  <span className="text-sm text-muted-foreground">Feb 7</span>
                </div>
                <p className="text-sm text-muted-foreground">ASM</p>
                <p className="text-sm">Hi Anshuman, I am reaching out to let you know...</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 hover:bg-muted rounded-lg cursor-pointer">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40&query=indian man professional" alt="Navi Singh" />
                <AvatarFallback>NS</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Navi Singh</h3>
                  <span className="text-sm text-muted-foreground">Feb 5</span>
                </div>
                <p className="text-sm text-muted-foreground">Microsoft</p>
                <p className="text-sm">Hey Anshuman, Want to master the art of AI pro...</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 hover:bg-muted rounded-lg cursor-pointer">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40&query=viasat logo" alt="Viasat Early Careers" />
                <AvatarFallback>VE</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Viasat Early Careers</h3>
                  <span className="text-sm text-muted-foreground">Feb 5</span>
                </div>
                <p className="text-sm text-muted-foreground">Viasat Early Career Talent team · Viasat Inc</p>
                <p className="text-sm">Hi Anshuman, We have exciting opportunities...</p>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="unread">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No unread messages</h3>
            <p className="text-muted-foreground">All caught up!</p>
          </div>
        </TabsContent>
        <TabsContent value="archived">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No archived messages</h3>
            <p className="text-muted-foreground">Messages you archive will appear here</p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
        <div className="mb-4">
          <img
            src="/placeholder.svg?height=100&width=100&query=message icon purple"
            alt="Message Icon"
            className="h-24 w-24"
          />
        </div>
        <h2 className="text-xl font-medium mb-2">Message anyone</h2>
        <p className="text-center text-muted-foreground mb-4">
          DM peers, professionals, and recruiters to ask questions and build your network.
        </p>
      </div>
    </div>
  )
}
