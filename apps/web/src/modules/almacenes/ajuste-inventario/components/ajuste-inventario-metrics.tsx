"use client";

import {
  Clock,
  CheckCircle2,
  Ban,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EstadoAjusteInventario,
  TipoAjusteInventario,
  type AjusteInventarioResponse,
} from "../types/ajuste-inventario.types";

interface AjusteInventarioMetricsProps {
  ajustes: AjusteInventarioResponse[];
  totalItems?: number;
  isLoading?: boolean;
}

export function AjusteInventarioMetrics({
  ajustes,
  totalItems = 0,
  isLoading = false,
}: AjusteInventarioMetricsProps) {
  const borradores = ajustes.filter(
    (a) => a.estado === EstadoAjusteInventario.Borrador
  ).length;
  const confirmados = ajustes.filter(
    (a) => a.estado === EstadoAjusteInventario.Confirmado
  ).length;
  const positivos = ajustes.filter(
    (a) => a.tipo === TipoAjusteInventario.Positivo
  ).length;
  const negativos = ajustes.filter(
    (a) => a.tipo === TipoAjusteInventario.Negativo
  ).length;
  const anulados = ajustes.filter(
    (a) => a.estado === EstadoAjusteInventario.Anulado
  ).length;

  const metrics = [
    {
      title: "Total Ajustes",
      value: totalItems,
      icon: SlidersHorizontal,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      title: "Positivos (+ Stock)",
      value: positivos,
      icon: ArrowDownLeft,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Negativos (- Stock)",
      value: negativos,
      icon: ArrowUpRight,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Borradores",
      value: borradores,
      icon: Clock,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "Confirmados",
      value: confirmados,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Anulados",
      value: anulados,
      icon: Ban,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
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
