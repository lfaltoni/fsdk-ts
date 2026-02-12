import { getLogger } from '../utils/logging';
import { apiRequest } from './client';
const logger = getLogger('auth-api');
// Authentication API functions
export const authApi = {
    login: async (credentials) => {
        logger.info('Attempting login', { email: credentials.email });
        try {
            const response = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials),
            });
            if (!response.user) {
                throw new Error('Invalid response: user data missing');
            }
            logger.info('Login successful', { userId: response.user.user_id });
            return response.user;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Login failed', { error: errorMessage });
            throw error;
        }
    },
    register: async (userData) => {
        logger.info('Attempting registration', { email: userData.email });
        try {
            const response = await apiRequest('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData),
            });
            if (!response.user) {
                throw new Error('Invalid response: user data missing');
            }
            logger.info('Registration successful', { userId: response.user.user_id });
            return response.user;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Registration failed', { error: errorMessage });
            throw error;
        }
    },
    logout: async () => {
        logger.info('Attempting logout');
        try {
            const response = await apiRequest('/api/auth/logout', {
                method: 'POST',
            });
            logger.info('Logout successful');
            return response;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Logout failed', { error: errorMessage });
            throw error;
        }
    }
};
