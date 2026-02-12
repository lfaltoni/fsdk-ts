"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authApi = void 0;
const logging_1 = require("../utils/logging");
const client_1 = require("./client");
const logger = (0, logging_1.getLogger)('auth-api');
// Authentication API functions
exports.authApi = {
    login: async (credentials) => {
        logger.info('Attempting login', { email: credentials.email });
        try {
            const response = await (0, client_1.apiRequest)('/api/auth/login', {
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
            const response = await (0, client_1.apiRequest)('/api/auth/register', {
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
            const response = await (0, client_1.apiRequest)('/api/auth/logout', {
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
