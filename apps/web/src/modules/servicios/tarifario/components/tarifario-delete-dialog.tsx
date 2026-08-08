"use client";

import * as React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/shared";
import { useDeleteTarifario } from "../hooks/use-tarifario";
import type { TarifarioItem } from "../types/tarifario.types";

interface TarifarioDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tarifarioToDelete?: TarifarioItem | null;
  onSuccessCallback?: () => void;
}

export function TarifarioDeleteDialog({
  open,
  onOpenChange,
  tarifarioToDelete,
  onSuccessCallback,
}: TarifarioDeleteDialogProps) {
  const deleteMutation = useDeleteTarifario();

  const handleConfirmDelete = async () => {
    if (!tarifarioToDelete) return;
    try {
      await deleteMutation.mutateAsync(tarifarioToDelete.id);
      toast.success(`Tarifario "${tarifarioToDelete.nombre}" eliminado correctamente.`);
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "No se pudo eliminar el tarifario.";
      toast.error(errorMsg);
    }
  };

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleConfirmDelete}
      title="¿Eliminar lista de precios / tarifario?"
      description={`Esta acción eliminará el tarifario "${tarifarioToDelete?.nombre ?? ""}" (${tarifarioToDelete?.codigo ?? ""}) y sus precios asociados.`}
      isLoading={deleteMutation.isPending}
    />
  );
}
