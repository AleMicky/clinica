"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Coins, Plus, RefreshCw, Sparkles } from "lucide-react";

interface AperturaCajaHeaderProps {
  onAddClick?: () => void;
  onRefresh?: () => void;
}

export function AperturaCajaHeader({
  onAddClick,
  onRefresh,
}: AperturaCajaHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-card via-card to-emerald-500/5 px-4 py-2.5 rounded-xl border border-border/70 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="size-8.5 rounded-lg bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-primary/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-2xs shrink-0">
          <Coins className="size-4.5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-foreground tracking-tight">
              Aperturas de Caja y Fondo Inicial
            </h1>
            <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.2 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <Sparkles className="size-2.5" />
              Tesorería
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1">
            Registro y control del fondo de cambio y saldo inicial entregado al cajero.
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
          onClick={onAddClick}
          className="h-8 px-3.5 text-xs font-semibold gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs shadow-emerald-500/20 transition-all duration-200 cursor-pointer"
        >
          <Plus className="size-3.5" />
          Registrar Fondo Inicial
        </Button>
      </div>
    </div>
  );
}
