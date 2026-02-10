import type { RegisterData } from '../types/auth';
export declare const useRegister: () => {
    register: (data: RegisterData) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    success: boolean;
    clearError: () => void;
    clearSuccess: () => void;
};
