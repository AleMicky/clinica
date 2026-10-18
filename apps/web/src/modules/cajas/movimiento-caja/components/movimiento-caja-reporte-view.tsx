"use client";

import * as React from "react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useMovimientosCaja,
  useMovimientoCajaMetrics,
  useExportarMovimientosCajaExcel,
} from "../hooks/use-movimientos-caja";
import { useTurnosCaja } from "../../turno-caja/hooks/use-turnos-caja";
import type {
  MovimientoCajaResponse,
  ExportarMovimientosQueryParams,
  MovimientoCajaQueryParams,
} from "../types/movimiento-caja.types";
import { MovimientoCajaDetailSheet } from "./movimiento-caja-detail-sheet";
import { MovimientoCajaReporteHeader } from "./reporte/movimiento-caja-reporte-header";
import {
  MovimientoCajaReporteFilters,
  type DatePreset,
} from "./reporte/movimiento-caja-reporte-filters";
import { MovimientoCajaReporteMetrics } from "./reporte/movimiento-caja-reporte-metrics";
import { MovimientoCajaReporteCharts } from "./reporte/movimiento-caja-reporte-charts";
import { MovimientoCajaReporteTable } from "./reporte/movimiento-caja-reporte-table";

const getTodayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const getYesterdayIso = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const getStartOfWeekIso = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
};

const getStartOfMonthIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

const getThirtyDaysAgoIso = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function MovimientoCajaReporteView() {
  // ---------------------------------------------------------------------------
  // Filters State
  // ---------------------------------------------------------------------------
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);

  const [fechaDesde, setFechaDesde] = React.useState<string>(getStartOfMonthIso);
  const [fechaHasta, setFechaHasta] = React.useState<string>(getTodayIso);
  const [selectedNaturaleza, setSelectedNaturaleza] = React.useState<
    "TODOS" | "ENTRADA" | "SALIDA"
  >("TODOS");
  const [selectedTurnoId, setSelectedTurnoId] = React.useState<number | null>(
    null
  );

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(15);
  const [showCharts, setShowCharts] = React.useState(true);

  // Detail sheet state
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false);
  const [selectedMovimiento, setSelectedMovimiento] =
    React.useState<MovimientoCajaResponse | null>(null);

  // Export Mutation
  const exportMutation = useExportarMovimientosCajaExcel();

  // Turnos de caja para el selector
  const { data: turnosData } = useTurnosCaja({ page: 1, pageSize: 50 });
  const turnosList = React.useMemo(() => {
    return Array.isArray(turnosData?.items)
      ? turnosData.items
      : Array.isArray(turnosData)
      ? turnosData
      : [];
  }, [turnosData]);

  // Query Params for Table (Paginated)
  const queryParams: MovimientoCajaQueryParams = React.useMemo(
    () => ({
      page,
      pageSize,
      search: debouncedSearch.trim() || undefined,
      turnoCajaId: selectedTurnoId || undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
    }),
    [page, pageSize, debouncedSearch, selectedTurnoId, fechaDesde, fechaHasta]
  );

  // Query Params for Metrics
  const metricsQueryParams = React.useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      turnoCajaId: selectedTurnoId || undefined,
      naturaleza: selectedNaturaleza !== "TODOS" ? selectedNaturaleza : undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
    }),
    [debouncedSearch, selectedTurnoId, selectedNaturaleza, fechaDesde, fechaHasta]
  );

  const {
    data: apiData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    refetch: refetchMovimientos,
  } = useMovimientosCaja(queryParams);

  const {
    data: apiMetrics,
    isLoading: isMetricsLoading,
    isFetching: isMetricsFetching,
    refetch: refetchMetrics,
  } = useMovimientoCajaMetrics(metricsQueryParams);

  const rawItems = React.useMemo(() => {
    if (Array.isArray(apiData?.items)) return apiData.items;
    if (Array.isArray(apiData))
      return apiData as unknown as MovimientoCajaResponse[];
    return [];
  }, [apiData]);

  // Client-side nature filter if selected
  const items = React.useMemo(() => {
    if (selectedNaturaleza === "TODOS") return rawItems;
    return rawItems.filter((m) => {
      const isEntrada =
        m.naturalezaAplicada?.toUpperCase() === "ENTRADA" ||
        m.tipoMovimientoCaja?.naturaleza?.toUpperCase() === "ENTRADA";
      return selectedNaturaleza === "ENTRADA" ? isEntrada : !isEntrada;
    });
  }, [rawItems, selectedNaturaleza]);

  const totalItems =
    selectedNaturaleza === "TODOS"
      ? apiData?.totalItems ?? (apiMetrics?.totalMovimientos ?? items.length)
      : items.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // ---------------------------------------------------------------------------
  // Filter Handlers
  // ---------------------------------------------------------------------------
  const handleClearFilters = React.useCallback(() => {
    setSearchTerm("");
    setFechaDesde(getStartOfMonthIso());
    setFechaHasta(getTodayIso());
    setSelectedNaturaleza("TODOS");
    setSelectedTurnoId(null);
    setPage(1);
  }, []);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      selectedNaturaleza !== "TODOS" ||
      selectedTurnoId !== null ||
      fechaDesde !== getStartOfMonthIso() ||
      fechaHasta !== getTodayIso()
  );

  const handleApplyPreset = React.useCallback((preset: DatePreset) => {
    const today = getTodayIso();
    setPage(1);
    switch (preset) {
      case "hoy":
        setFechaDesde(today);
        setFechaHasta(today);
        break;
      case "ayer": {
        const y = getYesterdayIso();
        setFechaDesde(y);
        setFechaHasta(y);
        break;
      }
      case "semana":
        setFechaDesde(getStartOfWeekIso());
        setFechaHasta(today);
        break;
      case "mes":
        setFechaDesde(getStartOfMonthIso());
        setFechaHasta(today);
        break;
      case "30dias":
        setFechaDesde(getThirtyDaysAgoIso());
        setFechaHasta(today);
        break;
      case "todo":
        setFechaDesde("");
        setFechaHasta("");
        break;
    }
  }, []);

  const handleRefresh = React.useCallback(() => {
    void refetchMovimientos();
    void refetchMetrics();
  }, [refetchMovimientos, refetchMetrics]);

  // ---------------------------------------------------------------------------
  // Export to Excel Handler
  // ---------------------------------------------------------------------------
  const handleExportExcel = async () => {
    try {
      const exportParams: ExportarMovimientosQueryParams = {
        search: debouncedSearch.trim() || undefined,
        turnoCajaId: selectedTurnoId || undefined,
        naturaleza: selectedNaturaleza !== "TODOS" ? selectedNaturaleza : undefined,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
      };

      toast.loading("Generando reporte oficial de movimientos en Excel (.xlsx)...", {
        id: "export-excel-movimientos",
      });

      const blob = await exportMutation.mutateAsync(exportParams);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      link.download = `reporte_movimientos_caja_${stamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Reporte de movimientos descargado exitosamente", {
        id: "export-excel-movimientos",
      });
    } catch {
      toast.error("Ocurrió un error al generar el archivo Excel", {
        id: "export-excel-movimientos",
      });
    }
  };

  return (
    <div className="space-y-4 pb-12 w-full min-w-0">
      {/* 1. Header Toolbar */}
      <MovimientoCajaReporteHeader
        totalItems={totalItems}
        isLoading={isListLoading}
        isFetching={isListFetching || isMetricsFetching}
        isExporting={exportMutation.isPending}
        showCharts={showCharts}
        onToggleCharts={() => setShowCharts((prev) => !prev)}
        onRefresh={handleRefresh}
        onExportExcel={handleExportExcel}
      />

      {/* 2. Filters & Presets Panel */}
      <MovimientoCajaReporteFilters
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        fechaDesde={fechaDesde}
        onFechaDesdeChange={(val) => {
          setFechaDesde(val);
          setPage(1);
        }}
        fechaHasta={fechaHasta}
        onFechaHastaChange={(val) => {
          setFechaHasta(val);
          setPage(1);
        }}
        selectedNaturaleza={selectedNaturaleza}
        onSelectedNaturalezaChange={(val) => {
          setSelectedNaturaleza(val);
          setPage(1);
        }}
        selectedTurnoId={selectedTurnoId}
        onSelectedTurnoIdChange={(val) => {
          setSelectedTurnoId(val);
          setPage(1);
        }}
        turnos={turnosList}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        onApplyPreset={handleApplyPreset}
        todayIso={getTodayIso()}
        yesterdayIso={getYesterdayIso()}
        startOfMonthIso={getStartOfMonthIso()}
      />

      {/* 3. Operational KPIs Summary */}
      <MovimientoCajaReporteMetrics
        metrics={apiMetrics}
        isLoading={isMetricsLoading}
      />

      {/* 4. Graphical Analytics Panel */}
      {showCharts && (
        <MovimientoCajaReporteCharts
          metrics={apiMetrics}
          isLoading={isMetricsLoading}
        />
      )}

      {/* 5. Reporting Ledger Table */}
      <MovimientoCajaReporteTable
        items={items}
        totalItems={totalItems}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        isLoading={isListLoading}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        onSelectMovimiento={(mov) => {
          setSelectedMovimiento(mov);
          setDetailSheetOpen(true);
        }}
      />

      {/* 6. Detail Sheet Drawer */}
      <MovimientoCajaDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        movimiento={selectedMovimiento}
      />
    </div>
  );
}
