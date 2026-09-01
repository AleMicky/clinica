"use client";

import * as React from "react";
import { BajaInventarioHeader } from "./baja-inventario-header";
import { BajaInventarioMetrics } from "./baja-inventario-metrics";
import { BajaInventarioList } from "./baja-inventario-list";
import { BajaInventarioFormDialog } from "./baja-inventario-form-dialog";
import { BajaInventarioDetailDialog } from "./baja-inventario-detail-dialog";
import { BajaInventarioConfirmDialog } from "./baja-inventario-confirm-dialog";
import { BajaInventarioAnularDialog } from "./baja-inventario-anular-dialog";
import { BajaInventarioDeleteDialog } from "./baja-inventario-delete-dialog";
import { useBajasInventario } from "../hooks/use-baja-inventario";
import {
  EstadoBajaInventario,
  TipoBajaInventario,
  type BajaInventarioResponse,
} from "../types/baja-inventario.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";

export function BajaInventarioModuleView() {
  // Query state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedAlmacenId, setSelectedAlmacenId] = React.useState<
    number | null
  >(null);
  const [selectedTipo, setSelectedTipo] =
    React.useState<TipoBajaInventario | null>(null);
  const [selectedEstado, setSelectedEstado] =
    React.useState<EstadoBajaInventario | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const {
    data: bajasData,
    isLoading,
    isRefetching,
    refetch,
  } = useBajasInventario({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
    almacenId: selectedAlmacenId ?? undefined,
    tipo: selectedTipo ?? undefined,
    estado: selectedEstado ?? undefined,
  });

  const bajas = bajasData?.items ?? [];

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleAlmacenChange = (id: number | null) => {
    setSelectedAlmacenId(id);
    setPage(1);
  };

  const handleTipoChange = (tipo: TipoBajaInventario | null) => {
    setSelectedTipo(tipo);
    setPage(1);
  };

  const handleEstadoChange = (estado: EstadoBajaInventario | null) => {
    setSelectedEstado(estado);
    setPage(1);
  };

  // Form Dialog (Create / Edit)
  const [formOpen, setFormOpen] = React.useState(false);
  const [bajaToEdit, setBajaToEdit] =
    React.useState<BajaInventarioResponse | null>(null);

  const handleOpenAdd = () => {
    setBajaToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (b: BajaInventarioResponse) => {
    setBajaToEdit(b);
    setFormOpen(true);
  };

  // Detail Dialog
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailBajaId, setDetailBajaId] = React.useState<number | null>(
    null
  );

  const handleViewDetail = (b: BajaInventarioResponse) => {
    setDetailBajaId(b.id);
    setDetailOpen(true);
  };

  // Confirm Dialog
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [bajaToConfirm, setBajaToConfirm] =
    React.useState<BajaInventarioResponse | null>(null);

  const handleOpenConfirm = (b: BajaInventarioResponse) => {
    setBajaToConfirm(b);
    setConfirmOpen(true);
  };

  // Anular Dialog
  const [anularOpen, setAnularOpen] = React.useState(false);
  const [bajaToAnular, setBajaToAnular] =
    React.useState<BajaInventarioResponse | null>(null);

  const handleOpenAnular = (b: BajaInventarioResponse) => {
    setBajaToAnular(b);
    setAnularOpen(true);
  };

  // Delete Dialog
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [bajaToDelete, setBajaToDelete] =
    React.useState<BajaInventarioResponse | null>(null);

  const handleOpenDelete = (b: BajaInventarioResponse) => {
    setBajaToDelete(b);
    setDeleteOpen(true);
  };

  // Audit Dialog
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAudit = (b: BajaInventarioResponse) => {
    const rawCreated =
      b.fechaCreacion ||
      (b as any).createdAt ||
      (b as any).created_at ||
      (b as any).creadoEn;
    const rawUpdated =
      b.fechaModificacion ||
      (b as any).updatedAt ||
      (b as any).updated_at ||
      (b as any).actualizadoEn;
    const createdUser =
      b.creadoPor ||
      (b as any).createdBy ||
      (b as any).created_by ||
      (b as any).usuarioCreacion;
    const updatedUser =
      b.modificadoPor ||
      (b as any).updatedBy ||
      (b as any).updated_by ||
      (b as any).usuarioModificacion;

    setAuditInfo({
      title: "Auditoría de Baja de Inventario",
      entityName: `Baja ${b.numero}`,
      entityCode: b.numero,
      id: b.id,
      createdAt: rawCreated,
      createdBy: createdUser,
      updatedAt: rawUpdated,
      updatedBy: updatedUser,
      extraDetails: [
        { label: "Almacén", value: b.almacenNombre || "-" },
        {
          label: "Causa / Tipo",
          value:
            b.tipo === TipoBajaInventario.Vencimiento
              ? "Vencimiento"
              : b.tipo === TipoBajaInventario.Danio
              ? "Daño / Rotura"
              : "Merma",
        },
        { label: "Motivo", value: b.motivo || "-" },
        { label: "Fecha", value: b.fecha || "-" },
        ...(b.fechaConfirmacion
          ? [{ label: "Fecha Confirmación", value: b.fechaConfirmacion }]
          : []),
        ...(b.fechaAnulacion
          ? [{ label: "Fecha Anulación", value: b.fechaAnulacion }]
          : []),
        ...(b.motivoAnulacion
          ? [{ label: "Motivo Anulación", value: b.motivoAnulacion }]
          : []),
        ...(b.movimientoInventarioId
          ? [
              {
                label: "Movimiento de Inventario",
                value: `#${b.movimientoInventarioId}`,
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
      <BajaInventarioHeader
        totalItems={bajasData?.totalItems ?? 0}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Metrics */}
      <BajaInventarioMetrics
        bajas={bajas}
        totalItems={bajasData?.totalItems ?? 0}
        isLoading={isLoading}
      />

      {/* List */}
      <BajaInventarioList
        bajas={bajas}
        isLoading={isLoading}
        totalItems={bajasData?.totalItems ?? 0}
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
        onAddBaja={handleOpenAdd}
        onViewDetail={handleViewDetail}
        onEdit={handleOpenEdit}
        onConfirm={handleOpenConfirm}
        onAnular={handleOpenAnular}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
        onViewAudit={handleViewAudit}
      />

      {/* Form Dialog */}
      <BajaInventarioFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        bajaToEdit={bajaToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Detail Dialog */}
      <BajaInventarioDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        bajaId={detailBajaId}
        onConfirm={handleOpenConfirm}
        onAnular={handleOpenAnular}
      />

      {/* Confirm Dialog */}
      <BajaInventarioConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        bajaToConfirm={bajaToConfirm}
        onSuccessCallback={() => refetch()}
      />

      {/* Anular Dialog */}
      <BajaInventarioAnularDialog
        open={anularOpen}
        onOpenChange={setAnularOpen}
        bajaToAnular={bajaToAnular}
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Dialog */}
      <BajaInventarioDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        bajaToDelete={bajaToDelete}
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
