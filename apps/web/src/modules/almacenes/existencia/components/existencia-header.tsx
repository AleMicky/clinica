"use client";

import * as React from "react";
import { Boxes, PackageCheck, AlertCircle, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExistenciaHeaderProps {
  totalItems?: number;
  totalFisico?: number;
  totalReservado?: number;
  totalDisponible?: number;
}

export function ExistenciaHeader({
  totalItems = 0,
  totalFisico = 0,
  totalReservado = 0,
  totalDisponible = 0,
}: ExistenciaHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-border/40 pb-3.5">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs">
            <Boxes className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Existencias / Stock de Inventario
            </h1>
            <p className="text-xs text-muted-foreground">
              Supervisa el stock físico, reservas activas y disponibilidad neta de productos por almacén.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="outline"
          className="text-xs font-normal py-1 px-2.5 gap-1.5 bg-muted/50 border-border/60 text-foreground"
        >
          <Layers className="size-3.5 text-muted-foreground" />
          <span>Registros: <strong className="font-semibold">{totalItems}</strong></span>
        </Badge>

        <Badge
          variant="outline"
          className="text-xs font-normal py-1 px-2.5 gap-1.5 bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400"
        >
          <Boxes className="size-3.5" />
          <span>Físico: <strong className="font-semibold">{totalFisico.toLocaleString()}</strong></span>
        </Badge>

        <Badge
          variant="outline"
          className="text-xs font-normal py-1 px-2.5 gap-1.5 bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
        >
          <AlertCircle className="size-3.5" />
          <span>Reservado: <strong className="font-semibold">{totalReservado.toLocaleString()}</strong></span>
        </Badge>

        <Badge
          variant="outline"
          className="text-xs font-normal py-1 px-2.5 gap-1.5 bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
        >
          <PackageCheck className="size-3.5" />
          <span>Disponible: <strong className="font-semibold">{totalDisponible.toLocaleString()}</strong></span>
        </Badge>
      </div>
    </div>
  );
}
