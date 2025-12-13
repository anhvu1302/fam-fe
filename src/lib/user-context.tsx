"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

import type { UserInfo } from "@/types/auth";

interface UserContextType {
    user: UserInfo | null;
    setUser: (user: UserInfo | null) => void;
    updateUser: (updates: Partial<UserInfo>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null);

    const updateUser = useCallback((updates: Partial<UserInfo>) => {
        setUser((prevUser) => {
            if (!prevUser) return null;
            return { ...prevUser, ...updates };
        });
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, updateUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within UserProvider");
    }
    return context;
}
