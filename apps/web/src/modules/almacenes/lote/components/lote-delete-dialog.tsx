"use client";

import * as React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/shared";
import { useDeleteLote } from "../hooks/use-lote";
import type { LoteResponse } from "../types/lote.types";

interface LoteDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loteToDelete?: LoteResponse | null;
  onSuccessCallback?: () => void;
}

export function LoteDeleteDialog({
  open,
  onOpenChange,
  loteToDelete,
  onSuccessCallback,
}: LoteDeleteDialogProps) {
  const deleteMutation = useDeleteLote();

  const handleConfirmDelete = async () => {
    if (!loteToDelete) return;
    try {
      await deleteMutation.mutateAsync(loteToDelete.id);
      toast.success(`Lote "${loteToDelete.numeroLote}" eliminado correctamente.`);
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "No se pudo eliminar el lote.";
      toast.error(errorMsg);
    }
  };

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleConfirmDelete}
      title="¿Eliminar lote de producto?"
      description={`Esta acción eliminará el registro del lote "${loteToDelete?.numeroLote ?? ""}". Verifique que no existan movimientos de inventario asociados a este lote.`}
      isLoading={deleteMutation.isPending}
    />
  );
}
