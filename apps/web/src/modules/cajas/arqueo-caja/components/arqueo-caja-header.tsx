"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calculator, Plus, RefreshCw, Sparkles } from "lucide-react";

interface ArqueoCajaHeaderProps {
  onNewArqueoClick: () => void;
  onRefresh?: () => void;
}

export function ArqueoCajaHeader({
  onNewArqueoClick,
  onRefresh,
}: ArqueoCajaHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-card via-card to-amber-500/5 px-4 py-2.5 rounded-xl border border-border/70 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="size-8.5 rounded-lg bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-primary/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-2xs shrink-0">
          <Calculator className="size-4.5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-foreground tracking-tight">
              Arqueos y Cierres de Caja
            </h1>
            <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.2 rounded-full border border-amber-500/20 flex items-center gap-1">
              <Sparkles className="size-2.5" />
              Conciliación
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1">
            Realice arqueos de efectivo por método de pago y concilie saldos físicos contra el sistema.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-8 px-2.5 text-xs gap-1.5 border-border/80 hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer"
            title="Actualizar datos"
          >
            <RefreshCw className="size-3.5" />
            <span className="hidden md:inline">Actualizar</span>
          </Button>
        )}

        <Button
          size="sm"
          onClick={onNewArqueoClick}
          className="h-8 px-3.5 text-xs font-semibold gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-xs shadow-amber-500/20 transition-all duration-200 cursor-pointer"
        >
          <Plus className="size-3.5" />
          Nuevo Arqueo
        </Button>
      </div>
    </div>
  );
}
