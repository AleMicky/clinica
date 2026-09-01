"use client";

import * as React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/shared";
import { useDeleteExistencia } from "../hooks/use-existencia";
import type { ExistenciaResponse } from "../types/existencia.types";

interface ExistenciaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existenciaToDelete?: ExistenciaResponse | null;
  onSuccessCallback?: () => void;
}

export function ExistenciaDeleteDialog({
  open,
  onOpenChange,
  existenciaToDelete,
  onSuccessCallback,
}: ExistenciaDeleteDialogProps) {
  const deleteMutation = useDeleteExistencia();

  const handleConfirmDelete = async () => {
    if (!existenciaToDelete) return;
    try {
      await deleteMutation.mutateAsync(existenciaToDelete.id);
      toast.success(
        `Registro de existencia de "${existenciaToDelete.productoNombre || "Producto"}" eliminado correctamente.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "No se pudo eliminar el registro de existencia.";
      toast.error(errorMsg);
    }
  };

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleConfirmDelete}
      title="¿Eliminar registro de existencia?"
      description={`Esta acción eliminará el registro de stock del producto "${existenciaToDelete?.productoNombre ?? "Producto"}" en el almacén "${existenciaToDelete?.almacenNombre ?? "Almacén"}".`}
      isLoading={deleteMutation.isPending}
    />
  );
}
