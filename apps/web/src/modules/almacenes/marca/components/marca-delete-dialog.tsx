"use client";

import * as React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/shared";
import { useDeleteMarca } from "../hooks/use-marca";
import type { MarcaResponse } from "../types/marca.types";

interface MarcaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marcaToDelete?: MarcaResponse | null;
  onSuccessCallback?: () => void;
}

export function MarcaDeleteDialog({
  open,
  onOpenChange,
  marcaToDelete,
  onSuccessCallback,
}: MarcaDeleteDialogProps) {
  const deleteMutation = useDeleteMarca();

  const handleConfirmDelete = async () => {
    if (!marcaToDelete) return;
    try {
      await deleteMutation.mutateAsync(marcaToDelete.id);
      toast.success(`Marca "${marcaToDelete.nombre}" eliminada correctamente.`);
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "No se pudo eliminar la marca.";
      toast.error(errorMsg);
    }
  };

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleConfirmDelete}
      title="¿Eliminar marca?"
      description={`Esta acción eliminará la marca "${marcaToDelete?.nombre ?? ""}" (${marcaToDelete?.codigo ?? ""}).`}
      isLoading={deleteMutation.isPending}
    />
  );
}
