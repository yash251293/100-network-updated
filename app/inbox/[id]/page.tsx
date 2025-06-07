"use client";

import React from 'react'; // Added React import
import { useState, useEffect, useRef, FormEvent } from "react";
import { useParams, useRouter } // if using useParams, or get from props
from "next/navigation";
import Link from "next/link"; // Keep if needed
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area"; // For message list
import { Send, ArrowLeft, UserCircle, Users, Loader2 } from "lucide-react"; // Added icons & Loader2
import { getToken } from "@/lib/authClient";
import { format } from 'date-fns'; // For formatting timestamps
import { toast } from "@/hooks/use-toast";

interface MessageSender {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  fullName?: string; // Optional, can be constructed
}

interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  contentType: 'text' | 'image' | 'file'; // Start with 'text'
  content: string;
  createdAt: string; // ISO string
  status?: 'sent' | 'delivered' | 'read' | 'sending' | 'failed'; // For UI feedback
}

// Simplified Conversation Detail for header (real one might be richer)
interface ConversationDetails {
    id: string;
    name: string; // Group name or partner's name
    type: 'one_on_one' | 'group';
    avatarUrl?: string | null; // Group avatar or partner's avatar
    // participants?: any[]; // Could be added if fetched
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const pageParams = React.use(params); // Use React.use to unwrap params
  const conversationId = pageParams.id; // Access id from resolved params

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [conversationDetails, setConversationDetails] = useState<ConversationDetails | null>(null); // For header

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch current user ID (simplified)
  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        // In a real app, you'd decode the token properly or have a user context
        // For now, let's assume verifyAuthToken could be adapted or we use a placeholder
        // This is a simplified way to get a user ID for UI logic (e.g. aligning messages)
        // A proper solution would use a user context or a dedicated API endpoint for current user details.
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.userId) {
          setCurrentUser({ id: payload.userId });
        }
      } catch (e) {
        console.error("Failed to decode token for current user ID:", e);
      }
    }
  }, []);

  // Fetch conversation details (e.g., name for header) - very simplified for now
  // Ideally, you'd have a GET /api/conversations/[id] endpoint
  // Or pass conversation details from the inbox page via router state (less ideal for direct nav)
  useEffect(() => {
    if (!conversationId) return;
    const fetchConvDetails = async () => {
        // Placeholder: In a real app, fetch this from an API: GET /api/conversations/:conversationId
        // For now, we'll try to get it from the list of conversations if available (won't work for direct nav)
        // Or just show Conversation ID if no better name is found
        // This part needs a proper API endpoint for robustness.
        // For this subtask, we will simulate fetching a basic name.
        // A more robust solution is needed in a later step.

        // Try to get from /api/conversations and find the specific one (inefficient but for UI demo)
        const token = getToken();
        if (token) {
            try {
                const res = await fetch('/api/conversations', { headers: { 'Authorization': `Bearer ${token}` } });
                if (res.ok) {
                    const data = await res.json();
                    const currentConv = data.conversations?.find((c: any) => c.id === conversationId);
                    if (currentConv) {
                        setConversationDetails({
                            id: currentConv.id,
                            name: currentConv.name || 'Chat',
                            type: currentConv.type,
                            avatarUrl: currentConv.avatarUrl
                        });
                    } else {
                       setConversationDetails({ id: conversationId, name: 'Chat', type: 'one_on_one' }); // Fallback
                    }
                } else {
                    setConversationDetails({ id: conversationId, name: 'Chat', type: 'one_on_one' }); // Fallback
                }
            } catch (e) {
                 setConversationDetails({ id: conversationId, name: 'Chat', type: 'one_on_one' }); // Fallback
            }
        } else {
             setConversationDetails({ id: conversationId, name: 'Chat', type: 'one_on_one' }); // Fallback
        }
    };
    fetchConvDetails();
  }, [conversationId]);


  // Fetch messages
  useEffect(() => {
    if (!conversationId) return;
    setIsLoadingMessages(true);
    setError(null);
    const token = getToken();
    if (!token) {
      setError("Authentication required.");
      setIsLoadingMessages(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}/messages?limit=50&offset=0`, { // Basic pagination
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch messages: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          // API returns newest first (DESC), reverse for chat display (oldest first)
          setMessages(data.data.reverse());
        } else {
          throw new Error("Invalid data format for messages.");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred fetching messages.");
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    fetchMessages();
    // Basic polling for new messages (replace with WebSockets in Phase 3)
    const intervalId = setInterval(fetchMessages, 15000); // Poll every 15 seconds
    return () => clearInterval(intervalId);

  }, [conversationId]);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessageContent.trim() === "" || !currentUser) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversationId: conversationId,
      sender: { // Assuming currentUser has these details, or fetch them
        id: currentUser.id,
        firstName: "You", // Placeholder, ideally from user context
        lastName: "",
        avatarUrl: null, // Placeholder
      },
      contentType: 'text',
      content: newMessageContent,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessageContent("");
    setIsSending(true);

    const token = getToken();
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newMessageContent }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.data) {
        setMessages(prev => prev.map(msg => msg.id === tempId ? { ...data.data, status: 'sent' } : msg));
      } else {
        throw new Error(data.message || "Failed to send message");
      }
    } catch (err: any) {
      toast({ title: "Error", description: `Failed to send: ${err.message}`, variant: "destructive" });
      setMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, status: 'failed' } : msg));
    } finally {
      setIsSending(false);
    }
  };

  const getFormattedTimestamp = (createdAtString: string | null | undefined): string => {
    if (!createdAtString) {
      return "---"; // Fallback for null, undefined, or empty string
    }
    const date = new Date(createdAtString);
    if (isNaN(date.getTime())) { // Check if the date is valid
      console.warn("Encountered invalid createdAt value:", createdAtString);
      return "[Invalid Date]"; // Fallback for invalid dates
    }
    try {
      return format(date, "p"); // e.g., "h:mm aa"
    } catch (e) {
      console.error("Error formatting date with date-fns:", createdAtString, e);
      return "[Formatting Error]"; // Fallback if format itself throws an error
    }
  };

  const getParticipantName = () => {
    if (!conversationDetails) return "Loading chat...";
    return conversationDetails.name || "Chat";
  };
  const getParticipantAvatar = () => {
    if (!conversationDetails) return undefined;
    return conversationDetails.avatarUrl || undefined;
  }
  const getParticipantAvatarFallback = () => {
     if (!conversationDetails || !conversationDetails.name) return "??";
     return conversationDetails.name.split(' ').map(n=>n[0]).join('').toUpperCase() || "??";
  }


  return (
    <div className="container max-w-2xl h-[calc(100vh-var(--header-height,4rem))] flex flex-col py-2 md:py-6">
      {/* Header */}
      <div className="flex items-center p-2 md:p-4 border-b mb-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.push('/inbox')} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={getParticipantAvatar()} />
          <AvatarFallback>
            {conversationDetails?.type === 'group' ? <GroupIcon className="h-5 w-5"/> : <UserCircle className="h-5 w-5"/>}
            {/* {getParticipantAvatarFallback()} */}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg font-semibold">{getParticipantName()}</h1>
          {/* <p className="text-xs text-muted-foreground">Online</p> */}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-grow p-2 md:p-4 -mx-2 md:-mx-4 mb-2">
        {isLoadingMessages && <div className="text-center py-4">Loading messages...</div>}
        {error && !isLoadingMessages && <div className="text-center py-4 text-red-500">Error: {error}</div>}
        {!isLoadingMessages && messages.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">No messages yet. Start the conversation!</div>
        )}
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end space-x-2 ${
                msg.sender.id === currentUser?.id ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender.id !== currentUser?.id && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={msg.sender.avatarUrl || undefined} />
                  <AvatarFallback>
                    {(msg.sender.firstName?.[0] || '') + (msg.sender.lastName?.[0] || '') || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.sender.id === currentUser?.id
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-muted rounded-bl-none"
                }`}
              >
                {msg.sender.id !== currentUser?.id && (
                    <p className="text-xs font-semibold mb-0.5">
                        {msg.sender.firstName || 'User'} {msg.sender.lastName || ''}
                    </p>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                    msg.sender.id === currentUser?.id ? "text-blue-200" : "text-muted-foreground"
                }`}>
                  {getFormattedTimestamp(msg.createdAt)}
                  {msg.status === 'sending' && ' (Sending...)'}
                  {msg.status === 'failed' && ' (Failed)'}
                </p>
              </div>
              {msg.sender.id === currentUser?.id && (
                <Avatar className="h-8 w-8">
                   {/* Current user avatar can be fetched or use fallback */}
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex items-center space-x-2 p-2 md:p-4 border-t sticky bottom-0 bg-background">
        <Input
          value={newMessageContent}
          onChange={(e) => setNewMessageContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          disabled={isSending || isLoadingMessages}
        />
        <Button type="submit" size="icon" className="rounded-full" disabled={isSending || isLoadingMessages || newMessageContent.trim() === ""}>
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}
