type Environment = {
    apiUrl: string;
    appName: string;
    appVersion: string;
};

function getRequiredEnv(
    value: string | undefined,
    variableName: string,
): string {
    if (!value) {
        throw new Error(
            `La variable de entorno "${variableName}" no está configurada.`,
        );
    }

    return value;
}

function getApiUrl(): string {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL;

    if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;

        if (!rawUrl || rawUrl.includes("localhost") || rawUrl.includes("127.0.0.1")) {
            return `${protocol}//${hostname}:5011/api/v1`;
        }
    }

    const baseUrl = rawUrl || "http://localhost:5011/api/v1";

    // Asegurar que siempre termine con /api/v1
    if (!baseUrl.endsWith("/api/v1")) {
        return `${baseUrl.replace(/\/+$/, "")}/api/v1`;
    }

    return baseUrl;
}

export const env: Environment = {
    apiUrl: getApiUrl(),

    appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Clínica",

    appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0",
};