"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
// Storage utilities for user session management
exports.storage = {
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
    // Check if user session exists and is valid
    hasValidSession: () => {
        const user = exports.storage.getUser();
        return user !== null && !!user.user_id;
    }
};
