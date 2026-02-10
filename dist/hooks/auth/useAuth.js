import { useState, useEffect, useCallback } from 'react';
import { storage } from '../../utils/storage';
import { authApi } from '../../api/auth';
import { getLogger } from '../../utils/logging';
const logger = getLogger('useAuth');
/**
 * Hook for managing authentication state
 */
export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const clearError = useCallback(() => {
        setError(null);
    }, []);
    const login = useCallback((userData) => {
        setUser(userData);
        storage.setUser(userData);
        logger.info('User logged in', { userId: userData.user_id });
    }, []);
    const logout = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            logger.info('Starting logout process');
            // Call backend logout
            await authApi.logout();
            // Clear local state and storage
            setUser(null);
            storage.clearUser();
            logger.info('User logged out successfully');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Logout failed';
            setError(errorMessage);
            logger.error('Logout error', { error: errorMessage });
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    const refreshUser = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            logger.info('Refreshing user data');
            const profileData = await authApi.getProfile();
            if (profileData) {
                const updatedUser = {
                    user_id: profileData.user_id,
                    email: profileData.email,
                    first_name: profileData.first_name,
                    last_name: profileData.last_name,
                    registration_order: profileData.registration_order
                };
                setUser(updatedUser);
                storage.setUser(updatedUser);
                logger.info('User data refreshed', { userId: updatedUser.user_id });
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to refresh user';
            setError(errorMessage);
            logger.error('Refresh user error', { error: errorMessage });
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedUser = storage.getUser();
                if (storedUser && storage.hasValidSession()) {
                    setUser(storedUser);
                    logger.info('User session restored', { userId: storedUser.user_id });
                }
                else {
                    storage.clearUser(); // Clear invalid session
                    logger.info('No valid session found');
                }
            }
            catch (error) {
                logger.error('Failed to initialize auth', { error });
                storage.clearUser();
            }
        };
        initializeAuth();
    }, []);
    return {
        user,
        isLoading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
        clearError
    };
};
