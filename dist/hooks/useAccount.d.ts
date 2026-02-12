export declare const useAccount: () => {
    user: import("..").User | null;
    profile: import("./account/useProfile").UserProfile;
    profilePictureUrl: string | null;
    uploadingProfilePicture: boolean;
    isLoading: boolean;
    error: string | null;
    updateUser: (userData: import("..").User) => void;
    clearUser: () => void;
    refreshUser: () => void;
    updateProfile: (profileData: import("./account/useProfile").UserProfile) => Promise<void>;
    refreshProfile: () => Promise<void>;
    uploadProfilePicture: (file: File) => Promise<any>;
    handleFileSelect: (event: import("react").ChangeEvent<HTMLInputElement>) => Promise<any>;
    refreshProfilePicture: () => Promise<void>;
    fileInputRef: import("react").RefObject<HTMLInputElement | null>;
    refreshAll: () => Promise<void>;
    clearAllErrors: () => void;
};
