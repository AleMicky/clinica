"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, AlertTriangle, ArrowLeftRight } from "lucide-react";
import { EstadoCobro, type CobroResponse } from "../types/cobro.types";

interface CobroStatusBadgeProps {
  cobro: CobroResponse | { estado: EstadoCobro };
  className?: string;
}

export function CobroStatusBadge({ cobro, className }: CobroStatusBadgeProps) {
  const { estado } = cobro;

  switch (estado) {
    case EstadoCobro.Registrado:
      return (
        <Badge
          variant="outline"
          className={`bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 text-[10px] font-semibold ${className}`}
        >
          <Clock className="size-3" />
          Por Cobrar
        </Badge>
      );
    case EstadoCobro.Confirmado:
      return (
        <Badge
          variant="outline"
          className={`bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[10px] font-semibold ${className}`}
        >
          <CheckCircle2 className="size-3" />
          Cobrado
        </Badge>
      );
    case EstadoCobro.Anulado:
      return (
        <Badge
          variant="outline"
          className={`bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 gap-1 text-[10px] font-semibold ${className}`}
        >
          <XCircle className="size-3" />
          Anulado
        </Badge>
      );
    case EstadoCobro.DevueltoParcial:
      return (
        <Badge
          variant="outline"
          className={`bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 text-[10px] font-semibold ${className}`}
        >
          <ArrowLeftRight className="size-3" />
          Dev. Parcial
        </Badge>
      );
    case EstadoCobro.Devuelto:
      return (
        <Badge
          variant="outline"
          className={`bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 gap-1 text-[10px] font-semibold ${className}`}
        >
          <AlertTriangle className="size-3" />
          Devuelto
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
