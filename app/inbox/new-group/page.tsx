"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getToken } from '@/lib/authClient';
import { UserPlus, Users as GroupIcon, Search, Loader2, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserSearchResult {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  fullName: string;
}

export default function NewGroupPage() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<UserSearchResult[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch search results
  useEffect(() => {
    if (debouncedSearchTerm.trim().length < 1) {
      setSearchResults([]);
      setIsLoadingSearch(false);
      return;
    }
    const fetchUsers = async () => {
      setIsLoadingSearch(true);
      setError(null);
      const token = getToken();
      if (!token) {
        setError("Authentication required.");
        setIsLoadingSearch(false);
        return;
      }
      try {
        const response = await fetch(`/api/users/search?query=${encodeURIComponent(debouncedSearchTerm)}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to search users.");
        const data = await response.json();
        if (data.success && Array.isArray(data.users)) {
          // Filter out already selected members from search results
          setSearchResults(data.users.filter(user => !selectedMembers.find(m => m.id === user.id)));
        } else {
          setSearchResults([]);
        }
      } catch (err: any) {
        setError(err.message);
        setSearchResults([]);
      } finally {
        setIsLoadingSearch(false);
      }
    };
    fetchUsers();
  }, [debouncedSearchTerm, selectedMembers]); // Re-fetch if selectedMembers changes to filter them out

  const handleAddMember = (user: UserSearchResult) => {
    if (!selectedMembers.find(m => m.id === user.id)) {
      setSelectedMembers(prev => [...prev, user]);
    }
    setSearchTerm(''); // Clear search term after adding
    setSearchResults([]); // Clear search results
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers(prev => prev.filter(m => m.id !== userId));
  };

  const handleCreateGroup = async () => {
    if (groupName.trim().length === 0) {
      toast({ title: "Error", description: "Group name is required.", variant: "destructive" });
      return;
    }
    if (selectedMembers.length === 0) {
      toast({ title: "Error", description: "Please add at least one member to the group.", variant: "destructive" });
      return;
    }

    setIsCreatingGroup(true);
    setError(null);
    const token = getToken();
    if (!token) {
      toast({ title: "Error", description: "Authentication required.", variant: "destructive" });
      setIsCreatingGroup(false);
      return;
    }

    try {
      const memberIds = selectedMembers.map(m => m.id);
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'group',
          userIds: memberIds,
          groupName: groupName,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.conversation?.id) {
        toast({ title: "Success", description: `Group "${groupName}" created.` });
        router.push(`/inbox/${data.conversation.id}`);
      } else {
        throw new Error(data.message || "Failed to create group.");
      }
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsCreatingGroup(false);
    }
  };

  return (
    <div className="container max-w-xl py-6">
      <h1 className="text-2xl font-bold mb-2">Create New Group Chat</h1>
      <p className="text-muted-foreground mb-6">Name your group and add members.</p>

      <div className="space-y-6">
        <div>
          <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
          <Input
            id="groupName"
            type="text"
            placeholder="Enter group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="mb-4"
            disabled={isCreatingGroup}
          />
        </div>

        <div>
          <label htmlFor="userSearch" className="block text-sm font-medium text-gray-700 mb-1">Add Members</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="userSearch"
              type="text"
              placeholder="Search users to add..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 mb-2"
              disabled={isCreatingGroup}
            />
          </div>
          {isLoadingSearch && <div className="text-sm text-muted-foreground flex items-center"><Loader2 className="h-4 w-4 animate-spin mr-1"/>Searching...</div>}
          {error && !isLoadingSearch && <p className="text-red-500 text-sm">{error}</p>}

          {!isLoadingSearch && searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto border rounded-md mt-1">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer"
                  onClick={() => handleAddMember(user)}
                >
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
                      <AvatarFallback>{user.fullName[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <span>{user.fullName}</span>
                  </div>
                  <UserPlus className="h-4 w-4 text-blue-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedMembers.length > 0 && (
          <div>
            <h3 className="text-md font-semibold mb-2">Selected Members ({selectedMembers.length}):</h3>
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map(member => (
                <Badge key={member.id} variant="secondary" className="pl-2 pr-1 py-1 text-sm">
                  {member.fullName}
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={isCreatingGroup}
                    className="ml-1.5 p-0.5 rounded-full hover:bg-destructive/20 text-destructive"
                    aria-label={`Remove ${member.fullName}`}
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleCreateGroup}
          disabled={isCreatingGroup || groupName.trim().length === 0 || selectedMembers.length === 0}
          className="w-full"
        >
          {isCreatingGroup ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GroupIcon className="mr-2 h-4 w-4" />}
          Create Group
        </Button>
      </div>
    </div>
  );
}
