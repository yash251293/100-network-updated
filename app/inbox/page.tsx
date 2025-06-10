"use client"

"use client" // Already client, but ensure

import { useState, useEffect, useCallback } from "react" // Added useCallback
import { useRouter } from 'next/navigation' // Added
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { getToken } from "@/lib/authClient"; // Added
import { toast } from "sonner"; // Added
import ProtectedRoute from "@/components/ProtectedRoute"; // Added
import { formatDistanceToNow } from 'date-fns'; // Added
import NewConversationModal from "@/components/NewConversationModal"; // Added
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MoreHorizontal, Circle, Star, Archive, Trash2, Send, ArrowLeft, Phone, Video, Info, UserPlus } from "lucide-react" // Added UserPlus
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// TypeScript interfaces
interface Message {
  id: number
  sender: string
  senderInitials: string
  message: string
  timestamp: string
  isMe: boolean
}

interface InboxMessage {
  id: number
  name: string
  initials: string
  avatar?: string | null
  date: string
  preview: string
  category: string
  messageCount: number
  isPriority: boolean
  isOnline: boolean
  conversation: Message[]
}

// Sample message data
const messages: InboxMessage[] = [
  {
    id: 1,
    name: "Dr. Catrenia McLendon",
    initials: "CM",
    avatar: "/placeholder.svg?height=56&width=56",
    date: "May 12",
    preview: "Hello! Just a quick reminder to RSVP for tomorrow's networking event. Looking forward to seeing you there and discussing potential collaboration opportunities.",
    category: "Event Reminder",
    messageCount: 2,
    isPriority: true,
    isOnline: true,
    conversation: [
      {
        id: 1,
        sender: "Dr. Catrenia McLendon",
        senderInitials: "CM",
        message: "Hello! Just a quick reminder to RSVP for tomorrow's networking event. Looking forward to seeing you there and discussing potential collaboration opportunities.",
        timestamp: "9:05 AM",
        isMe: false
      },
      {
        id: 2,
        sender: "You",
        senderInitials: "ME",
        message: "Thank you for the reminder! I'll definitely be there. Looking forward to connecting with everyone.",
        timestamp: "9:15 AM",
        isMe: true
      }
    ]
  },
  {
    id: 2,
    name: "Nicole Rosales",
    initials: "NR",
    avatar: null,
    date: "Mar 25",
    preview: "Don't miss out on the opportunity to join our exclusive mentorship program...",
    category: "Mentorship",
    messageCount: 1,
    isPriority: false,
    isOnline: false,
    conversation: [
      {
        id: 1,
        sender: "Nicole Rosales",
        senderInitials: "NR",
        message: "Don't miss out on the opportunity to join our exclusive mentorship program. We have some amazing mentors who can help accelerate your career growth.",
        timestamp: "2:30 PM",
        isMe: false
      }
    ]
  },
  {
    id: 3,
    name: "Courtney Aldaco",
    initials: "CA",
    avatar: "/placeholder.svg?height=48&width=48",
    date: "Mar 11",
    preview: "Are you ready to take your career to the next level? I have some exciting opportunities...",
    category: "Career",
    messageCount: 1,
    isPriority: false,
    isOnline: true,
    conversation: [
      {
        id: 1,
        sender: "Courtney Aldaco",
        senderInitials: "CA",
        message: "Are you ready to take your career to the next level? I have some exciting opportunities that might be perfect for your skill set.",
        timestamp: "11:45 AM",
        isMe: false
      }
    ]
  },
  {
    id: 4,
    name: "Corey Marasco",
    initials: "CM",
    avatar: null,
    date: "Mar 5",
    preview: "Are you ready to take the next step in your professional journey? Let's follow each other...",
    category: "Networking",
    messageCount: 1,
    isPriority: false,
    isOnline: false,
    conversation: [
      {
        id: 1,
        sender: "Corey Marasco",
        senderInitials: "CM",
        message: "Are you ready to take the next step in your professional journey? Let's follow each other and stay connected.",
        timestamp: "4:20 PM",
        isMe: false
      }
    ]
  },
  {
    id: 5,
    name: "Karen Adjaye",
    initials: "KA",
    avatar: null,
    date: "Feb 7",
    preview: "I am reaching out to let you know about an exciting job opportunity that matches your skills...",
    category: "Job Opportunity",
    messageCount: 1,
    isPriority: false,
    isOnline: false,
    conversation: [
      {
        id: 1,
        sender: "Karen Adjaye",
        senderInitials: "KA",
        message: "I am reaching out to let you know about an exciting job opportunity that matches your skills and experience. Would you be interested in learning more?",
        timestamp: "10:15 AM",
        isMe: false
      }
    ]
  },
  {
    id: 6,
    name: "Navi Singh",
    initials: "NS",
    avatar: "/placeholder.svg?height=48&width=48",
    date: "Feb 5",
    preview: "Want to master the art of AI prompting? Join our exclusive workshop series...",
    category: "Graduate Program",
    messageCount: 1,
    isPriority: false,
    isOnline: true,
    conversation: [
      {
        id: 1,
        sender: "Navi Singh",
        senderInitials: "NS",
        message: "Want to master the art of AI prompting? Join our exclusive workshop series designed specifically for graduate students.",
        timestamp: "3:45 PM",
        isMe: false
      }
    ]
  }
]

// Typing indicator component
const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-1 px-4 py-2">
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-sm text-slate-500 ml-2">is typing...</span>
    </div>
  )
}

function InboxPageContent() {
  const router = useRouter();
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null) // Will be less used now
  const [newMessage, setNewMessage] = useState("") // For the right pane, keep for now
  const [isTyping, setIsTyping] = useState(false) // For the right pane, keep for now

  const [conversationsList, setConversationsList] = useState<any[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [conversationsError, setConversationsError] = useState<string | null>(null);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false); // Added

  const fetchConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setConversationsError(null);
    const token = getToken();

    if (!token) {
      setConversationsError("Authentication required.");
      toast.error("Authentication required to view messages.");
      setIsLoadingConversations(false);
      return;
    }

    try {
      const response = await fetch('/api/conversations', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to fetch conversations" }));
        throw new Error(errorData.message || "Failed to fetch conversations");
      }
      const data = await response.json();
      setConversationsList(data.conversations || []);
    } catch (err: any) {
      setConversationsError(err.message);
      toast.error(err.message || "Could not load conversations.");
      setConversationsList([]);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);


  // This effect for simulating typing in right pane might need adjustment if right pane is removed/changed
  useEffect(() => {
    if (selectedMessage) { // This selectedMessage is now less relevant for list view
      const timer = setTimeout(() => {
        setIsTyping(true)
        const stopTyping = setTimeout(() => {
          setIsTyping(false)
        }, 3000)
        return () => clearTimeout(stopTyping)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [selectedMessage])

  const handleConversationClick = (conversation: any) => {
    // setSelectedMessage(message) // Old behavior
    // setIsTyping(false) // Old behavior
    router.push(`/inbox/${conversation.id}`);
  }

  const handleBackToList = () => { // This button is in the right pane, may not be used from this page anymore
    setSelectedMessage(null)
    setIsTyping(false)
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedMessage) {
      // Add new message to conversation
      const updatedMessage = {
        ...selectedMessage,
        conversation: [...selectedMessage.conversation, {
          id: selectedMessage.conversation.length + 1,
          sender: "You",
          senderInitials: "YO",
          message: newMessage,
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          isMe: true
        }]
      }
      setSelectedMessage(updatedMessage)
      setNewMessage("")

      // Simulate typing response
      setTimeout(() => {
        setIsTyping(true)
        setTimeout(() => {
          setIsTyping(false)
        }, 3000)
      }, 1000)
    }
  }

  const handleArchive = (messageId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Archive message:", messageId)
    // Add archive logic here
  }

  const handleStar = (messageId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Star message:", messageId)
    // Add star logic here
  }

  const handleDelete = (messageId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Delete message:", messageId)
    // Add delete logic here
  }

  // If a message is selected, show the conversation view
  if (selectedMessage) {
    return (
      <div className="min-h-full">
        <div className="w-[65%] mx-auto py-4">
          {/* Conversation Header */}
          <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-2xl shadow-sm">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToList}
                className="rounded-xl"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedMessage.avatar || undefined} alt={selectedMessage.name} />
                  <AvatarFallback className="bg-[#0056B3]/10 text-[#0056B3] font-medium">
                    {selectedMessage.initials}
                  </AvatarFallback>
          </Avatar>
                {selectedMessage.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-heading text-primary-navy">{selectedMessage.name}</h1>
                <p className="text-sm font-subheading text-slate-600">
                  {selectedMessage.isOnline ? "Active now" : `Last seen ${selectedMessage.date}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Info className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Conversation Messages */}
          <Card className="border-0 shadow-sm rounded-2xl bg-white mb-4">
            <CardContent className="p-6">
              <div className="space-y-6 max-h-[500px] overflow-y-auto">
                {selectedMessage.conversation.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start space-x-3 max-w-[70%] ${msg.isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`${msg.isMe ? 'bg-primary-navy text-white' : 'bg-slate-100 text-slate-600'} font-medium text-sm`}>
                          {msg.senderInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`rounded-2xl p-4 ${msg.isMe ? 'bg-slate-50 text-slate-700 border border-slate-200' : 'bg-slate-100 text-slate-700'}`}>
                        <p className="font-subheading text-sm leading-relaxed">{msg.message}</p>
                        <span className={`text-xs mt-2 block ${msg.isMe ? 'text-slate-500' : 'text-slate-500'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
          </div>
        </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3 max-w-[70%]">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-slate-100 text-slate-600 font-medium text-sm">
                          {selectedMessage.initials}
                        </AvatarFallback>
          </Avatar>
                      <div className="rounded-2xl p-4 bg-slate-100">
                        <TypingIndicator />
            </div>
          </div>
        </div>
                )}
            </div>
            </CardContent>
          </Card>

          {/* Message Input */}
          <Card className="border-0 shadow-sm rounded-2xl bg-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 border-slate-200 focus:border-primary-navy/30 focus:ring-primary-navy/10 rounded-xl font-subheading"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-primary-navy hover:bg-primary-navy/90 text-white rounded-xl"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
          </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Default inbox list view
  return (
    <div className="min-h-full">
      <div className="w-[65%] mx-auto py-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-heading text-primary-navy mb-2">Messages</h1>
            <p className="text-slate-600 font-subheading text-xl">Stay in touch with your professional network</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="default"
              size="sm"
              className="rounded-full bg-primary-navy text-white hover:bg-primary-navy/90"
              onClick={() => setShowNewConversationModal(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              New Message
            </Button>
            <Button variant="outline" size="sm" className="rounded-full border-slate-200 text-slate-600 hover:border-primary-navy/30 hover:text-primary-navy">
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <Button variant="outline" size="sm" className="rounded-full border-slate-200 text-slate-600 hover:border-primary-navy/30 hover:text-primary-navy">
              <Star className="h-4 w-4 mr-2" />
              Starred
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <Card className="border-0 shadow-sm rounded-2xl bg-white mb-6 max-w-2xl">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search conversations..."
                className="pl-12 pr-4 py-3 border-slate-200 focus:border-primary-navy/30 focus:ring-primary-navy/10 rounded-xl font-subheading"
              />
            </div>
          </CardContent>
        </Card>

        {/* Messages List */}
        <div className="space-y-3 max-w-4xl">
          {isLoadingConversations && (
            <div className="text-center py-10"><Search className="h-12 w-12 text-slate-300 mx-auto mb-2" />Loading conversations...</div>
          )}
          {!isLoadingConversations && conversationsError && (
            <div className="text-center py-10 text-red-500">Error: {conversationsError} <Button onClick={fetchConversations} variant="link">Try again</Button></div>
          )}
          {!isLoadingConversations && !conversationsError && conversationsList.length === 0 && (
            <div className="text-center py-10 text-slate-500">No conversations yet.</div>
          )}

          {!isLoadingConversations && !conversationsError && conversationsList.map((conversation) => {
            const lastMsg = conversation.lastMessage;
            const displayDate = lastMsg?.createdAt ? formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: true }) : formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true });
            const initials = conversation.name?.substring(0, 2).toUpperCase() || '??';

            return (
              <Card
                key={conversation.id}
                className="border-0 shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl bg-white cursor-pointer"
                onClick={() => handleConversationClick(conversation)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center space-x-4 p-6 group">
                    <div className="relative">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={conversation.avatarUrl || undefined} alt={conversation.name} />
                        <AvatarFallback className={'bg-slate-100 text-slate-600 font-medium text-base'}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online status not available in API list item */}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-heading text-lg text-primary-navy truncate">
                          {conversation.name || "Conversation"}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-500 font-subheading whitespace-nowrap">{displayDate}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7">
                                <MoreHorizontal className="h-4 w-4 text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={(e) => {e.stopPropagation(); console.log("Archive", conversation.id)}}>
                                <Archive className="h-4 w-4 mr-2" /> Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {e.stopPropagation(); console.log("Star", conversation.id)}}>
                                <Star className="h-4 w-4 mr-2" /> Star
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {e.stopPropagation(); console.log("Delete", conversation.id)}} className="text-red-600 focus:text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <p className="text-slate-600 font-subheading leading-relaxed line-clamp-2 text-sm mb-3">
                        {lastMsg?.senderFirstName && <span className="font-medium">{lastMsg.senderFirstName}: </span>}
                        {lastMsg?.content || "No messages yet."}
                      </p>
                      {/* Category and messageCount not directly available from API list item */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Message - can be kept or removed based on preference */}
        <Card className="border-0 shadow-sm rounded-2xl bg-gradient-to-r from-primary-navy to-[#0056B3] text-white mt-8 max-w-4xl">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-heading text-xl mb-2">Stay Connected</h3>
              <p className="text-blue-200 font-subheading leading-relaxed">
                Keep the conversation going with your professional network. Every message is an opportunity to grow.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
      />
    </div>
  );
}

export default function InboxPage() {
  return (
    <ProtectedRoute>
      <InboxPageContent />
    </ProtectedRoute>
  )
}
