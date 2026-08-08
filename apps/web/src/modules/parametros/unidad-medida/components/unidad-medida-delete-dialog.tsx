"use client";

import * as React from "react";
import { ConfirmDeleteDialog } from "@/components/shared";
import type { UnidadMedidaItem } from "./unidad-medida-table";

interface UnidadMedidaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unidad: UnidadMedidaItem | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function UnidadMedidaDeleteDialog({
  open,
  onOpenChange,
  unidad,
  onConfirm,
  isLoading = false,
}: UnidadMedidaDeleteDialogProps) {
  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="¿Eliminar la unidad de medida seleccionada?"
      itemName={unidad ? `${unidad.nombre} (${unidad.codigo})` : undefined}
      confirmLabel="Eliminar Unidad"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
