"use client";

import * as React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/shared";
import { useDeleteCategoriaProducto } from "../hooks/use-categoria-producto";
import type { CategoriaProductoResponse } from "../types/categoria-producto.types";

interface CategoriaProductoDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoriaToDelete?: CategoriaProductoResponse | null;
  onSuccessCallback?: () => void;
}

export function CategoriaProductoDeleteDialog({
  open,
  onOpenChange,
  categoriaToDelete,
  onSuccessCallback,
}: CategoriaProductoDeleteDialogProps) {
  const deleteMutation = useDeleteCategoriaProducto();

  const handleConfirmDelete = async () => {
    if (!categoriaToDelete) return;
    try {
      await deleteMutation.mutateAsync(categoriaToDelete.id);
      toast.success(`Categoría "${categoriaToDelete.nombre}" eliminada correctamente.`);
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "No se pudo eliminar la categoría.";
      toast.error(errorMsg);
    }
  };

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleConfirmDelete}
      title="¿Eliminar categoría de producto?"
      description={`Esta acción eliminará la categoría "${categoriaToDelete?.nombre ?? ""}" (${categoriaToDelete?.codigo ?? ""}).${
        categoriaToDelete?.cantidadSubcategorias
          ? ` Tiene ${categoriaToDelete.cantidadSubcategorias} subcategoría(s) asociada(s).`
          : ""
      }`}
      isLoading={deleteMutation.isPending}
    />
  );
}
