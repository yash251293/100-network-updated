import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { BookmarkIcon, Heart, MessageCircle, MoreHorizontal, X } from "lucide-react"

export default function FeedPage() {
  return (
    <div className="container max-w-5xl py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Feed</h1>
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt="User" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <Tabs defaultValue="for-you" className="mb-8">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="for-you">For you</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>
        <TabsContent value="for-you">
          <div className="space-y-4">
            <div className="flex space-x-2 mb-6">
              <Button variant="outline" className="rounded-full">
                All
              </Button>
              <Button variant="outline" className="rounded-full">
                Your major
              </Button>
              <Button variant="outline" className="rounded-full">
                Your school
              </Button>
              <Button variant="outline" className="rounded-full">
                Career tips
              </Button>
              <Button variant="outline" className="rounded-full">
                Employers
              </Button>
              <Button variant="outline" className="rounded-full">
                Intros
              </Button>
            </div>

            <div className="flex items-center space-x-4 bg-white rounded-lg border p-4">
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
              <Input placeholder="Share something with the community..." className="flex-1" />
            </div>

            <Card className="overflow-hidden">
              <div className="p-4 flex justify-between items-start">
                <div className="flex space-x-4">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback>CL</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Carl Livingston</div>
                    <div className="text-sm text-muted-foreground">Computer Science · 2024</div>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4 pt-0">
                <p className="mb-4">I have a job interview tomorrow and am def going to use some of these tips.</p>
                <div className="rounded-md overflow-hidden border mb-4">
                  <img src="/campus-walk.png" alt="Students on campus" className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-medium mb-1">3 interview tips for college students</h3>
                    <p className="text-sm text-muted-foreground">Up your interview game with research, answer...</p>
                    <p className="text-xs text-muted-foreground mt-2">100networks.com</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div>32 likes · 2 replies</div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <BookmarkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <div className="p-4 flex justify-between items-start">
                <div className="flex space-x-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40&query=professional headshot" alt="User" />
                    <AvatarFallback>IA</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Ian Arruda, MPM, CAPM</div>
                    <div className="text-sm text-muted-foreground">Arizona State University</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-muted-foreground">3d</div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4 pt-0">
                <p>
                  I finally did it! I have earned my graduate degree, a Master of Project Management, at Arizona State
                  University. I am grateful to all who supported me.
                </p>
                <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                  <div>45 likes · 8 replies</div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <BookmarkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="saved">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No saved posts yet</h3>
            <p className="text-muted-foreground mb-4">Posts you save will appear here</p>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-amber-100 text-amber-800 p-2 rounded-lg">
              <span className="text-xl">👋</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1">New! Feed is for community</h3>
              <p className="text-muted-foreground mb-4">
                Thousands of students and peers are on the feed right now. Connecting, asking questions, and sharing
                knowledge. Join them in the comments, or publish a post of your own.
              </p>
            </div>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
