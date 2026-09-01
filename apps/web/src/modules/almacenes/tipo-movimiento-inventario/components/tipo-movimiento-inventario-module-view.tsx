"use client";

import * as React from "react";
import { TipoMovimientoInventarioHeader } from "./tipo-movimiento-inventario-header";
import { TipoMovimientoInventarioMetrics } from "./tipo-movimiento-inventario-metrics";
import { TipoMovimientoInventarioList } from "./tipo-movimiento-inventario-list";
import { TipoMovimientoInventarioFormDialog } from "./tipo-movimiento-inventario-form-dialog";
import { TipoMovimientoInventarioDeleteDialog } from "./tipo-movimiento-inventario-delete-dialog";
import { useTiposMovimientoInventario } from "../hooks/use-tipo-movimiento-inventario";
import {
  NaturalezaMovimiento,
  type TipoMovimientoInventarioResponse,
} from "../types/tipo-movimiento-inventario.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";

export function TipoMovimientoInventarioModuleView() {
  // Query parameters state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [naturaleza, setNaturaleza] = React.useState<NaturalezaMovimiento | null>(
    null
  );
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const {
    data: tiposData,
    isLoading,
    refetch,
  } = useTiposMovimientoInventario({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
    naturaleza: naturaleza ?? undefined,
  });

  const tiposMovimiento = tiposData?.items ?? [];

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleNaturalezaChange = (nat: NaturalezaMovimiento | null) => {
    setNaturaleza(nat);
    setPage(1);
  };

  // Form Dialog state
  const [formOpen, setFormOpen] = React.useState(false);
  const [tipoToEdit, setTipoToEdit] =
    React.useState<TipoMovimientoInventarioResponse | null>(null);

  const handleOpenAdd = () => {
    setTipoToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (tipo: TipoMovimientoInventarioResponse) => {
    setTipoToEdit(tipo);
    setFormOpen(true);
  };

  // Delete Dialog state
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [tipoToDelete, setTipoToDelete] =
    React.useState<TipoMovimientoInventarioResponse | null>(null);

  const handleOpenDelete = (tipo: TipoMovimientoInventarioResponse) => {
    setTipoToDelete(tipo);
    setDeleteOpen(true);
  };

  // Audit Dialog state
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAudit = (tipo: TipoMovimientoInventarioResponse) => {
    const rawCreated =
      tipo.fechaCreacion ||
      (tipo as any).createdAt ||
      (tipo as any).created_at ||
      (tipo as any).creadoEn;
    const rawUpdated =
      tipo.fechaModificacion ||
      (tipo as any).updatedAt ||
      (tipo as any).updated_at ||
      (tipo as any).actualizadoEn;
    const createdUser =
      tipo.creadoPor ||
      (tipo as any).createdBy ||
      (tipo as any).created_by ||
      (tipo as any).usuarioCreacion;
    const updatedUser =
      tipo.modificadoPor ||
      (tipo as any).updatedBy ||
      (tipo as any).updated_by ||
      (tipo as any).usuarioModificacion;

    setAuditInfo({
      title: "Auditoría de Tipo de Movimiento",
      entityName: tipo.nombre,
      entityCode: tipo.codigo,
      id: tipo.id,
      createdAt: rawCreated,
      createdBy: createdUser,
      updatedAt: rawUpdated,
      updatedBy: updatedUser,
      extraDetails: [
        {
          label: "Naturaleza",
          value:
            tipo.naturaleza === NaturalezaMovimiento.Entrada
              ? "Entrada (+ Stock)"
              : "Salida (- Stock)",
        },
        ...(tipo.descripcion
          ? [{ label: "Descripción", value: tipo.descripcion }]
          : []),
      ],
    });
    setAuditDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      <TipoMovimientoInventarioHeader
        totalItems={tiposData?.totalItems ?? 0}
      />

      <TipoMovimientoInventarioMetrics
        tipos={tiposMovimiento}
        totalItems={tiposData?.totalItems ?? 0}
        isLoading={isLoading}
      />

      <TipoMovimientoInventarioList
        tiposMovimiento={tiposMovimiento}
        isLoading={isLoading}
        totalItems={tiposData?.totalItems ?? 0}
        currentPage={page}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedNaturaleza={naturaleza}
        onSearchChange={handleSearchChange}
        onNaturalezaChange={handleNaturalezaChange}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onAddTipoMovimiento={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
        onViewAudit={handleViewAudit}
      />

      {/* Form Dialog (Create / Edit) */}
      <TipoMovimientoInventarioFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        tipoToEdit={tipoToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Dialog */}
      <TipoMovimientoInventarioDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        tipoToDelete={tipoToDelete}
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
