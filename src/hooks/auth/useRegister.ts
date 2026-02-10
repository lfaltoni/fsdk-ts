import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../../api/auth';
import { storage } from '../../utils/storage';
import type { RegisterData, User } from '../../types/auth';
import { getLogger } from '../../utils/logging';
import { useLogin } from './useLogin';

export const useRegister = () => {
  const { login } = useLogin(); // for auto-login
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const user: User = await authApi.register(data);

      // Store user and auto-login
      storage.setUser(user);
      await login({ email: data.email, password: data.password });
      setSuccess(true);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(false);

  return { register, isLoading, error, success, clearError, clearSuccess };
};
