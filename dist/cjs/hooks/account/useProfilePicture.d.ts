import { ChangeEvent } from 'react';
export interface ProfilePictureResponse {
    url?: string;
    error?: string;
}
export declare const useProfilePicture: (userId: string) => {
    profilePictureUrl: string | null;
    isLoading: boolean;
    uploading: boolean;
    error: string | null;
    fileInputRef: import("react").RefObject<HTMLInputElement | null>;
    uploadProfilePicture: (file: File) => Promise<any>;
    handleFileSelect: (event: ChangeEvent<HTMLInputElement>) => Promise<any>;
    refreshProfilePicture: () => Promise<void>;
    clearError: () => void;
};
