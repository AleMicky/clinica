"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { cobroKeys } from "../api/cobro.key";
import { useCobros } from "../hooks/use-cobros";
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

  // Estado del ticket activo y switcher móvil
  const [selectedCobroId, setSelectedCobroId] = React.useState<number | null>(null);
  const [mobileTab, setMobileTab] = React.useState<"cola" | "terminal">("cola");

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

  // Cálculo de Métricas en vivo
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

  const isGlobalRefreshing = isRefetchingCobros || isRefetchingMetrics;

  return (
    <div className="h-[calc(100dvh-5.75rem)] sm:h-[calc(100dvh-7.75rem)] lg:h-[calc(100dvh-9rem)] max-h-[calc(100dvh-9rem)] flex flex-col gap-2.5 w-full animate-in fade-in-50 duration-200 overflow-hidden">
      {/* Cabecera del Módulo con Métricas Integradas en Línea */}
      <CobroHeader
        metrics={metrics}
        onRefresh={handleRefreshAll}
        isRefreshing={isGlobalRefreshing}
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
