import { User } from '../types/auth';
interface UseAuthReturn {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    clearError: () => void;
}
/**
 * Hook for managing authentication state
 */
export declare const useAuth: () => UseAuthReturn;
export {};
