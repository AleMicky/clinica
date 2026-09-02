"use client";

import * as React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/shared";
import { useDeleteProveedor } from "../hooks/use-proveedor";
import type { ProveedorResponse } from "../types/proveedor.types";

interface ProveedorDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proveedorToDelete?: ProveedorResponse | null;
  onSuccessCallback?: () => void;
}

export function ProveedorDeleteDialog({
  open,
  onOpenChange,
  proveedorToDelete,
  onSuccessCallback,
}: ProveedorDeleteDialogProps) {
  const deleteMutation = useDeleteProveedor();

  const handleConfirmDelete = async () => {
    if (!proveedorToDelete) return;
    try {
      await deleteMutation.mutateAsync(proveedorToDelete.id);
      toast.success(
        `Proveedor "${proveedorToDelete.razonSocial}" eliminado correctamente.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "No se pudo eliminar el proveedor.";
      toast.error(errorMsg);
    }
  };

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleConfirmDelete}
      title="¿Eliminar proveedor?"
      description={`Esta acción eliminará al proveedor "${proveedorToDelete?.razonSocial ?? "Proveedor"}" (${proveedorToDelete?.codigo ?? ""}).`}
      isLoading={deleteMutation.isPending}
    />
  );
}
