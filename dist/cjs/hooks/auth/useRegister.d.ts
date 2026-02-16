import type { RegisterData, User } from '../../types/auth';
export declare const useRegister: () => {
    register: (data: RegisterData) => Promise<User>;
    isLoading: boolean;
    error: string | null;
    success: boolean;
    clearError: () => void;
    clearSuccess: () => void;
};
