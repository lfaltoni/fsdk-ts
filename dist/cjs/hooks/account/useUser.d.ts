import type { User } from '../../types/auth';
export declare const useUser: () => {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    refreshUser: () => void;
    clearUser: () => void;
    updateUser: (userData: User) => void;
    clearError: () => void;
};
