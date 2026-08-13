"use client";

import { Plus, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MovimientoCajaHeaderProps {
  onNewMovimientoClick: () => void;
}

export function MovimientoCajaHeader({
  onNewMovimientoClick,
}: MovimientoCajaHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/40">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5 text-primary" />
          <span>Movimientos de Caja</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          Gestione los ingresos, egresos, retiros y ajustes de efectivo en los turnos de caja.
        </p>
      </div>

      <Button
        onClick={onNewMovimientoClick}
        size="sm"
        className="h-9 gap-1.5 text-xs font-semibold shadow-xs"
      >
        <Plus className="h-4 w-4" />
        <span>Nuevo Movimiento</span>
      </Button>
    </div>
  );
}
