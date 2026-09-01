"use client";

import {
  Clock,
  PlayCircle,
  CheckCircle2,
  Ban,
  Boxes,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EstadoInventarioFisico,
  type InventarioFisicoResponse,
} from "../types/inventario-fisico.types";

interface InventarioFisicoMetricsProps {
  inventarios: InventarioFisicoResponse[];
  totalItems?: number;
  isLoading?: boolean;
}

export function InventarioFisicoMetrics({
  inventarios,
  totalItems = 0,
  isLoading = false,
}: InventarioFisicoMetricsProps) {
  const borradores = inventarios.filter(
    (i) => i.estado === EstadoInventarioFisico.Borrador
  ).length;
  const enConteo = inventarios.filter(
    (i) => i.estado === EstadoInventarioFisico.EnConteo
  ).length;
  const cerrados = inventarios.filter(
    (i) => i.estado === EstadoInventarioFisico.Cerrado
  ).length;
  const anulados = inventarios.filter(
    (i) => i.estado === EstadoInventarioFisico.Anulado
  ).length;

  const metrics = [
    {
      title: "Total Registros",
      value: totalItems,
      icon: Boxes,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      title: "Borradores",
      value: borradores,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "En Conteo Físico",
      value: enConteo,
      icon: PlayCircle,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "Cerrados y Ajustados",
      value: cerrados,
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {Array.from({ length: 5 }).map((_, idx) => (
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {metrics.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-2.5 rounded-lg border border-border/60 bg-card flex flex-col justify-between hover:border-border transition-colors shadow-2xs"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium leading-none">
                {item.title}
              </span>
              <div
                className={`size-5 rounded-md flex items-center justify-center ${item.bg} ${item.border} ${item.color}`}
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
