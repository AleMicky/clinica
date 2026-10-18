"use client";

import * as React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/shared";
import { useDeleteProveedor, useDeleteProveedoresMultiple } from "../hooks/use-proveedor";
import type { ProveedorResponse } from "../types/proveedor.types";

export interface ProveedorDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proveedorToDelete?: ProveedorResponse | null;
  proveedoresToDelete?: ProveedorResponse[];
  onSuccessCallback?: () => void;
}

export function ProveedorDeleteDialog({
  open,
  onOpenChange,
  proveedorToDelete,
  proveedoresToDelete,
  onSuccessCallback,
}: Readonly<ProveedorDeleteDialogProps>) {
  const deleteMutation = useDeleteProveedor();
  const deleteMultipleMutation = useDeleteProveedoresMultiple();

  const isMultiple = Boolean(proveedoresToDelete && proveedoresToDelete.length > 0);
  const multipleCount = proveedoresToDelete?.length ?? 0;

  const handleConfirmDelete = async () => {
    try {
      if (isMultiple && proveedoresToDelete && proveedoresToDelete.length > 0) {
        const ids = proveedoresToDelete.map((p) => p.id);
        const res = await deleteMultipleMutation.mutateAsync(ids);
        toast.success(
          res?.message ||
            `${multipleCount} ${
              multipleCount === 1 ? "proveedor eliminado" : "proveedores eliminados"
            } correctamente.`
        );
      } else if (proveedorToDelete) {
        await deleteMutation.mutateAsync(proveedorToDelete.id);
        toast.success(
          `Proveedor "${proveedorToDelete.razonSocial}" eliminado correctamente.`
        );
      } else {
        return;
      }

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
        "No se pudo completar la eliminación.";
      toast.error(errorMsg);
    }
  };

  const title = isMultiple
    ? multipleCount === 1
      ? "¿Eliminar proveedor seleccionado?"
      : `¿Eliminar ${multipleCount} proveedores seleccionados?`
    : "¿Eliminar proveedor?";

  const confirmLabel = isMultiple
    ? multipleCount === 1
      ? "Eliminar Proveedor"
      : `Eliminar (${multipleCount}) Proveedores`
    : "Eliminar Proveedor";

  const renderDescription = () => {
    if (isMultiple && proveedoresToDelete && proveedoresToDelete.length > 0) {
      return (
        <div className="flex flex-col gap-2 mt-1">
          <span>
            {multipleCount === 1
              ? "Esta acción eliminará el proveedor seleccionado:"
              : `Esta acción dará de baja ${multipleCount} proveedores seleccionados del sistema:`}
          </span>
          <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-md bg-muted/40 border border-border/50 text-xs">
            {proveedoresToDelete.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 py-0.5 border-b border-border/20 last:border-0"
              >
                <span className="font-medium text-foreground truncate" title={p.razonSocial}>
                  {p.razonSocial}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground px-1.5 py-0.2 rounded bg-background border border-border/50 shrink-0">
                  {p.codigo}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return `Esta acción eliminará al proveedor "${proveedorToDelete?.razonSocial ?? "Proveedor"}" (${proveedorToDelete?.codigo ?? ""}).`;
  };

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleConfirmDelete}
      title={title}
      confirmLabel={confirmLabel}
      description={renderDescription()}
      isLoading={deleteMutation.isPending || deleteMultipleMutation.isPending}
      size={isMultiple ? "md" : "default"}
    />
  );
}
