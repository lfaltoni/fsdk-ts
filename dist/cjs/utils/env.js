"use strict";
// Environment configuration for frontend-lib
Object.defineProperty(exports, "__esModule", { value: true });
exports.envConfig = exports.getEnvConfig = void 0;
// Default configuration
const defaultConfig = {
    apiUrl: 'http://localhost:5000', // Default to local backend (Bookease-pro)
    mediaApiUrl: 'http://localhost:5001', // Default to local media service (dubaiactivities)
};
// Get configuration from environment or window object
const getEnvConfig = () => {
    if (typeof window !== 'undefined') {
        // Browser environment - check window object first, then env
        return {
            apiUrl: window.__API_URL__ || defaultConfig.apiUrl,
            mediaApiUrl: window.__MEDIA_API_URL__ || defaultConfig.mediaApiUrl,
        };
    }
    // Server environment - use process.env
    return {
        apiUrl: defaultConfig.apiUrl,
        mediaApiUrl: defaultConfig.mediaApiUrl,
    };
};
exports.getEnvConfig = getEnvConfig;
exports.envConfig = (0, exports.getEnvConfig)();
