"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdmisionHeader } from "./admision-header";
import { AdmisionMetricsCards } from "./admision-metrics";
import { AdmisionList } from "./admision-list";
import { AdmisionDetailSheet } from "./admision-detail-sheet";
import { AdmisionStatusDialog } from "./admision-status-dialog";
import { AdmisionConfirmStatusDialog } from "./admision-confirm-status-dialog";
import { ConfirmDeleteDialog } from "@/components/shared";
import {
  useAdmisiones,
  useCambiarEstadoAdmision,
  useDeleteAdmision,
} from "../hooks/use-admisiones";
import {
  EstadoAdmision,
  EstadoAdmisionLabels,
  type AdmisionCounts,
  type AdmisionMetrics,
  type AdmisionResponse,
  type EstadoAdmisionTab,
} from "../types/admision.types";

export function AdmisionModuleView() {
  const router = useRouter();

  // Modal State: Panel deslizable de Detalle Ficha
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false);
  const [selectedAdmisionForDetail, setSelectedAdmisionForDetail] =
    React.useState<AdmisionResponse | null>(null);

  // Modal State: Cambiar Estado
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [selectedAdmisionForStatus, setSelectedAdmisionForStatus] =
    React.useState<AdmisionResponse | null>(null);

  // Modal State: Alerta de Confirmación de Estado (Alert Dialog)
  const [confirmStatusDialogOpen, setConfirmStatusDialogOpen] = React.useState(false);
  const [statusChangeCandidate, setStatusChangeCandidate] = React.useState<{
    admision: AdmisionResponse;
    targetEstado: EstadoAdmision;
    motivo?: string;
  } | null>(null);

  // Modal State: Eliminar/Cancelar Admisión
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [admisionToDeleteId, setAdmisionToDeleteId] = React.useState<number | null>(null);

  // Filtros & Paginación
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedEstadoTab, setSelectedEstadoTab] = React.useState<EstadoAdmisionTab>("TODOS");

  // Fetch de React Query para la lista filtrada
  const {
    data: apiData,
    isLoading,
    refetch,
  } = useAdmisiones({
    page: currentPage,
    pageSize: pageSize,
    search: searchTerm.trim() || undefined,
    estado: selectedEstadoTab === "TODOS" ? undefined : selectedEstadoTab,
  });

  // Fetch para métricas globales del día
  const { data: allAdmisionesData } = useAdmisiones({
    pageSize: 100,
  });

  const cambiarEstadoMutation = useCambiarEstadoAdmision();
  const deleteMutation = useDeleteAdmision();

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleEstadoTabChange = (tab: EstadoAdmisionTab) => {
    setSelectedEstadoTab(tab);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const admisiones: AdmisionResponse[] = apiData?.items ?? [];
  const allAdmisionesList: AdmisionResponse[] = allAdmisionesData?.items ?? admisiones;

  // Cálculo de Métricas en Vivo
  const totalHoy = allAdmisionesData?.totalItems ?? allAdmisionesList.length;
  const registradas = allAdmisionesList.filter(
    (a) => a.estado === EstadoAdmision.Registrada
  ).length;
  const confirmadas = allAdmisionesList.filter(
    (a) => a.estado === EstadoAdmision.Confirmada
  ).length;
  const enviadasVenta = allAdmisionesList.filter(
    (a) => a.estado === EstadoAdmision.EnviadaVenta
  ).length;
  const canceladas = allAdmisionesList.filter(
    (a) => a.estado === EstadoAdmision.Cancelada
  ).length;

  const counts: AdmisionCounts = {
    todos: totalHoy,
    registradas,
    confirmadas,
    enviadasVenta,
    canceladas,
  };

  const montoTotalHoy = allAdmisionesList.reduce((acc, a) => {
    const total =
      a.totalAdmision ??
      a.detalles.reduce((sub, d) => sub + (d.total || 0), 0);
    return acc + total;
  }, 0);

  const metrics: AdmisionMetrics = {
    totalHoy,
    registradas,
    confirmadas,
    enviadasVenta,
    canceladas,
    montoTotalHoy,
  };

  // Handlers de navegación y modales
  const handleOpenAdd = () => {
    router.push("/recepcion/admisiones/nueva");
  };

  const handleViewDetail = (admision: AdmisionResponse) => {
    setSelectedAdmisionForDetail(admision);
    setDetailSheetOpen(true);
  };

  const handleOpenStatusDialog = (admision: AdmisionResponse) => {
    setSelectedAdmisionForStatus(admision);
    setStatusDialogOpen(true);
  };

  const handleOpenDelete = (id: number) => {
    setAdmisionToDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmStatusChange = async (
    targetEstado: EstadoAdmision,
    motivo?: string
  ) => {
    if (!selectedAdmisionForStatus) return;

    try {
      await cambiarEstadoMutation.mutateAsync({
        id: selectedAdmisionForStatus.id,
        data: {
          estadoDestino: targetEstado,
          motivo: motivo || `Cambio de estado a ${EstadoAdmisionLabels[targetEstado]}`,
        },
      });
      toast.success(
        `Estado de la admisión #${selectedAdmisionForStatus.numero} actualizado a "${EstadoAdmisionLabels[targetEstado]}".`
      );
      refetch();
    } catch (error: any) {
      const msg =
        error?.response?.data?.detail ||
        error?.message ||
        "No se pudo actualizar el estado de la admisión.";
      toast.error(msg);
    }
  };

  const handleRequestDirectChangeStatus = (
    admision: AdmisionResponse,
    nuevoEstado: EstadoAdmision
  ) => {
    setStatusChangeCandidate({
      admision,
      targetEstado: nuevoEstado,
      motivo: `Cambio a ${EstadoAdmisionLabels[nuevoEstado]}`,
    });
    setConfirmStatusDialogOpen(true);
  };

  const handleExecuteStatusChange = async () => {
    if (!statusChangeCandidate) return;
    const { admision, targetEstado, motivo } = statusChangeCandidate;

    try {
      await cambiarEstadoMutation.mutateAsync({
        id: admision.id,
        data: {
          estadoDestino: targetEstado,
          motivo: motivo || `Cambio de estado a ${EstadoAdmisionLabels[targetEstado]}`,
        },
      });
      toast.success(
        `Admisión #${admision.numero} marcada como "${EstadoAdmisionLabels[targetEstado]}".`
      );
      refetch();
    } catch (error: any) {
      const msg =
        error?.response?.data?.detail ||
        error?.message ||
        "No se pudo actualizar el estado de la admisión.";
      toast.error(msg);
    } finally {
      setStatusChangeCandidate(null);
      setConfirmStatusDialogOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!admisionToDeleteId) return;

    try {
      await deleteMutation.mutateAsync(admisionToDeleteId);
      toast.success("Admisión cancelada correctamente.");
      refetch();
    } catch (error: any) {
      const msg =
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al cancelar la admisión.";
      toast.error(msg);
    } finally {
      setAdmisionToDeleteId(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera del Módulo */}
      <AdmisionHeader onAddClick={handleOpenAdd} onRefresh={() => refetch()} />

      {/* Tarjetas de Métricas en Vivo */}
      <AdmisionMetricsCards metrics={metrics} />

      {/* Listado Principal de Admisiones (Formato Lista) */}
      <AdmisionList
        admisiones={admisiones}
        isLoading={isLoading}
        totalItems={apiData?.totalItems ?? admisiones.length}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedEstadoTab={selectedEstadoTab}
        counts={counts}
        onEstadoTabChange={handleEstadoTabChange}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onViewDetail={handleViewDetail}
        onDirectChangeStatus={handleRequestDirectChangeStatus}
        onDelete={handleOpenDelete}
      />

      {/* Sheet: Ficha y Detalle de Admisión */}
      <AdmisionDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        admision={selectedAdmisionForDetail}
        onChangeStatusClick={handleOpenStatusDialog}
      />

      {/* Modal: Cambio de Estado con Formulario */}
      <AdmisionStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        admision={selectedAdmisionForStatus}
        onConfirm={handleConfirmStatusChange}
        isLoading={cambiarEstadoMutation.isPending}
      />

      {/* Alert Dialog: Confirmación Rápida de Cambio de Estado */}
      <AdmisionConfirmStatusDialog
        open={confirmStatusDialogOpen}
        onOpenChange={setConfirmStatusDialogOpen}
        admision={statusChangeCandidate?.admision ?? null}
        targetEstado={statusChangeCandidate?.targetEstado ?? null}
        onConfirm={handleExecuteStatusChange}
        isLoading={cambiarEstadoMutation.isPending}
      />

      {/* Modal: Confirmación de Cancelación/Eliminación */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="¿Cancelar esta admisión?"
        description="Esta acción eliminará el registro de la atención seleccionada. ¿Desea continuar?"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
