"use client";

import * as React from "react";
import { AjusteInventarioHeader } from "./ajuste-inventario-header";
import { AjusteInventarioMetrics } from "./ajuste-inventario-metrics";
import { AjusteInventarioList } from "./ajuste-inventario-list";
import { AjusteInventarioFormDialog } from "./ajuste-inventario-form-dialog";
import { AjusteInventarioDetailDialog } from "./ajuste-inventario-detail-dialog";
import { AjusteInventarioConfirmDialog } from "./ajuste-inventario-confirm-dialog";
import { AjusteInventarioAnularDialog } from "./ajuste-inventario-anular-dialog";
import { AjusteInventarioDeleteDialog } from "./ajuste-inventario-delete-dialog";
import { useAjustesInventario } from "../hooks/use-ajuste-inventario";
import {
  EstadoAjusteInventario,
  TipoAjusteInventario,
  type AjusteInventarioResponse,
} from "../types/ajuste-inventario.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";

export function AjusteInventarioModuleView() {
  // Query state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedAlmacenId, setSelectedAlmacenId] = React.useState<
    number | null
  >(null);
  const [selectedTipo, setSelectedTipo] =
    React.useState<TipoAjusteInventario | null>(null);
  const [selectedEstado, setSelectedEstado] =
    React.useState<EstadoAjusteInventario | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const {
    data: ajustesData,
    isLoading,
    isRefetching,
    refetch,
  } = useAjustesInventario({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
    almacenId: selectedAlmacenId ?? undefined,
    tipo: selectedTipo ?? undefined,
    estado: selectedEstado ?? undefined,
  });

  const ajustes = ajustesData?.items ?? [];

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleAlmacenChange = (id: number | null) => {
    setSelectedAlmacenId(id);
    setPage(1);
  };

  const handleTipoChange = (tipo: TipoAjusteInventario | null) => {
    setSelectedTipo(tipo);
    setPage(1);
  };

  const handleEstadoChange = (estado: EstadoAjusteInventario | null) => {
    setSelectedEstado(estado);
    setPage(1);
  };

  // Form Dialog (Create / Edit)
  const [formOpen, setFormOpen] = React.useState(false);
  const [ajusteToEdit, setAjusteToEdit] =
    React.useState<AjusteInventarioResponse | null>(null);

  const handleOpenAdd = () => {
    setAjusteToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (a: AjusteInventarioResponse) => {
    setAjusteToEdit(a);
    setFormOpen(true);
  };

  // Detail Dialog
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailAjusteId, setDetailAjusteId] = React.useState<number | null>(
    null
  );

  const handleViewDetail = (a: AjusteInventarioResponse) => {
    setDetailAjusteId(a.id);
    setDetailOpen(true);
  };

  // Confirm Dialog
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [ajusteToConfirm, setAjusteToConfirm] =
    React.useState<AjusteInventarioResponse | null>(null);

  const handleOpenConfirm = (a: AjusteInventarioResponse) => {
    setAjusteToConfirm(a);
    setConfirmOpen(true);
  };

  // Anular Dialog
  const [anularOpen, setAnularOpen] = React.useState(false);
  const [ajusteToAnular, setAjusteToAnular] =
    React.useState<AjusteInventarioResponse | null>(null);

  const handleOpenAnular = (a: AjusteInventarioResponse) => {
    setAjusteToAnular(a);
    setAnularOpen(true);
  };

  // Delete Dialog
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [ajusteToDelete, setAjusteToDelete] =
    React.useState<AjusteInventarioResponse | null>(null);

  const handleOpenDelete = (a: AjusteInventarioResponse) => {
    setAjusteToDelete(a);
    setDeleteOpen(true);
  };

  // Audit Dialog
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAudit = (a: AjusteInventarioResponse) => {
    const rawCreated =
      a.fechaCreacion ||
      (a as any).createdAt ||
      (a as any).created_at ||
      (a as any).creadoEn;
    const rawUpdated =
      a.fechaModificacion ||
      (a as any).updatedAt ||
      (a as any).updated_at ||
      (a as any).actualizadoEn;
    const createdUser =
      a.creadoPor ||
      (a as any).createdBy ||
      (a as any).created_by ||
      (a as any).usuarioCreacion;
    const updatedUser =
      a.modificadoPor ||
      (a as any).updatedBy ||
      (a as any).updated_by ||
      (a as any).usuarioModificacion;

    setAuditInfo({
      title: "Auditoría de Ajuste de Inventario",
      entityName: `Ajuste ${a.numero}`,
      entityCode: a.numero,
      id: a.id,
      createdAt: rawCreated,
      createdBy: createdUser,
      updatedAt: rawUpdated,
      updatedBy: updatedUser,
      extraDetails: [
        { label: "Almacén", value: a.almacenNombre || "-" },
        {
          label: "Tipo",
          value:
            a.tipo === TipoAjusteInventario.Positivo
              ? "Positivo (Ingreso)"
              : "Negativo (Salida)",
        },
        { label: "Motivo", value: a.motivo || "-" },
        { label: "Fecha", value: a.fecha || "-" },
        ...(a.fechaConfirmacion
          ? [{ label: "Fecha Confirmación", value: a.fechaConfirmacion }]
          : []),
        ...(a.fechaAnulacion
          ? [{ label: "Fecha Anulación", value: a.fechaAnulacion }]
          : []),
        ...(a.motivoAnulacion
          ? [{ label: "Motivo Anulación", value: a.motivoAnulacion }]
          : []),
        ...(a.movimientoInventarioId
          ? [
              {
                label: "Movimiento de Inventario",
                value: `#${a.movimientoInventarioId}`,
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
      <AjusteInventarioHeader
        totalItems={ajustesData?.totalItems ?? 0}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Metrics */}
      <AjusteInventarioMetrics
        ajustes={ajustes}
        totalItems={ajustesData?.totalItems ?? 0}
        isLoading={isLoading}
      />

      {/* List */}
      <AjusteInventarioList
        ajustes={ajustes}
        isLoading={isLoading}
        totalItems={ajustesData?.totalItems ?? 0}
        currentPage={page}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedAlmacenId={selectedAlmacenId}
        selectedTipo={selectedTipo}
        selectedEstado={selectedEstado}
        onSearchChange={handleSearchChange}
        onAlmacenChange={handleAlmacenChange}
        onTipoChange={handleTipoChange}
        onEstadoChange={handleEstadoChange}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onAddAjuste={handleOpenAdd}
        onViewDetail={handleViewDetail}
        onEdit={handleOpenEdit}
        onConfirm={handleOpenConfirm}
        onAnular={handleOpenAnular}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
        onViewAudit={handleViewAudit}
      />

      {/* Form Dialog */}
      <AjusteInventarioFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        ajusteToEdit={ajusteToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Detail Dialog */}
      <AjusteInventarioDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        ajusteId={detailAjusteId}
        onConfirm={handleOpenConfirm}
        onAnular={handleOpenAnular}
      />

      {/* Confirm Dialog */}
      <AjusteInventarioConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        ajusteToConfirm={ajusteToConfirm}
        onSuccessCallback={() => refetch()}
      />

      {/* Anular Dialog */}
      <AjusteInventarioAnularDialog
        open={anularOpen}
        onOpenChange={setAnularOpen}
        ajusteToAnular={ajusteToAnular}
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Dialog */}
      <AjusteInventarioDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        ajusteToDelete={ajusteToDelete}
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
