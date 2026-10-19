"use client";

import * as React from "react";
import Link from "next/link";
import { Boxes, PackageCheck, AlertCircle, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

interface ExistenciaHeaderProps {
  totalItems?: number;
  totalFisico?: number;
  totalReservado?: number;
  totalDisponible?: number;
  alertasCount?: number;
  onOpenAlertas?: () => void;
}

export function ExistenciaHeader({
  totalItems = 0,
  totalFisico = 0,
  totalReservado = 0,
  totalDisponible = 0,
  alertasCount = 0,
  onOpenAlertas,
}: ExistenciaHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 bg-card border border-border/60 rounded-lg p-3 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-2xs">
          <Boxes className="size-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground">
              Existencias / Stock de Inventario
            </h1>
            <Badge
              variant="outline"
              className="text-[10px] h-4.5 px-1.5 font-semibold text-primary border-primary/30 bg-primary/5"
            >
              {totalItems} {totalItems === 1 ? "registro" : "registros"}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Supervisa el stock físico, reservas activas y disponibilidad neta de productos por almacén.
          </p>
        </div>
      </div>

      {/* KPI Badges */}
      <div className="flex items-center gap-2 flex-wrap shrink-0">
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

        <Link href={ROUTES.ALMACENES.EXISTENCIAS_PARTIDAS}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 cursor-pointer ml-1"
          >
            <Layers className="size-3.5 text-primary" />
            <span>Stock por Partida</span>
          </Button>
        </Link>

        {onOpenAlertas && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAlertas}
            className={cn(
              "h-8 text-xs gap-1.5 cursor-pointer",
              alertasCount > 0
                ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
                : "border-border/60"
            )}
            title="Ver monitor de alertas de stock y caducidad"
          >
            <AlertCircle className="size-3.5 text-amber-600 dark:text-amber-400" />
            <span>Alertas de Stock</span>
            {alertasCount > 0 && (
              <Badge
                variant="outline"
                className="text-[9px] h-4 px-1 font-bold bg-amber-500 text-amber-950 dark:text-amber-950 border-0"
              >
                {alertasCount}
              </Badge>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
