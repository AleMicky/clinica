"use client";

import type { ReactNode } from "react";

import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./auth-provider";
import { NotificationProvider } from "./notification-provider";
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
                    <NotificationProvider>
                        {children}
                        <Toaster />
                    </NotificationProvider>
                </AuthProvider>
            </ThemeProvider>
        </QueryProvider>
    );
}