"use client";

import { useRouter } from "next/navigation";
import { LoaderCircle, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLogout } from "../hooks/use-logout";

export function LogoutButton() {
    const router = useRouter();
    const logoutMutation = useLogout();

    async function handleLogout(): Promise<void> {
        try {
            await logoutMutation.mutateAsync();
        } finally {
            window.location.href = "/login";
        }
    }

    return (
        <Button
            type="button"
            variant="ghost"
            disabled={logoutMutation.isPending}
            onClick={handleLogout}
        >
            {logoutMutation.isPending ? (
                <LoaderCircle className="animate-spin" />
            ) : (
                <LogOut />
            )}

            Cerrar sesión
        </Button>
    );
}