import { LoginCredentials, RegisterData, User } from '../types/auth';
export declare const authApi: {
    login: (credentials: LoginCredentials) => Promise<User>;
    register: (userData: RegisterData) => Promise<User>;
    logout: () => Promise<{
        success: boolean;
        message: string;
    }>;
};
