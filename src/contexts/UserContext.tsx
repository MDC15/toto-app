import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { getUserName, saveUserName } from '../utils/storage';

interface UserContextType {
    userName: string | null;
    setUserName: (name: string) => Promise<void>;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [userName, setUserNameState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUserName = async () => {
            const name = await getUserName();
            setUserNameState(name);
            setIsLoading(false);
        };
        loadUserName();
    }, []);

    const setUserName = async (name: string) => {
        await saveUserName(name);
        setUserNameState(name);
    };

    return (
        <UserContext.Provider value={{ userName, setUserName, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};