"use client";

import { Plus, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArqueoCajaHeaderProps {
  onNewArqueoClick: () => void;
}

export function ArqueoCajaHeader({
  onNewArqueoClick,
}: ArqueoCajaHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/40">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <span>Arqueos y Cierres de Caja</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          Realice arqueos de efectivo por método de pago y concilie saldos con el sistema.
        </p>
      </div>

      <Button
        onClick={onNewArqueoClick}
        size="sm"
        className="h-9 gap-1.5 text-xs font-semibold shadow-xs"
      >
        <Plus className="h-4 w-4" />
        <span>Nuevo Arqueo</span>
      </Button>
    </div>
  );
}
