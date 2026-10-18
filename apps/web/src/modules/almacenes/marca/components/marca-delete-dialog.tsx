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
}: Readonly<MarcaDeleteDialogProps>) {
  const deleteMutation = useDeleteMarca();

  const handleConfirmDelete = async () => {
    if (!marcaToDelete) return;
    try {
      await deleteMutation.mutateAsync(marcaToDelete.id);
      toast.success(`Marca "${marcaToDelete.nombre}" eliminada correctamente.`);
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; detail?: string } };
        message?: string;
      };
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
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
