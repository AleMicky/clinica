"use client";

import * as React from "react";
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
  // Paginación y búsqueda
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedEstadoTab, setSelectedEstadoTab] = React.useState<EstadoCobro>(
    EstadoCobro.Registrado
  );

  // Estado Master-Detail
  const [selectedCobroForDetail, setSelectedCobroForDetail] =
    React.useState<CobroResponse | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false);

  // Modal Anular
  const [anularDialogOpen, setAnularDialogOpen] = React.useState(false);
  const [cobroToAnular, setCobroToAnular] = React.useState<CobroResponse | null>(
    null
  );

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Consulta de lista filtrada por estado
  const {
    data: apiData,
    isLoading,
    isRefetching,
    refetch,
  } = useCobros({
    page: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
    estado: selectedEstadoTab,
  });

  // Consulta para métricas globales
  const { data: allCobrosData } = useCobros({
    pageSize: 100,
  });

  const cobros: CobroResponse[] = Array.isArray(apiData?.items)
    ? apiData.items
    : Array.isArray(apiData)
    ? (apiData as unknown as CobroResponse[])
    : [];

  const totalItems = apiData?.totalItems ?? cobros.length;

  const allCobrosList: CobroResponse[] = Array.isArray(allCobrosData?.items)
    ? allCobrosData.items
    : cobros;

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
      } else {
        const isPending =
          c.estado === EstadoCobro.Registrado &&
          (c.total === 0 || (c.detalles && c.detalles.length === 0));

        if (isPending) {
          pendientesCobroCount++;
        } else {
          completadosCount++;
          montoTotal += Number(c.total) || 0;
        }
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

  // Auto-seleccionar primer cobro en pantallas grandes
  React.useEffect(() => {
    if (cobros.length > 0) {
      if (!selectedCobroForDetail) {
        setSelectedCobroForDetail(cobros[0]);
      } else {
        const updated = cobros.find((c) => c.id === selectedCobroForDetail.id);
        if (updated) {
          setSelectedCobroForDetail(updated);
        }
      }
    }
  }, [cobros]);

  // Handlers
  const handleSelectCobro = (cobro: CobroResponse) => {
    setSelectedCobroForDetail(cobro);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setDetailSheetOpen(true);
    }
  };

  const handlePromptAnular = (cobro: CobroResponse) => {
    setCobroToAnular(cobro);
    setAnularDialogOpen(true);
  };

  const handleEstadoTabChange = (tab: EstadoCobro) => {
    setSelectedEstadoTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera del Módulo */}
      <CobroHeader onRefresh={() => refetch()} isRefreshing={isRefetching} />

      {/* Tarjetas de Métricas */}
      <CobroMetrics metrics={metrics} isLoading={isLoading} />

      {/* CUERPO PRINCIPAL: MASTER - DETAIL SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* PANEL IZQUIERDO: MASTER LIST (7 Columnas) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-2.5">
          <CobroList
            cobros={cobros}
            isLoading={isLoading}
            totalItems={totalItems}
            currentPage={currentPage}
            pageSize={pageSize}
            searchTerm={searchTerm}
            selectedEstadoTab={selectedEstadoTab}
            selectedCobroId={selectedCobroForDetail?.id ?? null}
            onEstadoTabChange={handleEstadoTabChange}
            onSearchChange={setSearchTerm}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            onSelectCobro={handleSelectCobro}
            onAnular={handlePromptAnular}
            onRefresh={() => refetch()}
          />
        </div>

        {/* PANEL DERECHO: DETAIL / TERMINAL DE COBRO (5 Columnas - Sticky en Desktop) */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-5 sticky top-4 space-y-2.5">
          <CobroDetailCard
            cobro={selectedCobroForDetail}
            onSuccessCobro={() => refetch()}
            onAnular={handlePromptAnular}
          />
        </div>
      </div>

      {/* Sheet: Detalle Ficha Cobro (Para Móvil o Pantallas Pequeñas) */}
      <CobroDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        cobro={selectedCobroForDetail}
        onSuccessCobro={() => refetch()}
        onAnular={handlePromptAnular}
      />

      {/* Modal: Confirmación de Anulación de Cobro */}
      <CobroAnularDialog
        open={anularDialogOpen}
        onOpenChange={setAnularDialogOpen}
        cobro={cobroToAnular}
        onSuccessCallback={() => refetch()}
      />
    </div>
  );
}
