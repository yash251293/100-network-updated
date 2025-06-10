"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getToken } from '@/lib/authClient';
import { toast } from 'sonner';
import { UserPlus, Search, Loader2, Send } from 'lucide-react';

interface UserSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  headline?: string | null;
}

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // User search logic
  const searchUsers = useCallback(async () => {
    if (debouncedSearchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsLoadingSearch(true);
    const token = getToken();
    if (!token) {
      toast.error("Authentication required to search users.");
      setIsLoadingSearch(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(debouncedSearchTerm)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to search users" }));
        throw new Error(errorData.message);
      }
      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to search users.");
      setSearchResults([]);
    } finally {
      setIsLoadingSearch(false);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    searchUsers();
  }, [searchUsers]);

  const handleSelectUser = (user: UserSearchResult) => {
    setSelectedUser(user);
    setSearchTerm(""); // Clear search term after selection
    setSearchResults([]); // Clear search results
  };

  const handleStartChat = async () => {
    if (!selectedUser) {
      toast.error("Please select a user to start a chat.");
      return;
    }
    setIsCreatingConversation(true);
    const token = getToken();
    if (!token) {
      toast.error("Authentication required.");
      setIsCreatingConversation(false);
      return;
    }

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ type: 'one_on_one', userIds: [selectedUser.id] }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to start conversation" }));
        throw new Error(errorData.message);
      }

      const newConversationData = await response.json();
      toast.success("Conversation started!");
      router.push(`/inbox/${newConversationData.conversation.id}`);
      onClose(); // Close modal on success
    } catch (error: any) {
      toast.error(error.message || "Failed to start conversation.");
    } finally {
      setIsCreatingConversation(false);
    }
  };

  // Reset state when modal is closed/opened
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setDebouncedSearchTerm("");
      setSearchResults([]);
      setSelectedUser(null);
      setIsLoadingSearch(false);
      setIsCreatingConversation(false);
    }
  }, [isOpen]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] p-0 bg-white rounded-lg shadow-xl">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-800">New Message</DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search for people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {selectedUser && (
            <div className="p-3 bg-slate-100 rounded-md">
              <p className="text-sm font-medium text-slate-700">Selected: {selectedUser.firstName} {selectedUser.lastName}</p>
            </div>
          )}

          {(isLoadingSearch || searchResults.length > 0) && !selectedUser && (
            <ScrollArea className="h-[200px] border rounded-md">
              <div className="p-2 space-y-1">
                {isLoadingSearch && <div className="flex items-center justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-primary-navy" /> <span className="ml-2">Searching...</span></div>}
                {!isLoadingSearch && searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-2 hover:bg-slate-100 rounded-md cursor-pointer"
                    onClick={() => handleSelectUser(user)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl || undefined} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user.firstName} {user.lastName}</p>
                      {user.headline && <p className="text-xs text-gray-500 truncate">{user.headline}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          {!isLoadingSearch && searchResults.length === 0 && debouncedSearchTerm.length >=2 && !selectedUser && (
             <p className="text-sm text-center text-gray-500 py-4">No users found for "{debouncedSearchTerm}".</p>
          )}

        </div>
        <DialogFooter className="p-6 pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleStartChat}
            disabled={!selectedUser || isCreatingConversation}
          >
            {isCreatingConversation ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Start Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationModal;

[end of components/NewConversationModal.tsx]
