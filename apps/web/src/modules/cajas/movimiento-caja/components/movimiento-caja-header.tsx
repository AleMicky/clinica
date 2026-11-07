"use client";

import Link from "next/link";
import {
  Plus,
  ArrowLeftRight,
  RefreshCw,
  FileSpreadsheet,
  ShieldCheck,
  UserCheck,
  Store,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

interface MovimientoCajaHeaderProps {
  readonly onNewMovimientoClick: () => void;
  readonly onRefresh: () => void;
  readonly isRefreshing?: boolean;
  readonly empleadoNombre?: string | null;
  readonly turnoActivoLabel?: string | null;
  readonly esAdmin?: boolean;
  readonly verTodoAdmin?: boolean;
  readonly onToggleVerTodo?: () => void;
  readonly disableNewMovimiento?: boolean;
}

export function MovimientoCajaHeader({
  onNewMovimientoClick,
  onRefresh,
  isRefreshing = false,
  empleadoNombre,
  turnoActivoLabel,
  esAdmin = false,
  verTodoAdmin = false,
  onToggleVerTodo,
  disableNewMovimiento = false,
}: Readonly<MovimientoCajaHeaderProps>) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
          <ArrowLeftRight className="h-4 w-4" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              Movimientos de Caja
            </h1>
            {empleadoNombre && (
              <Badge
                variant="secondary"
                className="text-[11px] font-semibold gap-1 px-2 py-0.5 bg-primary/10 text-primary border border-primary/20"
              >
                <UserCheck className="h-3 w-3" />
                <span>{empleadoNombre}</span>
              </Badge>
            )}
            {turnoActivoLabel && (
              <Badge
                variant="outline"
                className="text-[10px] font-semibold gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25"
              >
                <Store className="h-3 w-3" />
                <span>{turnoActivoLabel}</span>
              </Badge>
            )}
            {esAdmin && (
              <Badge
                variant="outline"
                className="text-[10px] font-semibold gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25"
              >
                <ShieldCheck className="h-3 w-3" />
                <span>
                  {verTodoAdmin ? "Modo Administrador (Todos)" : "Mis Movimientos"}
                </span>
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {verTodoAdmin
              ? "Supervisión general de ingresos, egresos, retiros y ajustes de todas las cajas (Bs.)."
              : "Control de ingresos, egresos y retiros correspondientes a su sesión y turno de caja (Bs.)."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {esAdmin && onToggleVerTodo && (
          <Button
            type="button"
            variant={verTodoAdmin ? "default" : "outline"}
            size="sm"
            onClick={onToggleVerTodo}
            className="h-9 gap-1.5 text-xs px-3 shadow-2xs cursor-pointer"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{verTodoAdmin ? "Ver Mi Sesión" : "Ver Todo (Admin)"}</span>
          </Button>
        )}



        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-9 gap-1.5 text-xs px-3 shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </Button>

        <Button
          onClick={onNewMovimientoClick}
          size="sm"
          disabled={disableNewMovimiento}
          className="h-9 gap-1.5 text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Movimiento</span>
        </Button>
      </div>
    </div>
  );
}
