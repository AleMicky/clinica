"use client";

import {
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EstadoMovimientoInventario,
  type MovimientoInventarioResponse,
} from "../types/movimiento-inventario.types";

interface MovimientoInventarioMetricsProps {
  movimientos: MovimientoInventarioResponse[];
  totalItems?: number;
  isLoading?: boolean;
}

export function MovimientoInventarioMetrics({
  movimientos,
  totalItems = 0,
  isLoading = false,
}: MovimientoInventarioMetricsProps) {
  const borradoresCount = movimientos.filter(
    (m) => m.estado === EstadoMovimientoInventario.Borrador
  ).length;

  const confirmadosCount = movimientos.filter(
    (m) => m.estado === EstadoMovimientoInventario.Confirmado
  ).length;

  const anuladosCount = movimientos.filter(
    (m) => m.estado === EstadoMovimientoInventario.Anulado
  ).length;

  const metrics = [
    {
      title: "Total Comprobantes",
      value: totalItems,
      icon: ArrowLeftRight,
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/20",
    },
    {
      title: "Borradores",
      value: borradoresCount,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Confirmados",
      value: confirmadosCount,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Anulados",
      value: anuladosCount,
      icon: XCircle,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10 border-rose-500/20",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border/60 rounded-lg p-2.5 flex items-center justify-between shadow-2xs"
          >
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-10" />
            </div>
            <Skeleton className="size-7 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {metrics.map((metric, i) => {
        const Icon = metric.icon;
        return (
          <div
            key={i}
            className="bg-card border border-border/60 rounded-lg p-2.5 flex items-center justify-between shadow-2xs transition-all hover:border-border/80"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {metric.title}
              </span>
              <span className="text-lg font-bold tracking-tight text-foreground font-mono">
                {metric.value}
              </span>
            </div>
            <div
              className={`size-7 rounded-md border flex items-center justify-center ${metric.bgColor} ${metric.color} shrink-0`}
            >
              <Icon className="size-3.5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
