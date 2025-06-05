"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getToken } from '@/lib/authClient';
import { UserMinus, MessageSquarePlus, Search, Loader2 } from 'lucide-react'; // Added Loader2
import { toast } from '@/hooks/use-toast'; // Assuming use-toast is available

interface UserSearchResult {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  fullName: string;
}

export default function NewMessagePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Fetch search results
  useEffect(() => {
    if (debouncedSearchTerm.trim().length < 1) { // Require at least 1 char for search
      setSearchResults([]);
      setIsLoadingSearch(false);
      return;
    }

    const fetchUsers = async () => {
      setIsLoadingSearch(true);
      setError(null);
      const token = getToken();
      if (!token) {
        setError("Authentication required to search users.");
        setIsLoadingSearch(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/search?query=${encodeURIComponent(debouncedSearchTerm)}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to search users: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.users)) {
          setSearchResults(data.users);
        } else {
          setSearchResults([]); // Clear results on unexpected data
          throw new Error("Invalid data format received from user search.");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred during search.");
        setSearchResults([]);
      } finally {
        setIsLoadingSearch(false);
      }
    };

    fetchUsers();
  }, [debouncedSearchTerm]);

  const handleUserSelect = async (user: UserSearchResult) => {
    setIsCreatingConversation(true);
    setError(null);
    const token = getToken();
    if (!token) {
      toast({ title: "Error", description: "Authentication required.", variant: "destructive" });
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
        body: JSON.stringify({
          type: 'one_on_one',
          userIds: [user.id],
        }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.conversation?.id) {
        toast({ title: "Success", description: `Chat with ${user.fullName} started/opened.` });
        router.push(`/inbox/${data.conversation.id}`);
      } else {
        throw new Error(data.message || "Failed to start conversation.");
      }
    } catch (err: any) {
      setError(err.message || "Could not start conversation.");
      toast({ title: "Error", description: err.message || "Could not start conversation.", variant: "destructive" });
    } finally {
      setIsCreatingConversation(false);
    }
  };

  return (
    <div className="container max-w-xl py-6">
      <h1 className="text-2xl font-bold mb-2">New Message</h1>
      <p className="text-muted-foreground mb-6">Find a user to start a conversation with.</p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 mb-4"
          disabled={isCreatingConversation}
        />
      </div>

      {isLoadingSearch && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Searching users...</span>
        </div>
      )}

      {error && !isLoadingSearch && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {!isLoadingSearch && searchResults.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold mb-2">Results:</h2>
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
                  <AvatarFallback>
                    {(user.firstName?.[0] || '') + (user.lastName?.[0] || '') || user.fullName[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <span>{user.fullName}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUserSelect(user)}
                disabled={isCreatingConversation}
              >
                {isCreatingConversation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquarePlus className="h-4 w-4" />}
                <span className="ml-2">Message</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {!isLoadingSearch && debouncedSearchTerm.trim().length > 0 && searchResults.length === 0 && (
        <p className="text-muted-foreground text-center py-4">No users found matching your search.</p>
      )}
    </div>
  );
}
