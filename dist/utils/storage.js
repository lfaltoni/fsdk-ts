// Storage utilities for user session management
export const storage = {
    setUser: (user) => {
        try {
            localStorage.setItem('user', JSON.stringify(user));
        }
        catch (error) {
            console.error('Failed to store user in localStorage:', error);
        }
    },
    getUser: () => {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        }
        catch (error) {
            console.error('Failed to retrieve user from localStorage:', error);
            return null;
        }
    },
    clearUser: () => {
        try {
            localStorage.removeItem('user');
        }
        catch (error) {
            console.error('Failed to clear user from localStorage:', error);
        }
    },
    // JWT token management
    setToken: (token) => {
        try {
            localStorage.setItem('auth_token', token);
        }
        catch (error) {
            console.error('Failed to store token in localStorage:', error);
        }
    },
    getToken: () => {
        try {
            return localStorage.getItem('auth_token');
        }
        catch (error) {
            console.error('Failed to retrieve token from localStorage:', error);
            return null;
        }
    },
    clearToken: () => {
        try {
            localStorage.removeItem('auth_token');
        }
        catch (error) {
            console.error('Failed to clear token from localStorage:', error);
        }
    },
    // Check if user session exists and is valid
    hasValidSession: () => {
        const user = storage.getUser();
        return user !== null && !!user.user_id;
    }
};
