"use client";

import {
  Clock,
  CheckCircle2,
  Ban,
  Trash2,
  CalendarX,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EstadoBajaInventario,
  TipoBajaInventario,
  type BajaInventarioResponse,
} from "../types/baja-inventario.types";

interface BajaInventarioMetricsProps {
  bajas: BajaInventarioResponse[];
  totalItems?: number;
  isLoading?: boolean;
}

export function BajaInventarioMetrics({
  bajas,
  totalItems = 0,
  isLoading = false,
}: BajaInventarioMetricsProps) {
  const vencimiento = bajas.filter(
    (b) => b.tipo === TipoBajaInventario.Vencimiento
  ).length;
  const danio = bajas.filter(
    (b) => b.tipo === TipoBajaInventario.Danio
  ).length;
  const merma = bajas.filter(
    (b) => b.tipo === TipoBajaInventario.Merma
  ).length;
  const borradores = bajas.filter(
    (b) => b.estado === EstadoBajaInventario.Borrador
  ).length;
  const confirmados = bajas.filter(
    (b) => b.estado === EstadoBajaInventario.Confirmado
  ).length;
  const anulados = bajas.filter(
    (b) => b.estado === EstadoBajaInventario.Anulado
  ).length;

  const metrics = [
    {
      title: "Total Bajas",
      value: totalItems,
      icon: Trash2,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
    {
      title: "Por Vencimiento",
      value: vencimiento,
      icon: CalendarX,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Por Daño / Rotura",
      value: danio,
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
    {
      title: "Por Merma",
      value: merma,
      icon: Flame,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
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
      title: "Confirmadas",
      value: confirmados,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
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
