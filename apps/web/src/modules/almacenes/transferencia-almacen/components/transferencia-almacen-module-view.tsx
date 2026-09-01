"use client";

import * as React from "react";
import { TransferenciaAlmacenHeader } from "./transferencia-almacen-header";
import { TransferenciaAlmacenMetrics } from "./transferencia-almacen-metrics";
import { TransferenciaAlmacenList } from "./transferencia-almacen-list";
import { TransferenciaAlmacenFormDialog } from "./transferencia-almacen-form-dialog";
import { TransferenciaAlmacenDetailDialog } from "./transferencia-almacen-detail-dialog";
import { TransferenciaAlmacenSolicitarDialog } from "./transferencia-almacen-solicitar-dialog";
import { TransferenciaAlmacenAprobarDialog } from "./transferencia-almacen-aprobar-dialog";
import { TransferenciaAlmacenDespacharDialog } from "./transferencia-almacen-despachar-dialog";
import { TransferenciaAlmacenRecibirDialog } from "./transferencia-almacen-recibir-dialog";
import { TransferenciaAlmacenCancelarDialog } from "./transferencia-almacen-cancelar-dialog";
import { TransferenciaAlmacenDeleteDialog } from "./transferencia-almacen-delete-dialog";
import { useTransferenciasAlmacen } from "../hooks/use-transferencia-almacen";
import {
  EstadoTransferenciaAlmacen,
  type TransferenciaAlmacenResponse,
} from "../types/transferencia-almacen.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";

export function TransferenciaAlmacenModuleView() {
  // Query state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedAlmacenOrigenId, setSelectedAlmacenOrigenId] = React.useState<
    number | null
  >(null);
  const [selectedAlmacenDestinoId, setSelectedAlmacenDestinoId] = React.useState<
    number | null
  >(null);
  const [selectedEstado, setSelectedEstado] =
    React.useState<EstadoTransferenciaAlmacen | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const {
    data: transferenciasData,
    isLoading,
    isRefetching,
    refetch,
  } = useTransferenciasAlmacen({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
    almacenOrigenId: selectedAlmacenOrigenId ?? undefined,
    almacenDestinoId: selectedAlmacenDestinoId ?? undefined,
    estado: selectedEstado ?? undefined,
  });

  const transferencias = transferenciasData?.items ?? [];

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleAlmacenOrigenChange = (id: number | null) => {
    setSelectedAlmacenOrigenId(id);
    setPage(1);
  };

  const handleAlmacenDestinoChange = (id: number | null) => {
    setSelectedAlmacenDestinoId(id);
    setPage(1);
  };

  const handleEstadoChange = (estado: EstadoTransferenciaAlmacen | null) => {
    setSelectedEstado(estado);
    setPage(1);
  };

  // Form Dialog (Create / Edit)
  const [formOpen, setFormOpen] = React.useState(false);
  const [transferenciaToEdit, setTransferenciaToEdit] =
    React.useState<TransferenciaAlmacenResponse | null>(null);

  const handleOpenAdd = () => {
    setTransferenciaToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (t: TransferenciaAlmacenResponse) => {
    setTransferenciaToEdit(t);
    setFormOpen(true);
  };

  // Detail Dialog
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailTransferenciaId, setDetailTransferenciaId] = React.useState<
    number | null
  >(null);

  const handleViewDetail = (t: TransferenciaAlmacenResponse) => {
    setDetailTransferenciaId(t.id);
    setDetailOpen(true);
  };

  // Solicitar Dialog
  const [solicitarOpen, setSolicitarOpen] = React.useState(false);
  const [transferenciaToSolicitar, setTransferenciaToSolicitar] =
    React.useState<TransferenciaAlmacenResponse | null>(null);

  const handleOpenSolicitar = (t: TransferenciaAlmacenResponse) => {
    setTransferenciaToSolicitar(t);
    setSolicitarOpen(true);
  };

  // Aprobar Dialog
  const [aprobarOpen, setAprobarOpen] = React.useState(false);
  const [transferenciaToAprobar, setTransferenciaToAprobar] =
    React.useState<TransferenciaAlmacenResponse | null>(null);

  const handleOpenAprobar = (t: TransferenciaAlmacenResponse) => {
    setTransferenciaToAprobar(t);
    setAprobarOpen(true);
  };

  // Despachar Dialog
  const [despacharOpen, setDespacharOpen] = React.useState(false);
  const [transferenciaToDespachar, setTransferenciaToDespachar] =
    React.useState<TransferenciaAlmacenResponse | null>(null);

  const handleOpenDespachar = (t: TransferenciaAlmacenResponse) => {
    setTransferenciaToDespachar(t);
    setDespacharOpen(true);
  };

  // Recibir Dialog
  const [recibirOpen, setRecibirOpen] = React.useState(false);
  const [transferenciaToRecibir, setTransferenciaToRecibir] =
    React.useState<TransferenciaAlmacenResponse | null>(null);

  const handleOpenRecibir = (t: TransferenciaAlmacenResponse) => {
    setTransferenciaToRecibir(t);
    setRecibirOpen(true);
  };

  // Cancelar Dialog
  const [cancelarOpen, setCancelarOpen] = React.useState(false);
  const [transferenciaToCancelar, setTransferenciaToCancelar] =
    React.useState<TransferenciaAlmacenResponse | null>(null);

  const handleOpenCancelar = (t: TransferenciaAlmacenResponse) => {
    setTransferenciaToCancelar(t);
    setCancelarOpen(true);
  };

  // Delete Dialog
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [transferenciaToDelete, setTransferenciaToDelete] =
    React.useState<TransferenciaAlmacenResponse | null>(null);

  const handleOpenDelete = (t: TransferenciaAlmacenResponse) => {
    setTransferenciaToDelete(t);
    setDeleteOpen(true);
  };

  // Audit Dialog
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAudit = (t: TransferenciaAlmacenResponse) => {
    const rawCreated =
      t.fechaCreacion ||
      (t as any).createdAt ||
      (t as any).created_at ||
      (t as any).creadoEn;
    const rawUpdated =
      t.fechaModificacion ||
      (t as any).updatedAt ||
      (t as any).updated_at ||
      (t as any).actualizadoEn;
    const createdUser =
      t.creadoPor ||
      (t as any).createdBy ||
      (t as any).created_by ||
      (t as any).usuarioCreacion;
    const updatedUser =
      t.modificadoPor ||
      (t as any).updatedBy ||
      (t as any).updated_by ||
      (t as any).usuarioModificacion;

    setAuditInfo({
      title: "Auditoría de Transferencia entre Almacenes",
      entityName: `Transferencia ${t.numero}`,
      entityCode: t.numero,
      id: t.id,
      createdAt: rawCreated,
      createdBy: createdUser,
      updatedAt: rawUpdated,
      updatedBy: updatedUser,
      extraDetails: [
        { label: "Origen", value: t.almacenOrigenNombre || "-" },
        { label: "Destino", value: t.almacenDestinoNombre || "-" },
        { label: "Fecha Solicitud", value: t.fechaSolicitud || "-" },
        ...(t.fechaAprobacion
          ? [{ label: "Fecha Aprobación", value: t.fechaAprobacion }]
          : []),
        ...(t.fechaDespacho
          ? [{ label: "Fecha Despacho", value: t.fechaDespacho }]
          : []),
        ...(t.fechaRecepcion
          ? [{ label: "Fecha Recepción", value: t.fechaRecepcion }]
          : []),
        ...(t.motivoCancelacion
          ? [{ label: "Motivo Cancelación", value: t.motivoCancelacion }]
          : []),
      ],
    });
    setAuditDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Header */}
      <TransferenciaAlmacenHeader
        totalItems={transferenciasData?.totalItems ?? 0}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Metrics */}
      <TransferenciaAlmacenMetrics
        transferencias={transferencias}
        totalItems={transferenciasData?.totalItems ?? 0}
        isLoading={isLoading}
      />

      {/* List */}
      <TransferenciaAlmacenList
        transferencias={transferencias}
        isLoading={isLoading}
        totalItems={transferenciasData?.totalItems ?? 0}
        currentPage={page}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedAlmacenOrigenId={selectedAlmacenOrigenId}
        selectedAlmacenDestinoId={selectedAlmacenDestinoId}
        selectedEstado={selectedEstado}
        onSearchChange={handleSearchChange}
        onAlmacenOrigenChange={handleAlmacenOrigenChange}
        onAlmacenDestinoChange={handleAlmacenDestinoChange}
        onEstadoChange={handleEstadoChange}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onAddTransferencia={handleOpenAdd}
        onViewDetail={handleViewDetail}
        onEdit={handleOpenEdit}
        onSolicitar={handleOpenSolicitar}
        onAprobar={handleOpenAprobar}
        onDespachar={handleOpenDespachar}
        onRecibir={handleOpenRecibir}
        onCancelar={handleOpenCancelar}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
        onViewAudit={handleViewAudit}
      />

      {/* Form Dialog */}
      <TransferenciaAlmacenFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        transferenciaToEdit={transferenciaToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Detail Dialog */}
      <TransferenciaAlmacenDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        transferenciaId={detailTransferenciaId}
        onSolicitar={handleOpenSolicitar}
        onAprobar={handleOpenAprobar}
        onDespachar={handleOpenDespachar}
        onRecibir={handleOpenRecibir}
        onCancelar={handleOpenCancelar}
      />

      {/* Solicitar Dialog */}
      <TransferenciaAlmacenSolicitarDialog
        open={solicitarOpen}
        onOpenChange={setSolicitarOpen}
        transferenciaToSolicitar={transferenciaToSolicitar}
        onSuccessCallback={() => refetch()}
      />

      {/* Aprobar Dialog */}
      <TransferenciaAlmacenAprobarDialog
        open={aprobarOpen}
        onOpenChange={setAprobarOpen}
        transferenciaToAprobar={transferenciaToAprobar}
        onSuccessCallback={() => refetch()}
      />

      {/* Despachar Dialog */}
      <TransferenciaAlmacenDespacharDialog
        open={despacharOpen}
        onOpenChange={setDespacharOpen}
        transferenciaToDespachar={transferenciaToDespachar}
        onSuccessCallback={() => refetch()}
      />

      {/* Recibir Dialog */}
      <TransferenciaAlmacenRecibirDialog
        open={recibirOpen}
        onOpenChange={setRecibirOpen}
        transferenciaToRecibir={transferenciaToRecibir}
        onSuccessCallback={() => refetch()}
      />

      {/* Cancelar Dialog */}
      <TransferenciaAlmacenCancelarDialog
        open={cancelarOpen}
        onOpenChange={setCancelarOpen}
        transferenciaToCancelar={transferenciaToCancelar}
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Dialog */}
      <TransferenciaAlmacenDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        transferenciaToDelete={transferenciaToDelete}
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
