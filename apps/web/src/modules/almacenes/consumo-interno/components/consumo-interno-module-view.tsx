"use client";

import * as React from "react";
import { ConsumoInternoHeader } from "./consumo-interno-header";
import { ConsumoInternoMetrics } from "./consumo-interno-metrics";
import { ConsumoInternoList } from "./consumo-interno-list";
import { ConsumoInternoFormDialog } from "./consumo-interno-form-dialog";
import { ConsumoInternoDetailDialog } from "./consumo-interno-detail-dialog";
import { ConsumoInternoConfirmDialog } from "./consumo-interno-confirm-dialog";
import { ConsumoInternoAnularDialog } from "./consumo-interno-anular-dialog";
import { ConsumoInternoDeleteDialog } from "./consumo-interno-delete-dialog";
import { useConsumosInterno } from "../hooks/use-consumo-interno";
import {
  EstadoConsumoInterno,
  type ConsumoInternoResponse,
} from "../types/consumo-interno.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";

export function ConsumoInternoModuleView() {
  // Query state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedAlmacenId, setSelectedAlmacenId] = React.useState<
    number | null
  >(null);
  const [selectedAreaId, setSelectedAreaId] = React.useState<number | null>(
    null
  );
  const [selectedEstado, setSelectedEstado] =
    React.useState<EstadoConsumoInterno | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const {
    data: consumosData,
    isLoading,
    isRefetching,
    refetch,
  } = useConsumosInterno({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
    almacenId: selectedAlmacenId ?? undefined,
    areaId: selectedAreaId ?? undefined,
    estado: selectedEstado ?? undefined,
  });

  const consumos = consumosData?.items ?? [];

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleAlmacenChange = (id: number | null) => {
    setSelectedAlmacenId(id);
    setPage(1);
  };

  const handleAreaChange = (id: number | null) => {
    setSelectedAreaId(id);
    setPage(1);
  };

  const handleEstadoChange = (estado: EstadoConsumoInterno | null) => {
    setSelectedEstado(estado);
    setPage(1);
  };

  // Form Dialog (Create / Edit)
  const [formOpen, setFormOpen] = React.useState(false);
  const [consumoToEdit, setConsumoToEdit] =
    React.useState<ConsumoInternoResponse | null>(null);

  const handleOpenAdd = () => {
    setConsumoToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (c: ConsumoInternoResponse) => {
    setConsumoToEdit(c);
    setFormOpen(true);
  };

  // Detail Dialog
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailConsumoId, setDetailConsumoId] = React.useState<number | null>(
    null
  );

  const handleViewDetail = (c: ConsumoInternoResponse) => {
    setDetailConsumoId(c.id);
    setDetailOpen(true);
  };

  // Confirm Dialog
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [consumoToConfirm, setConsumoToConfirm] =
    React.useState<ConsumoInternoResponse | null>(null);

  const handleOpenConfirm = (c: ConsumoInternoResponse) => {
    setConsumoToConfirm(c);
    setConfirmOpen(true);
  };

  // Anular Dialog
  const [anularOpen, setAnularOpen] = React.useState(false);
  const [consumoToAnular, setConsumoToAnular] =
    React.useState<ConsumoInternoResponse | null>(null);

  const handleOpenAnular = (c: ConsumoInternoResponse) => {
    setConsumoToAnular(c);
    setAnularOpen(true);
  };

  // Delete Dialog
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [consumoToDelete, setConsumoToDelete] =
    React.useState<ConsumoInternoResponse | null>(null);

  const handleOpenDelete = (c: ConsumoInternoResponse) => {
    setConsumoToDelete(c);
    setDeleteOpen(true);
  };

  // Audit Dialog
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAudit = (c: ConsumoInternoResponse) => {
    const rawCreated =
      c.fechaCreacion ||
      (c as any).createdAt ||
      (c as any).created_at ||
      (c as any).creadoEn;
    const rawUpdated =
      c.fechaModificacion ||
      (c as any).updatedAt ||
      (c as any).updated_at ||
      (c as any).actualizadoEn;
    const createdUser =
      c.creadoPor ||
      (c as any).createdBy ||
      (c as any).created_by ||
      (c as any).usuarioCreacion;
    const updatedUser =
      c.modificadoPor ||
      (c as any).updatedBy ||
      (c as any).updated_by ||
      (c as any).usuarioModificacion;

    setAuditInfo({
      title: "Auditoría de Consumo Interno",
      entityName: `Vale ${c.numero}`,
      entityCode: c.numero,
      id: c.id,
      createdAt: rawCreated,
      createdBy: createdUser,
      updatedAt: rawUpdated,
      updatedBy: updatedUser,
      extraDetails: [
        { label: "Almacén", value: c.almacenNombre || "-" },
        { label: "Área Solicitante", value: c.areaNombre || "-" },
        { label: "Fecha Despacho", value: c.fecha || "-" },
        ...(c.referenciaTipo
          ? [
              {
                label: "Referencia",
                value: `${c.referenciaTipo}${c.referenciaId ? ` #${c.referenciaId}` : ""}`,
              },
            ]
          : []),
        { label: "Observación", value: c.observacion || "-" },
        ...(c.movimientoInventarioId
          ? [
              {
                label: "Movimiento de Inventario",
                value: `#${c.movimientoInventarioId}`,
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
      <ConsumoInternoHeader
        totalItems={consumosData?.totalItems ?? 0}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Metrics */}
      <ConsumoInternoMetrics
        consumos={consumos}
        totalItems={consumosData?.totalItems ?? 0}
        isLoading={isLoading}
      />

      {/* List */}
      <ConsumoInternoList
        consumos={consumos}
        isLoading={isLoading}
        totalItems={consumosData?.totalItems ?? 0}
        currentPage={page}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedAlmacenId={selectedAlmacenId}
        selectedAreaId={selectedAreaId}
        selectedEstado={selectedEstado}
        onSearchChange={handleSearchChange}
        onAlmacenChange={handleAlmacenChange}
        onAreaChange={handleAreaChange}
        onEstadoChange={handleEstadoChange}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onAddConsumo={handleOpenAdd}
        onViewDetail={handleViewDetail}
        onEdit={handleOpenEdit}
        onConfirm={handleOpenConfirm}
        onAnular={handleOpenAnular}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
        onViewAudit={handleViewAudit}
      />

      {/* Form Dialog */}
      <ConsumoInternoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        consumoToEdit={consumoToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Detail Dialog */}
      <ConsumoInternoDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        consumoId={detailConsumoId}
        onConfirm={handleOpenConfirm}
        onAnular={handleOpenAnular}
      />

      {/* Confirm Dialog */}
      <ConsumoInternoConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        consumoToConfirm={consumoToConfirm}
        onSuccessCallback={() => refetch()}
      />

      {/* Anular Dialog */}
      <ConsumoInternoAnularDialog
        open={anularOpen}
        onOpenChange={setAnularOpen}
        consumoToAnular={consumoToAnular}
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Dialog */}
      <ConsumoInternoDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        consumoToDelete={consumoToDelete}
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
