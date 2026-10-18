"use client";

import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Wallet,
  BarChart3,
  SlidersHorizontal,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";

interface CobroHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  showMetrics?: boolean;
  onToggleMetrics?: () => void;
  isCompact?: boolean;
  onToggleCompact?: () => void;
  showDetailPanel?: boolean;
  onToggleDetailPanel?: () => void;
}

export function CobroHeader({
  onRefresh,
  isRefreshing = false,
  showMetrics = true,
  onToggleMetrics,
  isCompact = false,
  onToggleCompact,
  showDetailPanel = true,
  onToggleDetailPanel,
}: Readonly<CobroHeaderProps>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-0.5">
      {/* Título y Resumen */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
          <Wallet className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-foreground truncate">
              Gestión de Cobros y Caja
            </h1>
            <span className="hidden sm:inline-block text-[11px] font-medium text-muted-foreground/80 bg-muted/60 px-2 py-0.5 rounded-full border border-border/40">
              Terminal POS
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate hidden sm:block">
            Recepción de pagos, liquidación multimoneda y comprobantes de caja
          </p>
        </div>
      </div>

      {/* Barra de Herramientas y Acciones */}
      <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
        {onToggleMetrics && (
          <Button
            type="button"
            variant={showMetrics ? "secondary" : "ghost"}
            size="sm"
            onClick={onToggleMetrics}
            title={showMetrics ? "Ocultar métricas" : "Mostrar métricas"}
            className="h-7.5 px-2.5 text-xs gap-1.5 cursor-pointer font-medium border border-border/50"
          >
            <BarChart3 className="size-3.5 text-muted-foreground" />
            <span className="hidden md:inline">
              {showMetrics ? "Métricas" : "Ver Métricas"}
            </span>
          </Button>
        )}

        {onToggleCompact && (
          <Button
            type="button"
            variant={isCompact ? "secondary" : "ghost"}
            size="sm"
            onClick={onToggleCompact}
            title={isCompact ? "Vista estándar" : "Vista compacta"}
            className="h-7.5 px-2.5 text-xs gap-1.5 cursor-pointer font-medium border border-border/50"
          >
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            <span>{isCompact ? "Compacto" : "Normal"}</span>
          </Button>
        )}

        {onToggleDetailPanel && (
          <Button
            type="button"
            variant={showDetailPanel ? "secondary" : "ghost"}
            size="sm"
            onClick={onToggleDetailPanel}
            title={showDetailPanel ? "Ocultar panel derecho" : "Ver panel derecho"}
            className="hidden lg:inline-flex h-7.5 px-2.5 text-xs gap-1.5 cursor-pointer font-medium border border-border/50"
          >
            {showDetailPanel ? (
              <>
                <PanelRightClose className="size-3.5 text-muted-foreground" />
                <span>Panel</span>
              </>
            ) : (
              <>
                <PanelRightOpen className="size-3.5 text-muted-foreground" />
                <span>Ver Panel</span>
              </>
            )}
          </Button>
        )}

        {onRefresh && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-7.5 px-2.5 text-xs gap-1.5 cursor-pointer shadow-2xs font-medium"
          >
            <RefreshCw
              className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        )}
      </div>
    </div>
  );
}

