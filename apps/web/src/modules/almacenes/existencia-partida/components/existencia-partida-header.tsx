"use client";

import * as React from "react";
import { Layers, PackageCheck, AlertCircle, Boxes, Plus, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/config/routes";

interface ExistenciaPartidaHeaderProps {
  totalItems?: number;
  totalFisico?: number;
  totalReservado?: number;
  totalDisponible?: number;
  onAdd?: () => void;
  showBackToExistencias?: boolean;
}

export function ExistenciaPartidaHeader({
  totalItems = 0,
  totalFisico = 0,
  totalReservado = 0,
  totalDisponible = 0,
  onAdd,
  showBackToExistencias = true,
}: ExistenciaPartidaHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-card border border-border/60 rounded-xl p-3.5 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-2xs">
          <Layers className="size-4.5" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground">
              Stock por Partida / Lote
            </h1>
            <Badge
              variant="outline"
              className="text-[10px] h-4.5 px-1.5 font-semibold text-primary border-primary/30 bg-primary/5"
            >
              {totalItems} {totalItems === 1 ? "partida" : "partidas"}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Control y trazabilidad del inventario específico por número de partida, fecha de caducidad y almacén.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* KPI Badges */}
        <Badge
          variant="outline"
          className="text-xs font-normal py-1 px-2.5 gap-1.5 bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400"
        >
          <Boxes className="size-3.5" />
          <span>
            Físico: <strong className="font-semibold">{totalFisico.toLocaleString()}</strong>
          </span>
        </Badge>

        <Badge
          variant="outline"
          className="text-xs font-normal py-1 px-2.5 gap-1.5 bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
        >
          <AlertCircle className="size-3.5" />
          <span>
            Reservado: <strong className="font-semibold">{totalReservado.toLocaleString()}</strong>
          </span>
        </Badge>

        <Badge
          variant="outline"
          className="text-xs font-normal py-1 px-2.5 gap-1.5 bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
        >
          <PackageCheck className="size-3.5" />
          <span>
            Disponible: <strong className="font-semibold">{totalDisponible.toLocaleString()}</strong>
          </span>
        </Badge>

        {showBackToExistencias && (
          <Link href={ROUTES.ALMACENES.EXISTENCIAS}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 cursor-pointer ml-auto sm:ml-0"
            >
              <ArrowLeft className="size-3.5" />
              <span>Ver Stock General</span>
            </Button>
          </Link>
        )}

        {onAdd && (
          <Button
            size="sm"
            onClick={onAdd}
            className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs font-medium"
          >
            <Plus className="size-3.5" />
            <span>Asignar Partida</span>
          </Button>
        )}
      </div>
    </div>
  );
}
