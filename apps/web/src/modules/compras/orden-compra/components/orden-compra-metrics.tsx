"use client";

import {
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Send,
  PackageCheck,
  Package,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EstadoOrdenCompra,
  type OrdenCompraResponse,
} from "../types/orden-compra.types";

interface OrdenCompraMetricsProps {
  ordenes: OrdenCompraResponse[];
  totalItems?: number;
  isLoading?: boolean;
}

export function OrdenCompraMetrics({
  ordenes,
  totalItems = 0,
  isLoading = false,
}: OrdenCompraMetricsProps) {
  const borradores = ordenes.filter(
    (o) => o.estado === EstadoOrdenCompra.Borrador
  ).length;
  const pendientes = ordenes.filter(
    (o) => o.estado === EstadoOrdenCompra.PendienteAprobacion
  ).length;
  const aprobadas = ordenes.filter(
    (o) => o.estado === EstadoOrdenCompra.Aprobada
  ).length;
  const enviadas = ordenes.filter(
    (o) => o.estado === EstadoOrdenCompra.EnviadaProveedor
  ).length;
  const recibidas = ordenes.filter(
    (o) =>
      o.estado === EstadoOrdenCompra.Recibida ||
      o.estado === EstadoOrdenCompra.ParcialmenteRecibida
  ).length;
  const canceladas = ordenes.filter(
    (o) => o.estado === EstadoOrdenCompra.Cancelada
  ).length;

  const metrics = [
    {
      title: "Total Órdenes",
      value: totalItems,
      icon: ShoppingBag,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
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
      title: "Pend. Aprobación",
      value: pendientes,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Aprobadas",
      value: aprobadas,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Enviadas a Prov.",
      value: enviadas,
      icon: Send,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      title: "Recibidas",
      value: recibidas,
      icon: PackageCheck,
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/20",
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
