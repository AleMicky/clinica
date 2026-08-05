"use client";

import * as React from "react";
import { ConfirmDeleteDialog } from "@/components/shared";
import type { MonedaItem } from "./moneda-table";

interface MonedaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moneda: MonedaItem | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function MonedaDeleteDialog({
  open,
  onOpenChange,
  moneda,
  onConfirm,
  isLoading = false,
}: MonedaDeleteDialogProps) {
  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="¿Eliminar la divisa seleccionada?"
      itemName={moneda ? `${moneda.nombre} (${moneda.codigo})` : undefined}
      confirmLabel="Eliminar Moneda"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
