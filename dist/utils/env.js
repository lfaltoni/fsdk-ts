// Environment configuration for frontend-lib
// Default configuration
const defaultConfig = {
    apiUrl: 'http://localhost:5000', // Default to local backend (Bookease-pro)
    mediaApiUrl: 'http://localhost:5001', // Default to local media service (dubaiactivities)
};
// Get configuration from environment or window object
export const getEnvConfig = () => {
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
export const envConfig = getEnvConfig();
