"use client";

import * as React from "react";
import { ProveedorHeader } from "./proveedor-header";
import { ProveedorList } from "./proveedor-list";
import { ProveedorFormDialog } from "./proveedor-form-dialog";
import { ProveedorDeleteDialog } from "./proveedor-delete-dialog";
import { useProveedores } from "../hooks/use-proveedor";
import type { ProveedorResponse } from "../types/proveedor.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";

export function ProveedorModuleView() {
  // Query filters
  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Main proveedores query
  const {
    data: proveedoresData,
    isLoading,
    refetch,
  } = useProveedores({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
  });

  const proveedores = proveedoresData?.items ?? [];

  // Metrics calculation
  const totalWithNit = React.useMemo(
    () => proveedores.filter((p) => Boolean(p.nit && p.nit.trim())).length,
    [proveedores]
  );

  const totalWithContact = React.useMemo(
    () =>
      proveedores.filter(
        (p) => Boolean(p.contacto && p.contacto.trim()) || Boolean(p.email) || Boolean(p.celular || p.telefono)
      ).length,
    [proveedores]
  );

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  // Form Dialog state
  const [formOpen, setFormOpen] = React.useState(false);
  const [proveedorToEdit, setProveedorToEdit] =
    React.useState<ProveedorResponse | null>(null);

  const handleOpenAdd = () => {
    setProveedorToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (item: ProveedorResponse) => {
    setProveedorToEdit(item);
    setFormOpen(true);
  };

  // Delete Dialog state
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [proveedorToDelete, setProveedorToDelete] =
    React.useState<ProveedorResponse | null>(null);

  const handleOpenDelete = (item: ProveedorResponse) => {
    setProveedorToDelete(item);
    setDeleteOpen(true);
  };

  // Audit Dialog state
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAudit = (item: ProveedorResponse) => {
    const rawCreated =
      item.fechaCreacion ||
      item.createdAt ||
      (item as any).created_at ||
      (item as any).creadoEn;
    const rawUpdated =
      item.fechaModificacion ||
      item.updatedAt ||
      (item as any).updated_at ||
      (item as any).actualizadoEn;
    const createdUser =
      item.creadoPor ||
      item.createdBy ||
      (item as any).created_by ||
      (item as any).usuarioCreacion;
    const updatedUser =
      item.modificadoPor ||
      item.updatedBy ||
      (item as any).updated_by ||
      (item as any).usuarioModificacion;

    setAuditInfo({
      title: "Auditoría de Proveedor",
      entityName: item.razonSocial,
      entityCode: item.codigo,
      id: item.id,
      createdAt: rawCreated,
      createdBy: createdUser,
      updatedAt: rawUpdated,
      updatedBy: updatedUser,
      extraDetails: [
        ...(item.nombreComercial ? [{ label: "Nombre Comercial", value: item.nombreComercial }] : []),
        ...(item.nit ? [{ label: "NIT / RUC", value: item.nit }] : []),
        ...(item.contacto ? [{ label: "Contacto", value: item.contacto }] : []),
        ...(item.email ? [{ label: "Email", value: item.email }] : []),
        ...(item.celular || item.telefono ? [{ label: "Teléfono / Celular", value: (item.celular || item.telefono)! }] : []),
        ...(item.direccion ? [{ label: "Dirección", value: item.direccion }] : []),
      ],
    });
    setAuditDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      <ProveedorHeader
        totalItems={proveedoresData?.totalItems ?? 0}
        totalWithNit={totalWithNit}
        totalWithContact={totalWithContact}
      />

      <ProveedorList
        proveedores={proveedores}
        isLoading={isLoading}
        totalItems={proveedoresData?.totalItems ?? 0}
        currentPage={page}
        pageSize={pageSize}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onAddProveedor={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
        onViewAudit={handleViewAudit}
      />

      {/* Form Dialog (Create / Edit) */}
      <ProveedorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        proveedorToEdit={proveedorToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Dialog */}
      <ProveedorDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        proveedorToDelete={proveedorToDelete}
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
