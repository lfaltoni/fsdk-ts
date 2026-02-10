"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLogin = void 0;
const react_1 = require("react");
const auth_1 = require("../../api/auth");
const storage_1 = require("../../utils/storage");
const logging_1 = require("../../utils/logging");
const logger = (0, logging_1.getLogger)('useLogin');
/**
 * Hook for handling login and registration functionality
 */
const useLogin = () => {
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const clearError = (0, react_1.useCallback)(() => {
        setError(null);
    }, []);
    const login = (0, react_1.useCallback)(async (credentials) => {
        setIsLoading(true);
        setError(null);
        try {
            logger.info('Starting login process');
            logger.logFormSubmission(credentials);
            const user = await auth_1.authApi.login(credentials);
            // Store user session
            storage_1.storage.setUser(user);
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
    }, []);
    const register = (0, react_1.useCallback)(async (userData) => {
        setIsLoading(true);
        setError(null);
        try {
            logger.info('Starting registration process');
            logger.logFormSubmission(userData);
            const user = await auth_1.authApi.register(userData);
            // Store user session
            storage_1.storage.setUser(user);
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
    }, []);
    return {
        login,
        register,
        isLoading,
        error,
        clearError
    };
};
exports.useLogin = useLogin;
