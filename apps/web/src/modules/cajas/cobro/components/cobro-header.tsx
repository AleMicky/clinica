"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, Wallet, Clock, CheckCircle2, DollarSign } from "lucide-react";
import type { CobroMetrics as CobroMetricsType } from "../types/cobro.types";

interface CobroHeaderProps {
  metrics: CobroMetricsType;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function CobroHeader({
  metrics,
  onRefresh,
  isRefreshing = false,
}: Readonly<CobroHeaderProps>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 pb-1">
      {/* Título y Badge POS */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
          <Wallet className="size-4" />
        </div>
        <div className="min-w-0 flex items-center gap-2">
          <h1 className="text-base font-bold tracking-tight text-foreground truncate">
            Caja & Cobros
          </h1>
          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            Terminal POS
          </span>
        </div>
      </div>

      {/* Métricas Integradas en Línea (Responsive y sin empujar la pantalla) */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end overflow-hidden">
        <div className="inline-flex items-center gap-2 px-2 py-1 sm:px-2.5 rounded-lg bg-card border border-border/70 text-xs shadow-2xs overflow-x-auto scrollbar-none max-w-full">
          <div className="flex items-center gap-1.5 pr-2 border-r border-border/50 shrink-0">
            <Clock className="size-3 text-amber-500 shrink-0" />
            <span className="text-[10px] sm:text-[11px] text-muted-foreground">Por Cobrar:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
              {metrics.pendientesCobro}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pr-2 border-r border-border/50 shrink-0">
            <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
            <span className="text-[10px] sm:text-[11px] text-muted-foreground">Cobrados:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {metrics.completados}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <DollarSign className="size-3 text-emerald-500 shrink-0" />
            <span className="text-[10px] sm:text-[11px] text-muted-foreground">Total:</span>
            <span className="font-extrabold text-foreground font-mono">
              Bs. {metrics.totalMontoCobrado.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {onRefresh && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-7 px-2 text-xs gap-1 cursor-pointer shadow-2xs font-medium shrink-0"
          >
            <RefreshCw
              className={`size-3 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden md:inline">Actualizar</span>
          </Button>
        )}
      </div>
    </div>
  );
}
