"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { BookmarkIcon, Heart, MessageCircle, MoreHorizontal, X, Send, ImageIcon } from "lucide-react"
import { useState } from "react"

export default function FeedPage() {
  const [postText, setPostText] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePost = () => {
    // Handle posting logic here
    console.log("Posting:", { text: postText, image: selectedImage })
    setPostText("")
    setSelectedImage(null)
    setIsExpanded(false)
  }

  const removeImage = () => {
    setSelectedImage(null)
  }

  return (
    <div className="container max-w-5xl py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">What's happening today</h1>
        </div>
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt="User" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
        </div>
      </div>

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

        {/* Enhanced Post Creation Section */}
        <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
          <CardContent className="p-4">
            <div className="flex space-x-4">
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                {!isExpanded ? (
                  <Input
                    placeholder="Share something with the community..."
                    className="cursor-pointer"
                    onClick={() => setIsExpanded(true)}
                    readOnly
                  />
                ) : (
                  <Textarea
                    placeholder="What's on your mind? Share your thoughts, achievements, or ask questions..."
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    className="min-h-[100px] resize-none border-0 focus-visible:ring-0 text-base"
                    autoFocus
                  />
                )}

                {selectedImage && (
                  <div className="relative inline-block">
                    <img
                      src={selectedImage || "/placeholder.svg"}
                      alt="Selected"
                      className="max-w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 rounded-full"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {isExpanded && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Button variant="ghost" size="sm" className="cursor-pointer" asChild>
                          <span>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Photo
                          </span>
                        </Button>
                      </label>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsExpanded(false)
                          setPostText("")
                          setSelectedImage(null)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handlePost}
                        disabled={!postText.trim() && !selectedImage}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Post
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
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
