"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { cobroKeys } from "../api/cobro.key";
import { useCobroMetrics, useCobros } from "../hooks/use-cobros";
import { CobroHeader } from "./cobro-header";
import { CobroList } from "./cobro-list";
import { CobroDetailCard } from "./cobro-detail-card";
import { CobroAnularDialog } from "./cobro-anular-dialog";
import {
  CreditCard,
  ListOrdered,
} from "lucide-react";
import {
  EstadoCobro,
  type CobroMetrics as CobroMetricsType,
  type CobroResponse,
} from "../types/cobro.types";

function getTodayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function CobroModuleView() {
  const queryClient = useQueryClient();

  // Paginación y filtros
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedEstadoTab, setSelectedEstadoTab] = React.useState<
    EstadoCobro | "TODOS"
  >("TODOS");
  // Rango de fechas por defecto: el día de hoy
  const [fechaDesde, setFechaDesde] = React.useState<string>(getTodayIso);
  const [fechaHasta, setFechaHasta] = React.useState<string>(getTodayIso);

  // Estado del ticket activo y switcher móvil
  const [selectedCobroId, setSelectedCobroId] = React.useState<number | null>(null);
  const [mobileTab, setMobileTab] = React.useState<"cola" | "terminal">("cola");

  // Modal Anular
  const [anularDialogOpen, setAnularDialogOpen] = React.useState(false);
  const [cobroToAnular, setCobroToAnular] = React.useState<CobroResponse | null>(null);

  // Consulta de lista filtrada por estado, búsqueda y rango de fechas
  const {
    data: apiData,
    isLoading: isLoadingCobros,
    isRefetching: isRefetchingCobros,
  } = useCobros({
    page: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
    estado: selectedEstadoTab === "TODOS" ? undefined : selectedEstadoTab,
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
  });

  // Consulta de métricas calculadas en el backend
  const {
    data: metricsData,
    isRefetching: isRefetchingMetrics,
  } = useCobroMetrics({
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
  });

  // Normalización de cobros de la página
  const cobros: CobroResponse[] = React.useMemo(() => {
    if (Array.isArray(apiData?.items)) return apiData.items;
    if (Array.isArray(apiData)) return apiData as unknown as CobroResponse[];
    return [];
  }, [apiData]);

  const totalItems = apiData?.totalItems ?? cobros.length;

  // Métricas obtenidas directamente del backend
  const metrics: CobroMetricsType = React.useMemo(() => {
    return {
      totalCobros: metricsData?.totalCobros ?? 0,
      pendientesCobro: metricsData?.pendientesCobro ?? 0,
      completados: metricsData?.completados ?? 0,
      anulados: metricsData?.anulados ?? 0,
      totalMontoCobrado: metricsData?.totalMontoCobrado ?? 0,
    };
  }, [metricsData]);

  // Selección automática o manual del ticket activo
  const selectedCobroForDetail = React.useMemo(() => {
    if (cobros.length === 0) return null;
    if (selectedCobroId !== null) {
      const found = cobros.find((c) => c.id === selectedCobroId);
      if (found) return found;
    }
    return cobros[0] ?? null;
  }, [cobros, selectedCobroId]);

  // Refresca todas las consultas del módulo
  const handleRefreshAll = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: cobroKeys.all });
  }, [queryClient]);

  // Handlers memoizados
  const handleSearchChange = React.useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleEstadoTabChange = React.useCallback((tab: EstadoCobro | "TODOS") => {
    setSelectedEstadoTab(tab);
    setCurrentPage(1);
    setSelectedCobroId(null);
  }, []);

  const handlePageChange = React.useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = React.useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const handleSelectCobro = React.useCallback((cobro: CobroResponse) => {
    setSelectedCobroId(cobro.id);
    setMobileTab("terminal");
  }, []);

  const handleSuccessCobro = React.useCallback(() => {
    handleRefreshAll();
    setMobileTab("cola");
  }, [handleRefreshAll]);

  const handlePromptAnular = React.useCallback((cobro: CobroResponse) => {
    setCobroToAnular(cobro);
    setAnularDialogOpen(true);
  }, []);

  const handleDateRangeChange = React.useCallback((desde: string, hasta: string) => {
    setFechaDesde(desde);
    setFechaHasta(hasta);
    setCurrentPage(1);
    setSelectedCobroId(null);
  }, []);

  const handleFechaDesdeChange = React.useCallback((val: string) => {
    setFechaDesde(val);
    setCurrentPage(1);
    setSelectedCobroId(null);
  }, []);

  const handleFechaHastaChange = React.useCallback((val: string) => {
    setFechaHasta(val);
    setCurrentPage(1);
    setSelectedCobroId(null);
  }, []);

  const isGlobalRefreshing = isRefetchingCobros || isRefetchingMetrics;

  return (
    <div className="h-[calc(100dvh-5.75rem)] sm:h-[calc(100dvh-7.75rem)] lg:h-[calc(100dvh-9rem)] max-h-[calc(100dvh-9rem)] flex flex-col gap-2.5 w-full animate-in fade-in-50 duration-200 overflow-hidden">
      {/* Cabecera del Módulo con Métricas Integradas en Línea y Filtro por Fecha */}
      <CobroHeader
        metrics={metrics}
        onRefresh={handleRefreshAll}
        isRefreshing={isGlobalRefreshing}
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        onDateRangeChange={handleDateRangeChange}
        onFechaDesdeChange={handleFechaDesdeChange}
        onFechaHastaChange={handleFechaHastaChange}
      />

      {/* Selector de Pantalla para Móviles y Tablets (< lg) */}
      <div className="flex lg:hidden items-center p-0.5 rounded-lg bg-muted/60 border border-border/50 gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab("cola")}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none ${
            mobileTab === "cola"
              ? "bg-background text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ListOrdered className="size-3.5" />
          <span>Tickets ({totalItems})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("terminal")}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none ${
            mobileTab === "terminal"
              ? "bg-background text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CreditCard className="size-3.5" />
          <span>
            {selectedCobroForDetail
              ? `Cobro #${selectedCobroForDetail.numero}`
              : "Terminal"}
          </span>
        </button>
      </div>

      {/* DISPOSICIÓN ESCRITORIO (>= lg): PANTALLA DIVIDIDA LADO A LADO */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-3 flex-1 min-h-0 overflow-hidden">
        {/* PANEL IZQUIERDO: COLA DE TICKETS (35% ANCHO) */}
        <div className="lg:col-span-5 xl:col-span-4 h-full min-h-0 overflow-hidden">
          <CobroList
            cobros={cobros}
            isLoading={isLoadingCobros}
            totalItems={totalItems}
            currentPage={currentPage}
            pageSize={pageSize}
            searchTerm={searchTerm}
            selectedEstadoTab={selectedEstadoTab}
            selectedCobroId={selectedCobroForDetail?.id ?? null}
            onEstadoTabChange={handleEstadoTabChange}
            onSearchChange={handleSearchChange}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSelectCobro={handleSelectCobro}
            onAnular={handlePromptAnular}
          />
        </div>

        {/* PANEL DERECHO: TERMINAL DE COBRO DIRECTO (65% ANCHO) */}
        <div className="lg:col-span-7 xl:col-span-8 h-full min-h-0 overflow-hidden">
          <CobroDetailCard
            cobro={selectedCobroForDetail}
            onSuccessCobro={handleSuccessCobro}
            onAnular={handlePromptAnular}
          />
        </div>
      </div>

      {/* DISPOSICIÓN MÓVIL Y TABLET (< lg): PANTALLA COMPLETA SEGÚN PESTAÑA */}
      <div className="flex lg:hidden flex-1 min-h-0 overflow-hidden">
        {mobileTab === "cola" ? (
          <div className="size-full min-h-0 overflow-hidden">
            <CobroList
              cobros={cobros}
              isLoading={isLoadingCobros}
              totalItems={totalItems}
              currentPage={currentPage}
              pageSize={pageSize}
              searchTerm={searchTerm}
              selectedEstadoTab={selectedEstadoTab}
              selectedCobroId={selectedCobroForDetail?.id ?? null}
              onEstadoTabChange={handleEstadoTabChange}
              onSearchChange={handleSearchChange}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSelectCobro={handleSelectCobro}
              onAnular={handlePromptAnular}
            />
          </div>
        ) : (
          <div className="size-full min-h-0 overflow-hidden">
            <CobroDetailCard
              cobro={selectedCobroForDetail}
              onSuccessCobro={handleSuccessCobro}
              onAnular={handlePromptAnular}
              onBack={() => setMobileTab("cola")}
            />
          </div>
        )}
      </div>

      {/* Modal: Confirmación de Anulación */}
      <CobroAnularDialog
        open={anularDialogOpen}
        onOpenChange={setAnularDialogOpen}
        cobro={cobroToAnular}
        onSuccessCallback={handleRefreshAll}
      />
    </div>
  );
}
