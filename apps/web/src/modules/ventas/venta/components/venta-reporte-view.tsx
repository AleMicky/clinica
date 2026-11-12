"use client";

import * as React from "react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useVentas,
  useVentaMetrics,
  useExportarVentasExcel,
} from "../hooks/use-ventas";
import {
  EstadoVenta,
  type VentaResponse,
  type ExportarVentasQueryParams,
  type VentaMetricsQueryParams,
} from "../types/ventas.types";
import { VentaDetailSheet } from "./venta-detail-sheet";
import { VentaReporteHeader } from "./reporte/venta-reporte-header";
import { VentaReporteFilters, type DatePreset } from "./reporte/venta-reporte-filters";
import { VentaReporteMetrics } from "./reporte/venta-reporte-metrics";
import { VentaReporteCharts } from "./reporte/venta-reporte-charts";
import { VentaReporteTable } from "./reporte/venta-reporte-table";

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

export function VentaReporteView() {
  // ---------------------------------------------------------------------------
  // Filters State
  // ---------------------------------------------------------------------------
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);

  const [fechaDesde, setFechaDesde] = React.useState<string>(getStartOfMonthIso);
  const [fechaHasta, setFechaHasta] = React.useState<string>(getTodayIso);
  const [selectedEstado, setSelectedEstado] = React.useState<string>("TODOS");

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(15);
  const [showCharts, setShowCharts] = React.useState(true);

  // Detail sheet state
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false);
  const [selectedVenta, setSelectedVenta] = React.useState<VentaResponse | null>(null);

  // Export Mutation
  const exportMutation = useExportarVentasExcel();

  // ---------------------------------------------------------------------------
  // Parsed Filters
  // ---------------------------------------------------------------------------
  const parsedEstado = React.useMemo(() => {
    if (selectedEstado === "TODOS") return undefined;
    const num = Number(selectedEstado);
    return Number.isNaN(num) ? undefined : (num as EstadoVenta);
  }, [selectedEstado]);

  // Query Params for Table (Paginated)
  const queryParams = React.useMemo(
    () => ({
      pageNumber: page,
      pageSize,
      search: debouncedSearch.trim() || undefined,
      estado: parsedEstado,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
    }),
    [page, pageSize, debouncedSearch, parsedEstado, fechaDesde, fechaHasta]
  );

  // Query Params for Metrics (Filtered dataset from the backend API)
  const metricsQueryParams: VentaMetricsQueryParams = React.useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
    }),
    [debouncedSearch, fechaDesde, fechaHasta]
  );

  const {
    data: apiData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    refetch: refetchVentas,
  } = useVentas(queryParams);

  const {
    data: apiMetrics,
    isLoading: isMetricsLoading,
    isFetching: isMetricsFetching,
    refetch: refetchMetrics,
  } = useVentaMetrics(metricsQueryParams);

  const items = React.useMemo(() => apiData?.items ?? [], [apiData]);
  const totalItems = apiData?.totalItems ?? (apiMetrics?.totalVentas ?? 0);
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // ---------------------------------------------------------------------------
  // Filter Handlers
  // ---------------------------------------------------------------------------
  const handleClearFilters = React.useCallback(() => {
    setSearchTerm("");
    setFechaDesde(getStartOfMonthIso());
    setFechaHasta(getTodayIso());
    setSelectedEstado("TODOS");
    setPage(1);
  }, []);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      selectedEstado !== "TODOS" ||
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
        const ayer = getYesterdayIso();
        setFechaDesde(ayer);
        setFechaHasta(ayer);
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
    void refetchVentas();
    void refetchMetrics();
  }, [refetchVentas, refetchMetrics]);

  // ---------------------------------------------------------------------------
  // Export to Excel Handler
  // ---------------------------------------------------------------------------
  const handleExportExcel = async () => {
    try {
      const exportParams: ExportarVentasQueryParams = {
        search: debouncedSearch.trim() || undefined,
        estado: parsedEstado,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
      };

      toast.loading("Generando reporte oficial de ventas en Excel (.xlsx)...", { id: "export-excel-ventas" });

      const blob = await exportMutation.mutateAsync(exportParams);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
      link.download = `Reporte_Ventas_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("¡Reporte de Ventas descargado exitosamente!", {
        id: "export-excel-ventas",
        description: "El archivo contiene el desglose detallado de comprobantes, pacientes, montos y estados.",
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error("Error al exportar a Excel", {
        id: "export-excel-ventas",
        description: error.message || "No se pudo generar el archivo de reporte.",
      });
    }
  };

  return (
    <div className="space-y-3.5 max-w-[1600px] w-full min-w-0 mx-auto pb-8">
      {/* 1. Header & Quick Actions */}
      <VentaReporteHeader
        totalItems={totalItems}
        isLoading={isListLoading}
        isFetching={isListFetching || isMetricsFetching}
        isExporting={exportMutation.isPending}
        showCharts={showCharts}
        onToggleCharts={() => setShowCharts((prev) => !prev)}
        onRefresh={handleRefresh}
        onExportExcel={handleExportExcel}
      />

      {/* 2. Quick Presets & Advanced Filter Panel */}
      <VentaReporteFilters
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
        selectedEstado={selectedEstado}
        onSelectedEstadoChange={(val) => {
          setSelectedEstado(val || "TODOS");
          setPage(1);
        }}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        onApplyPreset={handleApplyPreset}
        todayIso={getTodayIso()}
        yesterdayIso={getYesterdayIso()}
        startOfMonthIso={getStartOfMonthIso()}
      />

      {/* 3. Server-Aggregated KPI Metrics */}
      <VentaReporteMetrics
        metrics={apiMetrics}
        isLoading={isMetricsLoading}
      />

      {/* 4. Visual Breakdown Charts */}
      {showCharts && (
        <VentaReporteCharts
          metrics={apiMetrics}
          isLoading={isMetricsLoading}
        />
      )}

      {/* 5. Interactive Data Table Preview */}
      <VentaReporteTable
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
        onSelectVenta={(venta) => {
          setSelectedVenta(venta);
          setDetailSheetOpen(true);
        }}
      />

      {/* 6. Slide-Over Detail Sheet */}
      <VentaDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        venta={selectedVenta}
      />
    </div>
  );
}
