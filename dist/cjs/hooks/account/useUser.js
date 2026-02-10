"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUser = void 0;
const react_1 = require("react");
const storage_1 = require("../../utils/storage");
const useUser = () => {
    const [user, setUser] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    // Load user from storage on mount
    (0, react_1.useEffect)(() => {
        loadUser();
    }, []);
    const loadUser = () => {
        try {
            setIsLoading(true);
            setError(null);
            const userData = storage_1.storage.getUser();
            if (userData) {
                setUser(userData);
            }
            else {
                setUser(null);
            }
        }
        catch (error) {
            setError('Failed to load user data');
            setUser(null);
        }
        finally {
            setIsLoading(false);
        }
    };
    const refreshUser = () => {
        loadUser();
    };
    const clearUser = () => {
        storage_1.storage.clearUser();
        setUser(null);
    };
    const updateUser = (userData) => {
        storage_1.storage.setUser(userData);
        setUser(userData);
    };
    const clearError = () => setError(null);
    return {
        user,
        isLoading,
        error,
        refreshUser,
        clearUser,
        updateUser,
        clearError
    };
};
exports.useUser = useUser;
