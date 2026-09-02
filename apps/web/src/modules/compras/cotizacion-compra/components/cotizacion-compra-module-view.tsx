"use client";

import * as React from "react";
import { CotizacionCompraHeader } from "./cotizacion-compra-header";
import { CotizacionCompraMetrics } from "./cotizacion-compra-metrics";
import { CotizacionCompraList } from "./cotizacion-compra-list";
import { CotizacionCompraFormDialog } from "./cotizacion-compra-form-dialog";
import { CotizacionCompraDetailDialog } from "./cotizacion-compra-detail-dialog";
import { CotizacionCompraCancelDialog } from "./cotizacion-compra-cancel-dialog";
import { CotizacionCompraDeleteDialog } from "./cotizacion-compra-delete-dialog";
import {
  useCotizacionesCompra,
  useRecibirCotizacionCompra,
  useSeleccionarCotizacionCompra,
  useRechazarCotizacionCompra,
} from "../hooks/use-cotizacion-compra";
import {
  EstadoCotizacionCompra,
  type CotizacionCompraResponse,
} from "../types/cotizacion-compra.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";
import { toast } from "sonner";

export function CotizacionCompraModuleView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedProveedorId, setSelectedProveedorId] = React.useState<
    number | null
  >(null);
  const [selectedEstado, setSelectedEstado] =
    React.useState<EstadoCotizacionCompra | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const {
    data: cotizacionesData,
    isLoading,
    isRefetching,
    refetch,
  } = useCotizacionesCompra({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
    proveedorId: selectedProveedorId ?? undefined,
    estado: selectedEstado ?? undefined,
  });

  const cotizaciones = cotizacionesData?.items ?? [];

  const recibirMutation = useRecibirCotizacionCompra();
  const seleccionarMutation = useSeleccionarCotizacionCompra();
  const rechazarMutation = useRechazarCotizacionCompra();

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleProveedorChange = (id: number | null) => {
    setSelectedProveedorId(id);
    setPage(1);
  };

  const handleEstadoChange = (estado: EstadoCotizacionCompra | null) => {
    setSelectedEstado(estado);
    setPage(1);
  };

  // Form Dialog
  const [formOpen, setFormOpen] = React.useState(false);
  const [cotizacionToEdit, setCotizacionToEdit] =
    React.useState<CotizacionCompraResponse | null>(null);

  const handleOpenAdd = () => {
    setCotizacionToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (c: CotizacionCompraResponse) => {
    setCotizacionToEdit(c);
    setFormOpen(true);
  };

  // Detail Dialog
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailCotizacionId, setDetailCotizacionId] = React.useState<
    number | null
  >(null);

  const handleViewDetail = (c: CotizacionCompraResponse) => {
    setDetailCotizacionId(c.id);
    setDetailOpen(true);
  };

  // Quick State Actions
  const handleRecibir = async (c: CotizacionCompraResponse) => {
    try {
      await recibirMutation.mutateAsync(c.id);
      toast.success(`Cotización "${c.numero}" marcada como Recibida.`);
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Error al marcar como recibida.");
    }
  };

  const handleSeleccionar = async (c: CotizacionCompraResponse) => {
    try {
      await seleccionarMutation.mutateAsync(c.id);
      toast.success(`Cotización "${c.numero}" seleccionada como Ganadora.`);
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Error al seleccionar cotización.");
    }
  };

  const handleRechazar = async (c: CotizacionCompraResponse) => {
    try {
      await rechazarMutation.mutateAsync(c.id);
      toast.success(`Cotización "${c.numero}" rechazada.`);
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Error al rechazar cotización.");
    }
  };

  // Cancel Dialog
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cotizacionToCancel, setCotizacionToCancel] =
    React.useState<CotizacionCompraResponse | null>(null);

  const handleOpenCancel = (c: CotizacionCompraResponse) => {
    setCotizacionToCancel(c);
    setCancelOpen(true);
  };

  // Delete Dialog
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [cotizacionToDelete, setCotizacionToDelete] =
    React.useState<CotizacionCompraResponse | null>(null);

  const handleOpenDelete = (c: CotizacionCompraResponse) => {
    setCotizacionToDelete(c);
    setDeleteOpen(true);
  };

  // Audit Dialog
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAudit = (c: CotizacionCompraResponse) => {
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

    setAuditInfo({
      title: "Auditoría de Cotización de Compra",
      entityName: `Cotización ${c.numero}`,
      entityCode: c.numero,
      id: c.id,
      createdAt: rawCreated,
      createdBy: c.creadoPor || (c as any).createdBy,
      updatedAt: rawUpdated,
      updatedBy: c.modificadoPor || (c as any).updatedBy,
      extraDetails: [
        { label: "Proveedor", value: c.proveedorRazonSocial || "-" },
        { label: "Solicitud Origen", value: c.solicitudCompraNumero || "-" },
        { label: "Condición de Pago", value: c.condicionPago || "-" },
        { label: "Tiempo de Entrega", value: c.tiempoEntrega || "-" },
        { label: "Monto Total", value: `${c.total}` },
      ],
    });
    setAuditDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Header */}
      <CotizacionCompraHeader
        totalItems={cotizacionesData?.totalItems ?? 0}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Metrics */}
      <CotizacionCompraMetrics
        cotizaciones={cotizaciones}
        totalItems={cotizacionesData?.totalItems ?? 0}
        isLoading={isLoading}
      />

      {/* List */}
      <CotizacionCompraList
        cotizaciones={cotizaciones}
        isLoading={isLoading}
        totalItems={cotizacionesData?.totalItems ?? 0}
        currentPage={page}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedProveedorId={selectedProveedorId}
        selectedEstado={selectedEstado}
        onSearchChange={handleSearchChange}
        onProveedorChange={handleProveedorChange}
        onEstadoChange={handleEstadoChange}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onAddCotizacion={handleOpenAdd}
        onViewDetail={handleViewDetail}
        onEdit={handleOpenEdit}
        onRecibir={handleRecibir}
        onSeleccionar={handleSeleccionar}
        onRechazar={handleRechazar}
        onCancel={handleOpenCancel}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
        onViewAudit={handleViewAudit}
      />

      {/* Form Dialog */}
      <CotizacionCompraFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        cotizacionToEdit={cotizacionToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Detail Dialog */}
      <CotizacionCompraDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        cotizacionId={detailCotizacionId}
        onRecibir={handleRecibir}
        onSeleccionar={handleSeleccionar}
        onRechazar={handleRechazar}
        onCancel={handleOpenCancel}
      />

      {/* Cancel Dialog */}
      <CotizacionCompraCancelDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        cotizacion={cotizacionToCancel}
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Dialog */}
      <CotizacionCompraDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        cotizacion={cotizacionToDelete}
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
