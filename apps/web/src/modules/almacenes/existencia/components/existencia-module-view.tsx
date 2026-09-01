"use client";

import * as React from "react";
import { ExistenciaHeader } from "./existencia-header";
import { ExistenciaList } from "./existencia-list";
import { ExistenciaFormDialog } from "./existencia-form-dialog";
import { ExistenciaDeleteDialog } from "./existencia-delete-dialog";
import { useExistencias } from "../hooks/use-existencia";
import { useAlmacenes } from "../../almacen/hooks/use-almacen";
import { useProductos } from "../../producto/hooks/use-producto";
import { useLotes } from "../../lote/hooks/use-lote";
import type { ExistenciaResponse } from "../types/existencia.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";

export function ExistenciaModuleView() {
  // Query filters
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedAlmacenId, setSelectedAlmacenId] = React.useState<number | null>(
    null
  );
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Aux queries
  const { data: almacenesData } = useAlmacenes({ pageSize: 100 });
  const { data: productosData } = useProductos({ pageSize: 1000 });
  const { data: lotesData } = useLotes({ pageSize: 500 });

  const almacenes = almacenesData?.items ?? [];
  const productos = productosData?.items ?? [];
  const lotes = lotesData?.items ?? [];

  // Main existencias query
  const {
    data: existenciasData,
    isLoading,
    refetch,
  } = useExistencias({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
    almacenId: selectedAlmacenId ?? undefined,
  });

  const existencias = existenciasData?.items ?? [];

  // Aggregated KPI calculations for current page / data
  const totalFisico = React.useMemo(
    () => existencias.reduce((acc, curr) => acc + (curr.cantidad || 0), 0),
    [existencias]
  );
  const totalReservado = React.useMemo(
    () =>
      existencias.reduce((acc, curr) => acc + (curr.cantidadReservada || 0), 0),
    [existencias]
  );
  const totalDisponible = React.useMemo(
    () =>
      existencias.reduce((acc, curr) => acc + (curr.cantidadDisponible || 0), 0),
    [existencias]
  );

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleAlmacenChange = (id: number | null) => {
    setSelectedAlmacenId(id);
    setPage(1);
  };

  // Form Dialog state
  const [formOpen, setFormOpen] = React.useState(false);
  const [existenciaToEdit, setExistenciaToEdit] =
    React.useState<ExistenciaResponse | null>(null);

  const handleOpenAdd = () => {
    setExistenciaToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (item: ExistenciaResponse) => {
    setExistenciaToEdit(item);
    setFormOpen(true);
  };

  // Delete Dialog state
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [existenciaToDelete, setExistenciaToDelete] =
    React.useState<ExistenciaResponse | null>(null);

  const handleOpenDelete = (item: ExistenciaResponse) => {
    setExistenciaToDelete(item);
    setDeleteOpen(true);
  };

  // Audit Dialog state
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAudit = (item: ExistenciaResponse) => {
    const rawCreated =
      item.fechaCreacion ||
      (item as any).createdAt ||
      (item as any).created_at ||
      (item as any).creadoEn;
    const rawUpdated =
      item.fechaModificacion ||
      (item as any).updatedAt ||
      (item as any).updated_at ||
      (item as any).actualizadoEn;
    const createdUser =
      item.creadoPor ||
      (item as any).createdBy ||
      (item as any).created_by ||
      (item as any).usuarioCreacion;
    const updatedUser =
      item.modificadoPor ||
      (item as any).updatedBy ||
      (item as any).updated_by ||
      (item as any).usuarioModificacion;

    setAuditInfo({
      title: "Auditoría de Existencia / Stock",
      entityName: item.productoNombre || `Producto #${item.productoId}`,
      entityCode: item.productoCodigo || undefined,
      id: item.id,
      createdAt: rawCreated,
      createdBy: createdUser,
      updatedAt: rawUpdated,
      updatedBy: updatedUser,
      extraDetails: [
        { label: "Almacén", value: item.almacenNombre || `#${item.almacenId}` },
        ...(item.loteNumero ? [{ label: "Lote", value: item.loteNumero }] : []),
        { label: "Stock Físico", value: String(item.cantidad) },
        { label: "Stock Reservado", value: String(item.cantidadReservada) },
        { label: "Stock Disponible", value: String(item.cantidadDisponible) },
      ],
    });
    setAuditDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      <ExistenciaHeader
        totalItems={existenciasData?.totalItems ?? 0}
        totalFisico={totalFisico}
        totalReservado={totalReservado}
        totalDisponible={totalDisponible}
      />

      <ExistenciaList
        existencias={existencias}
        almacenes={almacenes}
        isLoading={isLoading}
        totalItems={existenciasData?.totalItems ?? 0}
        currentPage={page}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedAlmacenId={selectedAlmacenId}
        onSearchChange={handleSearchChange}
        onAlmacenChange={handleAlmacenChange}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onAddExistencia={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
        onViewAudit={handleViewAudit}
      />

      {/* Form Dialog (Create / Edit) */}
      <ExistenciaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        existenciaToEdit={existenciaToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Dialog */}
      <ExistenciaDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        existenciaToDelete={existenciaToDelete}
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
