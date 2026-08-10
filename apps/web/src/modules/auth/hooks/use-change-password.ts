"use client";

import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../api/auth.api";
import type { ChangePasswordRequest } from "../types/auth.types";

export function useChangePassword() {
    return useMutation({
        mutationFn: (request: ChangePasswordRequest) => changePassword(request),
    });
}
