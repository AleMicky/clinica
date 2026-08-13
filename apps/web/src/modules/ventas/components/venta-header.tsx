"use client";

import { Button } from "@/components/ui/button";
import { Coins, Plus, RefreshCw } from "lucide-react";

interface VentaHeaderProps {
  onAddClick: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function VentaHeader({
  onAddClick,
  onRefresh,
  isRefreshing = false,
}: VentaHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border/80 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs shrink-0">
          <Coins className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Ventas y Facturación
          </h1>
          <p className="text-xs text-muted-foreground">
            Gestión de comprobantes, cobros de atención y distribución por pagadores.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-9 text-xs gap-1.5 border-border/80"
        >
          <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Actualizar</span>
        </Button>

        <Button
          size="sm"
          onClick={onAddClick}
          className="h-9 text-xs font-semibold gap-1.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-sm"
        >
          <Plus className="size-4" />
          <span>Nueva Venta</span>
        </Button>
      </div>
    </div>
  );
}
