"use client";

import * as React from "react";
import { MovimientoInventarioHeader } from "./movimiento-inventario-header";
import { MovimientoInventarioMetrics } from "./movimiento-inventario-metrics";
import { MovimientoInventarioList } from "./movimiento-inventario-list";
import { MovimientoInventarioFormView } from "./movimiento-inventario-form-view";
import { MovimientoInventarioDetailDialog } from "./movimiento-inventario-detail-dialog";
import { MovimientoInventarioConfirmDialog } from "./movimiento-inventario-confirm-dialog";
import { MovimientoInventarioAnularDialog } from "./movimiento-inventario-anular-dialog";
import { MovimientoInventarioDeleteDialog } from "./movimiento-inventario-delete-dialog";
import { useMovimientosInventario } from "../hooks/use-movimiento-inventario";
import {
  EstadoMovimientoInventario,
  type MovimientoInventarioResponse,
} from "../types/movimiento-inventario.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";

export function MovimientoInventarioModuleView() {
  // Navigation view mode: 'list' or 'form'
  const [viewMode, setViewMode] = React.useState<"list" | "form">("list");
  const [movimientoToEdit, setMovimientoToEdit] =
    React.useState<MovimientoInventarioResponse | null>(null);

  // Query parameters state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedAlmacenId, setSelectedAlmacenId] = React.useState<
    number | null
  >(null);
  const [selectedTipoMovimientoId, setSelectedTipoMovimientoId] =
    React.useState<number | null>(null);
  const [selectedEstado, setSelectedEstado] =
    React.useState<EstadoMovimientoInventario | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const {
    data: movimientosData,
    isLoading,
    isRefetching,
    refetch,
  } = useMovimientosInventario({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
    almacenId: selectedAlmacenId ?? undefined,
    tipoMovimientoInventarioId: selectedTipoMovimientoId ?? undefined,
  });

  const rawItems = movimientosData?.items ?? [];

  // Filter in-memory for Estado if selected
  const movimientos = React.useMemo(() => {
    if (selectedEstado === null) return rawItems;
    return rawItems.filter((m) => m.estado === selectedEstado);
  }, [rawItems, selectedEstado]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleAlmacenChange = (almacenId: number | null) => {
    setSelectedAlmacenId(almacenId);
    setPage(1);
  };

  const handleTipoMovimientoChange = (tipoId: number | null) => {
    setSelectedTipoMovimientoId(tipoId);
    setPage(1);
  };

  const handleEstadoChange = (estado: EstadoMovimientoInventario | null) => {
    setSelectedEstado(estado);
    setPage(1);
  };

  // Switch to Form Page (Create / Edit)
  const handleOpenAdd = () => {
    setMovimientoToEdit(null);
    setViewMode("form");
  };

  const handleOpenEdit = (mov: MovimientoInventarioResponse) => {
    setMovimientoToEdit(mov);
    setViewMode("form");
  };

  const handleFormBack = () => {
    setViewMode("list");
    setMovimientoToEdit(null);
  };

  const handleFormSuccess = () => {
    setViewMode("list");
    setMovimientoToEdit(null);
    refetch();
  };

  // Detail Dialog state
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailMovimientoId, setDetailMovimientoId] = React.useState<
    number | null
  >(null);

  const handleViewDetail = (mov: MovimientoInventarioResponse) => {
    setDetailMovimientoId(mov.id);
    setDetailOpen(true);
  };

  // Confirm Dialog state
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [movimientoToConfirm, setMovimientoToConfirm] =
    React.useState<MovimientoInventarioResponse | null>(null);

  const handleOpenConfirm = (mov: MovimientoInventarioResponse) => {
    setMovimientoToConfirm(mov);
    setConfirmOpen(true);
  };

  // Anular Dialog state
  const [anularOpen, setAnularOpen] = React.useState(false);
  const [movimientoToAnular, setMovimientoToAnular] =
    React.useState<MovimientoInventarioResponse | null>(null);

  const handleOpenAnular = (mov: MovimientoInventarioResponse) => {
    setMovimientoToAnular(mov);
    setAnularOpen(true);
  };

  // Delete Dialog state
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [movimientoToDelete, setMovimientoToDelete] =
    React.useState<MovimientoInventarioResponse | null>(null);

  const handleOpenDelete = (mov: MovimientoInventarioResponse) => {
    setMovimientoToDelete(mov);
    setDeleteOpen(true);
  };

  // Audit Dialog state
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAudit = (mov: MovimientoInventarioResponse) => {
    const rawCreated =
      mov.fechaCreacion ||
      (mov as any).createdAt ||
      (mov as any).created_at ||
      (mov as any).creadoEn;
    const rawUpdated =
      mov.fechaModificacion ||
      (mov as any).updatedAt ||
      (mov as any).updated_at ||
      (mov as any).actualizadoEn;
    const createdUser =
      mov.creadoPor ||
      (mov as any).createdBy ||
      (mov as any).created_by ||
      (mov as any).usuarioCreacion;
    const updatedUser =
      mov.modificadoPor ||
      (mov as any).updatedBy ||
      (mov as any).updated_by ||
      (mov as any).usuarioModificacion;

    const estadoTexto =
      mov.estado === EstadoMovimientoInventario.Borrador
        ? "Borrador"
        : mov.estado === EstadoMovimientoInventario.Confirmado
        ? "Confirmado"
        : "Anulado";

    setAuditInfo({
      title: "Auditoría de Movimiento de Inventario",
      entityName: `Comprobante ${mov.numero}`,
      entityCode: mov.numero,
      id: mov.id,
      createdAt: rawCreated,
      createdBy: createdUser,
      updatedAt: rawUpdated,
      updatedBy: updatedUser,
      extraDetails: [
        { label: "Tipo Movimiento", value: mov.tipoMovimientoNombre || "-" },
        { label: "Almacén", value: mov.almacenNombre || "-" },
        { label: "Estado", value: estadoTexto },
        ...(mov.fechaConfirmacion
          ? [{ label: "Fecha Confirmación", value: mov.fechaConfirmacion }]
          : []),
        ...(mov.fechaAnulacion
          ? [
              { label: "Fecha Anulación", value: mov.fechaAnulacion },
              {
                label: "Motivo Anulación",
                value: mov.motivoAnulacion || "Sin motivo",
              },
            ]
          : []),
      ],
    });
    setAuditDialogOpen(true);
  };

  if (viewMode === "form") {
    return (
      <MovimientoInventarioFormView
        movimientoToEdit={movimientoToEdit}
        onCancel={handleFormBack}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Header */}
      <MovimientoInventarioHeader
        totalItems={movimientosData?.totalItems ?? 0}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Metrics */}
      <MovimientoInventarioMetrics
        movimientos={rawItems}
        totalItems={movimientosData?.totalItems ?? 0}
        isLoading={isLoading}
      />

      {/* Main List & Table */}
      <MovimientoInventarioList
        movimientos={movimientos}
        isLoading={isLoading}
        totalItems={movimientosData?.totalItems ?? 0}
        currentPage={page}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedAlmacenId={selectedAlmacenId}
        selectedTipoMovimientoId={selectedTipoMovimientoId}
        selectedEstado={selectedEstado}
        onSearchChange={handleSearchChange}
        onAlmacenChange={handleAlmacenChange}
        onTipoMovimientoChange={handleTipoMovimientoChange}
        onEstadoChange={handleEstadoChange}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onAddMovimiento={handleOpenAdd}
        onViewDetail={handleViewDetail}
        onEdit={handleOpenEdit}
        onConfirm={handleOpenConfirm}
        onAnular={handleOpenAnular}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
        onViewAudit={handleViewAudit}
      />

      {/* Detail Voucher Dialog */}
      <MovimientoInventarioDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        movimientoId={detailMovimientoId}
        onConfirm={handleOpenConfirm}
        onAnular={handleOpenAnular}
      />

      {/* Confirm Movement Dialog */}
      <MovimientoInventarioConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        movimientoToConfirm={movimientoToConfirm}
        onSuccessCallback={() => refetch()}
      />

      {/* Anular Movement Dialog */}
      <MovimientoInventarioAnularDialog
        open={anularOpen}
        onOpenChange={setAnularOpen}
        movimientoToAnular={movimientoToAnular}
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Draft Dialog */}
      <MovimientoInventarioDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        movimientoToDelete={movimientoToDelete}
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
