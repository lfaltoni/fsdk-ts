import { useState } from 'react';
import { authApi } from '../api/auth';
import { storage } from '../utils/storage';
import { useLogin } from './useLogin';
export const useRegister = () => {
    const { login } = useLogin(); // for auto-login
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const register = async (data) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const response = await authApi.register(data);
            if (response.success && response.user) {
                storage.setUser(response.user); // Store user
                await login({ email: data.email, password: data.password }); // Auto-login
                setSuccess(true);
            }
            else {
                setError(response.error || 'Registration failed');
            }
        }
        catch (err) {
            setError('Network error. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const clearError = () => setError(null);
    const clearSuccess = () => setSuccess(false);
    return { register, isLoading, error, success, clearError, clearSuccess };
};
