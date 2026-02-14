"use strict";
// Environment configuration for frontend-lib
Object.defineProperty(exports, "__esModule", { value: true });
exports.envConfig = exports.getEnvConfig = void 0;
// Default configuration
const defaultConfig = {
    apiUrl: 'http://localhost:5000', // Bookease-pro (bookings, slots, experiences)
    foundationUrl: 'http://localhost:5001', // Foundation SDK server (auth, profiles, media)
};
// Get configuration from environment or window object
const getEnvConfig = () => {
    if (typeof window !== 'undefined') {
        // Browser environment - check window object first, then env
        return {
            apiUrl: window.__API_URL__ || defaultConfig.apiUrl,
            foundationUrl: window.__FOUNDATION_URL__ || window.__MEDIA_API_URL__ || defaultConfig.foundationUrl,
        };
    }
    // Server environment - use process.env
    return {
        apiUrl: defaultConfig.apiUrl,
        foundationUrl: defaultConfig.foundationUrl,
    };
};
exports.getEnvConfig = getEnvConfig;
exports.envConfig = (0, exports.getEnvConfig)();
