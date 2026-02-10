"use strict";
// Environment configuration for frontend-lib
Object.defineProperty(exports, "__esModule", { value: true });
exports.envConfig = exports.getEnvConfig = void 0;
// Default configuration
const defaultConfig = {
    apiUrl: 'http://localhost:5000' // Default to local backend
};
// Get configuration from environment or window object
const getEnvConfig = () => {
    if (typeof window !== 'undefined') {
        // Browser environment - check window object first, then env
        return {
            apiUrl: window.__API_URL__ || 'http://localhost:5000'
        };
    }
    // Server environment - use process.env
    return {
        apiUrl: 'http://localhost:5000'
    };
};
exports.getEnvConfig = getEnvConfig;
exports.envConfig = (0, exports.getEnvConfig)();
