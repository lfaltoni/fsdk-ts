import { LoginCredentials, RegisterData, User } from '../types/auth';
export declare const authApi: {
    /**
     * Authenticate user with email and password
     */
    login: (credentials: LoginCredentials) => Promise<User>;
    /**
     * Register a new user account
     */
    register: (userData: RegisterData) => Promise<User>;
    /**
     * Logout current user
     */
    logout: () => Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get current user profile
     */
    getProfile: () => Promise<any>;
};
