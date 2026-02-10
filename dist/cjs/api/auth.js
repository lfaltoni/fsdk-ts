"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authApi = void 0;
const logging_1 = require("../utils/logging");
const env_1 = require("../utils/env");
const logger = (0, logging_1.getLogger)('auth-api');
// Base API configuration
const API_BASE_URL = env_1.envConfig.apiUrl;
// Generic API request wrapper
async function apiRequest(endpoint, options = {}) {
    const startTime = Date.now();
    const url = `${API_BASE_URL}${endpoint}`;
    logger.logApiRequest(options.method || 'GET', url, options.body);
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });
        const duration = Date.now() - startTime;
        const data = await response.json();
        logger.logApiResponse(response.status, data, duration);
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return data;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('API request failed', { error: errorMessage, duration });
        throw error;
    }
}
// Authentication API functions
exports.authApi = {
    /**
     * Authenticate user with email and password
     */
    login: async (credentials) => {
        logger.info('Attempting login', { email: credentials.email });
        try {
            const user = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials),
            });
            logger.info('Login successful', { userId: user.user_id });
            return user;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Login failed', { error: errorMessage });
            throw error;
        }
    },
    /**
     * Register a new user account
     */
    register: async (userData) => {
        logger.info('Attempting registration', { email: userData.email });
        try {
            const user = await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData),
            });
            logger.info('Registration successful', { userId: user.user_id });
            return user;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Registration failed', { error: errorMessage });
            throw error;
        }
    },
    /**
     * Logout current user
     */
    logout: async () => {
        logger.info('Attempting logout');
        try {
            const response = await apiRequest('/auth/logout', {
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
    },
    /**
     * Get current user profile
     */
    getProfile: async () => {
        logger.info('Fetching user profile');
        try {
            const response = await apiRequest('/auth/profile');
            logger.info('Profile fetched successfully');
            return response;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Failed to fetch profile', { error: errorMessage });
            throw error;
        }
    }
};
