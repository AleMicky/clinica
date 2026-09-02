"use client";

import * as React from "react";
import { DevolucionProveedorHeader } from "./devolucion-proveedor-header";
import { DevolucionProveedorMetrics } from "./devolucion-proveedor-metrics";
import { DevolucionProveedorList } from "./devolucion-proveedor-list";
import { DevolucionProveedorFormDialog } from "./devolucion-proveedor-form-dialog";
import { DevolucionProveedorDetailDialog } from "./devolucion-proveedor-detail-dialog";
import { DevolucionProveedorAnularDialog } from "./devolucion-proveedor-anular-dialog";
import { DevolucionProveedorDeleteDialog } from "./devolucion-proveedor-delete-dialog";
import {
  useDevolucionesProveedor,
  useEnviarAprobacionDevolucionProveedor,
  useAprobarDevolucionProveedor,
  useRechazarDevolucionProveedor,
  useConfirmarDevolucionProveedor,
} from "../hooks/use-devolucion-proveedor";
import {
  EstadoDevolucionProveedor,
  type DevolucionProveedorResponse,
} from "../types/devolucion-proveedor.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";
import { toast } from "sonner";

export function DevolucionProveedorModuleView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedProveedorId, setSelectedProveedorId] = React.useState<
    number | null
  >(null);
  const [selectedAlmacenId, setSelectedAlmacenId] = React.useState<
    number | null
  >(null);
  const [selectedEstado, setSelectedEstado] =
    React.useState<EstadoDevolucionProveedor | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const {
    data: devolucionesData,
    isLoading,
    isRefetching,
    refetch,
  } = useDevolucionesProveedor({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
    proveedorId: selectedProveedorId ?? undefined,
    almacenId: selectedAlmacenId ?? undefined,
    estado: selectedEstado ?? undefined,
  });

  const devoluciones = devolucionesData?.items ?? [];

  const enviarAprobacionMutation = useEnviarAprobacionDevolucionProveedor();
  const aprobarMutation = useAprobarDevolucionProveedor();
  const rechazarMutation = useRechazarDevolucionProveedor();
  const confirmarMutation = useConfirmarDevolucionProveedor();

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleProveedorChange = (id: number | null) => {
    setSelectedProveedorId(id);
    setPage(1);
  };

  const handleAlmacenChange = (id: number | null) => {
    setSelectedAlmacenId(id);
    setPage(1);
  };

  const handleEstadoChange = (estado: EstadoDevolucionProveedor | null) => {
    setSelectedEstado(estado);
    setPage(1);
  };

  // Form Dialog
  const [formOpen, setFormOpen] = React.useState(false);
  const [devolucionToEdit, setDevolucionToEdit] =
    React.useState<DevolucionProveedorResponse | null>(null);

  const handleOpenAdd = () => {
    setDevolucionToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (d: DevolucionProveedorResponse) => {
    setDevolucionToEdit(d);
    setFormOpen(true);
  };

  // Detail Dialog
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailDevolucionId, setDetailDevolucionId] = React.useState<
    number | null
  >(null);

  const handleViewDetail = (d: DevolucionProveedorResponse) => {
    setDetailDevolucionId(d.id);
    setDetailOpen(true);
  };

  // Quick State Transitions
  const handleSendApproval = async (d: DevolucionProveedorResponse) => {
    try {
      await enviarAprobacionMutation.mutateAsync(d.id);
      toast.success(`Devolución "${d.numero}" enviada a Aprobación.`);
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Error al enviar a aprobación.");
    }
  };

  const handleApprove = async (d: DevolucionProveedorResponse) => {
    try {
      await aprobarMutation.mutateAsync(d.id);
      toast.success(`Devolución "${d.numero}" aprobada.`);
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Error al aprobar la devolución.");
    }
  };

  const handleReject = async (d: DevolucionProveedorResponse) => {
    try {
      await rechazarMutation.mutateAsync(d.id);
      toast.success(`Devolución "${d.numero}" rechazada.`);
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Error al rechazar la devolución.");
    }
  };

  const handleConfirm = async (d: DevolucionProveedorResponse) => {
    try {
      await confirmarMutation.mutateAsync(d.id);
      toast.success(
        `Devolución "${d.numero}" confirmada. Stock descontado del almacén.`
      );
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Error al confirmar la devolución.");
    }
  };

  // Anular Dialog
  const [anularOpen, setAnularOpen] = React.useState(false);
  const [devolucionToAnular, setDevolucionToAnular] =
    React.useState<DevolucionProveedorResponse | null>(null);

  const handleOpenAnular = (d: DevolucionProveedorResponse) => {
    setDevolucionToAnular(d);
    setAnularOpen(true);
  };

  // Delete Dialog
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [devolucionToDelete, setDevolucionToDelete] =
    React.useState<DevolucionProveedorResponse | null>(null);

  const handleOpenDelete = (d: DevolucionProveedorResponse) => {
    setDevolucionToDelete(d);
    setDeleteOpen(true);
  };

  // Audit Dialog
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAudit = (d: DevolucionProveedorResponse) => {
    const rawCreated =
      d.fechaCreacion ||
      (d as any).createdAt ||
      (d as any).created_at ||
      (d as any).creadoEn;
    const rawUpdated =
      d.fechaModificacion ||
      (d as any).updatedAt ||
      (d as any).updated_at ||
      (d as any).actualizadoEn;

    setAuditInfo({
      title: "Auditoría de Devolución a Proveedor",
      entityName: `Devolución ${d.numero}`,
      entityCode: d.numero,
      id: d.id,
      createdAt: rawCreated,
      createdBy: d.creadoPor || (d as any).createdBy,
      updatedAt: rawUpdated,
      updatedBy: d.modificadoPor || (d as any).updatedBy,
      extraDetails: [
        { label: "Proveedor", value: d.proveedorRazonSocial || "-" },
        { label: "Almacén", value: d.almacenNombre || "-" },
        { label: "Fecha", value: d.fecha || "-" },
        { label: "Motivo", value: d.motivo },
        {
          label: "Recepción Vinculada",
          value: d.recepcionCompraNumero || "-",
        },
        ...(d.movimientoInventarioId
          ? [
              {
                label: "Movimiento Inventario",
                value: `#${d.movimientoInventarioId}`,
              },
            ]
          : []),
      ],
    });
    setAuditDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Header */}
      <DevolucionProveedorHeader
        totalItems={devolucionesData?.totalItems ?? 0}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Metrics */}
      <DevolucionProveedorMetrics
        devoluciones={devoluciones}
        totalItems={devolucionesData?.totalItems ?? 0}
        isLoading={isLoading}
      />

      {/* List */}
      <DevolucionProveedorList
        devoluciones={devoluciones}
        isLoading={isLoading}
        totalItems={devolucionesData?.totalItems ?? 0}
        currentPage={page}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedProveedorId={selectedProveedorId}
        selectedAlmacenId={selectedAlmacenId}
        selectedEstado={selectedEstado}
        onSearchChange={handleSearchChange}
        onProveedorChange={handleProveedorChange}
        onAlmacenChange={handleAlmacenChange}
        onEstadoChange={handleEstadoChange}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onAddDevolucion={handleOpenAdd}
        onViewDetail={handleViewDetail}
        onEdit={handleOpenEdit}
        onSendApproval={handleSendApproval}
        onApprove={handleApprove}
        onReject={handleReject}
        onConfirm={handleConfirm}
        onAnular={handleOpenAnular}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
        onViewAudit={handleViewAudit}
      />

      {/* Form Dialog */}
      <DevolucionProveedorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        devolucionToEdit={devolucionToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Detail Dialog */}
      <DevolucionProveedorDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        devolucionId={detailDevolucionId}
        onSendApproval={handleSendApproval}
        onApprove={handleApprove}
        onReject={handleReject}
        onConfirm={handleConfirm}
        onAnular={handleOpenAnular}
      />

      {/* Anular Dialog */}
      <DevolucionProveedorAnularDialog
        open={anularOpen}
        onOpenChange={setAnularOpen}
        devolucion={devolucionToAnular}
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Dialog */}
      <DevolucionProveedorDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        devolucion={devolucionToDelete}
        onSuccessCallback={() => refetch()}
      />

      {/* Shared Audit Dialog */}
      <AuditDialog
        open={auditDialogOpen}
        onOpenChange={setAuditDialogOpen}
        auditInfo={auditInfo}
      />
    </div>
  );
}
