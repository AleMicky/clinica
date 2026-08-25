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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
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
        return <Calendar className="h-3.5 w-3.5 text-blue-500" />;
      case "paciente":
        return <User className="h-3.5 w-3.5 text-emerald-500" />;
      case "laboratorio":
        return <HeartPulse className="h-3.5 w-3.5 text-rose-500" />;
      case "sistema":
      default:
        return <Info className="h-3.5 w-3.5 text-amber-500" />;
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
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
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
            className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all ${
              filter === "all"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all ${
              filter === "unread"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sin leer ({unreadCount})
          </button>
        </div>

        {/* LISTA DE NOTIFICACIONES */}
        <div className="max-h-72 overflow-y-auto divide-y divide-border/30">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <Bell className="h-8 w-8 text-muted-foreground/30" />
              <p>No tienes notificaciones en este momento</p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 text-xs flex gap-3 transition-colors hover:bg-muted/40 relative group ${
                  !n.read ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background border border-border/50 shadow-xs">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className={`font-semibold truncate ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed">
                    {n.description}
                  </p>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="absolute right-2 top-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.read && (
                    <button
                      onClick={(e) => markAsRead(n.id, e)}
                      title="Marcar como leída"
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => removeNotification(n.id, e)}
                    title="Eliminar"
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER POPOVER */}
        {notifications.length > 0 && (
          <div className="p-2 border-t border-border/50 bg-muted/20 text-center">
            <button
              onClick={clearAll}
              className="text-[11px] text-muted-foreground hover:text-destructive flex items-center justify-center gap-1 mx-auto transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              <span>Limpiar todas las notificaciones</span>
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
