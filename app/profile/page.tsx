'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Assuming Textarea is available

interface Skill {
  userSkillId: string;
  skillId: string;
  name: string;
  level: number;
  addedAt: string;
}

interface ProfileData {
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

interface UserProfile {
  userId: string;
  email: string;
  profile: ProfileData | null;
  skills: Skill[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state for editing
  const [editFormData, setEditFormData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    bio: '',
    avatarUrl: '',
  });

  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem('authToken');
          router.push('/auth/login');
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch profile');
        }

        const data: UserProfile = await response.json();
        setProfile(data);
        if (data.profile) {
          setEditFormData({
            firstName: data.profile.firstName || '',
            lastName: data.profile.lastName || '',
            bio: data.profile.bio || '',
            avatarUrl: data.profile.avatarUrl || '',
          });
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true); // Or a specific saving flag
    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedProfileData = await response.json();

      // Update local profile state optimistically or with response
      setProfile(prev => prev ? ({
        ...prev,
        profile: { ...prev.profile, ...updatedProfileData.profile } as ProfileData
      }) : null);

      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during update.');
    } finally {
      setIsLoading(false); // Or a specific saving flag
    }
  };

  if (isLoading && !profile) { // Show loading only on initial load
    return <div className="container mx-auto p-4 text-center">Loading profile...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!profile) {
    // This case should ideally be handled by redirect or a more specific message if token was valid but profile not found
    return <div className="container mx-auto p-4 text-center">No profile data found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      {/* Profile Information Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline">Edit Profile</Button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleEditSubmit}>
            <div className="mb-4">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" value={editFormData.firstName || ''} onChange={handleInputChange} />
            </div>
            <div className="mb-4">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" value={editFormData.lastName || ''} onChange={handleInputChange} />
            </div>
            <div className="mb-4">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" value={editFormData.bio || ''} onChange={handleInputChange} rows={4} />
            </div>
            <div className="mb-4">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input id="avatarUrl" name="avatarUrl" type="url" value={editFormData.avatarUrl || ''} onChange={handleInputChange} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>{isLoading && !profile ? 'Saving...' : 'Save Changes'}</Button>
              <Button variant="ghost" onClick={() => { setIsEditing(false); if(profile?.profile) setEditFormData(profile.profile); /* Reset form */ }}>Cancel</Button>
            </div>
          </form>
        ) : (
          <div>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>First Name:</strong> {profile.profile?.firstName || 'N/A'}</p>
            <p><strong>Last Name:</strong> {profile.profile?.lastName || 'N/A'}</p>
            <p><strong>Bio:</strong> {profile.profile?.bio || 'N/A'}</p>
            {profile.profile?.avatarUrl && (
              <div className="mt-2">
                <strong>Avatar:</strong> <img src={profile.profile.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Skills Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Skills</h2>
        {profile.skills.length > 0 ? (
          <ul className="space-y-2">
            {profile.skills.map(skill => (
              <li key={skill.userSkillId} className="p-3 bg-gray-100 rounded-md flex justify-between items-center">
                <div>
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-sm text-gray-600 ml-2">(Level: {skill.level})</span>
                </div>
                {/* Placeholder for Edit/Delete Skill buttons */}
                <div>
                  {/* <Button variant="link" size="sm" onClick={() => alert(`Edit ${skill.name}`)}>Edit</Button> */}
                  {/* <Button variant="link" size="sm"onClick={() => alert(`Delete ${skill.name}`)} className="text-red-500">Delete</Button> */}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>You haven't added any skills yet.</p>
        )}
        {/* Placeholder for Add Skill button/modal trigger */}
        {/* <Button className="mt-4">Add New Skill</Button> */}
      </div>
    </div>
  );
}
