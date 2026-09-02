"use client";

import * as React from "react";
import { OrdenCompraHeader } from "./orden-compra-header";
import { OrdenCompraMetrics } from "./orden-compra-metrics";
import { OrdenCompraList } from "./orden-compra-list";
import { OrdenCompraFormDialog } from "./orden-compra-form-dialog";
import { OrdenCompraDetailDialog } from "./orden-compra-detail-dialog";
import { OrdenCompraCancelDialog } from "./orden-compra-cancel-dialog";
import { OrdenCompraDeleteDialog } from "./orden-compra-delete-dialog";
import {
  useOrdenesCompra,
  useEnviarAprobacionOrdenCompra,
  useAprobarOrdenCompra,
  useEnviarProveedorOrdenCompra,
} from "../hooks/use-orden-compra";
import {
  EstadoOrdenCompra,
  type OrdenCompraResponse,
} from "../types/orden-compra.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";
import { toast } from "sonner";

export function OrdenCompraModuleView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedProveedorId, setSelectedProveedorId] = React.useState<
    number | null
  >(null);
  const [selectedAlmacenId, setSelectedAlmacenId] = React.useState<
    number | null
  >(null);
  const [selectedEstado, setSelectedEstado] =
    React.useState<EstadoOrdenCompra | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const {
    data: ordenesData,
    isLoading,
    isRefetching,
    refetch,
  } = useOrdenesCompra({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
    proveedorId: selectedProveedorId ?? undefined,
    almacenId: selectedAlmacenId ?? undefined,
    estado: selectedEstado ?? undefined,
  });

  const ordenes = ordenesData?.items ?? [];

  const enviarAprobacionMutation = useEnviarAprobacionOrdenCompra();
  const aprobarMutation = useAprobarOrdenCompra();
  const enviarProveedorMutation = useEnviarProveedorOrdenCompra();

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleProveedorChange = (id: number | null) => {
    setSelectedProveedorId(id);
    setPage(1);
  };

  const handleAlmacenChange = (id: number | null) => {
    setSelectedAlmacenId(id);
    setPage(1);
  };

  const handleEstadoChange = (estado: EstadoOrdenCompra | null) => {
    setSelectedEstado(estado);
    setPage(1);
  };

  // Form Dialog
  const [formOpen, setFormOpen] = React.useState(false);
  const [ordenToEdit, setOrdenToEdit] =
    React.useState<OrdenCompraResponse | null>(null);

  const handleOpenAdd = () => {
    setOrdenToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (o: OrdenCompraResponse) => {
    setOrdenToEdit(o);
    setFormOpen(true);
  };

  // Detail Dialog
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailOrdenId, setDetailOrdenId] = React.useState<number | null>(
    null
  );

  const handleViewDetail = (o: OrdenCompraResponse) => {
    setDetailOrdenId(o.id);
    setDetailOpen(true);
  };

  // Quick State Actions
  const handleSendApproval = async (o: OrdenCompraResponse) => {
    try {
      await enviarAprobacionMutation.mutateAsync(o.id);
      toast.success(`Orden "${o.numero}" enviada a Aprobación.`);
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Error al enviar a aprobación.");
    }
  };

  const handleApprove = async (o: OrdenCompraResponse) => {
    try {
      await aprobarMutation.mutateAsync(o.id);
      toast.success(`Orden "${o.numero}" aprobada formalmente.`);
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Error al aprobar la orden.");
    }
  };

  const handleSendProveedor = async (o: OrdenCompraResponse) => {
    try {
      await enviarProveedorMutation.mutateAsync(o.id);
      toast.success(`Orden "${o.numero}" marcada como Enviada al Proveedor.`);
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Error al enviar al proveedor.");
    }
  };

  // Cancel Dialog
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [ordenToCancel, setOrdenToCancel] =
    React.useState<OrdenCompraResponse | null>(null);

  const handleOpenCancel = (o: OrdenCompraResponse) => {
    setOrdenToCancel(o);
    setCancelOpen(true);
  };

  // Delete Dialog
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [ordenToDelete, setOrdenToDelete] =
    React.useState<OrdenCompraResponse | null>(null);

  const handleOpenDelete = (o: OrdenCompraResponse) => {
    setOrdenToDelete(o);
    setDeleteOpen(true);
  };

  // Audit Dialog
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAudit = (o: OrdenCompraResponse) => {
    const rawCreated =
      o.fechaCreacion ||
      (o as any).createdAt ||
      (o as any).created_at ||
      (o as any).creadoEn;
    const rawUpdated =
      o.fechaModificacion ||
      (o as any).updatedAt ||
      (o as any).updated_at ||
      (o as any).actualizadoEn;

    setAuditInfo({
      title: "Auditoría de Orden de Compra",
      entityName: `Orden ${o.numero}`,
      entityCode: o.numero,
      id: o.id,
      createdAt: rawCreated,
      createdBy: o.creadoPor || (o as any).createdBy,
      updatedAt: rawUpdated,
      updatedBy: o.modificadoPor || (o as any).updatedBy,
      extraDetails: [
        { label: "Proveedor", value: o.proveedorRazonSocial || "-" },
        { label: "Almacén Destino", value: o.almacenNombre || "-" },
        { label: "Fecha Emisión", value: o.fecha || "-" },
        { label: "Entrega Esperada", value: o.fechaEntregaEsperada || "-" },
        { label: "Condición de Pago", value: o.condicionPago || "-" },
        { label: "Monto Total", value: `${o.total}` },
      ],
    });
    setAuditDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Header */}
      <OrdenCompraHeader
        totalItems={ordenesData?.totalItems ?? 0}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Metrics */}
      <OrdenCompraMetrics
        ordenes={ordenes}
        totalItems={ordenesData?.totalItems ?? 0}
        isLoading={isLoading}
      />

      {/* List */}
      <OrdenCompraList
        ordenes={ordenes}
        isLoading={isLoading}
        totalItems={ordenesData?.totalItems ?? 0}
        currentPage={page}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedProveedorId={selectedProveedorId}
        selectedAlmacenId={selectedAlmacenId}
        selectedEstado={selectedEstado}
        onSearchChange={handleSearchChange}
        onProveedorChange={handleProveedorChange}
        onAlmacenChange={handleAlmacenChange}
        onEstadoChange={handleEstadoChange}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onAddOrden={handleOpenAdd}
        onViewDetail={handleViewDetail}
        onEdit={handleOpenEdit}
        onSendApproval={handleSendApproval}
        onApprove={handleApprove}
        onSendProveedor={handleSendProveedor}
        onCancel={handleOpenCancel}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
        onViewAudit={handleViewAudit}
      />

      {/* Form Dialog */}
      <OrdenCompraFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        ordenToEdit={ordenToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Detail Dialog */}
      <OrdenCompraDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        ordenId={detailOrdenId}
        onSendApproval={handleSendApproval}
        onApprove={handleApprove}
        onSendProveedor={handleSendProveedor}
        onCancel={handleOpenCancel}
      />

      {/* Cancel Dialog */}
      <OrdenCompraCancelDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        orden={ordenToCancel}
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Dialog */}
      <OrdenCompraDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        orden={ordenToDelete}
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
