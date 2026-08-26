"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { toast } from "sonner";
import * as signalR from "@microsoft/signalr";

import {
    type Notification,
    NotificationType,
} from "@/modules/notification/types/notification";
import {
    getNotifications,
    getUnreadCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "@/modules/notification/api/notification.api";
import { createNotificationConnection } from "@/lib/signalr/notification-connection";
import { playNotificationSound } from "@/lib/sound/notification-sound";
import { useAuth } from "./auth-provider";

interface NotificationContextValue {
    notifications: Notification[];
    unreadCount: number;
    connected: boolean;
    markAsRead: (notificationOrId: Notification | number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
    undefined,
);

interface NotificationProviderProps {
    children: ReactNode;
    token?: string | null;
}

function showNotificationToast(notification: Notification) {
    const description = notification.mensaje;
    const toastOptions = {
        description,
        duration: 5000,
        action: notification.url
            ? {
                  label: "Ver",
                  onClick: () => {
                      if (typeof window !== "undefined") {
                          window.location.href = notification.url!;
                      }
                  },
              }
            : undefined,
    };

    switch (Number(notification.tipo)) {
        case NotificationType.Exito:
            toast.success(notification.titulo, toastOptions);
            break;
        case NotificationType.Advertencia:
            toast.warning(notification.titulo, toastOptions);
            break;
        case NotificationType.Error:
            toast.error(notification.titulo, toastOptions);
            break;
        case NotificationType.Informacion:
        default:
            toast.info(notification.titulo, toastOptions);
            break;
    }
}

export function NotificationProvider({
    children,
    token: propToken,
}: NotificationProviderProps) {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [connected, setConnected] = useState(false);
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    // Resolve JWT token
    const token = useMemo(() => {
        if (propToken) return propToken;
        if (!isAuthenticated) return null;
        if (typeof window !== "undefined") {
            return localStorage.getItem("auth_token");
        }
        return null;
    }, [propToken, isAuthenticated]);

    const refresh = useCallback(async () => {
        if (!isAuthenticated) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        try {
            const [data, count] = await Promise.all([
                getNotifications(30),
                getUnreadCount(),
            ]);

            setNotifications(data);
            setUnreadCount(count);
        } catch (error) {
            console.error("Error al obtener notificaciones:", error);
        }
    }, [isAuthenticated]);

    // Initial fetch when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            void refresh();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [isAuthenticated, refresh]);

    // SignalR Connection lifecycle
    useEffect(() => {
        if (!token || !isAuthenticated) {
            if (connectionRef.current) {
                void connectionRef.current.stop();
                connectionRef.current = null;
                setConnected(false);
            }
            return;
        }

        const connection = createNotificationConnection(token);
        connectionRef.current = connection;

        connection.on("NotificacionRecibida", (notification: Notification) => {
            setNotifications((current) => {
                const exists = current.some((x) => x.id === notification.id);
                if (exists) return current;
                return [notification, ...current];
            });

            if (!notification.leida) {
                setUnreadCount((current) => current + 1);
            }

            playNotificationSound();
            showNotificationToast(notification);
        });

        connection.on("NotificacionLeida", (id: number) => {
            setNotifications((current) =>
                current.map((notification) =>
                    notification.id === id
                        ? {
                              ...notification,
                              leida: true,
                              fechaLectura: new Date().toISOString(),
                          }
                        : notification,
                ),
            );

            setUnreadCount((current) => Math.max(0, current - 1));
        });

        connection.on("TodasNotificacionesLeidas", () => {
            setNotifications((current) =>
                current.map((notification) => ({
                    ...notification,
                    leida: true,
                    fechaLectura:
                        notification.fechaLectura ?? new Date().toISOString(),
                })),
            );

            setUnreadCount(0);
        });

        connection.onreconnecting(() => {
            setConnected(false);
        });

        connection.onreconnected(() => {
            setConnected(true);
            void refresh();
        });

        connection.onclose(() => {
            setConnected(false);
        });

        const start = async () => {
            try {
                await connection.start();
                setConnected(true);
            } catch (error) {
                console.warn("SignalR no se pudo conectar:", error);
                setConnected(false);
            }
        };

        void start();

        return () => {
            connection.off("NotificacionRecibida");
            connection.off("NotificacionLeida");
            connection.off("TodasNotificacionesLeidas");
            void connection.stop();
            connectionRef.current = null;
            setConnected(false);
        };
    }, [token, isAuthenticated, refresh]);

    const markAsRead = useCallback(
        async (notificationOrId: Notification | number) => {
            const id =
                typeof notificationOrId === "number"
                    ? notificationOrId
                    : notificationOrId.id;

            const existing = notifications.find((n) => n.id === id);
            if (existing && existing.leida) return;

            // Optimistic update
            setNotifications((current) =>
                current.map((item) =>
                    item.id === id
                        ? {
                              ...item,
                              leida: true,
                              fechaLectura: new Date().toISOString(),
                          }
                        : item,
                ),
            );
            setUnreadCount((current) => Math.max(0, current - 1));

            try {
                await markNotificationAsRead(id);
            } catch (error) {
                console.error("Error al marcar notificación como leída:", error);
                void refresh();
            }
        },
        [notifications, refresh],
    );

    const markAllAsRead = useCallback(async () => {
        if (unreadCount === 0) return;

        // Optimistic update
        setNotifications((current) =>
            current.map((item) => ({
                ...item,
                leida: true,
                fechaLectura: item.fechaLectura ?? new Date().toISOString(),
            })),
        );
        setUnreadCount(0);

        try {
            await markAllNotificationsAsRead();
        } catch (error) {
            console.error(
                "Error al marcar todas las notificaciones como leídas:",
                error,
            );
            void refresh();
        }
    }, [unreadCount, refresh]);

    const value = useMemo<NotificationContextValue>(
        () => ({
            notifications,
            unreadCount,
            connected,
            markAsRead,
            markAllAsRead,
            refresh,
        }),
        [
            notifications,
            unreadCount,
            connected,
            markAsRead,
            markAllAsRead,
            refresh,
        ],
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications(): NotificationContextValue {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error(
            "useNotifications debe utilizarse dentro de NotificationProvider",
        );
    }

    return context;
}