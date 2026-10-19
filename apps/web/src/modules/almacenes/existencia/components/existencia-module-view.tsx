"use client";

import * as React from "react";
import { ExistenciaHeader } from "./existencia-header";
import { ExistenciaList } from "./existencia-list";
import { ExistenciaFormDialog } from "./existencia-form-dialog";
import { ExistenciaDeleteDialog } from "./existencia-delete-dialog";
import { useExistencias } from "../hooks/use-existencia";
import { useAlmacenes } from "../../almacen/hooks/use-almacen";
import { useProductos } from "../../producto/hooks/use-producto";
import type { ExistenciaResponse } from "../types/existencia.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";
import { ExistenciaPartidasModal } from "../../existencia-partida/components/existencia-partidas-modal";
import { KardexModal } from "../../kardex";
import { AlertasStockDialog, useAlertasStock } from "../../alertas-stock";

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
  const almacenes = almacenesData?.items ?? [];

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
        { label: "Stock Físico", value: String(item.cantidad) },
        { label: "Stock Reservado", value: String(item.cantidadReservada) },
        { label: "Stock Disponible", value: String(item.cantidadDisponible) },
      ],
    });
    setAuditDialogOpen(true);
  };

  // Partidas Modal state
  const [partidasModalOpen, setPartidasModalOpen] = React.useState(false);
  const [selectedExistenciaForPartidas, setSelectedExistenciaForPartidas] =
    React.useState<ExistenciaResponse | null>(null);

  const handleOpenPartidas = (item: ExistenciaResponse) => {
    setSelectedExistenciaForPartidas(item);
    setPartidasModalOpen(true);
  };

  // Kardex Modal state
  const [kardexModalOpen, setKardexModalOpen] = React.useState(false);
  const [selectedExistenciaForKardex, setSelectedExistenciaForKardex] =
    React.useState<ExistenciaResponse | null>(null);

  const handleOpenKardex = (item: ExistenciaResponse) => {
    setSelectedExistenciaForKardex(item);
    setKardexModalOpen(true);
  };

  // Alertas Dialog state
  const [alertasDialogOpen, setAlertasDialogOpen] = React.useState(false);
  const { data: alertasStock = [] } = useAlertasStock({
    almacenId: selectedAlmacenId ?? undefined,
  });

  return (
    <div className="flex flex-col gap-3.5 w-full">
      <ExistenciaHeader
        totalItems={existenciasData?.totalItems ?? 0}
        totalFisico={totalFisico}
        totalReservado={totalReservado}
        totalDisponible={totalDisponible}
        alertasCount={alertasStock.length}
        onOpenAlertas={() => setAlertasDialogOpen(true)}
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
        onViewPartidas={handleOpenPartidas}
        onViewKardex={handleOpenKardex}
      />

      {/* Kardex Físico - Valorado Modal */}
      <KardexModal
        open={kardexModalOpen}
        onOpenChange={setKardexModalOpen}
        almacenId={selectedExistenciaForKardex?.almacenId}
        productoId={selectedExistenciaForKardex?.productoId}
        productoNombre={selectedExistenciaForKardex?.productoNombre}
        productoCodigo={selectedExistenciaForKardex?.productoCodigo}
        almacenNombre={selectedExistenciaForKardex?.almacenNombre}
      />

      {/* Alertas de Stock y Caducidad Dialog */}
      <AlertasStockDialog
        open={alertasDialogOpen}
        onOpenChange={setAlertasDialogOpen}
        selectedAlmacenId={selectedAlmacenId}
        onSelectExistencia={(almId, prodId) => {
          setSelectedAlmacenId(almId);
          const found = existencias.find(
            (e) => e.almacenId === almId && e.productoId === prodId
          );
          if (found) {
            handleOpenKardex(found);
          }
        }}
      />

      {/* Partidas / Lotes Breakdown Modal */}
      <ExistenciaPartidasModal
        open={partidasModalOpen}
        onOpenChange={setPartidasModalOpen}
        existencia={selectedExistenciaForPartidas}
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
