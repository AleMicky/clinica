"use client";

import * as React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/shared";
import { useDeleteConvenio } from "../hooks/use-convenio";
import type { ConvenioItem } from "../types/convenio.types";

interface ConvenioDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  convenioToDelete?: ConvenioItem | null;
  onSuccessCallback?: () => void;
}

export function ConvenioDeleteDialog({
  open,
  onOpenChange,
  convenioToDelete,
  onSuccessCallback,
}: ConvenioDeleteDialogProps) {
  const deleteMutation = useDeleteConvenio();

  const handleConfirmDelete = async () => {
    if (!convenioToDelete) return;
    try {
      await deleteMutation.mutateAsync(convenioToDelete.id);
      toast.success(`Convenio "${convenioToDelete.nombre}" eliminado correctamente.`);
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "No se pudo eliminar el convenio.";
      toast.error(errorMsg);
    }
  };

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleConfirmDelete}
      title="¿Eliminar convenio institucional?"
      description={`Esta acción eliminará el convenio "${convenioToDelete?.nombre ?? ""}" (${convenioToDelete?.codigo ?? ""}).`}
      isLoading={deleteMutation.isPending}
    />
  );
}
