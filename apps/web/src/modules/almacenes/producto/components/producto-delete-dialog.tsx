"use client";

import * as React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/shared";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { useDeleteProducto } from "../hooks/use-producto";
import type { ProductoResponse } from "../types/producto.types";

interface ProductoDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productoToDelete?: ProductoResponse | null;
  onSuccessCallback?: () => void;
}

export function ProductoDeleteDialog({
  open,
  onOpenChange,
  productoToDelete,
  onSuccessCallback,
}: Readonly<ProductoDeleteDialogProps>) {
  const deleteMutation = useDeleteProducto();

  const handleConfirmDelete = async () => {
    if (!productoToDelete) return;
    try {
      await deleteMutation.mutateAsync(productoToDelete.id);
      toast.success(`Producto "${productoToDelete.nombre}" eliminado correctamente.`);
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleConfirmDelete}
      title="¿Eliminar producto del catálogo?"
      description={`Esta acción eliminará el producto "${productoToDelete?.nombre ?? ""}" (${productoToDelete?.codigo ?? ""}). Asegúrese de que no tenga existencias activas ni movimientos pendientes asociados.`}
      isLoading={deleteMutation.isPending}
    />
  );
}
