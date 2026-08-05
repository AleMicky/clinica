"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logout } from "../api/auth.api";
import { authKeys } from "../api/auth.keys";

export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logout,

        onSettled: () => {
            if (typeof window !== "undefined") {
                localStorage.removeItem("auth_token");
            }

            queryClient.setQueryData(authKeys.me(), null);

            queryClient.removeQueries({
                queryKey: authKeys.all,
            });

            queryClient.clear();
        },
    });
}