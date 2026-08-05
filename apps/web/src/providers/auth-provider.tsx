"use client";

import {
    createContext,
    useContext,
    type ReactNode,
} from "react";

import { useMe } from "@/modules/auth/hooks/use-me";
import type { AuthUser } from "@/modules/auth/types/auth.types";

type AuthContextValue = {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isError: boolean;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
};

const AuthContext =
    createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const {
        data: user,
        isLoading,
        isError,
    } = useMe();

    function hasRole(role: string): boolean {
        return (
            user?.roles.some(
                (currentRole) =>
                    currentRole.toLowerCase() ===
                    role.toLowerCase(),
            ) ?? false
        );
    }

    function hasAnyRole(roles: string[]): boolean {
        return roles.some(hasRole);
    }



    const value: AuthContextValue = {
        user: user ?? null,
        isAuthenticated: Boolean(user),
        isLoading,
        isError,
        hasRole,
        hasAnyRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth debe utilizarse dentro de AuthProvider.",
        );
    }

    return context;
}