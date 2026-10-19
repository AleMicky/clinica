"use client";

import * as React from "react";
import { Pill, Plus, RefreshCw, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DispensacionHeaderProps {
  totalItems?: number;
  onRefresh?: () => void;
  isLoading?: boolean;
  onAddDispensacion?: () => void;
}

export function DispensacionHeader({
  totalItems = 0,
  onRefresh,
  isLoading = false,
  onAddDispensacion,
}: DispensacionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card border border-border/60 rounded-lg p-3.5 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 shadow-2xs">
          <Pill className="size-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground">
              Farmacia • Dispensación y Ventas
            </h1>
            <Badge
              variant="outline"
              className="text-[10px] h-4.5 px-1.5 font-semibold text-teal-700 dark:text-teal-300 border-teal-500/30 bg-teal-500/10"
            >
              {totalItems} {totalItems === 1 ? "registro" : "registros"}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Emite órdenes de venta y preventa para cobro en cajas, y dispensa medicamentos con descuento automático de stock y lote.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="size-8 cursor-pointer border-border/60"
            title="Recargar datos"
          >
            <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
          </Button>
        )}

        {onAddDispensacion && (
          <Button
            size="sm"
            onClick={onAddDispensacion}
            className="h-8 text-xs gap-1.5 cursor-pointer bg-teal-600 hover:bg-teal-700 text-white shadow-2xs"
          >
            <Plus className="size-3.5" />
            <span>Nueva Venta / Dispensación</span>
          </Button>
        )}
      </div>
    </div>
  );
}
