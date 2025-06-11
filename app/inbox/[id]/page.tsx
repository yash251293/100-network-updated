"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, Phone, Video, Info, Loader2, AlertTriangle, MessageSquare } from "lucide-react"; // Added icons
import { getToken } from "@/lib/authClient";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';
import ProtectedRoute from "@/components/ProtectedRoute";

const MESSAGES_PER_PAGE = 20;

function ConversationDetailPageContent({ conversationIdParam }: { conversationIdParam: string }) {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const conversationId = conversationIdParam;
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [conversationPartner, setConversationPartner] = useState<any>(null);
  const [messagePage, setMessagePage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const fetchCurrentUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      // This should ideally be caught by ProtectedRoute, but as a fallback:
      setMessagesError("Authentication required.");
      setIsLoadingMessages(false); // Stop overall loading if no auth
      return;
    }
    try {
      const response = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch current user.");
      const data = await response.json();
      setCurrentUserId(data.userId || data.id); // Assuming API returns userId or id
    } catch (error: any) {
      toast.error(error.message || "Could not fetch user details.");
      // Decide if this is a critical error that should stop message loading
    }
  }, []);

  const fetchMessages = useCallback(async (pageToFetch: number) => {
    if (!conversationId || !currentUserId) return; // Wait for IDs
    if (pageToFetch === 1) setIsLoadingMessages(true); // Full load for first page
    setMessagesError(null);
    const token = getToken();

    if (!token) {
        setMessagesError("Authentication required.");
        setIsLoadingMessages(false);
        return;
    }

    try {
      const offset = (pageToFetch - 1) * MESSAGES_PER_PAGE;
      const response = await fetch(`/api/conversations/${conversationId}/messages?limit=${MESSAGES_PER_PAGE}&offset=${offset}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to fetch messages" }));
        throw new Error(errorData.message || "Failed to fetch messages");
      }
      const data = await response.json();
      const newMessages = data.messages || [];

      setMessages(prevMessages => pageToFetch === 1 ? newMessages : [...newMessages, ...prevMessages]);
      setHasMoreMessages(newMessages.length === MESSAGES_PER_PAGE);
      setMessagePage(pageToFetch);

      if (pageToFetch === 1 && newMessages.length > 0) {
        // Determine conversation partner from the first message or participants list
        const firstMessage = newMessages[0];
        if (firstMessage?.senderId !== currentUserId && firstMessage?.sender) {
          setConversationPartner({
            id: firstMessage.senderId,
            name: `${firstMessage.sender.firstName} ${firstMessage.sender.lastName}`,
            avatarUrl: firstMessage.sender.avatarUrl,
            initials: `${firstMessage.sender.firstName?.[0] || ''}${firstMessage.sender.lastName?.[0] || ''}`.toUpperCase()
          });
        } else if (data.participants && data.participants.length > 0) {
            const otherParticipant = data.participants.find((p:any) => p.id !== currentUserId);
            if(otherParticipant) {
                 setConversationPartner({
                    id: otherParticipant.id,
                    name: `${otherParticipant.firstName} ${otherParticipant.lastName}`,
                    avatarUrl: otherParticipant.avatarUrl,
                    initials: `${otherParticipant.firstName?.[0] || ''}${otherParticipant.lastName?.[0] || ''}`.toUpperCase()
                });
            }
        }
         // Auto-scroll on initial load after messages are set
        setTimeout(() => scrollToBottom(), 0);
      }
    } catch (err: any) {
      setMessagesError(err.message);
      toast.error(err.message || "Could not load messages.");
    } finally {
      if (pageToFetch === 1) setIsLoadingMessages(false);
    }
  }, [conversationId, currentUserId]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (conversationId && currentUserId) {
      fetchMessages(1); // Fetch initial page
    }
  }, [conversationId, currentUserId, fetchMessages]);


  // Auto-scroll when new messages are added by the current user (or any new message if preferred)
  useEffect(() => {
    if (messages.length > 0) {
        // Only auto-scroll if the last message is from current user or it's the initial load.
        // More sophisticated scroll lock can be added later.
        const lastMessage = messages[messages.length -1];
        if(lastMessage?.senderId === currentUserId || isLoadingMessages) { // isLoadingMessages for initial scroll
             scrollToBottom("smooth");
        }
    }
  }, [messages, isLoadingMessages, currentUserId]);


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !currentUserId) return;
    setIsSendingMessage(true);
    const token = getToken();
    if (!token) {
      toast.error("Authentication required to send message.");
      setIsSendingMessage(false);
      return;
    }

    const tempMessageId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempMessageId,
      conversationId: conversationId,
      senderId: currentUserId,
      sender: { // Assuming we have current user's details for optimistic update
          id: currentUserId,
          // Fetch these from /api/profile or store them
          firstName: conversationPartner?.isMe ? "You" : currentUserId, // This logic needs refinement
          lastName: "",
          avatarUrl: "" // Current user's avatar
      },
      content: newMessage,
      createdAt: new Date().toISOString(),
      isOptimistic: true // Flag for potential styling or retry logic
    };

    setMessages(prevMessages => [...prevMessages, optimisticMessage]);
    setNewMessage("");
    scrollToBottom("smooth");

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newMessage }),
      });

      const result = await response.json();

      if (response.ok) {
        // Replace optimistic message with actual message from server
        setMessages(prevMessages => prevMessages.map(msg =>
            msg.id === tempMessageId ? { ...result.data, isOptimistic: false } : msg
        ));
        // toast.success("Message sent!"); // Optional: can be too noisy
      } else {
        toast.error(result.message || "Failed to send message.");
        // Revert optimistic update or mark as failed
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempMessageId));
      }
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("An unexpected error occurred.");
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempMessageId));
    } finally {
      setIsSendingMessage(false);
    }
  };

  const loadMoreMessages = () => {
    if (hasMoreMessages && !isLoadingMessages) {
      fetchMessages(messagePage + 1);
    }
  };


  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg shadow-sm border sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {conversationPartner ? (
            <>
              <Avatar className="h-10 w-10">
                <AvatarImage src={conversationPartner.avatarUrl || undefined} alt={conversationPartner.name} />
                <AvatarFallback>{conversationPartner.initials || '??'}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold">{conversationPartner.name}</h1>
                {/* Add online status or other info if available */}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
                 <Avatar className="h-10 w-10 bg-gray-200 animate-pulse" />
                 <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="rounded-full"><Phone className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" className="rounded-full"><Video className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" className="rounded-full"><Info className="h-5 w-5" /></Button>
        </div>
      </div>

      {/* Message List */}
      <div ref={messageListRef} className="flex-grow overflow-y-auto p-4 space-y-2 bg-slate-50 rounded-lg">
        {hasMoreMessages && !isLoadingMessages && messages.length > 0 && (
          <div className="text-center mb-4">
            <Button onClick={loadMoreMessages} variant="outline" size="sm" disabled={isLoadingMessages}>
              {isLoadingMessages && messagePage > 1 ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
              Load More Messages
            </Button>
          </div>
        )}
        {isLoadingMessages && messages.length === 0 && <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary-navy" /> <p>Loading messages...</p></div>}
        {!isLoadingMessages && messagesError && <div className="text-center py-10 text-red-500"><AlertTriangle className="inline h-5 w-5 mr-1"/>Error: {messagesError} <Button onClick={() => fetchMessages(1)} variant="link">Try again</Button></div>}
        {!isLoadingMessages && !messagesError && messages.length === 0 && <div className="text-center py-10 text-gray-500"><MessageSquare className="inline h-8 w-8 mr-2" />No messages yet. Be the first to send a message!</div>}

        {messages.map((msg, index) => {
          const isMe = msg.senderId === currentUserId || (msg.isOptimistic && msg.senderId === currentUserId);
          // Fallback for sender name if not present (e.g. optimistic message before full data)
          const senderName = msg.sender?.firstName ? `${msg.sender.firstName} ${msg.sender.lastName || ''}` : (isMe ? "You" : conversationPartner?.name || "Them");
          const senderInitials = msg.sender?.firstName ? `${msg.sender.firstName[0]}${msg.sender.lastName?.[0] || ''}`.toUpperCase() : (isMe ? "ME" : conversationPartner?.initials || "??");
          const senderAvatar = isMe ? null : (msg.sender?.avatarUrl || conversationPartner?.avatarUrl);


          return (
            <div key={msg.id || `optimistic-${index}`} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end space-x-2 max-w-[70%] ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isMe && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={senderAvatar || undefined} />
                    <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">{senderInitials}</AvatarFallback>
                  </Avatar>
                )}
                 {isMe && ( // Optionally show current user's avatar
                  <Avatar className="h-8 w-8">
                     {/* <AvatarImage src={currentUserAvatarUrl || undefined} /> */}
                    <AvatarFallback className="bg-primary-navy text-white text-xs">ME</AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-2xl p-3 shadow-sm ${isMe ? 'bg-primary-navy text-white' : 'bg-white text-gray-800 border border-gray-200'}`}>
                  {!isMe && <p className="text-xs font-medium mb-1 text-primary-navy">{senderName}</p>}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <span className={`text-xs mt-1 block ${isMe ? 'text-blue-200' : 'text-gray-500'} ${msg.isOptimistic ? 'opacity-70 italic' : ''}`}>
                    {msg.isOptimistic ? 'Sending...' : formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
         <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="mt-auto p-4 bg-white border-t sticky bottom-0 z-10">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-2">
          <Input
            placeholder="Type a message..."
            className="flex-1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSendingMessage}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full"
            disabled={isSendingMessage || !newMessage.trim()}
          >
            {isSendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MessageDetailPageWrapper({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <ConversationDetailPageContent conversationIdParam={params.id} />
    </ProtectedRoute>
  )
}
