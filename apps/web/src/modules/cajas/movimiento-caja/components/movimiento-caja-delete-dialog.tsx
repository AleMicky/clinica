"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { MovimientoCajaResponse } from "../types/movimiento-caja.types";

interface MovimientoCajaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimiento?: MovimientoCajaResponse | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function MovimientoCajaDeleteDialog({
  open,
  onOpenChange,
  movimiento,
  onConfirm,
  isLoading = false,
}: MovimientoCajaDeleteDialogProps) {
  if (!movimiento) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Eliminar Movimiento de Caja</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-xs">
            ¿Está seguro de que desea eliminar el movimiento de caja{" "}
            <strong className="text-foreground">"{movimiento.concepto}"</strong> por un monto de{" "}
            <strong className="text-foreground">S/ {Number(movimiento.monto).toFixed(2)}</strong>?
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-9 text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-9 gap-2 text-xs"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>Confirmar Eliminación</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
