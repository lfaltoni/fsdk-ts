import { useState, useRef, ChangeEvent } from 'react';

export interface ProfilePictureResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export const useProfilePicture = (userId: string) => {
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProfilePicture = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/media/profile-picture/${userId}`);
      const data: ProfilePictureResponse = await response.json();

      if (response.ok && data.success) {
        setProfilePictureUrl(data.url || null);
      } else {
        // Profile picture not found is not an error
        if (response.status === 404) {
          setProfilePictureUrl(null);
        } else {
          setError(data.error || 'Failed to load profile picture');
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Allowed: jpg, jpeg, png, gif, webp');
      return null;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 10MB');
      return null;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);

      const response = await fetch('/media/upload/profile-picture', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const result: ProfilePictureResponse = await response.json();

      if (response.ok && result.success) {
        setProfilePictureUrl(result.url || null);
        return result.url;
      } else {
        setError(result.error || 'Upload failed');
        return null;
      }
    } catch (error) {
      setError('Network error. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return null;

    return await uploadProfilePicture(file);
  };

  const refreshProfilePicture = async () => {
    await loadProfilePicture();
  };

  const clearError = () => setError(null);

  // Load profile picture on mount
  useState(() => {
    loadProfilePicture();
  });

  return {
    profilePictureUrl,
    isLoading,
    uploading,
    error,
    fileInputRef,
    uploadProfilePicture,
    handleFileSelect,
    refreshProfilePicture,
    clearError
  };
};
