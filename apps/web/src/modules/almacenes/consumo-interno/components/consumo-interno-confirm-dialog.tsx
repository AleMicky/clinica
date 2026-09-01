"use client";

import * as React from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfirmarConsumoInterno } from "../hooks/use-consumo-interno";
import type { ConsumoInternoResponse } from "../types/consumo-interno.types";

interface ConsumoInternoConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consumoToConfirm?: ConsumoInternoResponse | null;
  onSuccessCallback?: () => void;
}

export function ConsumoInternoConfirmDialog({
  open,
  onOpenChange,
  consumoToConfirm,
  onSuccessCallback,
}: ConsumoInternoConfirmDialogProps) {
  const confirmMutation = useConfirmarConsumoInterno();

  const handleConfirm = async () => {
    if (!consumoToConfirm) return;

    try {
      await confirmMutation.mutateAsync(consumoToConfirm.id);
      toast.success(
        `Vale "${consumoToConfirm.numero}" confirmado y despachado. Stock actualizado.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al confirmar el consumo interno.";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                Confirmar Despacho de Insumos
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                Esta acción descontará las existencias del almacén emisor
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 space-y-2 text-xs">
          <p className="text-muted-foreground">
            ¿Confirmar el despacho del vale{" "}
            <span className="font-mono font-semibold text-foreground">
              {consumoToConfirm?.numero}
            </span>{" "}
            para el área de:{" "}
            <span className="font-semibold text-foreground">
              "{consumoToConfirm?.areaNombre}"
            </span>
            ?
          </p>

          <div className="p-2.5 rounded-lg border bg-teal-500/10 border-teal-500/20 text-teal-800 dark:text-teal-300 text-xs flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>
              Se generará un movimiento de salida por consumo interno en el almacén{" "}
              <strong>{consumoToConfirm?.almacenNombre}</strong> y se cerrará el vale de entrega.
            </span>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border/40 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={confirmMutation.isPending}
            className="h-7 text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={confirmMutation.isPending}
            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-medium"
          >
            {confirmMutation.isPending ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Confirmando...</span>
              </>
            ) : (
              <span>Confirmar Despacho</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
