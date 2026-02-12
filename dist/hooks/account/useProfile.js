import { useState, useEffect } from 'react';
import { storage } from '../../utils/storage';
import { profileApi } from '../../api/profile';
export const useProfile = () => {
    const [profile, setProfile] = useState({});
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        const userData = storage.getUser();
        if (userData) {
            setUser(userData);
            loadProfileData();
        }
    }, []);
    const loadProfileData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { user: fetchedUser, profile_data } = await profileApi.getProfile();
            setProfile(profile_data);
            setUser(fetchedUser);
            storage.setUser(fetchedUser);
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
            await profileApi.updateProfile(profileData);
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
