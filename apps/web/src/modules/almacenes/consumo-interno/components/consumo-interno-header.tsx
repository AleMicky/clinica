"use client";

import { Utensils, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ConsumoInternoHeaderProps {
  totalItems?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ConsumoInternoHeader({
  totalItems = 0,
  onRefresh,
  isRefreshing = false,
}: ConsumoInternoHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 bg-card border border-border/60 rounded-lg p-3 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 shadow-2xs">
          <Utensils className="size-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground">
              Consumos Internos
            </h1>
            <Badge
              variant="outline"
              className="text-[10px] h-4.5 px-1.5 font-semibold text-teal-600 dark:text-teal-400 border-teal-500/30 bg-teal-500/5"
            >
              {totalItems} {totalItems === 1 ? "registro" : "registros"}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Vales de despacho de insumos y materiales para consumo directo en áreas, salas y servicios hospitalarios
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-7 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RefreshCw
              className={`size-3 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline text-xs">Actualizar</span>
          </Button>
        )}
      </div>
    </div>
  );
}
