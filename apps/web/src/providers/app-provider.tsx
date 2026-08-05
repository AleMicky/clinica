"use client";

import type { ReactNode } from "react";

import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "./auth-provider";

type AppProviderProps = {
    children: ReactNode;
};

export function AppProvider({
    children,
}: AppProviderProps) {
    return (
        <QueryProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </QueryProvider>
    );
}