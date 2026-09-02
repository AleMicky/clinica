"use client";

import {
  Clock,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  CheckCheck,
  Ban,
  CalendarX,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EstadoCotizacionCompra,
  type CotizacionCompraResponse,
} from "../types/cotizacion-compra.types";

interface CotizacionCompraMetricsProps {
  cotizaciones: CotizacionCompraResponse[];
  totalItems?: number;
  isLoading?: boolean;
}

export function CotizacionCompraMetrics({
  cotizaciones,
  totalItems = 0,
  isLoading = false,
}: CotizacionCompraMetricsProps) {
  const borradores = cotizaciones.filter(
    (c) => c.estado === EstadoCotizacionCompra.Borrador
  ).length;
  const recibidas = cotizaciones.filter(
    (c) => c.estado === EstadoCotizacionCompra.Recibida
  ).length;
  const seleccionadas = cotizaciones.filter(
    (c) => c.estado === EstadoCotizacionCompra.Seleccionada
  ).length;
  const rechazadas = cotizaciones.filter(
    (c) => c.estado === EstadoCotizacionCompra.Rechazada
  ).length;
  const vencidas = cotizaciones.filter(
    (c) => c.estado === EstadoCotizacionCompra.Vencida
  ).length;
  const canceladas = cotizaciones.filter(
    (c) => c.estado === EstadoCotizacionCompra.Cancelada
  ).length;

  const metrics = [
    {
      title: "Total Cotizaciones",
      value: totalItems,
      icon: FileSpreadsheet,
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/20",
    },
    {
      title: "Borradores",
      value: borradores,
      icon: Clock,
      color: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-500/10",
      border: "border-slate-500/20",
    },
    {
      title: "Recibidas",
      value: recibidas,
      icon: CheckCircle2,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "Seleccionadas (Ganadoras)",
      value: seleccionadas,
      icon: CheckCheck,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Rechazadas",
      value: rechazadas,
      icon: XCircle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
    {
      title: "Vencidas / Canceladas",
      value: vencidas + canceladas,
      icon: Ban,
      color: "text-zinc-600 dark:text-zinc-400",
      bg: "bg-zinc-500/10",
      border: "border-zinc-500/20",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg border border-border/50 bg-card flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="size-5 rounded-md" />
            </div>
            <Skeleton className="h-5 w-10" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
      {metrics.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-2.5 rounded-lg border border-border/60 bg-card flex flex-col justify-between hover:border-border transition-colors shadow-2xs"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium leading-none truncate pr-1">
                {item.title}
              </span>
              <div
                className={`size-5 rounded-md flex items-center justify-center shrink-0 ${item.bg} ${item.border} ${item.color}`}
              >
                <Icon className="size-3" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-bold text-foreground font-mono">
                {item.value}
              </span>
              <span className="text-[10px] text-muted-foreground">reg.</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
