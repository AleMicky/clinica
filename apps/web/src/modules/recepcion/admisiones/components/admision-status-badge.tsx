"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CreditCard,
  CheckCircle2,
  Stethoscope,
  CheckCheck,
  XCircle,
} from "lucide-react";
import { EstadoAdmision } from "../types/admision.types";

interface AdmisionStatusBadgeProps {
  estado: EstadoAdmision;
  className?: string;
}

export function AdmisionStatusBadge({ estado, className }: AdmisionStatusBadgeProps) {
  switch (estado) {
    case EstadoAdmision.Registrada:
      return (
        <Badge
          variant="outline"
          className={`bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-medium text-[11px] gap-1 px-2.5 py-0.5 shadow-2xs ${className}`}
        >
          <Clock className="size-3 text-blue-500 animate-pulse" />
          Registrada
        </Badge>
      );
    case EstadoAdmision.PendientePago:
      return (
        <Badge
          variant="outline"
          className={`bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium text-[11px] gap-1 px-2.5 py-0.5 shadow-2xs ${className}`}
        >
          <CreditCard className="size-3 text-amber-500" />
          Pendiente Pago
        </Badge>
      );
    case EstadoAdmision.Pagada:
      return (
        <Badge
          variant="outline"
          className={`bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium text-[11px] gap-1 px-2.5 py-0.5 shadow-2xs ${className}`}
        >
          <CheckCircle2 className="size-3 text-emerald-500" />
          Pagada
        </Badge>
      );
    case EstadoAdmision.EnAtencion:
      return (
        <Badge
          variant="outline"
          className={`bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-medium text-[11px] gap-1 px-2.5 py-0.5 shadow-2xs ${className}`}
        >
          <Stethoscope className="size-3 text-purple-500 animate-bounce" />
          En Atención
        </Badge>
      );
    case EstadoAdmision.Finalizada:
      return (
        <Badge
          variant="outline"
          className={`bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20 font-medium text-[11px] gap-1 px-2.5 py-0.5 shadow-2xs ${className}`}
        >
          <CheckCheck className="size-3 text-zinc-500" />
          Finalizada
        </Badge>
      );
    case EstadoAdmision.Cancelada:
      return (
        <Badge
          variant="outline"
          className={`bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-medium text-[11px] gap-1 px-2.5 py-0.5 shadow-2xs ${className}`}
        >
          <XCircle className="size-3 text-rose-500" />
          Cancelada
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className={className}>
          Desconocido
        </Badge>
      );
  }
}
