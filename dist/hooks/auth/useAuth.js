import { useState, useEffect, useCallback } from 'react';
import { storage } from '../../utils/storage';
import { authApi } from '../../api/auth';
import { profileApi } from '../../api/profile';
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
            // Clear local state and storage (including JWT)
            setUser(null);
            storage.clearUser();
            storage.clearToken();
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
            const { user, profile_data } = await profileApi.getProfile();
            if (user) {
                const updatedUser = {
                    user_id: user.user_id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    registration_order: user.registration_order
                };
                setUser(updatedUser);
                storage.setUser(updatedUser);
                logger.info('User data refreshed', { userId: updatedUser.user_id, profile_data });
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
