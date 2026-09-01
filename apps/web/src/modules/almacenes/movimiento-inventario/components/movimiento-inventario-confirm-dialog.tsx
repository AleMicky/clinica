"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfirmarMovimientoInventario } from "../hooks/use-movimiento-inventario";
import type { MovimientoInventarioResponse } from "../types/movimiento-inventario.types";

interface MovimientoInventarioConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimientoToConfirm?: MovimientoInventarioResponse | null;
  onSuccessCallback?: () => void;
}

export function MovimientoInventarioConfirmDialog({
  open,
  onOpenChange,
  movimientoToConfirm,
  onSuccessCallback,
}: MovimientoInventarioConfirmDialogProps) {
  const confirmMutation = useConfirmarMovimientoInventario();

  const handleConfirm = async () => {
    if (!movimientoToConfirm) return;

    try {
      await confirmMutation.mutateAsync(movimientoToConfirm.id);
      toast.success(
        `Movimiento "${movimientoToConfirm.numero}" confirmado y aplicado al inventario con éxito.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al confirmar el movimiento.";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="flex flex-col items-center text-center gap-2 pb-2">
          <div className="size-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-6" />
          </div>
          <DialogTitle className="text-base font-bold text-foreground">
            ¿Confirmar Movimiento de Inventario?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Estás a punto de confirmar el movimiento{" "}
            <strong className="text-foreground font-mono">
              {movimientoToConfirm?.numero}
            </strong>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5 my-2">
          <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-xs">
              Impacto en Existencias y Kárdex
            </span>
            <p className="text-[11px] leading-relaxed opacity-95">
              Al confirmar, las cantidades de los productos se actualizarán
              automáticamente en el almacén{" "}
              <strong>{movimientoToConfirm?.almacenNombre}</strong> y el comprobante
              no podrá ser modificado nuevamente en estado borrador.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={confirmMutation.isPending}
            className="h-8 text-xs cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={confirmMutation.isPending}
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs cursor-pointer"
          >
            {confirmMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Confirmando...</span>
              </>
            ) : (
              <span>Sí, Confirmar Movimiento</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
