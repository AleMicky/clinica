"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";

type AuthGuardProps = {
    children: ReactNode;
};

export function AuthGuard({
    children,
}: AuthGuardProps) {
    const router = useRouter();

    const {
        isAuthenticated,
        isLoading,
    } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [
        isAuthenticated,
        isLoading,
        router,
    ]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <LoaderCircle className="size-8 animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return children;
}