import { useState, useCallback } from 'react';
import { authApi } from '../../api/auth';
import { useAuth } from './useAuth';
import { getLogger } from '../../utils/logging';
const logger = getLogger('useLogin');
/**
 * Hook for handling login and registration functionality
 */
export const useLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login: authLogin } = useAuth();
    const clearError = useCallback(() => {
        setError(null);
    }, []);
    const login = useCallback(async (credentials) => {
        setIsLoading(true);
        setError(null);
        try {
            logger.info('Starting login process');
            logger.logFormSubmission(credentials);
            const user = await authApi.login(credentials);
            // Use useAuth's login function to update React state
            authLogin(user);
            logger.info('Login successful', { userId: user.user_id });
            return user;
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
    }, [authLogin]);
    const register = useCallback(async (userData) => {
        setIsLoading(true);
        setError(null);
        try {
            logger.info('Starting registration process');
            logger.logFormSubmission(userData);
            const user = await authApi.register(userData);
            // Use useAuth's login function to update React state
            authLogin(user);
            logger.info('Registration successful', { userId: user.user_id });
            return user;
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
    }, [authLogin]);
    return {
        login,
        register,
        isLoading,
        error,
        clearError
    };
};
