"use client";

import * as React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/shared";
import { useDeleteServicio } from "../hooks/use-servicio";
import type { ServicioItem } from "../types/servicio.types";

interface ServicioDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servicioToDelete?: ServicioItem | null;
  onSuccessCallback?: () => void;
}

export function ServicioDeleteDialog({
  open,
  onOpenChange,
  servicioToDelete,
  onSuccessCallback,
}: ServicioDeleteDialogProps) {
  const deleteMutation = useDeleteServicio();

  const handleConfirmDelete = async () => {
    if (!servicioToDelete) return;
    try {
      await deleteMutation.mutateAsync({
        categoriaId: servicioToDelete.categoriaServicioId,
        servicioId: servicioToDelete.id,
      });
      toast.success(`Servicio "${servicioToDelete.nombre}" eliminado correctamente.`);
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "No se pudo eliminar el servicio.";
      toast.error(errorMsg);
    }
  };

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleConfirmDelete}
      title="¿Eliminar servicio o prestación médica?"
      description={`Esta acción eliminará el servicio "${servicioToDelete?.nombre ?? ""}" (${servicioToDelete?.codigo ?? ""}).`}
      isLoading={deleteMutation.isPending}
    />
  );
}
