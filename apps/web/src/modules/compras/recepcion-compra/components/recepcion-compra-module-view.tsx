"use client";

import * as React from "react";
import { RecepcionCompraHeader } from "./recepcion-compra-header";
import { RecepcionCompraMetrics } from "./recepcion-compra-metrics";
import { RecepcionCompraList } from "./recepcion-compra-list";
import { RecepcionCompraFormDialog } from "./recepcion-compra-form-dialog";
import { RecepcionCompraDetailDialog } from "./recepcion-compra-detail-dialog";
import { RecepcionCompraAnularDialog } from "./recepcion-compra-anular-dialog";
import { RecepcionCompraDeleteDialog } from "./recepcion-compra-delete-dialog";
import {
  useRecepcionesCompra,
  useConfirmarRecepcionCompra,
} from "../hooks/use-recepcion-compra";
import {
  EstadoRecepcionCompra,
  type RecepcionCompraResponse,
} from "../types/recepcion-compra.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";
import { toast } from "sonner";

export function RecepcionCompraModuleView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedProveedorId, setSelectedProveedorId] = React.useState<
    number | null
  >(null);
  const [selectedAlmacenId, setSelectedAlmacenId] = React.useState<
    number | null
  >(null);
  const [selectedEstado, setSelectedEstado] =
    React.useState<EstadoRecepcionCompra | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const {
    data: recepcionesData,
    isLoading,
    isRefetching,
    refetch,
  } = useRecepcionesCompra({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
    proveedorId: selectedProveedorId ?? undefined,
    almacenId: selectedAlmacenId ?? undefined,
    estado: selectedEstado ?? undefined,
  });

  const recepciones = recepcionesData?.items ?? [];

  const confirmarMutation = useConfirmarRecepcionCompra();

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

  const handleEstadoChange = (estado: EstadoRecepcionCompra | null) => {
    setSelectedEstado(estado);
    setPage(1);
  };

  // Form Dialog
  const [formOpen, setFormOpen] = React.useState(false);
  const [recepcionToEdit, setRecepcionToEdit] =
    React.useState<RecepcionCompraResponse | null>(null);

  const handleOpenAdd = () => {
    setRecepcionToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (r: RecepcionCompraResponse) => {
    setRecepcionToEdit(r);
    setFormOpen(true);
  };

  // Detail Dialog
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailRecepcionId, setDetailRecepcionId] = React.useState<
    number | null
  >(null);

  const handleViewDetail = (r: RecepcionCompraResponse) => {
    setDetailRecepcionId(r.id);
    setDetailOpen(true);
  };

  // Quick Confirm
  const handleConfirm = async (r: RecepcionCompraResponse) => {
    try {
      await confirmarMutation.mutateAsync(r.id);
      toast.success(
        `Recepción "${r.numero}" confirmada. Stock ingresado al almacén.`
      );
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Error al confirmar la recepción.");
    }
  };

  // Anular Dialog
  const [anularOpen, setAnularOpen] = React.useState(false);
  const [recepcionToAnular, setRecepcionToAnular] =
    React.useState<RecepcionCompraResponse | null>(null);

  const handleOpenAnular = (r: RecepcionCompraResponse) => {
    setRecepcionToAnular(r);
    setAnularOpen(true);
  };

  // Delete Dialog
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [recepcionToDelete, setRecepcionToDelete] =
    React.useState<RecepcionCompraResponse | null>(null);

  const handleOpenDelete = (r: RecepcionCompraResponse) => {
    setRecepcionToDelete(r);
    setDeleteOpen(true);
  };

  // Audit Dialog
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAudit = (r: RecepcionCompraResponse) => {
    const rawCreated =
      r.fechaCreacion ||
      (r as any).createdAt ||
      (r as any).created_at ||
      (r as any).creadoEn;
    const rawUpdated =
      r.fechaModificacion ||
      (r as any).updatedAt ||
      (r as any).updated_at ||
      (r as any).actualizadoEn;

    setAuditInfo({
      title: "Auditoría de Recepción de Compra",
      entityName: `Recepción ${r.numero}`,
      entityCode: r.numero,
      id: r.id,
      createdAt: rawCreated,
      createdBy: r.creadoPor || (r as any).createdBy,
      updatedAt: rawUpdated,
      updatedBy: r.modificadoPor || (r as any).updatedBy,
      extraDetails: [
        { label: "Orden Compra", value: r.ordenCompraNumero || "-" },
        { label: "Proveedor", value: r.proveedorRazonSocial || "-" },
        { label: "Almacén", value: r.almacenNombre || "-" },
        { label: "Fecha Recepción", value: r.fechaRecepcion || "-" },
        { label: "Factura", value: r.numeroFactura || "-" },
        { label: "Remisión", value: r.numeroRemision || "-" },
        ...(r.movimientoInventarioId
          ? [
              {
                label: "Movimiento Inventario",
                value: `#${r.movimientoInventarioId}`,
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
      <RecepcionCompraHeader
        totalItems={recepcionesData?.totalItems ?? 0}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Metrics */}
      <RecepcionCompraMetrics
        recepciones={recepciones}
        totalItems={recepcionesData?.totalItems ?? 0}
        isLoading={isLoading}
      />

      {/* List */}
      <RecepcionCompraList
        recepciones={recepciones}
        isLoading={isLoading}
        totalItems={recepcionesData?.totalItems ?? 0}
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
        onAddRecepcion={handleOpenAdd}
        onViewDetail={handleViewDetail}
        onEdit={handleOpenEdit}
        onConfirm={handleConfirm}
        onAnular={handleOpenAnular}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
        onViewAudit={handleViewAudit}
      />

      {/* Form Dialog */}
      <RecepcionCompraFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        recepcionToEdit={recepcionToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Detail Dialog */}
      <RecepcionCompraDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        recepcionId={detailRecepcionId}
        onConfirm={handleConfirm}
        onAnular={handleOpenAnular}
      />

      {/* Anular Dialog */}
      <RecepcionCompraAnularDialog
        open={anularOpen}
        onOpenChange={setAnularOpen}
        recepcion={recepcionToAnular}
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Dialog */}
      <RecepcionCompraDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        recepcion={recepcionToDelete}
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
