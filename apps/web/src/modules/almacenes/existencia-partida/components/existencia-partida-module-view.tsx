"use client";

import * as React from "react";
import { ExistenciaPartidaHeader } from "./existencia-partida-header";
import { ExistenciaPartidaList } from "./existencia-partida-list";
import { ExistenciaPartidaFormDialog } from "./existencia-partida-form-dialog";
import { ExistenciaPartidaDeleteDialog } from "./existencia-partida-delete-dialog";
import { useExistenciasPartidas } from "../hooks/use-existencia-partida";
import { useAlmacenes } from "../../almacen/hooks/use-almacen";
import type { ExistenciaPartidaResponse } from "../types/existencia-partida.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";

export function ExistenciaPartidaModuleView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedAlmacenId, setSelectedAlmacenId] = React.useState<number | null>(
    null
  );
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Aux queries
  const { data: almacenesData } = useAlmacenes({ pageSize: 100 });
  const almacenes = almacenesData?.items ?? [];

  // Main existencias-partidas query
  const {
    data: partidasData,
    isLoading,
    refetch,
  } = useExistenciasPartidas({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
    almacenId: selectedAlmacenId ?? undefined,
  });

  const items = partidasData?.items ?? [];

  // KPI calculations
  const totalFisico = React.useMemo(
    () => items.reduce((acc, curr) => acc + (curr.cantidad || 0), 0),
    [items]
  );
  const totalReservado = React.useMemo(
    () => items.reduce((acc, curr) => acc + (curr.cantidadReservada || 0), 0),
    [items]
  );
  const totalDisponible = React.useMemo(
    () => items.reduce((acc, curr) => acc + (curr.cantidadDisponible || 0), 0),
    [items]
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
  const [partidaToEdit, setPartidaToEdit] =
    React.useState<ExistenciaPartidaResponse | null>(null);

  const handleOpenAdd = () => {
    setPartidaToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (item: ExistenciaPartidaResponse) => {
    setPartidaToEdit(item);
    setFormOpen(true);
  };

  // Delete Dialog state
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [partidaToDelete, setPartidaToDelete] =
    React.useState<ExistenciaPartidaResponse | null>(null);

  const handleOpenDelete = (item: ExistenciaPartidaResponse) => {
    setPartidaToDelete(item);
    setDeleteOpen(true);
  };

  // Audit Dialog state
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAudit = (item: ExistenciaPartidaResponse) => {
    setAuditInfo({
      title: "Auditoría de Partida en Existencia",
      entityName: `${item.productoNombre || "Producto"} (Lote ${item.numeroPartida || item.partidaInventarioId})`,
      entityCode: item.productoCodigo || undefined,
      id: item.id,
      createdAt: item.fechaCreacion,
      createdBy: item.creadoPor,
      updatedAt: item.fechaModificacion,
      updatedBy: item.modificadoPor,
      extraDetails: [
        { label: "Almacén", value: item.almacenNombre || `#${item.almacenId}` },
        { label: "Lote / Partida", value: item.numeroPartida || `#${item.partidaInventarioId}` },
        { label: "Costo Unitario", value: `$${item.costoUnitario.toFixed(2)}` },
        { label: "Fecha Caducidad", value: item.fechaVencimiento || "Sin caducidad" },
        { label: "Stock Físico", value: String(item.cantidad) },
        { label: "Stock Reservado", value: String(item.cantidadReservada) },
        { label: "Stock Disponible", value: String(item.cantidadDisponible) },
      ],
    });
    setAuditDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      <ExistenciaPartidaHeader
        totalItems={partidasData?.totalItems ?? 0}
        totalFisico={totalFisico}
        totalReservado={totalReservado}
        totalDisponible={totalDisponible}
        onAdd={handleOpenAdd}
      />

      <ExistenciaPartidaList
        items={items}
        almacenes={almacenes}
        isLoading={isLoading}
        totalItems={partidasData?.totalItems ?? 0}
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
        onAddPartida={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
        onViewAudit={handleViewAudit}
      />

      {/* Form Dialog */}
      <ExistenciaPartidaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        existenciaPartidaToEdit={partidaToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Dialog */}
      <ExistenciaPartidaDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        existenciaPartidaToDelete={partidaToDelete}
        onSuccessCallback={() => refetch()}
      />

      {/* Audit Dialog */}
      <AuditDialog
        open={auditDialogOpen}
        onOpenChange={setAuditDialogOpen}
        auditInfo={auditInfo}
      />
    </div>
  );
}
