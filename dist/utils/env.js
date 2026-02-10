// Environment configuration for frontend-lib
// Default configuration
const defaultConfig = {
    apiUrl: 'http://localhost:5000' // Default to local backend
};
// Get configuration from environment or window object
export const getEnvConfig = () => {
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
export const envConfig = getEnvConfig();
