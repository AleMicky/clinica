"use client";

import * as React from "react";
import { toast } from "sonner";
import { Send, Loader2, GitCompareArrows } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSolicitarTransferenciaAlmacen } from "../hooks/use-transferencia-almacen";
import type { TransferenciaAlmacenResponse } from "../types/transferencia-almacen.types";

interface TransferenciaAlmacenSolicitarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transferenciaToSolicitar?: TransferenciaAlmacenResponse | null;
  onSuccessCallback?: () => void;
}

export function TransferenciaAlmacenSolicitarDialog({
  open,
  onOpenChange,
  transferenciaToSolicitar,
  onSuccessCallback,
}: TransferenciaAlmacenSolicitarDialogProps) {
  const solicitarMutation = useSolicitarTransferenciaAlmacen();

  const handleSolicitar = async () => {
    if (!transferenciaToSolicitar) return;

    try {
      await solicitarMutation.mutateAsync(transferenciaToSolicitar.id);
      toast.success(
        `Transferencia "${transferenciaToSolicitar.numero}" enviada para aprobación.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al solicitar la transferencia.";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Send className="size-4" />
            </div>
            <DialogTitle className="text-sm font-bold text-foreground">
              Solicitar Transferencia
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            ¿Deseas enviar la transferencia{" "}
            <span className="font-mono font-semibold text-foreground">
              {transferenciaToSolicitar?.numero}
            </span>{" "}
            para su revisión y aprobación en el almacén emisor?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-3 border-t border-border/40 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={solicitarMutation.isPending}
            className="h-7 text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSolicitar}
            disabled={solicitarMutation.isPending}
            className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1 font-medium"
          >
            {solicitarMutation.isPending ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Solicitando...</span>
              </>
            ) : (
              <span>Confirmar y Solicitar</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
