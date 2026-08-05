import axios from "axios";

export type ProblemDetails = {
    type?: string;
    title?: string;
    status?: number;
    detail?: string;
    instance?: string;
    message?: string;
    errors?: Record<string, string[]>;
};

export function getApiErrorMessage(
    error: unknown,
): string {
    if (axios.isAxiosError<ProblemDetails>(error)) {
        const data = error.response?.data;

        if (data?.detail) {
            return data.detail;
        }

        if (data?.message) {
            return data.message;
        }

        if (data?.errors) {
            const firstError = Object.values(
                data.errors,
            ).flat()[0];

            if (firstError) {
                return firstError;
            }
        }

        if (data?.title) {
            return data.title;
        }

        if (error.response?.status === 401) {
            return "El usuario o la contraseña son incorrectos.";
        }

        if (error.response?.status === 403) {
            return "No tienes autorización para ingresar.";
        }

        if (error.response?.status === 429) {
            return "Demasiados intentos. Intenta nuevamente más tarde.";
        }

        if (error.response?.status === 500) {
            return "Ocurrió un error interno en el servidor.";
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Ocurrió un error inesperado.";
}