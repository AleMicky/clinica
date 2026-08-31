"use client";

import * as React from "react";
import { CategoriaProductoHeader } from "./categoria-producto-header";
import { CategoriaProductoList } from "./categoria-producto-list";
import { CategoriaProductoFormDialog } from "./categoria-producto-form-dialog";
import { CategoriaProductoDeleteDialog } from "./categoria-producto-delete-dialog";
import { useCategoriasProducto } from "../hooks/use-categoria-producto";
import type { CategoriaProductoResponse } from "../types/categoria-producto.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";

export function CategoriaProductoModuleView() {
  // Search, pagination state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const {
    data: categoriasData,
    isLoading,
    refetch,
  } = useCategoriasProducto({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
  });

  const categorias = categoriasData?.items ?? [];

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  // Form Dialog state
  const [formOpen, setFormOpen] = React.useState(false);
  const [categoriaToEdit, setCategoriaToEdit] = React.useState<CategoriaProductoResponse | null>(null);

  const handleOpenAdd = () => {
    setCategoriaToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (categoria: CategoriaProductoResponse) => {
    setCategoriaToEdit(categoria);
    setFormOpen(true);
  };

  // Delete Dialog state
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = React.useState<CategoriaProductoResponse | null>(null);

  const handleOpenDelete = (categoria: CategoriaProductoResponse) => {
    setCategoriaToDelete(categoria);
    setDeleteOpen(true);
  };

  // Audit Dialog state
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAudit = (categoria: CategoriaProductoResponse) => {
    const rawCreated = categoria.fechaCreacion || categoria.createdAt || (categoria as any).created_at || (categoria as any).creadoEn;
    const rawUpdated = categoria.fechaModificacion || categoria.updatedAt || (categoria as any).updated_at || (categoria as any).actualizadoEn;
    const createdUser = categoria.creadoPor || categoria.createdBy || (categoria as any).created_by || (categoria as any).usuarioCreacion;
    const updatedUser = categoria.modificadoPor || categoria.updatedBy || (categoria as any).updated_by || (categoria as any).usuarioModificacion;

    setAuditInfo({
      title: "Auditoría de Categoría de Producto",
      entityName: categoria.nombre,
      entityCode: categoria.codigo,
      id: categoria.id,
      createdAt: rawCreated,
      createdBy: createdUser,
      updatedAt: rawUpdated,
      updatedBy: updatedUser,
      extraDetails: [
        ...(categoria.categoriaPadreNombre
          ? [{ label: "Categoría Padre", value: categoria.categoriaPadreNombre }]
          : []),
        ...(categoria.descripcion
          ? [{ label: "Descripción", value: categoria.descripcion }]
          : []),
        { label: "Subcategorías", value: String(categoria.cantidadSubcategorias) },
      ],
    });
    setAuditDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      <CategoriaProductoHeader />

      <CategoriaProductoList
        categorias={categorias}
        isLoading={isLoading}
        totalItems={categoriasData?.totalItems ?? 0}
        currentPage={page}
        pageSize={pageSize}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onAddCategoria={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
        onViewAudit={handleViewAudit}
      />

      {/* Form Dialog (Create / Edit) */}
      <CategoriaProductoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        categoriaToEdit={categoriaToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Dialog */}
      <CategoriaProductoDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        categoriaToDelete={categoriaToDelete}
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
