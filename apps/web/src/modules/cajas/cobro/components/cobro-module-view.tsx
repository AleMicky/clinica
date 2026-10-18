"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { cobroKeys } from "../api/cobro.key";
import { useCobros } from "../hooks/use-cobros";
import { CobroHeader } from "./cobro-header";
import { CobroMetrics } from "./cobro-metrics";
import { CobroList } from "./cobro-list";
import { CobroDetailCard } from "./cobro-detail-card";
import { CobroDetailSheet } from "./cobro-detail-sheet";
import { CobroAnularDialog } from "./cobro-anular-dialog";
import {
  EstadoCobro,
  type CobroMetrics as CobroMetricsType,
  type CobroResponse,
} from "../types/cobro.types";

export function CobroModuleView() {
  const queryClient = useQueryClient();

  // Estados visuales y de densidad
  const [isCompact, setIsCompact] = React.useState(true);
  const [showMetrics, setShowMetrics] = React.useState(true);
  const [showDetailPanel, setShowDetailPanel] = React.useState(true);

  // Paginación y filtros
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedEstadoTab, setSelectedEstadoTab] = React.useState<
    EstadoCobro | "TODOS"
  >("TODOS");

  // Estado Master-Detail
  const [selectedCobroId, setSelectedCobroId] = React.useState<number | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false);

  // Modal Anular
  const [anularDialogOpen, setAnularDialogOpen] = React.useState(false);
  const [cobroToAnular, setCobroToAnular] = React.useState<CobroResponse | null>(null);

  // Consulta de lista filtrada por estado y búsqueda
  const {
    data: apiData,
    isLoading: isLoadingCobros,
    isRefetching: isRefetchingCobros,
  } = useCobros({
    page: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
    estado: selectedEstadoTab === "TODOS" ? undefined : selectedEstadoTab,
  });

  // Consulta para métricas globales
  const {
    data: allCobrosData,
    isLoading: isLoadingMetrics,
    isRefetching: isRefetchingMetrics,
  } = useCobros({
    pageSize: 100,
  });

  // Normalización de cobros de la página
  const cobros: CobroResponse[] = React.useMemo(() => {
    if (Array.isArray(apiData?.items)) return apiData.items;
    if (Array.isArray(apiData)) return apiData as unknown as CobroResponse[];
    return [];
  }, [apiData]);

  const totalItems = apiData?.totalItems ?? cobros.length;

  // Normalización de cobros para métricas
  const allCobrosList: CobroResponse[] = React.useMemo(() => {
    if (Array.isArray(allCobrosData?.items)) return allCobrosData.items;
    if (Array.isArray(allCobrosData)) return allCobrosData as unknown as CobroResponse[];
    return [];
  }, [allCobrosData]);

  const totalItemsCount = allCobrosData?.totalItems ?? allCobrosList.length;

  // Cálculo de Métricas
  const metrics: CobroMetricsType = React.useMemo(() => {
    let montoTotal = 0;
    let pendientesCobroCount = 0;
    let completadosCount = 0;
    let anuladosCount = 0;

    allCobrosList.forEach((c) => {
      if (c.estado === EstadoCobro.Anulado) {
        anuladosCount++;
      } else if (c.estado === EstadoCobro.Registrado) {
        pendientesCobroCount++;
      } else if (c.estado === EstadoCobro.Confirmado) {
        completadosCount++;
        montoTotal += Number(c.total) || 0;
      }
    });

    return {
      totalCobros: totalItemsCount,
      pendientesCobro: pendientesCobroCount,
      completados: completadosCount,
      anulados: anuladosCount,
      totalMontoCobrado: montoTotal,
    };
  }, [allCobrosList, totalItemsCount]);

  // Selección automática o manual
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
    queryClient.invalidateQueries({ queryKey: cobroKeys.all });
  }, [queryClient]);

  // Handlers memoizados
  const handleSearchChange = React.useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    setSelectedCobroId(null);
  }, []);

  const handleEstadoTabChange = React.useCallback((tab: EstadoCobro | "TODOS") => {
    setSelectedEstadoTab(tab);
    setCurrentPage(1);
    setSelectedCobroId(null);
  }, []);

  const handlePageChange = React.useCallback((page: number) => {
    setCurrentPage(page);
    setSelectedCobroId(null);
  }, []);

  const handlePageSizeChange = React.useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    setSelectedCobroId(null);
  }, []);

  const handleSelectCobro = React.useCallback((cobro: CobroResponse) => {
    setSelectedCobroId(cobro.id);
    const isMobileOrTablet =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches;

    if (isMobileOrTablet || !showDetailPanel) {
      setDetailSheetOpen(true);
    }
  }, [showDetailPanel]);

  const handlePromptAnular = React.useCallback((cobro: CobroResponse) => {
    setCobroToAnular(cobro);
    setAnularDialogOpen(true);
  }, []);

  const isGlobalRefreshing = isRefetchingCobros || isRefetchingMetrics;
  const isGlobalLoading = isLoadingCobros || isLoadingMetrics;

  return (
    <div className="flex flex-col gap-2.5 w-full animate-in fade-in-50 duration-200">
      {/* Cabecera del Módulo con Barra de Controles Compactos */}
      <CobroHeader
        onRefresh={handleRefreshAll}
        isRefreshing={isGlobalRefreshing}
        showMetrics={showMetrics}
        onToggleMetrics={() => setShowMetrics((prev) => !prev)}
        isCompact={isCompact}
        onToggleCompact={() => setIsCompact((prev) => !prev)}
        showDetailPanel={showDetailPanel}
        onToggleDetailPanel={() => setShowDetailPanel((prev) => !prev)}
      />

      {/* Tarjetas / Ribbon de Métricas (Colapsable y Compactable) */}
      {showMetrics && (
        <CobroMetrics
          metrics={metrics}
          isLoading={isGlobalLoading}
          isCompact={isCompact}
        />
      )}

      {/* CUERPO PRINCIPAL: MASTER - DETAIL SPLIT LAYOUT DINÁMICO */}
      <div
        className={`grid gap-2.5 items-start ${
          showDetailPanel
            ? "grid-cols-1 lg:grid-cols-12"
            : "grid-cols-1"
        }`}
      >
        {/* PANEL IZQUIERDO: MASTER LIST (Expandible a 12 o 7 cols) */}
        <div
          className={`${
            showDetailPanel ? "lg:col-span-7 xl:col-span-7" : "w-full"
          } space-y-2`}
        >
          <CobroList
            cobros={cobros}
            isLoading={isLoadingCobros}
            isCompact={isCompact}
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

        {/* PANEL DERECHO: DETAIL / TERMINAL DE COBRO (Sticky en Desktop) */}
        {showDetailPanel && (
          <div className="hidden lg:block lg:col-span-5 xl:col-span-5 sticky top-3 space-y-2">
            <CobroDetailCard
              cobro={selectedCobroForDetail}
              onSuccessCobro={handleRefreshAll}
              onAnular={handlePromptAnular}
            />
          </div>
        )}
      </div>

      {/* Sheet: Detalle Ficha Cobro (Para Móvil o cuando el panel lateral está colapsado) */}
      <CobroDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        cobro={selectedCobroForDetail}
        onSuccessCobro={handleRefreshAll}
        onAnular={handlePromptAnular}
      />

      {/* Modal: Confirmación de Anulación de Cobro */}
      <CobroAnularDialog
        open={anularDialogOpen}
        onOpenChange={setAnularDialogOpen}
        cobro={cobroToAnular}
        onSuccessCallback={handleRefreshAll}
      />
    </div>
  );
}
