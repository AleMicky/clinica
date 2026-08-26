import * as signalR from "@microsoft/signalr";
import { env } from "@/lib/env";

export function createNotificationConnection(token: string) {
    const hubBaseUrl = env.apiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
    const hubUrl = `${hubBaseUrl}/hubs/notificaciones`;

    return new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
            accessTokenFactory: () => token,
        })
        .withAutomaticReconnect([
            0,
            2000,
            5000,
            10000,
            30000,
        ])
        .configureLogging(
            process.env.NODE_ENV === "development"
                ? signalR.LogLevel.Information
                : signalR.LogLevel.Warning,
        )
        .build();
}