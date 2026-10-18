"use client";

import * as React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/shared";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { useDeleteProducto, useDeleteProductosMultiple } from "../hooks/use-producto";
import type { ProductoResponse } from "../types/producto.types";

export interface ProductoDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productoToDelete?: ProductoResponse | null;
  productosToDelete?: ProductoResponse[];
  onSuccessCallback?: () => void;
}

export function ProductoDeleteDialog({
  open,
  onOpenChange,
  productoToDelete,
  productosToDelete,
  onSuccessCallback,
}: Readonly<ProductoDeleteDialogProps>) {
  const deleteMutation = useDeleteProducto();
  const deleteMultipleMutation = useDeleteProductosMultiple();

  const isMultiple = Boolean(productosToDelete && productosToDelete.length > 0);
  const multipleCount = productosToDelete?.length ?? 0;

  const handleConfirmDelete = async () => {
    try {
      if (isMultiple && productosToDelete && productosToDelete.length > 0) {
        const ids = productosToDelete.map((p) => p.id);
        const res = await deleteMultipleMutation.mutateAsync(ids);
        toast.success(
          res?.message ||
            `${multipleCount} ${
              multipleCount === 1 ? "producto eliminado" : "productos eliminados"
            } correctamente.`
        );
      } else if (productoToDelete) {
        await deleteMutation.mutateAsync(productoToDelete.id);
        toast.success(`Producto "${productoToDelete.nombre}" eliminado correctamente.`);
      } else {
        return;
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const title = isMultiple
    ? multipleCount === 1
      ? "¿Eliminar producto seleccionado?"
      : `¿Eliminar ${multipleCount} productos seleccionados?`
    : "¿Eliminar producto del catálogo?";

  const confirmLabel = isMultiple
    ? multipleCount === 1
      ? "Eliminar Producto"
      : `Eliminar (${multipleCount}) Productos`
    : "Eliminar Producto";

  const renderDescription = () => {
    if (isMultiple && productosToDelete && productosToDelete.length > 0) {
      return (
        <div className="flex flex-col gap-2 mt-1">
          <p className="text-muted-foreground text-xs leading-relaxed">
            {multipleCount === 1
              ? "Esta acción eliminará el producto seleccionado, sus partidas de inventario y existencias asociadas:"
              : `Esta acción eliminará ${multipleCount} productos seleccionados, junto con sus partidas de inventario y existencias asociadas:`}
          </p>
          <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-md bg-muted/40 border border-border/50 text-xs">
            {productosToDelete.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 py-0.5 border-b border-border/20 last:border-0"
              >
                <span className="font-medium text-foreground truncate" title={p.nombre}>
                  {p.nombre}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground px-1.5 py-0.2 rounded bg-background border border-border/50 shrink-0">
                  {p.codigo}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/80 italic">
            Nota: Solo se pueden eliminar productos sin movimientos transaccionales de compras o inventario.
          </p>
        </div>
      );
    }

    return `Esta acción eliminará el producto "${productoToDelete?.nombre ?? ""}" (${productoToDelete?.codigo ?? ""}), incluyendo sus partidas de inventario y existencias registradas. Asegúrese de que no tenga movimientos transaccionales asociados.`;
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
