"use client";

import * as React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/shared";
import { useDeleteCategoriaServicio } from "../hooks/use-categoria-servicio";
import type { CategoriaServicioResponse } from "../types/categoria-servicio.types";

interface CategoriaServicioDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoriaToDelete?: CategoriaServicioResponse | null;
  onSuccessCallback?: () => void;
}

export function CategoriaServicioDeleteDialog({
  open,
  onOpenChange,
  categoriaToDelete,
  onSuccessCallback,
}: CategoriaServicioDeleteDialogProps) {
  const deleteMutation = useDeleteCategoriaServicio();

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
      title="¿Eliminar categoría de servicio?"
      description={`Esta acción eliminará la categoría "${categoriaToDelete?.nombre ?? ""}" (${categoriaToDelete?.codigo ?? ""}).`}
      isLoading={deleteMutation.isPending}
    />
  );
}
