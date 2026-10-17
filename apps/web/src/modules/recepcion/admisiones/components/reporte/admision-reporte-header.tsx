"use client";

import * as React from "react";
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  BarChart3,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdmisionReporteHeaderProps {
  totalItems: number;
  isLoading: boolean;
  isFetching: boolean;
  isExporting: boolean;
  showCharts: boolean;
  onToggleCharts: () => void;
  onRefresh: () => void;
  onExportExcel: () => void;
}

export function AdmisionReporteHeader({
  totalItems,
  isLoading,
  isFetching,
  isExporting,
  showCharts,
  onToggleCharts,
  onRefresh,
  onExportExcel,
}: AdmisionReporteHeaderProps) {
  const isBusy = isLoading || isFetching;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/80 backdrop-blur-sm px-5 py-4 rounded-2xl border border-border/40 shadow-xs transition-all">
      <div className="flex items-center gap-3.5">
        <div className="size-11 rounded-xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs shrink-0">
          <FileSpreadsheet className="size-5.5" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              Reporte General de Admisiones
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              Analítica en Vivo
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            Consolidado asistencial, trazabilidad de pacientes, prestaciones médicas y exportación contable oficial.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleCharts}
          className="h-8.5 px-3 text-xs gap-1.5 rounded-lg border-border/60 hover:bg-muted/60 transition-all cursor-pointer font-medium"
          title={showCharts ? "Ocultar panel gráfico" : "Mostrar panel gráfico"}
        >
          {showCharts ? (
            <EyeOff className="size-3.5 text-muted-foreground" />
          ) : (
            <BarChart3 className="size-3.5 text-primary" />
          )}
          <span>{showCharts ? "Ocultar Gráficos" : "Ver Gráficos"}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isBusy}
          className="h-8.5 px-3 text-xs gap-1.5 rounded-lg border-border/60 hover:bg-muted/60 transition-all cursor-pointer font-medium"
          title="Actualizar datos del servidor"
        >
          <RefreshCw className={cn("size-3.5", isBusy && "animate-spin text-primary")} />
          <span className="hidden md:inline">Actualizar</span>
        </Button>

        <Button
          size="sm"
          onClick={onExportExcel}
          disabled={isExporting || isLoading || totalItems === 0}
          className="h-8.5 px-3.5 text-xs font-semibold gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xs shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title={totalItems === 0 ? "No hay registros disponibles para exportar" : "Descargar archivo Excel"}
        >
          <Download className={cn("size-3.5", isExporting && "animate-bounce")} />
          <span>Exportar Excel</span>
          {totalItems > 0 && (
            <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.2 rounded-full">
              {totalItems}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

