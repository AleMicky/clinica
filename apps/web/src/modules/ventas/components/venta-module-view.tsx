"use client";

import * as React from "react";
import { toast } from "sonner";
import { VentaHeader } from "./venta-header";
import { VentaMetricsCards } from "./venta-metrics";
import { VentaList } from "./venta-list";
import { VentaFormDialog } from "./venta-form-dialog";
import { VentaDetailSheet } from "./venta-detail-sheet";
import { VentaDetailCard } from "./venta-detail-card";
import { VentaStatusDialog } from "./venta-status-dialog";
import { VentaConfirmStatusDialog } from "./venta-confirm-status-dialog";
import { ConfirmDeleteDialog } from "@/components/shared";

import {
  useAnularVenta,
  useCambiarEstadoVenta,
  useVentas,
} from "../hooks/use-ventas";
import {
  EstadoVenta,
  EstadoVentaLabels,
  type VentaMetrics,
  type VentaResponse,
} from "../types/ventas.types";

export function VentaModuleView() {
  // Modal State: Form Nueva Venta
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);

  // Modal State: Ficha Detalle Venta
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false);
  const [selectedVentaForDetail, setSelectedVentaForDetail] =
    React.useState<VentaResponse | null>(null);

  // Modal State: Cambiar Estado con Formulario
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [selectedVentaForStatus, setSelectedVentaForStatus] =
    React.useState<VentaResponse | null>(null);

  // Modal State: Alerta de Confirmación de Cambio de Estado
  const [confirmStatusDialogOpen, setConfirmStatusDialogOpen] = React.useState(false);
  const [statusChangeCandidate, setStatusChangeCandidate] = React.useState<{
    venta: VentaResponse;
    targetEstado: EstadoVenta;
    motivo?: string;
  } | null>(null);

  // Modal State: Anular Venta
  const [anularDialogOpen, setAnularDialogOpen] = React.useState(false);
  const [ventaToAnularId, setVentaToAnularId] = React.useState<number | null>(null);

  // Filters & Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedEstadoTab, setSelectedEstadoTab] = React.useState<
    EstadoVenta | "TODOS"
  >("TODOS");

  // React Query Fetch
  const {
    data: apiData,
    isLoading,
    isRefetching,
    refetch,
  } = useVentas({
    pageNumber: currentPage,
    pageSize: pageSize,
    search: searchTerm.trim() || undefined,
    estado: selectedEstadoTab === "TODOS" ? undefined : selectedEstadoTab,
  });

  const cambiarEstadoMutation = useCambiarEstadoVenta();
  const anularMutation = useAnularVenta();

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleEstadoTabChange = (tab: EstadoVenta | "TODOS") => {
    setSelectedEstadoTab(tab);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const ventas: VentaResponse[] = apiData?.items ?? [];

  // Metrics calculation
  const totalVentas = apiData?.totalItems ?? ventas.length;
  const pendientes = ventas.filter((v) => v.estado === EstadoVenta.Pendiente).length;
  const pagadas = ventas.filter((v) => v.estado === EstadoVenta.Pagada).length;
  const anuladas = ventas.filter((v) => v.estado === EstadoVenta.Anulada).length;
  const montoTotal = ventas.reduce((acc, v) => acc + (v.total || 0), 0);

  const metrics: VentaMetrics = {
    totalVentas,
    pendientes,
    pagadas,
    anuladas,
    montoTotal,
  };

  // Auto-seleccionar la primera venta para la vista Master-Detail en pantallas grandes
  React.useEffect(() => {
    if (ventas.length > 0) {
      if (!selectedVentaForDetail) {
        setSelectedVentaForDetail(ventas[0]);
      } else {
        const updated = ventas.find((v) => v.id === selectedVentaForDetail.id);
        if (updated) {
          setSelectedVentaForDetail(updated);
        }
      }
    }
  }, [ventas]);

  // Handlers
  const handleOpenAdd = () => {
    setFormDialogOpen(true);
  };

  const handleViewDetail = (venta: VentaResponse) => {
    setSelectedVentaForDetail(venta);
    // En móviles/tablets abre el panel sheet deslizable
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setDetailSheetOpen(true);
    }
  };

  const handleOpenStatusDialog = (venta: VentaResponse) => {
    setSelectedVentaForStatus(venta);
    setStatusDialogOpen(true);
  };

  const handleOpenAnular = (id: number) => {
    setVentaToAnularId(id);
    setAnularDialogOpen(true);
  };

  const handleRequestDirectChangeStatus = (
    venta: VentaResponse,
    nuevoEstado: EstadoVenta
  ) => {
    setStatusChangeCandidate({
      venta,
      targetEstado: nuevoEstado,
      motivo: `Cambio a ${EstadoVentaLabels[nuevoEstado]}`,
    });
    setConfirmStatusDialogOpen(true);
  };

  const handleExecuteStatusChange = async () => {
    if (!statusChangeCandidate) return;
    const { venta, targetEstado, motivo } = statusChangeCandidate;

    try {
      await cambiarEstadoMutation.mutateAsync({
        id: venta.id,
        data: {
          estadoDestino: targetEstado,
          motivo: motivo || `Cambio de estado a ${EstadoVentaLabels[targetEstado]}`,
        },
      });
      toast.success(
        `Venta #${venta.numero} actualizada a "${EstadoVentaLabels[targetEstado]}".`
      );
      refetch();
    } catch {
      toast.error("No se pudo actualizar el estado de la venta.");
    } finally {
      setStatusChangeCandidate(null);
      setConfirmStatusDialogOpen(false);
    }
  };

  const handleConfirmStatusChange = async (
    targetEstado: EstadoVenta,
    motivo?: string
  ) => {
    if (!selectedVentaForStatus) return;

    try {
      await cambiarEstadoMutation.mutateAsync({
        id: selectedVentaForStatus.id,
        data: {
          estadoDestino: targetEstado,
          motivo: motivo || `Cambio de estado a ${EstadoVentaLabels[targetEstado]}`,
        },
      });
      toast.success(
        `Estado de la venta #${selectedVentaForStatus.numero} actualizado.`
      );
      refetch();
    } catch {
      toast.error("No se pudo actualizar el estado de la venta.");
    }
  };

  const handleConfirmAnular = async () => {
    if (!ventaToAnularId) return;

    try {
      await anularMutation.mutateAsync(ventaToAnularId);
      toast.success("Comprobante de venta anulado correctamente.");
      refetch();
    } catch {
      toast.error("Ocurrió un error al anular el comprobante de venta.");
    } finally {
      setVentaToAnularId(null);
      setAnularDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera del Módulo */}
      <VentaHeader
        onAddClick={handleOpenAdd}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Tarjetas de Métricas */}
      <VentaMetricsCards metrics={metrics} />

      {/* CUERPO PRINCIPAL: MASTER - DETAIL SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* PANEL IZQUIERDO: MASTER LIST (7 Columnas) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-2.5">
          <VentaList
            ventas={ventas}
            isLoading={isLoading}
            totalItems={apiData?.totalItems ?? ventas.length}
            currentPage={currentPage}
            pageSize={pageSize}
            searchTerm={searchTerm}
            selectedEstadoTab={selectedEstadoTab}
            selectedVentaId={selectedVentaForDetail?.id ?? null}
            onEstadoTabChange={handleEstadoTabChange}
            onSearchChange={handleSearchChange}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
            onViewDetail={handleViewDetail}
            onDirectChangeStatus={handleRequestDirectChangeStatus}
            onChangeStatus={handleOpenStatusDialog}
            onAnular={handleOpenAnular}
            onRefresh={() => refetch()}
          />
        </div>

        {/* PANEL DERECHO: DETAIL CARD (5 Columnas - Sticky en Desktop) */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-5 sticky top-4 space-y-2.5">
          <VentaDetailCard
            venta={selectedVentaForDetail}
            onDirectChangeStatus={handleRequestDirectChangeStatus}
            onChangeStatusClick={handleOpenStatusDialog}
            onAnularClick={handleOpenAnular}
          />
        </div>
      </div>

      {/* Modal: Nueva Venta */}
      <VentaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSuccessCallback={() => refetch()}
      />

      {/* Sheet: Detalle Ficha Venta (Para Móvil o Pantallas Pequeñas) */}
      <VentaDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        venta={selectedVentaForDetail}
        onChangeStatusClick={handleOpenStatusDialog}
      />

      {/* Modal: Cambiar Estado con Formulario */}
      <VentaStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        venta={selectedVentaForStatus}
        onConfirm={handleConfirmStatusChange}
        isLoading={cambiarEstadoMutation.isPending}
      />

      {/* Alert Dialog: Confirmación Rápida de Cambio de Estado */}
      <VentaConfirmStatusDialog
        open={confirmStatusDialogOpen}
        onOpenChange={setConfirmStatusDialogOpen}
        venta={statusChangeCandidate?.venta ?? null}
        targetEstado={statusChangeCandidate?.targetEstado ?? null}
        onConfirm={handleExecuteStatusChange}
        isLoading={cambiarEstadoMutation.isPending}
      />

      {/* Modal: Confirmación de Anulación */}
      <ConfirmDeleteDialog
        open={anularDialogOpen}
        onOpenChange={setAnularDialogOpen}
        onConfirm={handleConfirmAnular}
        title="¿Anular este comprobante de venta?"
        description="Esta acción cambiará el estado de la venta a Anulada y cancelará las asignaciones de pagadores. ¿Desea continuar?"
        isLoading={anularMutation.isPending}
      />
    </div>
  );
}
