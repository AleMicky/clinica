"use client";

import * as React from "react";
import { SolicitudCompraHeader } from "./solicitud-compra-header";
import { SolicitudCompraMetrics } from "./solicitud-compra-metrics";
import { SolicitudCompraList } from "./solicitud-compra-list";
import { SolicitudCompraFormDialog } from "./solicitud-compra-form-dialog";
import { SolicitudCompraDetailDialog } from "./solicitud-compra-detail-dialog";
import { SolicitudCompraSendApprovalDialog } from "./solicitud-compra-send-approval-dialog";
import { SolicitudCompraApproveDialog } from "./solicitud-compra-approve-dialog";
import { SolicitudCompraRejectDialog } from "./solicitud-compra-reject-dialog";
import { SolicitudCompraCancelDialog } from "./solicitud-compra-cancel-dialog";
import { SolicitudCompraDeleteDialog } from "./solicitud-compra-delete-dialog";
import { useSolicitudesCompra } from "../hooks/use-solicitud-compra";
import {
  EstadoSolicitudCompra,
  type SolicitudCompraResponse,
} from "../types/solicitud-compra.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";

export function SolicitudCompraModuleView() {
  // Query state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedAlmacenId, setSelectedAlmacenId] = React.useState<
    number | null
  >(null);
  const [selectedEstado, setSelectedEstado] =
    React.useState<EstadoSolicitudCompra | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const {
    data: solicitudesData,
    isLoading,
    isRefetching,
    refetch,
  } = useSolicitudesCompra({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
    almacenId: selectedAlmacenId ?? undefined,
    estado: selectedEstado ?? undefined,
  });

  const solicitudes = solicitudesData?.items ?? [];

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleAlmacenChange = (id: number | null) => {
    setSelectedAlmacenId(id);
    setPage(1);
  };

  const handleEstadoChange = (estado: EstadoSolicitudCompra | null) => {
    setSelectedEstado(estado);
    setPage(1);
  };

  // Form Dialog (Create / Edit)
  const [formOpen, setFormOpen] = React.useState(false);
  const [solicitudToEdit, setSolicitudToEdit] =
    React.useState<SolicitudCompraResponse | null>(null);

  const handleOpenAdd = () => {
    setSolicitudToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (s: SolicitudCompraResponse) => {
    setSolicitudToEdit(s);
    setFormOpen(true);
  };

  // Detail Dialog
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailSolicitudId, setDetailSolicitudId] = React.useState<
    number | null
  >(null);

  const handleViewDetail = (s: SolicitudCompraResponse) => {
    setDetailSolicitudId(s.id);
    setDetailOpen(true);
  };

  // Send Approval Dialog
  const [sendApprovalOpen, setSendApprovalOpen] = React.useState(false);
  const [solicitudToSend, setSolicitudToSend] =
    React.useState<SolicitudCompraResponse | null>(null);

  const handleOpenSendApproval = (s: SolicitudCompraResponse) => {
    setSolicitudToSend(s);
    setSendApprovalOpen(true);
  };

  // Approve Dialog
  const [approveOpen, setApproveOpen] = React.useState(false);
  const [solicitudToApprove, setSolicitudToApprove] =
    React.useState<SolicitudCompraResponse | null>(null);

  const handleOpenApprove = (s: SolicitudCompraResponse) => {
    setSolicitudToApprove(s);
    setApproveOpen(true);
  };

  // Reject Dialog
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [solicitudToReject, setSolicitudToReject] =
    React.useState<SolicitudCompraResponse | null>(null);

  const handleOpenReject = (s: SolicitudCompraResponse) => {
    setSolicitudToReject(s);
    setRejectOpen(true);
  };

  // Cancel Dialog
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [solicitudToCancel, setSolicitudToCancel] =
    React.useState<SolicitudCompraResponse | null>(null);

  const handleOpenCancel = (s: SolicitudCompraResponse) => {
    setSolicitudToCancel(s);
    setCancelOpen(true);
  };

  // Delete Dialog
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [solicitudToDelete, setSolicitudToDelete] =
    React.useState<SolicitudCompraResponse | null>(null);

  const handleOpenDelete = (s: SolicitudCompraResponse) => {
    setSolicitudToDelete(s);
    setDeleteOpen(true);
  };

  // Audit Dialog
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAudit = (s: SolicitudCompraResponse) => {
    const rawCreated =
      s.fechaCreacion ||
      (s as any).createdAt ||
      (s as any).created_at ||
      (s as any).creadoEn;
    const rawUpdated =
      s.fechaModificacion ||
      (s as any).updatedAt ||
      (s as any).updated_at ||
      (s as any).actualizadoEn;
    const createdUser =
      s.creadoPor ||
      (s as any).createdBy ||
      (s as any).created_by ||
      (s as any).usuarioCreacion;
    const updatedUser =
      s.modificadoPor ||
      (s as any).updatedBy ||
      (s as any).updated_by ||
      (s as any).usuarioModificacion;

    setAuditInfo({
      title: "Auditoría de Solicitud de Compra",
      entityName: `Solicitud ${s.numero}`,
      entityCode: s.numero,
      id: s.id,
      createdAt: rawCreated,
      createdBy: createdUser,
      updatedAt: rawUpdated,
      updatedBy: updatedUser,
      extraDetails: [
        { label: "Almacén Destino", value: s.almacenNombre || "-" },
        { label: "Fecha Emisión", value: s.fechaSolicitud || "-" },
        { label: "Fecha Requerida", value: s.fechaRequerida || "-" },
        { label: "Observación", value: s.observacion || "-" },
        ...(s.fechaAprobacion
          ? [{ label: "Fecha Aprobación", value: s.fechaAprobacion }]
          : []),
        ...(s.aprobadoPorId
          ? [{ label: "Aprobado Por", value: s.aprobadoPorId }]
          : []),
        ...(s.observacionAprobacion
          ? [{ label: "Observación Aprobación", value: s.observacionAprobacion }]
          : []),
      ],
    });
    setAuditDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Header */}
      <SolicitudCompraHeader
        totalItems={solicitudesData?.totalItems ?? 0}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Metrics */}
      <SolicitudCompraMetrics
        solicitudes={solicitudes}
        totalItems={solicitudesData?.totalItems ?? 0}
        isLoading={isLoading}
      />

      {/* List */}
      <SolicitudCompraList
        solicitudes={solicitudes}
        isLoading={isLoading}
        totalItems={solicitudesData?.totalItems ?? 0}
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
        onAddSolicitud={handleOpenAdd}
        onViewDetail={handleViewDetail}
        onEdit={handleOpenEdit}
        onSendApproval={handleOpenSendApproval}
        onApprove={handleOpenApprove}
        onReject={handleOpenReject}
        onCancel={handleOpenCancel}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
        onViewAudit={handleViewAudit}
      />

      {/* Form Dialog */}
      <SolicitudCompraFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        solicitudToEdit={solicitudToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Detail Dialog */}
      <SolicitudCompraDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        solicitudId={detailSolicitudId}
        onSendApproval={handleOpenSendApproval}
        onApprove={handleOpenApprove}
        onReject={handleOpenReject}
        onCancel={handleOpenCancel}
      />

      {/* Send Approval Dialog */}
      <SolicitudCompraSendApprovalDialog
        open={sendApprovalOpen}
        onOpenChange={setSendApprovalOpen}
        solicitud={solicitudToSend}
        onSuccessCallback={() => refetch()}
      />

      {/* Approve Dialog */}
      <SolicitudCompraApproveDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        solicitud={solicitudToApprove}
        onSuccessCallback={() => refetch()}
      />

      {/* Reject Dialog */}
      <SolicitudCompraRejectDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        solicitud={solicitudToReject}
        onSuccessCallback={() => refetch()}
      />

      {/* Cancel Dialog */}
      <SolicitudCompraCancelDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        solicitud={solicitudToCancel}
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Dialog */}
      <SolicitudCompraDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        solicitud={solicitudToDelete}
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
