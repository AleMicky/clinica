import { apiClient } from "@/lib/api-client";

import type {
    ChangePasswordRequest,
    ChangePasswordResponse,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    MeResponse,
} from "../types/auth.types";

export async function login(
    request: LoginRequest,
): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
        "/auth/login",
        request,
    );

    return response.data;
}

export async function getMe(): Promise<MeResponse | null> {
    if (typeof window !== "undefined" && !localStorage.getItem("auth_token")) {
        return null;
    }

    try {
        const response = await apiClient.get<MeResponse>("/auth/me");
        return response.data;
    } catch (error) {
        if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
        }
        return null;
    }
}

export async function logout(): Promise<LogoutResponse> {
    const response = await apiClient.post<LogoutResponse>(
        "/auth/logout",
    );

    return response.data;
}

export async function changePassword(
    request: ChangePasswordRequest,
): Promise<ChangePasswordResponse> {
    const response =
        await apiClient.post<ChangePasswordResponse>(
            "/auth/change-password",
            request,
        );

    return response.data;
}