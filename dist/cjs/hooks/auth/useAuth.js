"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = void 0;
const react_1 = require("react");
const storage_1 = require("../../utils/storage");
const auth_1 = require("../../api/auth");
const profile_1 = require("../../api/profile");
const logging_1 = require("../../utils/logging");
const logger = (0, logging_1.getLogger)('useAuth');
/**
 * Hook for managing authentication state
 */
const useAuth = () => {
    const [user, setUser] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const clearError = (0, react_1.useCallback)(() => {
        setError(null);
    }, []);
    const login = (0, react_1.useCallback)((userData) => {
        setUser(userData);
        storage_1.storage.setUser(userData);
        logger.info('User logged in', { userId: userData.user_id });
    }, []);
    const logout = (0, react_1.useCallback)(async () => {
        setIsLoading(true);
        setError(null);
        try {
            logger.info('Starting logout process');
            // Call backend logout
            await auth_1.authApi.logout();
            // Clear local state and storage (including JWT)
            setUser(null);
            storage_1.storage.clearUser();
            storage_1.storage.clearToken();
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
    const refreshUser = (0, react_1.useCallback)(async () => {
        setIsLoading(true);
        setError(null);
        try {
            logger.info('Refreshing user data');
            const { user, profile_data } = await profile_1.profileApi.getProfile();
            if (user) {
                const updatedUser = {
                    user_id: user.user_id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    registration_order: user.registration_order
                };
                setUser(updatedUser);
                storage_1.storage.setUser(updatedUser);
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
    (0, react_1.useEffect)(() => {
        const initializeAuth = () => {
            try {
                const storedUser = storage_1.storage.getUser();
                if (storedUser && storage_1.storage.hasValidSession()) {
                    setUser(storedUser);
                    logger.info('User session restored', { userId: storedUser.user_id });
                }
                else {
                    storage_1.storage.clearUser(); // Clear invalid session
                    logger.info('No valid session found');
                }
            }
            catch (error) {
                logger.error('Failed to initialize auth', { error });
                storage_1.storage.clearUser();
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
exports.useAuth = useAuth;
