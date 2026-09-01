"use client";

import {
  Clock,
  CheckCircle2,
  Ban,
  Utensils,
  Building2,
  Package,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EstadoConsumoInterno,
  type ConsumoInternoResponse,
} from "../types/consumo-interno.types";

interface ConsumoInternoMetricsProps {
  consumos: ConsumoInternoResponse[];
  totalItems?: number;
  isLoading?: boolean;
}

export function ConsumoInternoMetrics({
  consumos,
  totalItems = 0,
  isLoading = false,
}: ConsumoInternoMetricsProps) {
  const borradores = consumos.filter(
    (c) => c.estado === EstadoConsumoInterno.Borrador
  ).length;
  const confirmados = consumos.filter(
    (c) => c.estado === EstadoConsumoInterno.Confirmado
  ).length;
  const anulados = consumos.filter(
    (c) => c.estado === EstadoConsumoInterno.Anulado
  ).length;

  const uniqueAreas = new Set(consumos.map((c) => c.areaId)).size;
  const totalUnidades = consumos.reduce(
    (acc, c) =>
      acc +
      (c.detalles || []).reduce((dAcc, d) => dAcc + (Number(d.cantidad) || 0), 0),
    0
  );

  const metrics = [
    {
      title: "Total Vales",
      value: totalItems,
      icon: Utensils,
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/20",
    },
    {
      title: "Áreas Beneficiarias",
      value: uniqueAreas,
      icon: Building2,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      title: "Unidades Despachadas",
      value: totalUnidades,
      icon: Package,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
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
                {item.value.toLocaleString("es-ES")}
              </span>
              <span className="text-[10px] text-muted-foreground">reg.</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
