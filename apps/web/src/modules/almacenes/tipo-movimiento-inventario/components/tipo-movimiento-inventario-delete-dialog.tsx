"use client";

import * as React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/shared";
import { useDeleteTipoMovimientoInventario } from "../hooks/use-tipo-movimiento-inventario";
import type { TipoMovimientoInventarioResponse } from "../types/tipo-movimiento-inventario.types";

interface TipoMovimientoInventarioDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoToDelete?: TipoMovimientoInventarioResponse | null;
  onSuccessCallback?: () => void;
}

export function TipoMovimientoInventarioDeleteDialog({
  open,
  onOpenChange,
  tipoToDelete,
  onSuccessCallback,
}: TipoMovimientoInventarioDeleteDialogProps) {
  const deleteMutation = useDeleteTipoMovimientoInventario();

  const handleConfirmDelete = async () => {
    if (!tipoToDelete) return;
    try {
      await deleteMutation.mutateAsync(tipoToDelete.id);
      toast.success(
        `Tipo de movimiento "${tipoToDelete.nombre}" eliminado correctamente.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "No se pudo eliminar el tipo de movimiento.";
      toast.error(errorMsg);
    }
  };

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleConfirmDelete}
      title="¿Eliminar tipo de movimiento?"
      description={`Esta acción eliminará el tipo de movimiento "${tipoToDelete?.nombre ?? ""}" (${tipoToDelete?.codigo ?? ""}).`}
      isLoading={deleteMutation.isPending}
    />
  );
}
