import type { User } from '../../types/auth';
export interface UserProfile {
    [key: string]: any;
}
export declare const useProfile: () => {
    profile: UserProfile;
    user: User | null;
    isLoading: boolean;
    error: string | null;
    updateProfile: (profileData: UserProfile) => Promise<void>;
    refreshProfile: () => Promise<void>;
    clearError: () => void;
};
