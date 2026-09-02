"use client";

import * as React from "react";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteRecepcionCompra } from "../hooks/use-recepcion-compra";
import type { RecepcionCompraResponse } from "../types/recepcion-compra.types";

interface RecepcionCompraDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recepcion?: RecepcionCompraResponse | null;
  onSuccessCallback?: () => void;
}

export function RecepcionCompraDeleteDialog({
  open,
  onOpenChange,
  recepcion,
  onSuccessCallback,
}: RecepcionCompraDeleteDialogProps) {
  const deleteMutation = useDeleteRecepcionCompra();

  const handleDelete = async () => {
    if (!recepcion) return;

    try {
      await deleteMutation.mutateAsync(recepcion.id);
      toast.success(
        `Borrador de recepción "${recepcion.numero}" eliminado.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al eliminar la recepción.";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
              <Trash2 className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                Eliminar Borrador
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                Esta acción eliminará permanentemente la recepción
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p className="text-xs text-muted-foreground py-2">
          ¿Estás seguro de que deseas eliminar permanentemente el borrador de recepción{" "}
          <span className="font-mono font-semibold text-foreground">
            {recepcion?.numero}
          </span>
          ?
        </p>

        <DialogFooter className="pt-3 border-t border-border/40 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
            className="h-7 text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="h-7 text-xs gap-1 font-medium cursor-pointer"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <span>Eliminar Borrador</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
