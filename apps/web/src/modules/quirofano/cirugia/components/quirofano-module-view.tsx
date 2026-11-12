"use client";

import * as React from "react";
import { QuirofanoHeader } from "./quirofano-header";
import { QuirofanoMetrics } from "./quirofano-metrics";
import { QuirofanoList } from "./quirofano-list";
import { QuirofanoFormDialog } from "./quirofano-form-dialog";
import { QuirofanoProtocoloDialog } from "./quirofano-protocolo-dialog";
import { QuirofanoDetailDialog } from "./quirofano-detail-dialog";
import { QuirofanoIniciarDialog } from "./quirofano-iniciar-dialog";
import { QuirofanoCancelarDialog } from "./quirofano-cancelar-dialog";
import { useCirugias, useCirugiaMetrics } from "../hooks/use-quirofano";
import type {
  CirugiaResponse,
  EstadoCirugia,
} from "../types/quirofano.types";

export function QuirofanoModuleView() {
  // Query parameters state
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedEstado, setSelectedEstado] = React.useState<EstadoCirugia | undefined>(undefined);
  const [page, setPage] = React.useState(1);
  const pageSize = 12;

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Queries
  const {
    data: cirugiasData,
    isLoading: isLoadingCirugias,
    isRefetching,
    refetch: refetchCirugias,
  } = useCirugias({
    search: debouncedSearch || undefined,
    estado: selectedEstado,
    page,
    pageSize,
  });

  const {
    data: metricsData,
    isLoading: isLoadingMetrics,
    refetch: refetchMetrics,
  } = useCirugiaMetrics();

  const handleRefresh = () => {
    refetchCirugias();
    refetchMetrics();
  };

  // Dialog states
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [selectedCirugiaForDetail, setSelectedCirugiaForDetail] = React.useState<CirugiaResponse | null>(null);

  const [isProtocoloOpen, setIsProtocoloOpen] = React.useState(false);
  const [isFinalizarOpen, setIsFinalizarOpen] = React.useState(false);
  const [selectedCirugiaForMaterials, setSelectedCirugiaForMaterials] = React.useState<CirugiaResponse | null>(null);

  const [isIniciarOpen, setIsIniciarOpen] = React.useState(false);
  const [selectedCirugiaForIniciar, setSelectedCirugiaForIniciar] = React.useState<CirugiaResponse | null>(null);

  const [isCancelarOpen, setIsCancelarOpen] = React.useState(false);
  const [selectedCirugiaForCancelar, setSelectedCirugiaForCancelar] = React.useState<CirugiaResponse | null>(null);

  // Handlers
  const handleNewCirugia = () => {
    setIsFormOpen(true);
  };

  const handleViewDetail = (cirugia: CirugiaResponse) => {
    setSelectedCirugiaForDetail(cirugia);
    setIsDetailOpen(true);
  };

  const handleIniciar = (cirugia: CirugiaResponse) => {
    setSelectedCirugiaForIniciar(cirugia);
    setIsIniciarOpen(true);
  };

  const handleProtocoloGastos = (cirugia: CirugiaResponse) => {
    setSelectedCirugiaForMaterials(cirugia);
    setIsProtocoloOpen(true);
  };

  const handleFinalizar = (cirugia: CirugiaResponse) => {
    setSelectedCirugiaForMaterials(cirugia);
    setIsFinalizarOpen(true);
  };

  const handleCancelar = (cirugia: CirugiaResponse) => {
    setSelectedCirugiaForCancelar(cirugia);
    setIsCancelarOpen(true);
  };

  const handleEstadoChange = (estado: EstadoCirugia | undefined) => {
    setSelectedEstado(estado);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <QuirofanoHeader
        onNewCirugiaClick={handleNewCirugia}
        onRefreshClick={handleRefresh}
        isRefreshing={isRefetching}
      />

      {/* Metrics Cards */}
      <QuirofanoMetrics
        metrics={metricsData}
        isLoading={isLoadingMetrics}
      />

      {/* List with Filters & Actions */}
      <QuirofanoList
        cirugias={cirugiasData?.items ?? []}
        isLoading={isLoadingCirugias}
        onViewDetail={handleViewDetail}
        onIniciar={handleIniciar}
        onProtocoloGastos={handleProtocoloGastos}
        onFinalizar={handleFinalizar}
        onCancelar={handleCancelar}
        onSearchChange={setSearch}
        onEstadoChange={handleEstadoChange}
        selectedEstado={selectedEstado}
      />

      {/* Dialogs */}
      <QuirofanoFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccessCallback={handleRefresh}
      />

      <QuirofanoDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        cirugia={selectedCirugiaForDetail}
      />

      {/* Registro continuo de materiales en curso */}
      <QuirofanoProtocoloDialog
        open={isProtocoloOpen}
        onOpenChange={setIsProtocoloOpen}
        cirugia={selectedCirugiaForMaterials}
        isFinalizeMode={false}
        onSuccessCallback={handleRefresh}
      />

      {/* Cierre Quirúrgico & Descuento en Almacén */}
      <QuirofanoProtocoloDialog
        open={isFinalizarOpen}
        onOpenChange={setIsFinalizarOpen}
        cirugia={selectedCirugiaForMaterials}
        isFinalizeMode={true}
        onSuccessCallback={handleRefresh}
      />

      <QuirofanoIniciarDialog
        open={isIniciarOpen}
        onOpenChange={setIsIniciarOpen}
        cirugia={selectedCirugiaForIniciar}
      />

      <QuirofanoCancelarDialog
        open={isCancelarOpen}
        onOpenChange={setIsCancelarOpen}
        cirugia={selectedCirugiaForCancelar}
      />
    </div>
  );
}
