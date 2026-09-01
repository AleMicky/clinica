"use client";

import * as React from "react";
import { toast } from "sonner";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCerrarInventarioFisico } from "../hooks/use-inventario-fisico";
import type { InventarioFisicoResponse } from "../types/inventario-fisico.types";

interface InventarioFisicoCerrarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventarioToCerrar?: InventarioFisicoResponse | null;
  onSuccessCallback?: () => void;
}

export function InventarioFisicoCerrarDialog({
  open,
  onOpenChange,
  inventarioToCerrar,
  onSuccessCallback,
}: InventarioFisicoCerrarDialogProps) {
  const cerrarMutation = useCerrarInventarioFisico();

  const handleCerrar = async () => {
    if (!inventarioToCerrar) return;

    try {
      await cerrarMutation.mutateAsync(inventarioToCerrar.id);
      toast.success(
        `Inventario "${inventarioToCerrar.numero}" cerrado. Se generaron los movimientos de ajuste pertinentes.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al cerrar y procesar el inventario físico.";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Lock className="size-4" />
            </div>
            <DialogTitle className="text-sm font-bold text-foreground">
              Cerrar Inventario y Ajustar Stock
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            Al cerrar el inventario{" "}
            <span className="font-mono font-semibold text-foreground">
              {inventarioToCerrar?.numero}
            </span>
            , el sistema generará automáticamente los movimientos de ajuste por
            sobrantes o faltantes en el almacén{" "}
            <span className="font-semibold text-foreground">
              {inventarioToCerrar?.almacenNombre}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2 my-2">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <span>
            Esta acción es irreversible y actualizará el stock físico real
            del almacén según las cantidades contadas.
          </span>
        </div>

        <DialogFooter className="pt-3 border-t border-border/40 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={cerrarMutation.isPending}
            className="h-7 text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleCerrar}
            disabled={cerrarMutation.isPending}
            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-medium"
          >
            {cerrarMutation.isPending ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Cerrando y Ajustando...</span>
              </>
            ) : (
              <span>Confirmar Cierre y Ajuste</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
