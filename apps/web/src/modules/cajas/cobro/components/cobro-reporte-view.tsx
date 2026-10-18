"use client";

import * as React from "react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useCobros,
  useCobroMetrics,
  useExportarCobrosExcel,
} from "../hooks/use-cobros";
import {
  EstadoCobro,
  type CobroResponse,
  type ExportarCobrosQueryParams,
  type CobroQueryParams,
} from "../types/cobro.types";
import { CobroDetailSheet } from "./cobro-detail-sheet";
import { CobroReporteHeader } from "./reporte/cobro-reporte-header";
import { CobroReporteFilters, type DatePreset } from "./reporte/cobro-reporte-filters";
import { CobroReporteMetrics } from "./reporte/cobro-reporte-metrics";
import { CobroReporteCharts } from "./reporte/cobro-reporte-charts";
import { CobroReporteTable } from "./reporte/cobro-reporte-table";

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

export function CobroReporteView() {
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
  const [selectedCobro, setSelectedCobro] = React.useState<CobroResponse | null>(null);

  // Export Mutation
  const exportMutation = useExportarCobrosExcel();

  // ---------------------------------------------------------------------------
  // Parsed Filters
  // ---------------------------------------------------------------------------
  const parsedEstado = React.useMemo(() => {
    if (selectedEstado === "TODOS") return undefined;
    const num = Number(selectedEstado);
    return Number.isNaN(num) ? undefined : (num as EstadoCobro);
  }, [selectedEstado]);

  // Query Params for Table (Paginated)
  const queryParams: CobroQueryParams = React.useMemo(
    () => ({
      page,
      pageSize,
      search: debouncedSearch.trim() || undefined,
      estado: parsedEstado,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
    }),
    [page, pageSize, debouncedSearch, parsedEstado, fechaDesde, fechaHasta]
  );

  // Query Params for Metrics
  const metricsQueryParams = React.useMemo(
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
    refetch: refetchCobros,
  } = useCobros(queryParams);

  const {
    data: apiMetrics,
    isLoading: isMetricsLoading,
    isFetching: isMetricsFetching,
    refetch: refetchMetrics,
  } = useCobroMetrics(metricsQueryParams);

  const items = React.useMemo(() => apiData?.items ?? [], [apiData]);
  const totalItems = apiData?.totalItems ?? (apiMetrics?.totalCobros ?? 0);
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
    void refetchCobros();
    void refetchMetrics();
  }, [refetchCobros, refetchMetrics]);

  // ---------------------------------------------------------------------------
  // Export to Excel Handler
  // ---------------------------------------------------------------------------
  const handleExportExcel = async () => {
    try {
      const exportParams: ExportarCobrosQueryParams = {
        search: debouncedSearch.trim() || undefined,
        estado: parsedEstado,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
      };

      toast.loading("Generando reporte oficial de cobranzas en Excel (.xlsx)...", {
        id: "export-excel-cobros",
      });

      const blob = await exportMutation.mutateAsync(exportParams);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      link.download = `reporte_cobranzas_${stamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Reporte de cobranzas descargado exitosamente", {
        id: "export-excel-cobros",
      });
    } catch {
      toast.error("Ocurrió un error al generar el archivo Excel", {
        id: "export-excel-cobros",
      });
    }
  };

  return (
    <div className="space-y-4 pb-12 w-full min-w-0">
      {/* 1. Header Toolbar */}
      <CobroReporteHeader
        totalItems={totalItems}
        isLoading={isListLoading}
        isFetching={isListFetching}
        isExporting={exportMutation.isPending}
        showCharts={showCharts}
        onToggleCharts={() => setShowCharts((prev) => !prev)}
        onRefresh={handleRefresh}
        onExportExcel={handleExportExcel}
      />

      {/* 2. Filters & Presets Panel */}
      <CobroReporteFilters
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
          setSelectedEstado(val);
          setPage(1);
        }}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        onApplyPreset={handleApplyPreset}
        todayIso={getTodayIso()}
        yesterdayIso={getYesterdayIso()}
        startOfMonthIso={getStartOfMonthIso()}
      />

      {/* 3. Executive Metrics KPI Cards */}
      <CobroReporteMetrics
        metrics={apiMetrics}
        isLoading={isMetricsLoading}
      />

      {/* 4. Interactive Charts & Distribution (Toggable) */}
      {showCharts && (
        <CobroReporteCharts
          metrics={apiMetrics}
          isLoading={isMetricsLoading}
        />
      )}

      {/* 5. Detailed Data Table */}
      <CobroReporteTable
        items={items}
        totalItems={totalItems}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        isLoading={isListLoading}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        onSelectCobro={(cobro) => {
          setSelectedCobro(cobro);
          setDetailSheetOpen(true);
        }}
      />

      {/* 6. Receipt Detail Sheet Modal (Modo Solo Consulta) */}
      <CobroDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        cobro={selectedCobro}
        readOnly
      />
    </div>
  );
}
