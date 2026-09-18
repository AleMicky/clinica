"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
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

function getErrorMessage(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: { detail?: string } }; message?: string };
  return err?.response?.data?.detail || err?.message || fallback;
}

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

  // Búsqueda con debounce para reducir carga al servidor
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch de React Query para la lista filtrada
  const {
    data: apiData,
    isLoading,
    isFetching,
    refetch,
  } = useAdmisiones({
    page: currentPage,
    pageSize: pageSize,
    search: debouncedSearch.trim() || undefined,
    estado: selectedEstadoTab === "TODOS" ? undefined : selectedEstadoTab,
  });

  // Fetch para métricas globales del día
  const { data: allAdmisionesData, isLoading: isAllAdmisionesLoading } = useAdmisiones({
    pageSize: 100,
  });

  const cambiarEstadoMutation = useCambiarEstadoAdmision();
  const deleteMutation = useDeleteAdmision();

  const handleSearchChange = React.useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleEstadoTabChange = React.useCallback((tab: EstadoAdmisionTab) => {
    setSelectedEstadoTab(tab);
    setCurrentPage(1);
  }, []);

  const handlePageSizeChange = React.useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const handleResetFilters = React.useCallback(() => {
    setSearchTerm("");
    setSelectedEstadoTab("TODOS");
    setCurrentPage(1);
  }, []);

  const admisiones: AdmisionResponse[] = apiData?.items ?? [];

  // Cálculo memoizado de Métricas y Contadores
  const { counts, metrics } = React.useMemo(() => {
    const list: AdmisionResponse[] = allAdmisionesData?.items ?? apiData?.items ?? [];
    const totalHoy = allAdmisionesData?.totalItems ?? list.length;

    let registradas = 0;
    let confirmadas = 0;
    let enviadasVenta = 0;
    let canceladas = 0;
    let montoTotalHoy = 0;

    for (const a of list) {
      if (a.estado === EstadoAdmision.Registrada) registradas++;
      else if (a.estado === EstadoAdmision.Confirmada) confirmadas++;
      else if (a.estado === EstadoAdmision.EnviadaVenta) enviadasVenta++;
      else if (a.estado === EstadoAdmision.Cancelada) canceladas++;

      const total =
        a.totalAdmision ??
        a.detalles.reduce((sub, d) => sub + (d.total || 0), 0);
      montoTotalHoy += total;
    }

    const calculatedCounts: AdmisionCounts = {
      todos: totalHoy,
      registradas,
      confirmadas,
      enviadasVenta,
      canceladas,
    };

    const calculatedMetrics: AdmisionMetrics = {
      totalHoy,
      registradas,
      confirmadas,
      enviadasVenta,
      canceladas,
      montoTotalHoy,
    };

    return { counts: calculatedCounts, metrics: calculatedMetrics };
  }, [allAdmisionesData, apiData]);

  // Handlers de navegación y modales
  const handleOpenAdd = React.useCallback(() => {
    router.push("/recepcion/admisiones/nueva");
  }, [router]);

  const handleEdit = React.useCallback((admision: AdmisionResponse) => {
    router.push(`/recepcion/admisiones/${admision.id}/editar`);
  }, [router]);

  const handleViewDetail = React.useCallback((admision: AdmisionResponse) => {
    setSelectedAdmisionForDetail(admision);
    setDetailSheetOpen(true);
  }, []);

  const handleOpenStatusDialog = React.useCallback((admision: AdmisionResponse) => {
    setSelectedAdmisionForStatus(admision);
    setStatusDialogOpen(true);
  }, []);

  const handleOpenDelete = React.useCallback((id: number) => {
    setAdmisionToDeleteId(id);
    setDeleteDialogOpen(true);
  }, []);

  // Lógica unificada para cambio de estado
  const executeStatusChange = React.useCallback(
    async (
      admisionId: number,
      numero: string,
      targetEstado: EstadoAdmision,
      motivo?: string
    ): Promise<boolean> => {
      try {
        await cambiarEstadoMutation.mutateAsync({
          id: admisionId,
          data: {
            estadoDestino: targetEstado,
            motivo: motivo || `Cambio de estado a ${EstadoAdmisionLabels[targetEstado]}`,
          },
        });
        toast.success(
          `Estado de la admisión #${numero} actualizado a "${EstadoAdmisionLabels[targetEstado]}".`
        );
        return true;
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "No se pudo actualizar el estado de la admisión."));
        return false;
      }
    },
    [cambiarEstadoMutation]
  );

  const handleConfirmStatusChange = React.useCallback(
    async (targetEstado: EstadoAdmision, motivo?: string) => {
      if (!selectedAdmisionForStatus) return;
      const success = await executeStatusChange(
        selectedAdmisionForStatus.id,
        selectedAdmisionForStatus.numero,
        targetEstado,
        motivo
      );
      if (success) {
        setStatusDialogOpen(false);
        setSelectedAdmisionForStatus(null);
      }
    },
    [selectedAdmisionForStatus, executeStatusChange]
  );

  const handleRequestDirectChangeStatus = React.useCallback(
    (admision: AdmisionResponse, nuevoEstado: EstadoAdmision) => {
      setStatusChangeCandidate({
        admision,
        targetEstado: nuevoEstado,
        motivo: `Cambio a ${EstadoAdmisionLabels[nuevoEstado]}`,
      });
      setConfirmStatusDialogOpen(true);
    },
    []
  );

  const handleExecuteStatusChange = React.useCallback(async () => {
    if (!statusChangeCandidate) return;
    const { admision, targetEstado, motivo } = statusChangeCandidate;

    try {
      await executeStatusChange(admision.id, admision.numero, targetEstado, motivo);
    } finally {
      setStatusChangeCandidate(null);
      setConfirmStatusDialogOpen(false);
    }
  }, [statusChangeCandidate, executeStatusChange]);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!admisionToDeleteId) return;

    try {
      await deleteMutation.mutateAsync(admisionToDeleteId);
      toast.success("Admisión cancelada correctamente.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Ocurrió un error al cancelar la admisión."));
    } finally {
      setAdmisionToDeleteId(null);
      setDeleteDialogOpen(false);
    }
  }, [admisionToDeleteId, deleteMutation]);

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera del Módulo */}
      <AdmisionHeader
        onAddClick={handleOpenAdd}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />

      {/* Tarjetas de Métricas en Vivo */}
      <AdmisionMetricsCards
        metrics={metrics}
        isLoading={isAllAdmisionesLoading && !allAdmisionesData}
      />

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
        onEdit={handleEdit}
        onDirectChangeStatus={handleRequestDirectChangeStatus}
        onDelete={handleOpenDelete}
        onResetFilters={handleResetFilters}
      />

      {/* Sheet: Ficha y Detalle de Admisión */}
      <AdmisionDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        admision={selectedAdmisionForDetail}
        onChangeStatusClick={handleOpenStatusDialog}
        onEditClick={handleEdit}
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
