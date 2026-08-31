"use client";

import * as React from "react";
import { AlmacenHeader } from "./almacen-header";
import { AlmacenList } from "./almacen-list";
import { AlmacenFormDialog } from "./almacen-form-dialog";
import { AlmacenDeleteDialog } from "./almacen-delete-dialog";
import { useAlmacenes } from "../hooks/use-almacen";
import type { AlmacenResponse } from "../types/almacen.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";

export function AlmacenModuleView() {
  // Search, pagination state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const {
    data: almacenesData,
    isLoading,
    refetch,
  } = useAlmacenes({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
  });

  const almacenes = almacenesData?.items ?? [];

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  // Form Dialog state
  const [formOpen, setFormOpen] = React.useState(false);
  const [almacenToEdit, setAlmacenToEdit] = React.useState<AlmacenResponse | null>(null);

  const handleOpenAdd = () => {
    setAlmacenToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (almacen: AlmacenResponse) => {
    setAlmacenToEdit(almacen);
    setFormOpen(true);
  };

  // Delete Dialog state
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [almacenToDelete, setAlmacenToDelete] = React.useState<AlmacenResponse | null>(null);

  const handleOpenDelete = (almacen: AlmacenResponse) => {
    setAlmacenToDelete(almacen);
    setDeleteOpen(true);
  };

  // Audit Dialog state
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAudit = (almacen: AlmacenResponse) => {
    const rawCreated = almacen.fechaCreacion || almacen.createdAt || (almacen as any).created_at || (almacen as any).creadoEn;
    const rawUpdated = almacen.fechaModificacion || almacen.updatedAt || (almacen as any).updated_at || (almacen as any).actualizadoEn;
    const createdUser = almacen.creadoPor || almacen.createdBy || (almacen as any).created_by || (almacen as any).usuarioCreacion;
    const updatedUser = almacen.modificadoPor || almacen.updatedBy || (almacen as any).updated_by || (almacen as any).usuarioModificacion;

    setAuditInfo({
      title: "Auditoría de Almacén",
      entityName: almacen.nombre,
      entityCode: almacen.codigo,
      id: almacen.id,
      createdAt: rawCreated,
      createdBy: createdUser,
      updatedAt: rawUpdated,
      updatedBy: updatedUser,
      extraDetails: [
        ...(almacen.ubicacion ? [{ label: "Ubicación", value: almacen.ubicacion }] : []),
        ...(almacen.descripcion ? [{ label: "Descripción", value: almacen.descripcion }] : []),
      ],
    });
    setAuditDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      <AlmacenHeader />

      <AlmacenList
        almacenes={almacenes}
        isLoading={isLoading}
        totalItems={almacenesData?.totalItems ?? 0}
        currentPage={page}
        pageSize={pageSize}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onAddAlmacen={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
        onViewAudit={handleViewAudit}
      />

      {/* Form Dialog (Create / Edit) */}
      <AlmacenFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        almacenToEdit={almacenToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Dialog */}
      <AlmacenDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        almacenToDelete={almacenToDelete}
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
