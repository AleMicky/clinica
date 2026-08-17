"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdmisionHeader } from "./admision-header";
import { AdmisionMetricsCards } from "./admision-metrics";
import { AdmisionList } from "./admision-list";
import { AdmisionFormDialog } from "./admision-form-dialog";
import { AdmisionDetailSheet } from "./admision-detail-sheet";
import { AdmisionStatusDialog } from "./admision-status-dialog";
import { ConfirmDeleteDialog } from "@/components/shared";
import {
  useAdmisiones,
  useCambiarEstadoAdmision,
  useDeleteAdmision,
} from "../hooks/use-admisiones";
import {
  EstadoAdmision,
  type AdmisionMetrics,
  type AdmisionResponse,
} from "../types/admision.types";

export function AdmisionModuleView() {
  // Modal State: Form Nueva Admisión
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);

  // Modal State: Panel deslizable de Detalle Ficha
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false);
  const [selectedAdmisionForDetail, setSelectedAdmisionForDetail] =
    React.useState<AdmisionResponse | null>(null);

  // Modal State: Cambiar Estado
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [selectedAdmisionForStatus, setSelectedAdmisionForStatus] =
    React.useState<AdmisionResponse | null>(null);

  // Modal State: Eliminar/Cancelar Admisión
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [admisionToDeleteId, setAdmisionToDeleteId] = React.useState<number | null>(null);

  // Filtros & Paginación
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedEstadoTab, setSelectedEstadoTab] = React.useState<
    EstadoAdmision | "TODOS"
  >("TODOS");

  // Fetch de React Query
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

  const cambiarEstadoMutation = useCambiarEstadoAdmision();
  const deleteMutation = useDeleteAdmision();

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleEstadoTabChange = (tab: EstadoAdmision | "TODOS") => {
    setSelectedEstadoTab(tab);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const admisiones: AdmisionResponse[] = apiData?.items ?? [];

  // Cálculo de Métricas en Vivo
  const totalHoy = apiData?.totalItems ?? admisiones.length;
  const pendientesPago = admisiones.filter(
    (a) => a.estado === EstadoAdmision.PendientePago || a.estado === EstadoAdmision.Registrada
  ).length;
  const enAtencion = admisiones.filter(
    (a) => a.estado === EstadoAdmision.EnAtencion
  ).length;
  const finalizadas = admisiones.filter(
    (a) => a.estado === EstadoAdmision.Finalizada
  ).length;

  const montoTotalHoy = admisiones.reduce((acc, a) => {
    const total =
      a.totalAdmision ??
      a.detalles.reduce((sub, d) => sub + (d.total || 0), 0);
    return acc + total;
  }, 0);

  const metrics: AdmisionMetrics = {
    totalHoy,
    pendientesPago,
    enAtencion,
    finalizadas,
    montoTotalHoy,
  };

  const router = useRouter();

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
    observacion?: string
  ) => {
    if (!selectedAdmisionForStatus) return;

    try {
      await cambiarEstadoMutation.mutateAsync({
        id: selectedAdmisionForStatus.id,
        data: { nuevoEstado: targetEstado, observacion },
      });
      toast.success(
        `Estado de la admisión #${selectedAdmisionForStatus.numero} actualizado.`
      );
      refetch();
    } catch {
      toast.error("No se pudo actualizar el estado de la admisión.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!admisionToDeleteId) return;

    try {
      await deleteMutation.mutateAsync(admisionToDeleteId);
      toast.success("Admisión cancelada correctamente.");
      refetch();
    } catch {
      toast.error("Ocurrió un error al cancelar la admisión.");
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
        onEstadoTabChange={handleEstadoTabChange}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onViewDetail={handleViewDetail}
        onChangeStatus={handleOpenStatusDialog}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
      />

      {/* Modal: Formulario Nueva Admisión */}
      <AdmisionFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSuccessCallback={() => refetch()}
      />

      {/* Sheet: Ficha y Detalle de Admisión */}
      <AdmisionDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        admision={selectedAdmisionForDetail}
        onChangeStatusClick={handleOpenStatusDialog}
      />

      {/* Modal: Cambio de Estado */}
      <AdmisionStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        admision={selectedAdmisionForStatus}
        onConfirm={handleConfirmStatusChange}
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
