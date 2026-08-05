"use client";

import * as React from "react";
import { ConfirmDeleteDialog } from "@/components/shared";
import type { TipoCambioItem } from "./tipo-cambio-table";

interface TipoCambioDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoCambio: TipoCambioItem | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function TipoCambioDeleteDialog({
  open,
  onOpenChange,
  tipoCambio,
  onConfirm,
  isLoading = false,
}: TipoCambioDeleteDialogProps) {
  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="¿Eliminar el registro de tipo de cambio?"
      itemName={
        tipoCambio
          ? `tasa del ${tipoCambio.fecha} (${tipoCambio.monedaOrigenCodigo || "Origen"} → ${tipoCambio.monedaDestinoCodigo || "Destino"})`
          : undefined
      }
      confirmLabel="Eliminar Registro"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
