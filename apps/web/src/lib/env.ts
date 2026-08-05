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

export const env: Environment = {
    apiUrl: getRequiredEnv(
        process.env.NEXT_PUBLIC_API_URL,
        "NEXT_PUBLIC_API_URL",
    ),

    appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Clínica",

    appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0",
};