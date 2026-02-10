import { User } from '../types/auth';
export declare const storage: {
    setUser: (user: User) => void;
    getUser: () => User | null;
    clearUser: () => void;
    hasValidSession: () => boolean;
};
