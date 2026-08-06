"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getMe, login } from "../api/auth.api";
import { authKeys } from "../api/auth.keys";

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: login,

        meta: { skipGlobalError: true } as Record<string, unknown>,

        onSuccess: async (data) => {
            if (typeof window !== "undefined" && data.accessToken) {
                localStorage.setItem("auth_token", data.accessToken);
            }

            try {
                const user = await getMe();
                queryClient.setQueryData(authKeys.me(), user);
            } catch (error) {
                console.error("Error al obtener perfil del usuario:", error);
            }
        },
    });
}