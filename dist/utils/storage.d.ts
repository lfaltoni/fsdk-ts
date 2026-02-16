import { User } from '../types/auth';
export declare const storage: {
    setUser: (user: User) => void;
    getUser: () => User | null;
    clearUser: () => void;
    setToken: (token: string) => void;
    getToken: () => string | null;
    clearToken: () => void;
    hasValidSession: () => boolean;
};
