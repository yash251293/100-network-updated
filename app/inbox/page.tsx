"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // For future navigation from buttons
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input"; // Keep if search is to be implemented later
import { Button } from "@/components/ui/button";
import { Search, PlusCircle, Users as GroupIcon } from "lucide-react"; // Keep Search if needed
import { getToken } from "@/lib/authClient";
import { formatDistanceToNowStrict } from 'date-fns';

interface Participant {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

interface LastMessage {
  content: string;
  senderId: string;
  senderFirstName: string | null;
  createdAt: string;
}

interface Conversation {
  id: string;
  type: 'one_on_one' | 'group';
  name: string; // Partner's full name for 1-on-1, group name for group
  avatarUrl: string | null; // Partner's avatar for 1-on-1, group avatar for group
  participants: Participant[];
  lastMessage: LastMessage | null;
  updatedAt: string;
}

export default function InboxPage() {
  const router = useRouter(); // For future use with buttons
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [searchTerm, setSearchTerm] = useState(""); // For future search implementation

  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        setError("Authentication required.");
        setIsLoading(false);
        // router.push('/auth/login'); // Optional: redirect if no token
        return;
      }

      try {
        const response = await fetch('/api/conversations', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch conversations: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
        } else {
          throw new Error("Invalid data format received from server.");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, []); // Removed router from dependency array as it's not used in this useEffect

  // Placeholder functions for new message/group
  const handleNewMessage = () => {
    // console.log("Navigate to new message / user search page"); // Optional: keep for debugging if needed
    router.push('/inbox/new');
  };

  const handleCreateGroup = () => {
    console.log("Navigate to create group page");
    // router.push('/inbox/new-group'); // Example future route
  };

  // Filtered conversations for future search implementation
  // const filteredConversations = conversations.filter(conv =>
  //   conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  if (isLoading) {
    return <div className="container max-w-2xl py-6 text-center">Loading messages...</div>;
  }

  if (error) {
    return <div className="container max-w-2xl py-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container max-w-2xl py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleNewMessage}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Message
          </Button>
          <Button variant="outline" onClick={handleCreateGroup}>
            <GroupIcon className="mr-2 h-4 w-4" /> Create Group
          </Button>
        </div>
      </div>

      {/* Search input - keep for future, or remove if not implementing search now */}
      {/*
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search messages or users..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      */}

      <div className="space-y-1">
        {conversations.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground py-8">No conversations yet.</p>
        )}
        {conversations.map((conv) => (
          <Link href={`/inbox/${conv.id}`} key={conv.id} legacyBehavior>
            <a className="flex items-center space-x-4 p-3 hover:bg-muted rounded-lg cursor-pointer border-b">
              <Avatar className="h-12 w-12">
                <AvatarImage src={conv.avatarUrl || undefined} alt={conv.name} />
                <AvatarFallback className="text-lg">
                  {conv.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium truncate text-base">{conv.name}</h3>
                  {conv.lastMessage?.createdAt && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNowStrict(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {conv.lastMessage
                    ? `${conv.lastMessage.senderFirstName || 'User'}: ${conv.lastMessage.content}`
                    : "No messages yet..."}
                </p>
              </div>
              {/* Basic unread indicator placeholder - logic to be added */}
              {/* {conv.unreadCount > 0 && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>} */}
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
