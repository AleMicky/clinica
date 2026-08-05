"use client";

import type { ReactNode } from "react";

import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "./auth-provider";
import { ThemeProvider } from "./theme-provider";

type AppProviderProps = {
    children: ReactNode;
};

export function AppProvider({
    children,
}: AppProviderProps) {
    return (
        <QueryProvider>
            <ThemeProvider defaultTheme="system" storageKey="clinica-theme">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </ThemeProvider>
        </QueryProvider>
    );
}