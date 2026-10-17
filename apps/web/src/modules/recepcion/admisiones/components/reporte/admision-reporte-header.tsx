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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-card via-card to-primary/5 px-4 py-2.5 rounded-xl border border-border/70 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="size-8.5 rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-teal-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-2xs shrink-0">
          <FileSpreadsheet className="size-4.5" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-bold text-foreground tracking-tight">
              Reporte de Admisiones y Prestaciones
            </h1>
            <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Auditoría & Analítica en Vivo
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1">
            Filtre por período, estado, cobertura médica y exporte los registros oficiales a Excel (.xlsx).
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleCharts}
          className="h-8 px-2.5 text-xs gap-1.5 border-border/80 hover:bg-accent transition-all cursor-pointer"
          title={showCharts ? "Ocultar panel gráfico" : "Mostrar panel gráfico"}
        >
          {showCharts ? <EyeOff className="size-3.5 text-muted-foreground" /> : <BarChart3 className="size-3.5 text-primary" />}
          <span className="hidden sm:inline">{showCharts ? "Ocultar Gráficos" : "Ver Gráficos"}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isBusy}
          className="h-8 px-2.5 text-xs gap-1.5 border-border/80 hover:bg-accent transition-all cursor-pointer"
        >
          <RefreshCw className={cn("size-3.5", isBusy && "animate-spin text-primary")} />
          <span className="hidden md:inline">Actualizar</span>
        </Button>

        <Button
          size="sm"
          onClick={onExportExcel}
          disabled={isExporting || isLoading || totalItems === 0}
          className="h-8 px-3 text-xs font-semibold gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs shadow-emerald-600/25 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title={totalItems === 0 ? "No hay registros disponibles para exportar" : "Descargar archivo Excel"}
        >
          <Download className={cn("size-3.5", isExporting && "animate-bounce")} />
          <span>Exportar Excel (.xlsx)</span>
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
