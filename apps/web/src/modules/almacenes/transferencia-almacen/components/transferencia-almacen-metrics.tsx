"use client";

import {
  Clock,
  Send,
  CheckCircle2,
  Truck,
  PackageCheck,
  Ban,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EstadoTransferenciaAlmacen,
  type TransferenciaAlmacenResponse,
} from "../types/transferencia-almacen.types";

interface TransferenciaAlmacenMetricsProps {
  transferencias: TransferenciaAlmacenResponse[];
  totalItems?: number;
  isLoading?: boolean;
}

export function TransferenciaAlmacenMetrics({
  transferencias,
  totalItems = 0,
  isLoading = false,
}: TransferenciaAlmacenMetricsProps) {
  const borradores = transferencias.filter(
    (t) => t.estado === EstadoTransferenciaAlmacen.Borrador
  ).length;
  const solicitadas = transferencias.filter(
    (t) => t.estado === EstadoTransferenciaAlmacen.Solicitado
  ).length;
  const aprobadas = transferencias.filter(
    (t) => t.estado === EstadoTransferenciaAlmacen.Aprobado
  ).length;
  const despachadas = transferencias.filter(
    (t) => t.estado === EstadoTransferenciaAlmacen.Despachado
  ).length;
  const recibidas = transferencias.filter(
    (t) => t.estado === EstadoTransferenciaAlmacen.Recibido
  ).length;
  const canceladas = transferencias.filter(
    (t) => t.estado === EstadoTransferenciaAlmacen.Cancelado
  ).length;

  const metrics = [
    {
      title: "Borradores",
      value: borradores,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Solicitadas",
      value: solicitadas,
      icon: Send,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "Aprobadas",
      value: aprobadas,
      icon: CheckCircle2,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      title: "En Tránsito / Desp.",
      value: despachadas,
      icon: Truck,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      title: "Recibidas",
      value: recibidas,
      icon: PackageCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Canceladas",
      value: canceladas,
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
