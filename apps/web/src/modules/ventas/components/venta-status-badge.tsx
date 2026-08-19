"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, DollarSign, Send, XCircle } from "lucide-react";
import { EstadoVenta, EstadoVentaPagador } from "../types/ventas.types";

interface VentaStatusBadgeProps {
  estado: EstadoVenta;
  className?: string;
}

export function VentaStatusBadge({ estado, className }: VentaStatusBadgeProps) {
  switch (estado) {
    case EstadoVenta.Pendiente:
      return (
        <Badge
          variant="outline"
          className={`bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 text-[11px] font-semibold ${className}`}
        >
          <Clock className="size-3" />
          Pendiente
        </Badge>
      );
    case EstadoVenta.PendienteCobro:
      return (
        <Badge
          variant="outline"
          className={`bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 gap-1 text-[11px] font-semibold ${className}`}
        >
          <Send className="size-3" />
          Pendiente Cobro
        </Badge>
      );
    case EstadoVenta.ParcialmentePagada:
      return (
        <Badge
          variant="outline"
          className={`bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1 text-[11px] font-semibold ${className}`}
        >
          <DollarSign className="size-3" />
          Parcialmente Pagada
        </Badge>
      );
    case EstadoVenta.Pagada:
      return (
        <Badge
          variant="outline"
          className={`bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px] font-semibold ${className}`}
        >
          <CheckCircle2 className="size-3" />
          Pagada
        </Badge>
      );
    case EstadoVenta.Anulada:
      return (
        <Badge
          variant="outline"
          className={`bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 gap-1 text-[11px] font-semibold ${className}`}
        >
          <XCircle className="size-3" />
          Anulada
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={className}>
          Desconocido
        </Badge>
      );
  }
}

interface PagadorStatusBadgeProps {
  estado: EstadoVentaPagador;
  className?: string;
}

export function PagadorStatusBadge({ estado, className }: PagadorStatusBadgeProps) {
  switch (estado) {
    case EstadoVentaPagador.Pendiente:
      return (
        <Badge
          variant="outline"
          className={`bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] ${className}`}
        >
          Pendiente
        </Badge>
      );
    case EstadoVentaPagador.ParcialmentePagado:
      return (
        <Badge
          variant="outline"
          className={`bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] ${className}`}
        >
          Parcial
        </Badge>
      );
    case EstadoVentaPagador.Pagado:
      return (
        <Badge
          variant="outline"
          className={`bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] ${className}`}
        >
          Pagado
        </Badge>
      );
    case EstadoVentaPagador.Anulado:
      return (
        <Badge
          variant="outline"
          className={`bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] ${className}`}
        >
          Anulado
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={className}>
          -
        </Badge>
      );
  }
}
