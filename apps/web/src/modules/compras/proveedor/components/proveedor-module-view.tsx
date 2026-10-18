"use client";

import * as React from "react";
import { ProveedorHeader } from "./proveedor-header";
import { ProveedorTable } from "./proveedor-list";
import { ProveedorFormDialog } from "./proveedor-form-dialog";
import { ProveedorDeleteDialog } from "./proveedor-delete-dialog";
import { ProveedorImportDialog } from "./proveedor-import-dialog";
import { useProveedores } from "../hooks/use-proveedor";
import type { ProveedorResponse } from "../types/proveedor.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";

export function ProveedorModuleView() {
  // Query state & filters
  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Selection state
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [selectedProveedoresMap, setSelectedProveedoresMap] = React.useState<
    Map<number, ProveedorResponse>
  >(new Map());

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

  // Keep map updated with current page proveedores
  const handleSelectionChange = (newSelectedIds: number[]) => {
    setSelectedIds(newSelectedIds);
    setSelectedProveedoresMap((prev) => {
      const next = new Map(prev);
      proveedores.forEach((p) => {
        if (newSelectedIds.includes(p.id)) {
          next.set(p.id, p);
        }
      });
      for (const id of next.keys()) {
        if (!newSelectedIds.includes(id)) {
          next.delete(id);
        }
      }
      return next;
    });
  };

  // Metrics calculation
  const totalWithNit = React.useMemo(
    () => proveedores.filter((p) => Boolean(p.nit?.trim())).length,
    [proveedores]
  );

  const totalWithContact = React.useMemo(
    () =>
      proveedores.filter(
        (p) =>
          Boolean(p.contacto?.trim()) ||
          Boolean(p.email) ||
          Boolean(p.celular || p.telefono)
      ).length,
    [proveedores]
  );

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  // Dialog states
  const [formOpen, setFormOpen] = React.useState(false);
  const [proveedorToEdit, setProveedorToEdit] =
    React.useState<ProveedorResponse | null>(null);

  const [importOpen, setImportOpen] = React.useState(false);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [proveedorToDelete, setProveedorToDelete] =
    React.useState<ProveedorResponse | null>(null);
  const [proveedoresToDelete, setProveedoresToDelete] = React.useState<
    ProveedorResponse[]
  >([]);

  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleOpenAdd = () => {
    setProveedorToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (item: ProveedorResponse) => {
    setProveedorToEdit(item);
    setFormOpen(true);
  };

  const handleOpenDelete = (item: ProveedorResponse) => {
    setProveedorToDelete(item);
    setProveedoresToDelete([]);
    setDeleteOpen(true);
  };

  const handleOpenDeleteMultiple = (ids: number[]) => {
    const items = ids
      .map(
        (id) =>
          selectedProveedoresMap.get(id) ??
          proveedores.find((p) => p.id === id)
      )
      .filter((item): item is ProveedorResponse => Boolean(item));

    setProveedorToDelete(null);
    setProveedoresToDelete(items);
    setDeleteOpen(true);
  };

  const handleViewAudit = (item: ProveedorResponse) => {
    setAuditInfo({
      title: "Auditoría de Proveedor",
      entityName: item.razonSocial,
      entityCode: item.codigo,
      id: item.id,
      createdAt: item.fechaCreacion || item.createdAt || item.creadoEn,
      createdBy: item.creadoPor || item.createdBy || item.usuarioCreacion,
      updatedAt: item.fechaModificacion || item.updatedAt || item.actualizadoEn,
      updatedBy:
        item.modificadoPor || item.updatedBy || item.usuarioModificacion,
      extraDetails: [
        ...(item.nombreComercial
          ? [{ label: "Nombre Comercial", value: item.nombreComercial }]
          : []),
        ...(item.nit ? [{ label: "NIT / RUC", value: item.nit }] : []),
        ...(item.contacto ? [{ label: "Contacto", value: item.contacto }] : []),
        ...(item.email ? [{ label: "Email", value: item.email }] : []),
        ...(item.celular || item.telefono
          ? [
              {
                label: "Teléfono / Celular",
                value: (item.celular || item.telefono)!,
              },
            ]
          : []),
        ...(item.direccion
          ? [{ label: "Dirección", value: item.direccion }]
          : []),
        ...(item.observacion
          ? [{ label: "Observación", value: item.observacion }]
          : []),
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

      <ProveedorTable
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
        onImportClick={() => setImportOpen(true)}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
        onViewAudit={handleViewAudit}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        onDeleteMultiple={handleOpenDeleteMultiple}
      />

      {/* Form Dialog (Create / Edit) */}
      <ProveedorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        proveedorToEdit={proveedorToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Import Dialog (Excel) */}
      <ProveedorImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={() => refetch()}
      />

      {/* Delete Dialog (Single & Multiple) */}
      <ProveedorDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        proveedorToDelete={proveedorToDelete}
        proveedoresToDelete={proveedoresToDelete}
        onSuccessCallback={() => {
          setSelectedIds([]);
          setSelectedProveedoresMap(new Map());
          refetch();
        }}
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
