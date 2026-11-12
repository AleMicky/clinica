import { apiClient } from "@/lib/api/api-client";
import type { Notification, UnreadCountResponse } from "../types/notification";

export async function getNotifications(cantidad: number = 20): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>("/notificaciones", {
        params: { cantidad },
    });
    return response.data;
}

export async function getUnreadCount(): Promise<number> {
    const response = await apiClient.get<UnreadCountResponse>("/notificaciones/contador");
    return response.data.cantidad;
}

export async function markNotificationAsRead(id: number): Promise<void> {
    await apiClient.patch(`/notificaciones/${id}/leer`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
    await apiClient.patch("/notificaciones/leer-todas");
}
