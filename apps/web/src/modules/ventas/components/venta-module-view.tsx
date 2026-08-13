"use client";

import * as React from "react";
import { toast } from "sonner";
import { VentaHeader } from "./venta-header";
import { VentaMetricsCards } from "./venta-metrics";
import { VentaTable } from "./venta-table";
import { VentaFormDialog } from "./venta-form-dialog";
import { VentaDetailSheet } from "./venta-detail-sheet";
import { VentaStatusDialog } from "./venta-status-dialog";
import { ConfirmDeleteDialog } from "@/components/shared";

import {
  useAnularVenta,
  useCambiarEstadoVenta,
  useVentas,
} from "../hooks/use-ventas";
import {
  EstadoVenta,
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

  // Modal State: Cambiar Estado
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [selectedVentaForStatus, setSelectedVentaForStatus] =
    React.useState<VentaResponse | null>(null);

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

  // Handlers
  const handleOpenAdd = () => {
    setFormDialogOpen(true);
  };

  const handleViewDetail = (venta: VentaResponse) => {
    setSelectedVentaForDetail(venta);
    setDetailSheetOpen(true);
  };

  const handleOpenStatusDialog = (venta: VentaResponse) => {
    setSelectedVentaForStatus(venta);
    setStatusDialogOpen(true);
  };

  const handleOpenAnular = (id: number) => {
    setVentaToAnularId(id);
    setAnularDialogOpen(true);
  };

  const handleConfirmStatusChange = async (
    targetEstado: EstadoVenta,
    motivo?: string
  ) => {
    if (!selectedVentaForStatus) return;

    try {
      await cambiarEstadoMutation.mutateAsync({
        id: selectedVentaForStatus.id,
        data: { estadoDestino: targetEstado, motivo },
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
    <div className="flex flex-col gap-4 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera del Módulo */}
      <VentaHeader
        onAddClick={handleOpenAdd}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Tarjetas de Métricas */}
      <VentaMetricsCards metrics={metrics} />

      {/* Tabla de Ventas */}
      <VentaTable
        ventas={ventas}
        isLoading={isLoading}
        totalItems={apiData?.totalItems ?? ventas.length}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedEstadoTab={selectedEstadoTab}
        onEstadoTabChange={handleEstadoTabChange}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onViewDetail={handleViewDetail}
        onChangeStatus={handleOpenStatusDialog}
        onAnular={handleOpenAnular}
        onRefresh={() => refetch()}
      />

      {/* Modal: Nueva Venta */}
      <VentaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSuccessCallback={() => refetch()}
      />

      {/* Sheet: Detalle Ficha Venta */}
      <VentaDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        venta={selectedVentaForDetail}
        onChangeStatusClick={handleOpenStatusDialog}
      />

      {/* Modal: Cambiar Estado */}
      <VentaStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        venta={selectedVentaForStatus}
        onConfirm={handleConfirmStatusChange}
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
