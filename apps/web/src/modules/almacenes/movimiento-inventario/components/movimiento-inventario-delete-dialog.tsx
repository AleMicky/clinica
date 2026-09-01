"use client";

import * as React from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
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
import { useDeleteMovimientoInventario } from "../hooks/use-movimiento-inventario";
import type { MovimientoInventarioResponse } from "../types/movimiento-inventario.types";

interface MovimientoInventarioDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimientoToDelete?: MovimientoInventarioResponse | null;
  onSuccessCallback?: () => void;
}

export function MovimientoInventarioDeleteDialog({
  open,
  onOpenChange,
  movimientoToDelete,
  onSuccessCallback,
}: MovimientoInventarioDeleteDialogProps) {
  const deleteMutation = useDeleteMovimientoInventario();

  const handleDelete = async () => {
    if (!movimientoToDelete) return;

    try {
      await deleteMutation.mutateAsync(movimientoToDelete.id);
      toast.success(
        `Borrador "${movimientoToDelete.numero}" eliminado correctamente.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al eliminar el movimiento.";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="flex flex-col items-center text-center gap-2 pb-2">
          <div className="size-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
            <Trash2 className="size-6" />
          </div>
          <DialogTitle className="text-base font-bold text-foreground">
            ¿Eliminar Borrador de Movimiento?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Estás a punto de eliminar permanentemente el borrador{" "}
            <strong className="text-foreground font-mono">
              {movimientoToDelete?.numero}
            </strong>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2.5 my-2">
          <AlertTriangle className="size-4 shrink-0 text-destructive mt-0.5" />
          <p className="text-[11px] leading-relaxed opacity-95">
            Esta acción eliminará el comprobante no confirmado y todos sus
            artículos asociados del sistema. Esta acción no se puede deshacer.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
            className="h-8 text-xs cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="h-8 text-xs gap-1.5 shadow-xs cursor-pointer"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <span>Eliminar Comprobante</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
