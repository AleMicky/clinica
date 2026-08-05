import axios, {
    AxiosError,
    type AxiosInstance,
    type AxiosResponse,
} from "axios";

import { env } from "@/lib/env";

export type ApiErrorResponse = {
    title?: string;
    detail?: string;
    message?: string;
    status?: number;
    errors?: Record<string, string[]>;
};

export const apiClient: AxiosInstance = axios.create({
    baseURL: env.apiUrl,

    timeout: 15_000,

    withCredentials: true,

    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,

    async (error: AxiosError<ApiErrorResponse>) => {
        if (!error.response) {
            return Promise.reject(
                new Error(
                    "No se pudo conectar con el servidor. Verifica tu conexión.",
                ),
            );
        }

        const status = error.response.status;

        const requestUrl = error.config?.url ?? "";

        const isAuthRequest =
            requestUrl.includes("/auth/login") ||
            requestUrl.includes("/auth/me") ||
            requestUrl.includes("/auth/logout");

        switch (status) {
            case 401:
                console.warn("La sesión no es válida o ha expirado.");

                // No redireccionar si el error proviene del propio módulo Auth
                if (!isAuthRequest && typeof window !== "undefined") {
                    window.location.replace("/login");
                }

                break;

            case 403:
                console.warn("No tienes permisos para realizar esta acción.");
                break;

            case 404:
                console.warn("El recurso solicitado no existe.");
                break;

            default:
                if (status >= 500) {
                    console.error("Ocurrió un error interno en el servidor.");
                }

                break;
        }

        return Promise.reject(error);
    },
);