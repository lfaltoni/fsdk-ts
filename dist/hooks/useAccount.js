import { useUser } from './account/useUser';
import { useProfile } from './account/useProfile';
import { useProfilePicture } from './account/useProfilePicture';
export const useAccount = () => {
    console.log('useAccount hook called');
    const userData = useUser();
    console.log('userData:', userData);
    const profileData = useProfile();
    console.log('profileData:', profileData);
    const profilePictureData = useProfilePicture(userData.user?.user_id || '');
    console.log('profilePictureData:', profilePictureData);
    const refreshAll = async () => {
        await Promise.all([
            profileData.refreshProfile(),
            profilePictureData.refreshProfilePicture(),
            userData.refreshUser()
        ]);
    };
    const clearAllErrors = () => {
        userData.clearError();
        profileData.clearError();
        profilePictureData.clearError();
    };
    // Determine overall loading state
    const isLoading = userData.isLoading || profileData.isLoading || profilePictureData.isLoading;
    // Determine overall error state (prioritize user errors, then profile, then profile picture)
    const error = userData.error || profileData.error || profilePictureData.error;
    return {
        // User data
        user: userData.user,
        // Profile data
        profile: profileData.profile,
        // Profile picture data
        profilePictureUrl: profilePictureData.profilePictureUrl,
        uploadingProfilePicture: profilePictureData.uploading,
        // Loading states
        isLoading,
        // Error state
        error,
        // User operations
        updateUser: userData.updateUser,
        clearUser: userData.clearUser,
        refreshUser: userData.refreshUser,
        // Profile operations
        updateProfile: profileData.updateProfile,
        refreshProfile: profileData.refreshProfile,
        // Profile picture operations
        uploadProfilePicture: profilePictureData.uploadProfilePicture,
        handleFileSelect: profilePictureData.handleFileSelect,
        refreshProfilePicture: profilePictureData.refreshProfilePicture,
        fileInputRef: profilePictureData.fileInputRef,
        // Unified operations
        refreshAll,
        clearAllErrors
    };
};
