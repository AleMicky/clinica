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
import { useConfirmarAjusteInventario } from "../hooks/use-ajuste-inventario";
import {
  TipoAjusteInventario,
  type AjusteInventarioResponse,
} from "../types/ajuste-inventario.types";

interface AjusteInventarioConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ajusteToConfirm?: AjusteInventarioResponse | null;
  onSuccessCallback?: () => void;
}

export function AjusteInventarioConfirmDialog({
  open,
  onOpenChange,
  ajusteToConfirm,
  onSuccessCallback,
}: AjusteInventarioConfirmDialogProps) {
  const confirmMutation = useConfirmarAjusteInventario();

  const handleConfirm = async () => {
    if (!ajusteToConfirm) return;

    try {
      await confirmMutation.mutateAsync(ajusteToConfirm.id);
      toast.success(
        `Ajuste "${ajusteToConfirm.numero}" confirmado. Stock actualizado correctamente.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al confirmar el ajuste de inventario.";
      toast.error(errorMsg);
    }
  };

  const isPositivo = ajusteToConfirm?.tipo === TipoAjusteInventario.Positivo;

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
                Confirmar Ajuste de Stock
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                Esta acción impactará inmediatamente las existencias
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 space-y-2 text-xs">
          <p className="text-muted-foreground">
            ¿Confirmar el ajuste{" "}
            <span className="font-mono font-semibold text-foreground">
              {ajusteToConfirm?.numero}
            </span>{" "}
            por motivo de:{" "}
            <span className="font-semibold text-foreground">
              "{ajusteToConfirm?.motivo}"
            </span>
            ?
          </p>

          <div
            className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
              isPositivo
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                : "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300"
            }`}
          >
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>
              {isPositivo
                ? "Se generará un movimiento de entrada por ajuste positivo, incrementando el stock de los productos."
                : "Se generará un movimiento de salida por ajuste negativo, descontando el stock de los productos."}
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
              <span>Confirmar Ajuste</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
