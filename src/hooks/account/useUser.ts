import { useState, useEffect } from 'react';
import { storage } from '../../utils/storage';
import type { User } from '../../types/auth';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = () => {
    try {
      setIsLoading(true);
      setError(null);

      const userData = storage.getUser();
      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      setError('Failed to load user data');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = () => {
    loadUser();
  };

  const clearUser = () => {
    storage.clearUser();
    setUser(null);
  };

  const updateUser = (userData: User) => {
    storage.setUser(userData);
    setUser(userData);
  };

  const clearError = () => setError(null);

  return {
    user,
    isLoading,
    error,
    refreshUser,
    clearUser,
    updateUser,
    clearError
  };
};
