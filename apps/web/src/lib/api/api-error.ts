import axios from "axios";

export type ProblemDetails = {
    type?: string;
    title?: string;
    status?: number;
    detail?: string;
    instance?: string;
    message?: string;
    error?: string | Record<string, unknown>;
    errors?: Record<string, string[] | string> | Array<{ field?: string; message?: string } | string>;
    [key: string]: unknown;
};

export type ApiErrorInfo = {
    title?: string;
    status?: number;
    detail?: string;
    message?: string;
    errors?: Record<string, string[]>;
};

function extractDetailedError(data: any): string | null {
    if (!data) return null;

    // 1. Array or Dictionary format for 'errors' (FluentValidation / ASP.NET / RequestValidator)
    if (data.errors) {
        if (Array.isArray(data.errors)) {
            const msgs = data.errors
                .map((e: any) => (typeof e === "string" ? e : e?.message || e?.detail || JSON.stringify(e)))
                .filter(Boolean);
            if (msgs.length > 0) return msgs.join("\n");
        } else if (typeof data.errors === "object") {
            const errorEntries = Object.entries(data.errors);
            const messages: string[] = [];
            for (const [field, err] of errorEntries) {
                if (Array.isArray(err)) {
                    messages.push(...err.map((m) => (field ? `${field}: ${m}` : m)));
                } else if (typeof err === "string" && err.trim()) {
                    messages.push(field ? `${field}: ${err}` : err);
                }
            }
            if (messages.length > 0) return messages.join("\n");
        }
    }

    // 2. Direct string fields
    if (typeof data.detail === "string" && data.detail.trim()) {
        return data.detail;
    }

    if (typeof data.message === "string" && data.message.trim()) {
        return data.message;
    }

    if (typeof data.error === "string" && data.error.trim()) {
        return data.error;
    }

    // 3. Nested error object
    if (data.error && typeof data.error === "object") {
        const nestedMsg = extractDetailedError(data.error);
        if (nestedMsg) return nestedMsg;
    }

    return null;
}

export function getApiErrorInfo(error: unknown): ApiErrorInfo {
    if (axios.isAxiosError<ProblemDetails>(error)) {
        const data = error.response?.data;
        const status = error.response?.status;
        const detailMsg = extractDetailedError(data);

        const title = data?.title || (status === 400 ? "Error de Validación" : "Error");

        return {
            title,
            status,
            detail: detailMsg || getApiErrorMessage(error),
            message: typeof data?.message === "string" ? data.message : undefined,
        };
    }

    if (error instanceof Error) {
        return { detail: error.message };
    }

    return { detail: "Ocurrió un error inesperado." };
}

export function getApiErrorMessage(
    error: unknown,
): string {
    if (axios.isAxiosError<ProblemDetails>(error)) {
        const data = error.response?.data;
        const detailMsg = extractDetailedError(data);

        if (detailMsg) {
            return detailMsg;
        }

        if (typeof data?.title === "string" && data.title.trim()) {
            return data.title;
        }

        if (error.response?.status === 400) {
            return "Los datos enviados no son válidos. Por favor revise el formulario.";
        }

        if (error.response?.status === 401) {
            return "El usuario o la contraseña son incorrectos.";
        }

        if (error.response?.status === 403) {
            return "No tienes autorización para ingresar o realizar esta acción.";
        }

        if (error.response?.status === 404) {
            return "El recurso solicitado no fue encontrado.";
        }

        if (error.response?.status === 409) {
            return "Ya existe un registro con los mismos datos o se encuentra en conflicto.";
        }

        if (error.response?.status === 429) {
            return "Demasiados intentos. Intenta nuevamente más tarde.";
        }

        if (error.response?.status && error.response.status >= 500) {
            return "Ocurrió un error interno en el servidor.";
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Ocurrió un error inesperado.";
}