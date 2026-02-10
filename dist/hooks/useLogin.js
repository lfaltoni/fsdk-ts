import { useState, useCallback } from 'react';
import { authApi } from '../api/auth';
import { storage } from '../utils/storage';
import { getLogger } from '../utils/logging';
const logger = getLogger('useLogin');
/**
 * Hook for handling login and registration functionality
 */
export const useLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const clearError = useCallback(() => {
        setError(null);
    }, []);
    const login = useCallback(async (credentials) => {
        setIsLoading(true);
        setError(null);
        try {
            logger.info('Starting login process');
            logger.logFormSubmission(credentials);
            const response = await authApi.login(credentials);
            if (response.success && response.user) {
                // Store user session
                storage.setUser(response.user);
                logger.info('Login successful', { userId: response.user.user_id });
            }
            return response;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            setError(errorMessage);
            logger.error('Login error', { error: errorMessage });
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    const register = useCallback(async (userData) => {
        setIsLoading(true);
        setError(null);
        try {
            logger.info('Starting registration process');
            logger.logFormSubmission(userData);
            const response = await authApi.register(userData);
            if (response.success && response.user) {
                // Store user session
                storage.setUser(response.user);
                logger.info('Registration successful', { userId: response.user.user_id });
            }
            return response;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            setError(errorMessage);
            logger.error('Registration error', { error: errorMessage });
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    return {
        login,
        register,
        isLoading,
        error,
        clearError
    };
};
