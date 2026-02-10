import type { LoginCredentials, RegisterData, User } from '../../types/auth';
interface UseLoginReturn {
    login: (credentials: LoginCredentials) => Promise<User>;
    register: (userData: RegisterData) => Promise<User>;
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
}
/**
 * Hook for handling login and registration functionality
 */
export declare const useLogin: () => UseLoginReturn;
export {};
