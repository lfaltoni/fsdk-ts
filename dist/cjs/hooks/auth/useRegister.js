"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRegister = void 0;
const react_1 = require("react");
const auth_1 = require("../../api/auth");
const storage_1 = require("../../utils/storage");
const useLogin_1 = require("./useLogin");
const useRegister = () => {
    const { login } = (0, useLogin_1.useLogin)(); // for auto-login
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [success, setSuccess] = (0, react_1.useState)(false);
    const register = async (data) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const user = await auth_1.authApi.register(data);
            // Store user and auto-login
            storage_1.storage.setUser(user);
            await login({ email: data.email, password: data.password });
            setSuccess(true);
            return user;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
            setError(message);
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    };
    const clearError = () => setError(null);
    const clearSuccess = () => setSuccess(false);
    return { register, isLoading, error, success, clearError, clearSuccess };
};
exports.useRegister = useRegister;
