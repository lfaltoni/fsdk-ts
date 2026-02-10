import type { User } from '../../types/auth';
export interface UserProfile {
    name?: string;
    gender?: string;
    dob?: string;
    address?: string;
    phone?: string;
    about?: string;
    [key: string]: any;
}
export interface ProfileResponse {
    success: boolean;
    profile_data?: UserProfile;
    user_info?: User;
    error?: string;
}
export declare const useProfile: () => {
    profile: UserProfile;
    user: User | null;
    isLoading: boolean;
    error: string | null;
    updateProfile: (profileData: UserProfile) => Promise<ProfileResponse | undefined>;
    refreshProfile: () => Promise<void>;
    clearError: () => void;
};
