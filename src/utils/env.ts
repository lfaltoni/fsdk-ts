// Environment configuration for frontend-lib

export interface EnvConfig {
  apiUrl: string;
}

// Default configuration
const defaultConfig: EnvConfig = {
  apiUrl: 'http://localhost:5000'  // Default to local backend
};

// Get configuration from environment or window object
export const getEnvConfig = (): EnvConfig => {
  if (typeof window !== 'undefined') {
    // Browser environment - check window object first, then env
    return {
      apiUrl: (window as any).__API_URL__ || 'http://localhost:5000'
    };
  }
  
  // Server environment - use process.env
  return {
    apiUrl: 'http://localhost:5000'
  };
};

export const envConfig = getEnvConfig();
