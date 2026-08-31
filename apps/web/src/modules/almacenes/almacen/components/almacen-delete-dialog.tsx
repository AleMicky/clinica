"use client";

import * as React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/shared";
import { useDeleteAlmacen } from "../hooks/use-almacen";
import type { AlmacenResponse } from "../types/almacen.types";

interface AlmacenDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  almacenToDelete?: AlmacenResponse | null;
  onSuccessCallback?: () => void;
}

export function AlmacenDeleteDialog({
  open,
  onOpenChange,
  almacenToDelete,
  onSuccessCallback,
}: AlmacenDeleteDialogProps) {
  const deleteMutation = useDeleteAlmacen();

  const handleConfirmDelete = async () => {
    if (!almacenToDelete) return;
    try {
      await deleteMutation.mutateAsync(almacenToDelete.id);
      toast.success(`Almacén "${almacenToDelete.nombre}" eliminado correctamente.`);
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "No se pudo eliminar el almacén.";
      toast.error(errorMsg);
    }
  };

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleConfirmDelete}
      title="¿Eliminar almacén?"
      description={`Esta acción eliminará el almacén "${almacenToDelete?.nombre ?? ""}" (${almacenToDelete?.codigo ?? ""}).`}
      isLoading={deleteMutation.isPending}
    />
  );
}
