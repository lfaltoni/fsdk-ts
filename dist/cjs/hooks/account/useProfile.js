"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProfile = void 0;
const react_1 = require("react");
const storage_1 = require("../../utils/storage");
const useProfile = () => {
    const [profile, setProfile] = (0, react_1.useState)({});
    const [user, setUser] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    // Load user and profile data on mount
    (0, react_1.useEffect)(() => {
        loadUserData();
        const userData = storage_1.storage.getUser();
        if (userData) {
            setUser(userData);
            loadProfileData(userData.user_id);
        }
    }, []);
    const loadUserData = () => {
        try {
            const userData = storage_1.storage.getUser();
            if (userData) {
                setUser(userData);
            }
        }
        catch (error) {
            setError('Failed to load user data');
        }
    };
    const loadProfileData = async (userId) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`/user/profile?user_id=${userId}`);
            const data = await response.json();
            if (data.success) {
                setProfile(data.profile_data || {});
                if (data.user_info) {
                    setUser(data.user_info);
                    storage_1.storage.setUser(data.user_info);
                }
            }
            else {
                setError(data.error || 'Failed to load profile data');
            }
        }
        catch (error) {
            setError('Network error. Please try again.');
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
            const response = await fetch('/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.user_id,
                    profile_data: profileData
                }),
            });
            const data = await response.json();
            if (data.success) {
                setProfile(profileData);
                return data;
            }
            else {
                setError(data.error || 'Failed to update profile');
                throw new Error(data.error || 'Failed to update profile');
            }
        }
        catch (error) {
            setError('Network error. Please try again.');
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    };
    const refreshProfile = async () => {
        if (user) {
            await loadProfileData(user.user_id);
        }
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
