"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProfilePicture = void 0;
const react_1 = require("react");
const env_1 = require("../../utils/env");
const useProfilePicture = (userId) => {
    const [profilePictureUrl, setProfilePictureUrl] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [uploading, setUploading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const fileInputRef = (0, react_1.useRef)(null);
    const loadProfilePicture = async () => {
        if (!userId)
            return;
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`${env_1.envConfig.apiUrl}/media/profile-picture/${userId}`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setProfilePictureUrl(data.url || null);
            }
            else {
                // Profile picture not found is not an error
                if (response.status === 404) {
                    setProfilePictureUrl(null);
                }
                else {
                    setError(data.error || 'Failed to load profile picture');
                }
            }
        }
        catch (error) {
            setError('Network error. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const uploadProfilePicture = async (file) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Invalid file type. Allowed: jpg, jpeg, png, gif, webp');
            return null;
        }
        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setError('File too large. Maximum size is 10MB');
            return null;
        }
        try {
            setUploading(true);
            setError(null);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('user_id', userId);
            const response = await fetch(`${env_1.envConfig.apiUrl}/media/upload/profile-picture`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setProfilePictureUrl(result.url || null);
                return result.url;
            }
            else {
                setError(result.error || 'Upload failed');
                return null;
            }
        }
        catch (error) {
            setError('Network error. Please try again.');
            return null;
        }
        finally {
            setUploading(false);
        }
    };
    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return null;
        return await uploadProfilePicture(file);
    };
    const refreshProfilePicture = async () => {
        await loadProfilePicture();
    };
    const clearError = () => setError(null);
    // Load profile picture on mount
    (0, react_1.useState)(() => {
        loadProfilePicture();
    });
    return {
        profilePictureUrl,
        isLoading,
        uploading,
        error,
        fileInputRef,
        uploadProfilePicture,
        handleFileSelect,
        refreshProfilePicture,
        clearError
    };
};
exports.useProfilePicture = useProfilePicture;
