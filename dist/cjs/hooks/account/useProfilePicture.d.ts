import { ChangeEvent } from 'react';
export interface ProfilePictureResponse {
    success: boolean;
    url?: string;
    error?: string;
}
export declare const useProfilePicture: (userId: string) => {
    profilePictureUrl: string | null;
    isLoading: boolean;
    uploading: boolean;
    error: string | null;
    fileInputRef: import("react").RefObject<HTMLInputElement | null>;
    uploadProfilePicture: (file: File) => Promise<string | null | undefined>;
    handleFileSelect: (event: ChangeEvent<HTMLInputElement>) => Promise<string | null | undefined>;
    refreshProfilePicture: () => Promise<void>;
    clearError: () => void;
};
