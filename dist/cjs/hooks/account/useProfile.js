"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProfile = void 0;
const react_1 = require("react");
const storage_1 = require("../../utils/storage");
const profile_1 = require("../../api/profile");
const useProfile = () => {
    const [profile, setProfile] = (0, react_1.useState)({});
    const [user, setUser] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const userData = storage_1.storage.getUser();
        if (userData) {
            setUser(userData);
            loadProfileData();
        }
    }, []);
    const loadProfileData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { user: fetchedUser, profile_data } = await profile_1.profileApi.getProfile();
            setProfile(profile_data);
            setUser(fetchedUser);
            storage_1.storage.setUser(fetchedUser);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load profile data';
            setError(message);
        }
        finally {
            setIsLoading(false);
        }
    };
    const updateProfile = async (profileData) => {
        if (!user) {
            setError('User not found');
            return;
        }
        try {
            setIsLoading(true);
            setError(null);
            await profile_1.profileApi.updateProfile(profileData);
            setProfile(profileData);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update profile';
            setError(message);
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    };
    const refreshProfile = async () => {
        await loadProfileData();
    };
    const clearError = () => setError(null);
    return {
        profile,
        user,
        isLoading,
        error,
        updateProfile,
        refreshProfile,
        clearError
    };
};
exports.useProfile = useProfile;
