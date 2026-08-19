"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, Wallet } from "lucide-react";

interface CobroHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function CobroHeader({ onRefresh, isRefreshing = false }: CobroHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
      <div>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-2xs">
            <Wallet className="size-4.5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-foreground">
              Gestión de Cobros y Caja
            </h2>
            <p className="text-xs text-muted-foreground">
              Recepción de pagos de prestaciones, liquidación multimoneda y emisión de comprobantes.
            </p>
          </div>
        </div>
      </div>

      {onRefresh && (
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw
              className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Actualizar</span>
          </Button>
        </div>
      )}
    </div>
  );
}
