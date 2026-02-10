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
    updateProfile: (profileData: import("./account/useProfile").UserProfile) => Promise<import("./account/useProfile").ProfileResponse | undefined>;
    refreshProfile: () => Promise<void>;
    uploadProfilePicture: (file: File) => Promise<string | null | undefined>;
    handleFileSelect: (event: import("react").ChangeEvent<HTMLInputElement>) => Promise<string | null | undefined>;
    refreshProfilePicture: () => Promise<void>;
    fileInputRef: import("react").RefObject<HTMLInputElement | null>;
    refreshAll: () => Promise<void>;
    clearAllErrors: () => void;
};
