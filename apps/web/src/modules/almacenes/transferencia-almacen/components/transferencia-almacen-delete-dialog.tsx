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
import { useDeleteTransferenciaAlmacen } from "../hooks/use-transferencia-almacen";
import type { TransferenciaAlmacenResponse } from "../types/transferencia-almacen.types";

interface TransferenciaAlmacenDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transferenciaToDelete?: TransferenciaAlmacenResponse | null;
  onSuccessCallback?: () => void;
}

export function TransferenciaAlmacenDeleteDialog({
  open,
  onOpenChange,
  transferenciaToDelete,
  onSuccessCallback,
}: TransferenciaAlmacenDeleteDialogProps) {
  const deleteMutation = useDeleteTransferenciaAlmacen();

  const handleDelete = async () => {
    if (!transferenciaToDelete) return;

    try {
      await deleteMutation.mutateAsync(transferenciaToDelete.id);
      toast.success(
        `Borrador de transferencia "${transferenciaToDelete.numero}" eliminado.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al eliminar el borrador de la transferencia.";
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
                Esta acción es irreversible y eliminará el registro
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p className="text-xs text-muted-foreground py-2">
          ¿Estás seguro de que deseas eliminar permanentemente el borrador de
          transferencia{" "}
          <span className="font-mono font-semibold text-foreground">
            {transferenciaToDelete?.numero}
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
            className="h-7 text-xs gap-1 font-medium"
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
