"use client";

import * as React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/shared";
import { useDeleteExistenciaPartida } from "../hooks/use-existencia-partida";
import type { ExistenciaPartidaResponse } from "../types/existencia-partida.types";

interface ExistenciaPartidaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existenciaPartidaToDelete?: ExistenciaPartidaResponse | null;
  onSuccessCallback?: () => void;
}

export function ExistenciaPartidaDeleteDialog({
  open,
  onOpenChange,
  existenciaPartidaToDelete,
  onSuccessCallback,
}: ExistenciaPartidaDeleteDialogProps) {
  const deleteMutation = useDeleteExistenciaPartida();

  const handleConfirmDelete = async () => {
    if (!existenciaPartidaToDelete) return;
    try {
      await deleteMutation.mutateAsync(existenciaPartidaToDelete.id);
      toast.success(
        `Partida "${existenciaPartidaToDelete.numeroPartida || "Sin número"}" desvinculada del stock correctamente.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "No se pudo eliminar el registro de stock por partida.";
      toast.error(errorMsg);
    }
  };

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleConfirmDelete}
      title="¿Eliminar partida de la existencia?"
      description={`Esta acción desvinculará la partida "${existenciaPartidaToDelete?.numeroPartida ?? "Sin número"}" del producto "${existenciaPartidaToDelete?.productoNombre ?? "Producto"}" en el almacén "${existenciaPartidaToDelete?.almacenNombre ?? "Almacén"}".`}
      isLoading={deleteMutation.isPending}
    />
  );
}
