import { User } from '../types/auth';

// Storage utilities for user session management
export const storage = {
  setUser: (user: User): void => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store user in localStorage:', error);
    }
  },

  getUser: (): User | null => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Failed to retrieve user from localStorage:', error);
      return null;
    }
  },

  clearUser: (): void => {
    try {
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Failed to clear user from localStorage:', error);
    }
  },

  // Check if user session exists and is valid
  hasValidSession: (): boolean => {
    const user = storage.getUser();
    return user !== null && !!user.user_id;
  }
};
