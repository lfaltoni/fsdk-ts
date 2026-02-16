"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authApi = void 0;
const logging_1 = require("../utils/logging");
const foundation_client_1 = require("./foundation-client");
const storage_1 = require("../utils/storage");
const logger = (0, logging_1.getLogger)('auth-api');
// Authentication API functions
exports.authApi = {
    login: async (credentials) => {
        logger.info('Attempting login', { email: credentials.email });
        const response = await (0, foundation_client_1.foundationRequest)('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        if (!response.user) {
            throw new Error('Invalid response: user data missing');
        }
        // Store JWT for cross-service auth
        if (response.token) {
            storage_1.storage.setToken(response.token);
        }
        logger.info('Login successful', { userId: response.user.user_id });
        return response.user;
    },
    register: async (userData) => {
        logger.info('Attempting registration', { email: userData.email });
        const response = await (0, foundation_client_1.foundationRequest)('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        if (!response.user) {
            throw new Error('Invalid response: user data missing');
        }
        // Store JWT for cross-service auth
        if (response.token) {
            storage_1.storage.setToken(response.token);
        }
        logger.info('Registration successful', { userId: response.user.user_id });
        return response.user;
    },
    logout: async () => {
        logger.info('Attempting logout');
        const response = await (0, foundation_client_1.foundationRequest)('/api/auth/logout', {
            method: 'POST',
        });
        logger.info('Logout successful');
        return response;
    },
};
