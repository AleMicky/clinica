"use client";

import * as React from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  User,
  HeartPulse,
  Info,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "cita" | "paciente" | "laboratorio" | "sistema";
}

const initialNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Nueva Cita Agendada",
    description: "Dr. Carlos Rodríguez tiene consulta programada a las 10:30 AM",
    time: "hace 5 min",
    read: false,
    type: "cita",
  },
  {
    id: "2",
    title: "Resultado de Laboratorio",
    description: "Exámenes de hemograma completos para Juan Pérez",
    time: "hace 30 min",
    read: false,
    type: "laboratorio",
  },
  {
    id: "3",
    title: "Expediente Actualizado",
    description: "Se ingresaron nuevos antecedentes médicos a María López",
    time: "hace 2 horas",
    read: false,
    type: "paciente",
  },
  {
    id: "4",
    title: "Mantenimiento del Sistema",
    description: "Respaldo automático de base de datos completado con éxito",
    time: "hace 1 día",
    read: true,
    type: "sistema",
  },
];

export function NotificationsPopover() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(
    initialNotifications
  );
  const [filter, setFilter] = React.useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const markAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications([]);
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "cita":
        return <Calendar className="h-4 w-4 text-blue-500 shrink-0" />;
      case "paciente":
        return <User className="h-4 w-4 text-emerald-500 shrink-0" />;
      case "laboratorio":
        return <HeartPulse className="h-4 w-4 text-purple-500 shrink-0" />;
      case "sistema":
        return <Info className="h-4 w-4 text-amber-500 shrink-0" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500 shrink-0" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            )}
            <span className="sr-only">Notificaciones</span>
          </Button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 overflow-hidden shadow-lg border border-border"
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              Notificaciones
            </h2>
            {unreadCount > 0 && (
              <Badge variant="default" className="h-5 px-1.5 text-[10px] font-bold">
                {unreadCount} nuevas
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Leídas
            </button>
          )}
        </div>

        {/* Filtros rápidos */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-muted/10 border-b border-border text-xs">
          <div className="flex gap-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                filter === "all"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                filter === "unread"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sin leer ({unreadCount})
            </button>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-muted-foreground hover:text-destructive text-xs px-1 py-0.5 rounded transition-colors"
              title="Limpiar todas"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Lista de notificaciones */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
          {filteredNotifications.length === 0 ? (
            <div className="py-8 text-center px-4">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium text-foreground">
                Sin notificaciones
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {filter === "unread"
                  ? "No tienes notificaciones pendientes por leer"
                  : "Tu bandeja de entrada está limpia"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex gap-3 p-3 transition-colors text-left hover:bg-muted/40 relative group ${
                  !notification.read ? "bg-primary/5" : ""
                }`}
              >
                <div className="mt-0.5">{getIcon(notification.type)}</div>
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p
                      className={`text-xs font-semibold truncate ${
                        !notification.read
                          ? "text-foreground font-bold"
                          : "text-foreground/80"
                      }`}
                    >
                      {notification.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {notification.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {notification.description}
                  </p>
                </div>

                {/* Acciones de item */}
                <div className="absolute right-2 top-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.read && (
                    <button
                      onClick={(e) => markAsRead(notification.id, e)}
                      className="p-1 rounded-md hover:bg-background text-muted-foreground hover:text-primary transition-colors"
                      title="Marcar como leída"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => removeNotification(notification.id, e)}
                    className="p-1 rounded-md hover:bg-background text-muted-foreground hover:text-destructive transition-colors"
                    title="Eliminar"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {!notification.read && (
                  <span className="absolute left-1.5 top-3.5 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
