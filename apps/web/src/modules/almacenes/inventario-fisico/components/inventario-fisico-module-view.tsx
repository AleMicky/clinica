"use client";

import * as React from "react";
import { InventarioFisicoHeader } from "./inventario-fisico-header";
import { InventarioFisicoMetrics } from "./inventario-fisico-metrics";
import { InventarioFisicoList } from "./inventario-fisico-list";
import { InventarioFisicoFormDialog } from "./inventario-fisico-form-dialog";
import { InventarioFisicoDetailDialog } from "./inventario-fisico-detail-dialog";
import { InventarioFisicoIniciarConteoDialog } from "./inventario-fisico-iniciar-dialog";
import { InventarioFisicoRegistrarConteoDialog } from "./inventario-fisico-registrar-conteo-dialog";
import { InventarioFisicoCerrarDialog } from "./inventario-fisico-cerrar-dialog";
import { InventarioFisicoAnularDialog } from "./inventario-fisico-anular-dialog";
import { InventarioFisicoDeleteDialog } from "./inventario-fisico-delete-dialog";
import { useInventariosFisicos } from "../hooks/use-inventario-fisico";
import {
  EstadoInventarioFisico,
  type InventarioFisicoResponse,
} from "../types/inventario-fisico.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";

export function InventarioFisicoModuleView() {
  // Query state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedAlmacenId, setSelectedAlmacenId] = React.useState<
    number | null
  >(null);
  const [selectedEstado, setSelectedEstado] =
    React.useState<EstadoInventarioFisico | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const {
    data: inventariosData,
    isLoading,
    isRefetching,
    refetch,
  } = useInventariosFisicos({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
    almacenId: selectedAlmacenId ?? undefined,
    estado: selectedEstado ?? undefined,
  });

  const inventarios = inventariosData?.items ?? [];

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleAlmacenChange = (id: number | null) => {
    setSelectedAlmacenId(id);
    setPage(1);
  };

  const handleEstadoChange = (estado: EstadoInventarioFisico | null) => {
    setSelectedEstado(estado);
    setPage(1);
  };

  // Form Dialog (Create / Edit)
  const [formOpen, setFormOpen] = React.useState(false);
  const [inventarioToEdit, setInventarioToEdit] =
    React.useState<InventarioFisicoResponse | null>(null);

  const handleOpenAdd = () => {
    setInventarioToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (inv: InventarioFisicoResponse) => {
    setInventarioToEdit(inv);
    setFormOpen(true);
  };

  // Detail Dialog
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailInventarioId, setDetailInventarioId] = React.useState<
    number | null
  >(null);

  const handleViewDetail = (inv: InventarioFisicoResponse) => {
    setDetailInventarioId(inv.id);
    setDetailOpen(true);
  };

  // Iniciar Conteo Dialog
  const [iniciarOpen, setIniciarOpen] = React.useState(false);
  const [inventarioToIniciar, setInventarioToIniciar] =
    React.useState<InventarioFisicoResponse | null>(null);

  const handleOpenIniciar = (inv: InventarioFisicoResponse) => {
    setInventarioToIniciar(inv);
    setIniciarOpen(true);
  };

  // Registrar Conteos Dialog
  const [conteoOpen, setConteoOpen] = React.useState(false);
  const [inventarioToConteo, setInventarioToConteo] =
    React.useState<InventarioFisicoResponse | null>(null);

  const handleOpenConteo = (inv: InventarioFisicoResponse) => {
    setInventarioToConteo(inv);
    setConteoOpen(true);
  };

  // Cerrar Dialog
  const [cerrarOpen, setCerrarOpen] = React.useState(false);
  const [inventarioToCerrar, setInventarioToCerrar] =
    React.useState<InventarioFisicoResponse | null>(null);

  const handleOpenCerrar = (inv: InventarioFisicoResponse) => {
    setInventarioToCerrar(inv);
    setCerrarOpen(true);
  };

  // Anular Dialog
  const [anularOpen, setAnularOpen] = React.useState(false);
  const [inventarioToAnular, setInventarioToAnular] =
    React.useState<InventarioFisicoResponse | null>(null);

  const handleOpenAnular = (inv: InventarioFisicoResponse) => {
    setInventarioToAnular(inv);
    setAnularOpen(true);
  };

  // Delete Dialog
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [inventarioToDelete, setInventarioToDelete] =
    React.useState<InventarioFisicoResponse | null>(null);

  const handleOpenDelete = (inv: InventarioFisicoResponse) => {
    setInventarioToDelete(inv);
    setDeleteOpen(true);
  };

  // Audit Dialog
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAudit = (inv: InventarioFisicoResponse) => {
    const rawCreated =
      inv.fechaCreacion ||
      (inv as any).createdAt ||
      (inv as any).created_at ||
      (inv as any).creadoEn;
    const rawUpdated =
      inv.fechaModificacion ||
      (inv as any).updatedAt ||
      (inv as any).updated_at ||
      (inv as any).actualizadoEn;
    const createdUser =
      inv.creadoPor ||
      (inv as any).createdBy ||
      (inv as any).created_by ||
      (inv as any).usuarioCreacion;
    const updatedUser =
      inv.modificadoPor ||
      (inv as any).updatedBy ||
      (inv as any).updated_by ||
      (inv as any).usuarioModificacion;

    setAuditInfo({
      title: "Auditoría de Inventario Físico",
      entityName: `Inventario ${inv.numero}`,
      entityCode: inv.numero,
      id: inv.id,
      createdAt: rawCreated,
      createdBy: createdUser,
      updatedAt: rawUpdated,
      updatedBy: updatedUser,
      extraDetails: [
        { label: "Almacén", value: inv.almacenNombre || "-" },
        { label: "Fecha Inicio", value: inv.fechaInicio || "-" },
        ...(inv.fechaCierre
          ? [{ label: "Fecha Cierre", value: inv.fechaCierre }]
          : []),
        ...(inv.motivoAnulacion
          ? [{ label: "Motivo Anulación", value: inv.motivoAnulacion }]
          : []),
        ...(inv.movimientoAjustePositivoId
          ? [
              {
                label: "Movimiento Sobrante (Ingreso)",
                value: `#${inv.movimientoAjustePositivoId}`,
              },
            ]
          : []),
        ...(inv.movimientoAjusteNegativoId
          ? [
              {
                label: "Movimiento Faltante (Salida)",
                value: `#${inv.movimientoAjusteNegativoId}`,
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
      <InventarioFisicoHeader
        totalItems={inventariosData?.totalItems ?? 0}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Metrics */}
      <InventarioFisicoMetrics
        inventarios={inventarios}
        totalItems={inventariosData?.totalItems ?? 0}
        isLoading={isLoading}
      />

      {/* List */}
      <InventarioFisicoList
        inventarios={inventarios}
        isLoading={isLoading}
        totalItems={inventariosData?.totalItems ?? 0}
        currentPage={page}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedAlmacenId={selectedAlmacenId}
        selectedEstado={selectedEstado}
        onSearchChange={handleSearchChange}
        onAlmacenChange={handleAlmacenChange}
        onEstadoChange={handleEstadoChange}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onAddInventario={handleOpenAdd}
        onViewDetail={handleViewDetail}
        onEdit={handleOpenEdit}
        onIniciarConteo={handleOpenIniciar}
        onRegistrarConteo={handleOpenConteo}
        onCerrar={handleOpenCerrar}
        onAnular={handleOpenAnular}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
        onViewAudit={handleViewAudit}
      />

      {/* Form Dialog */}
      <InventarioFisicoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        inventarioToEdit={inventarioToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Detail Dialog */}
      <InventarioFisicoDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        inventarioId={detailInventarioId}
        onIniciarConteo={handleOpenIniciar}
        onRegistrarConteo={handleOpenConteo}
        onCerrar={handleOpenCerrar}
        onAnular={handleOpenAnular}
      />

      {/* Iniciar Conteo Dialog */}
      <InventarioFisicoIniciarConteoDialog
        open={iniciarOpen}
        onOpenChange={setIniciarOpen}
        inventarioToIniciar={inventarioToIniciar}
        onSuccessCallback={() => refetch()}
      />

      {/* Registrar Conteo Dialog */}
      <InventarioFisicoRegistrarConteoDialog
        open={conteoOpen}
        onOpenChange={setConteoOpen}
        inventarioToConteo={inventarioToConteo}
        onSuccessCallback={() => refetch()}
      />

      {/* Cerrar Dialog */}
      <InventarioFisicoCerrarDialog
        open={cerrarOpen}
        onOpenChange={setCerrarOpen}
        inventarioToCerrar={inventarioToCerrar}
        onSuccessCallback={() => refetch()}
      />

      {/* Anular Dialog */}
      <InventarioFisicoAnularDialog
        open={anularOpen}
        onOpenChange={setAnularOpen}
        inventarioToAnular={inventarioToAnular}
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Dialog */}
      <InventarioFisicoDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        inventarioToDelete={inventarioToDelete}
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
