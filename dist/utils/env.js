// Environment configuration for frontend-lib
// Default configuration
const defaultConfig = {
    apiUrl: 'http://localhost:5000', // Bookease-pro (bookings, slots, experiences)
    foundationUrl: 'http://localhost:5001', // Foundation SDK server (auth, profiles, media)
};
// Get configuration from environment or window object
export const getEnvConfig = () => {
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
export const envConfig = getEnvConfig();
