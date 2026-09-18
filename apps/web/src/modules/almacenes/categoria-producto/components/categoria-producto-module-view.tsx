"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { CategoriaProductoHeader } from "./categoria-producto-header";
import { CategoriaProductoTree } from "./categoria-producto-tree";
import { CategoriaProductoFormDialog } from "./categoria-producto-form-dialog";
import { CategoriaProductoDeleteDialog } from "./categoria-producto-delete-dialog";
import { useCategoriasProducto } from "../hooks/use-categoria-producto";
import type { CategoriaProductoResponse } from "../types/categoria-producto.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function CategoriaProductoModuleView() {
  // Query all categories to construct full tree hierarchy
  const {
    data: categoriasData,
    isLoading,
    isError,
    error,
    refetch,
  } = useCategoriasProducto({
    pageSize: 1000,
  });

  const categorias = React.useMemo(
    () => categoriasData?.items ?? [],
    [categoriasData?.items]
  );

  // Form Dialog state
  const [formOpen, setFormOpen] = React.useState(false);
  const [categoriaToEdit, setCategoriaToEdit] = React.useState<CategoriaProductoResponse | null>(null);
  const [defaultParentId, setDefaultParentId] = React.useState<number | null>(null);

  const handleOpenAdd = React.useCallback((padreId?: number | null) => {
    setCategoriaToEdit(null);
    setDefaultParentId(padreId ?? null);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = React.useCallback((categoria: CategoriaProductoResponse) => {
    setCategoriaToEdit(categoria);
    setDefaultParentId(categoria.categoriaPadreId ?? null);
    setFormOpen(true);
  }, []);

  // Delete Dialog state
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = React.useState<CategoriaProductoResponse | null>(null);

  const handleOpenDelete = React.useCallback((categoria: CategoriaProductoResponse) => {
    setCategoriaToDelete(categoria);
    setDeleteOpen(true);
  }, []);

  // Audit Dialog state
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewAudit = React.useCallback((categoria: CategoriaProductoResponse) => {
    setAuditInfo({
      title: "Auditoría de Categoría de Producto",
      entityName: categoria.nombre,
      entityCode: categoria.codigo,
      id: categoria.id,
      createdAt: categoria.fechaCreacion || categoria.createdAt,
      createdBy: categoria.creadoPor || categoria.createdBy,
      updatedAt: categoria.fechaModificacion || categoria.updatedAt,
      updatedBy: categoria.modificadoPor || categoria.updatedBy,
      extraDetails: [
        ...(categoria.categoriaPadreNombre
          ? [{ label: "Categoría Padre", value: categoria.categoriaPadreNombre }]
          : []),
        ...(categoria.descripcion
          ? [{ label: "Descripción", value: categoria.descripcion }]
          : []),
        { label: "Subcategorías", value: String(categoria.cantidadSubcategorias ?? 0) },
      ],
    });
    setAuditDialogOpen(true);
  }, []);

  const { totalCount, rootCount, subCount } = React.useMemo(() => {
    const total = categorias.length;
    const roots = categorias.filter((c) => !c.categoriaPadreId).length;
    const subs = total - roots;
    return { totalCount: total, rootCount: roots, subCount: subs };
  }, [categorias]);

  return (
    <div className="flex flex-col gap-3.5 w-full">
      <CategoriaProductoHeader
        totalCount={totalCount}
        rootCount={rootCount}
        subCount={subCount}
      />

      {/* Network / Fetch Error Banner */}
      {isError && (
        <Alert variant="destructive" className="flex items-center justify-between py-2.5 px-3.5">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <div>
              <AlertTitle className="text-xs font-semibold">Error al cargar las categorías</AlertTitle>
              <AlertDescription className="text-[11px]">
                {error instanceof Error
                  ? error.message
                  : "No se pudo sincronizar la información del servidor."}
              </AlertDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-7 text-xs gap-1.5 shrink-0 cursor-pointer"
          >
            <RefreshCw className="size-3" />
            <span>Reintentar</span>
          </Button>
        </Alert>
      )}

      {/* Tree Hierarchy Component */}
      <CategoriaProductoTree
        categorias={categorias}
        isLoading={isLoading}
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
        defaultParentId={defaultParentId}
        categorias={categorias}
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
