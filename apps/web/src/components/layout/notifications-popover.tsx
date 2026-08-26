"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  User,
  HeartPulse,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Wifi,
  WifiOff,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/providers/notification-provider";
import { playNotificationSound } from "@/lib/sound/notification-sound";
import {
  type Notification,
  NotificationType,
} from "@/modules/notification/types/notification";

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "hace un momento";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours} h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `hace ${diffInDays} d`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

export function NotificationsPopover() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [filter, setFilter] = React.useState<"all" | "unread">("all");

  const filteredNotifications = React.useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.leida);
    }
    return notifications;
  }, [notifications, filter]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.leida) {
      void markAsRead(notification);
    }
    if (notification.url) {
      router.push(notification.url);
    }
  };

  const getIcon = (notification: Notification) => {
    const modulo = notification.modulo?.toLowerCase() ?? "";

    if (modulo.includes("cita") || modulo.includes("admision")) {
      return <Calendar className="h-3.5 w-3.5 text-blue-500" />;
    }
    if (modulo.includes("paciente") || modulo.includes("persona")) {
      return <User className="h-3.5 w-3.5 text-emerald-500" />;
    }
    if (modulo.includes("servicio") || modulo.includes("medico")) {
      return <HeartPulse className="h-3.5 w-3.5 text-indigo-500" />;
    }

    switch (Number(notification.tipo)) {
      case NotificationType.Exito:
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
      case NotificationType.Advertencia:
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
      case NotificationType.Error:
        return <AlertCircle className="h-3.5 w-3.5 text-rose-500" />;
      case NotificationType.Informacion:
      default:
        return <Info className="h-3.5 w-3.5 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            )}
            <span className="sr-only">Notificaciones</span>
          </Button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 shadow-lg border border-border/60 rounded-xl overflow-hidden"
      >
        {/* CABECERA */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Notificaciones</span>
            {unreadCount > 0 && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 font-bold rounded-full">
                {unreadCount}
              </Badge>
            )}
            <span
              title={connected ? "En tiempo real conectado" : "Desconectado"}
              className="inline-flex items-center"
            >
              {connected ? (
                <Wifi className="h-3 w-3 text-emerald-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-muted-foreground/50" />
              )}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                void playNotificationSound();
              }}
              title="Probar sonido de notificación"
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            >
              <Volume2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                void markAllAsRead();
              }}
              className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="h-3 w-3" />
              <span>Marcar todas leídas</span>
            </button>
          )}
        </div>

        {/* FILTROS (TODAS / SIN LEER) */}
        <div className="flex items-center gap-1 p-1 bg-muted/20 border-b border-border/40 text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all cursor-pointer ${
              filter === "all"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all cursor-pointer ${
              filter === "unread"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sin leer ({unreadCount})
          </button>
        </div>

        {/* LISTA DE NOTIFICACIONES */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/30">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <Bell className="h-8 w-8 text-muted-foreground/30" />
              <p>
                {filter === "unread"
                  ? "No tienes notificaciones pendientes"
                  : "No tienes notificaciones en este momento"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3 text-xs flex gap-3 transition-colors hover:bg-muted/50 relative group cursor-pointer ${
                  !n.leida ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background border border-border/50 shadow-xs mt-0.5">
                  {getIcon(n)}
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p
                      className={`font-semibold truncate ${
                        !n.leida ? "text-foreground font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {n.titulo}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatRelativeTime(n.fechaCreacion)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed">
                    {n.mensaje}
                  </p>
                </div>

                {/* BOTÓN MARCAR COMO LEÍDA */}
                {!n.leida && (
                  <div className="absolute right-2 top-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void markAsRead(n);
                      }}
                      title="Marcar como leída"
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
