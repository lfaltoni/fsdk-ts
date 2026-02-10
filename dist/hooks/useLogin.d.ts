import { LoginCredentials, RegisterData, AuthResponse } from '../types/auth';
interface UseLoginReturn {
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    register: (userData: RegisterData) => Promise<AuthResponse>;
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
}
/**
 * Hook for handling login and registration functionality
 */
export declare const useLogin: () => UseLoginReturn;
export {};
