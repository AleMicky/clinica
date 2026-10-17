"use client";

import * as React from "react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useAdmisiones,
  useAdmisionMetrics,
  useExportarAdmisionesExcel,
  useOpenAdmisionPdf,
} from "../hooks/use-admisiones";
import { useConvenios } from "@/modules/servicios/convenio/hooks/use-convenio";
import {
  EstadoAdmision,
  type AdmisionResponse,
  type ExportarAdmisionesQueryParams,
  type AdmisionMetricsQueryParams,
} from "../types/admision.types";
import { AdmisionDetailSheet } from "./admision-detail-sheet";
import { AdmisionReporteHeader } from "./reporte/admision-reporte-header";
import { AdmisionReporteFilters, type DatePreset } from "./reporte/admision-reporte-filters";
import { AdmisionReporteMetrics } from "./reporte/admision-reporte-metrics";
import { AdmisionReporteCharts } from "./reporte/admision-reporte-charts";
import { AdmisionReporteTable } from "./reporte/admision-reporte-table";

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

export function AdmisionReporteView() {
  // ---------------------------------------------------------------------------
  // Filters State
  // ---------------------------------------------------------------------------
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);

  const [fechaDesde, setFechaDesde] = React.useState<string>(getStartOfMonthIso);
  const [fechaHasta, setFechaHasta] = React.useState<string>(getTodayIso);
  const [selectedEstado, setSelectedEstado] = React.useState<string>("TODOS");
  const [selectedConvenioId, setSelectedConvenioId] = React.useState<string>("TODOS");

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(15);
  const [showCharts, setShowCharts] = React.useState(true);

  // Detail sheet state
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false);
  const [selectedAdmision, setSelectedAdmision] = React.useState<AdmisionResponse | null>(null);

  // Printing state per row
  const [printingId, setPrintingId] = React.useState<number | null>(null);

  // Convenios list for selector
  const { data: conveniosData } = useConvenios({ pageSize: 200 });
  const convenios = React.useMemo(() => conveniosData?.items ?? [], [conveniosData]);

  // Mutations
  const exportMutation = useExportarAdmisionesExcel();
  const openPdfMutation = useOpenAdmisionPdf();

  // ---------------------------------------------------------------------------
  // Parsed Filters
  // ---------------------------------------------------------------------------
  const parsedEstado = React.useMemo(() => {
    if (selectedEstado === "TODOS") return undefined;
    const num = Number(selectedEstado);
    return Number.isNaN(num) ? undefined : (num as EstadoAdmision);
  }, [selectedEstado]);

  const parsedConvenioId = React.useMemo(() => {
    if (selectedConvenioId === "TODOS") return undefined;
    const num = Number(selectedConvenioId);
    return Number.isNaN(num) ? undefined : num;
  }, [selectedConvenioId]);

  // Query Params for Table (Paginated)
  const queryParams = React.useMemo(
    () => ({
      page,
      pageSize,
      search: debouncedSearch.trim() || undefined,
      estado: parsedEstado,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      convenioId: parsedConvenioId,
    }),
    [page, pageSize, debouncedSearch, parsedEstado, fechaDesde, fechaHasta, parsedConvenioId]
  );

  // Query Params for Metrics (Full filtered dataset from the server API)
  const metricsQueryParams: AdmisionMetricsQueryParams = React.useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      estado: parsedEstado,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      convenioId: parsedConvenioId,
    }),
    [debouncedSearch, parsedEstado, fechaDesde, fechaHasta, parsedConvenioId]
  );

  const {
    data: apiData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    refetch: refetchAdmisiones,
  } = useAdmisiones(queryParams);

  const {
    data: apiMetrics,
    isLoading: isMetricsLoading,
    isFetching: isMetricsFetching,
    refetch: refetchMetrics,
  } = useAdmisionMetrics(metricsQueryParams);

  const items = React.useMemo(() => apiData?.items ?? [], [apiData]);
  const totalItems = apiData?.totalItems ?? (apiMetrics?.total ?? apiMetrics?.totalHoy ?? 0);
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // ---------------------------------------------------------------------------
  // Filter Handlers
  // ---------------------------------------------------------------------------
  const handleClearFilters = React.useCallback(() => {
    setSearchTerm("");
    setFechaDesde(getStartOfMonthIso());
    setFechaHasta(getTodayIso());
    setSelectedEstado("TODOS");
    setSelectedConvenioId("TODOS");
    setPage(1);
  }, []);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      selectedEstado !== "TODOS" ||
      selectedConvenioId !== "TODOS" ||
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
    void refetchAdmisiones();
    void refetchMetrics();
  }, [refetchAdmisiones, refetchMetrics]);

  // ---------------------------------------------------------------------------
  // Export to Excel Handler
  // ---------------------------------------------------------------------------
  const handleExportExcel = async () => {
    try {
      const exportParams: ExportarAdmisionesQueryParams = {
        search: debouncedSearch.trim() || undefined,
        estado: parsedEstado,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
        convenioId: parsedConvenioId,
      };

      toast.loading("Generando reporte oficial en Excel (.xlsx)...", { id: "export-excel" });

      const blob = await exportMutation.mutateAsync(exportParams);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
      link.download = `Reporte_Admisiones_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("¡Reporte Excel descargado exitosamente!", {
        id: "export-excel",
        description: "El archivo contiene el desglose detallado de admisiones, pacientes y montos.",
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error("Error al exportar a Excel", {
        id: "export-excel",
        description: error.message || "No se pudo generar el archivo de reporte.",
      });
    }
  };

  // ---------------------------------------------------------------------------
  // Print PDF Ticket Handler with Individual Loader
  // ---------------------------------------------------------------------------
  const handlePrintPdf = async (id: number) => {
    try {
      setPrintingId(id);
      await openPdfMutation.mutateAsync(id);
    } catch {
      toast.error("Error al generar el ticket PDF");
    } finally {
      setPrintingId(null);
    }
  };

  return (
    <div className="space-y-2.5 max-w-[1600px] mx-auto pb-4">
      {/* 1. Header & Quick Actions */}
      <AdmisionReporteHeader
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
      <AdmisionReporteFilters
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
        selectedConvenioId={selectedConvenioId}
        onSelectedConvenioIdChange={(val) => {
          setSelectedConvenioId(val || "TODOS");
          setPage(1);
        }}
        convenios={convenios}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        onApplyPreset={handleApplyPreset}
        todayIso={getTodayIso()}
        yesterdayIso={getYesterdayIso()}
        startOfMonthIso={getStartOfMonthIso()}
      />

      {/* 3. Server-Aggregated KPI Metrics */}
      <AdmisionReporteMetrics
        metrics={apiMetrics}
        isLoading={isMetricsLoading}
      />

      {/* 4. Visual Breakdown Charts (Collapsible & Populated from API) */}
      {showCharts && (
        <AdmisionReporteCharts
          metrics={apiMetrics}
          isLoading={isMetricsLoading}
        />
      )}

      {/* 5. Interactive Data Table Preview */}
      <AdmisionReporteTable
        items={items}
        totalItems={totalItems}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        isLoading={isListLoading}
        hasActiveFilters={hasActiveFilters}
        printingId={printingId}
        onClearFilters={handleClearFilters}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        onSelectAdmision={(adm) => {
          setSelectedAdmision(adm);
          setDetailSheetOpen(true);
        }}
        onPrintPdf={handlePrintPdf}
      />

      {/* 6. Slide-Over Detail Sheet */}
      <AdmisionDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        admision={selectedAdmision}
      />
    </div>
  );
}
