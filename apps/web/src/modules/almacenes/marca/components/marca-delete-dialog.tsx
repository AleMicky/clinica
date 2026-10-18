"use client";

import * as React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/shared";
import { useDeleteMarca, useDeleteMarcasMultiple } from "../hooks/use-marca";
import type { MarcaResponse } from "../types/marca.types";

export interface MarcaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marcaToDelete?: MarcaResponse | null;
  marcasToDelete?: MarcaResponse[];
  onSuccessCallback?: () => void;
}

export function MarcaDeleteDialog({
  open,
  onOpenChange,
  marcaToDelete,
  marcasToDelete,
  onSuccessCallback,
}: Readonly<MarcaDeleteDialogProps>) {
  const deleteMutation = useDeleteMarca();
  const deleteMultipleMutation = useDeleteMarcasMultiple();

  const isMultiple = Boolean(marcasToDelete && marcasToDelete.length > 0);
  const multipleCount = marcasToDelete?.length ?? 0;

  const handleConfirmDelete = async () => {
    try {
      if (isMultiple && marcasToDelete && marcasToDelete.length > 0) {
        const ids = marcasToDelete.map((m) => m.id);
        const res = await deleteMultipleMutation.mutateAsync(ids);
        toast.success(
          res?.message ||
            `${multipleCount} ${
              multipleCount === 1 ? "marca eliminada" : "marcas eliminadas"
            } correctamente.`
        );
      } else if (marcaToDelete) {
        await deleteMutation.mutateAsync(marcaToDelete.id);
        toast.success(`Marca "${marcaToDelete.nombre}" eliminada correctamente.`);
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
      ? "¿Eliminar marca seleccionada?"
      : `¿Eliminar ${multipleCount} marcas seleccionadas?`
    : "¿Eliminar marca?";

  const confirmLabel = isMultiple
    ? multipleCount === 1
      ? "Eliminar Marca"
      : `Eliminar (${multipleCount}) Marcas`
    : "Eliminar Marca";

  const renderDescription = () => {
    if (isMultiple && marcasToDelete && marcasToDelete.length > 0) {
      return (
        <div className="flex flex-col gap-2 mt-1">
          <span>
            {multipleCount === 1
              ? "Esta acción dará de baja la marca seleccionada del sistema:"
              : `Esta acción dará de baja ${multipleCount} marcas seleccionadas del sistema:`}
          </span>
          <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-md bg-muted/40 border border-border/50 text-xs">
            {marcasToDelete.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-2 py-0.5 border-b border-border/20 last:border-0"
              >
                <span className="font-medium text-foreground truncate" title={m.nombre}>
                  {m.nombre}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground px-1.5 py-0.2 rounded bg-background border border-border/50 shrink-0">
                  {m.codigo}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return `Esta acción eliminará la marca "${marcaToDelete?.nombre ?? "Marca"}" (${marcaToDelete?.codigo ?? ""}).`;
  };

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleConfirmDelete}
      title={title}
      description={renderDescription()}
      confirmLabel={confirmLabel}
      isLoading={deleteMutation.isPending || deleteMultipleMutation.isPending}
    />
  );
}
