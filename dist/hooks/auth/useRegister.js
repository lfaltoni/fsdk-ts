import { useState } from 'react';
import { authApi } from '../../api/auth';
import { storage } from '../../utils/storage';
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
            const user = await authApi.register(data);
            // Store user and auto-login
            storage.setUser(user);
            await login({ email: data.email, password: data.password });
            setSuccess(true);
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
