"use client";

import { useQuery } from "@tanstack/react-query";

import { getMe } from "../api/auth.api";
import { authKeys } from "../api/auth.keys";

export function useMe() {
    return useQuery({
        queryKey: authKeys.me(),
        queryFn: getMe,

        retry: false,

        staleTime: 5 * 60 * 1000,

        refetchOnWindowFocus: false,
    });
}