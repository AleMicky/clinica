"use client";

import * as React from "react";
import { toast } from "sonner";
import { Send, Loader2, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEnviarAprobacionSolicitudCompra } from "../hooks/use-solicitud-compra";
import type { SolicitudCompraResponse } from "../types/solicitud-compra.types";

interface SolicitudCompraSendApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solicitud?: SolicitudCompraResponse | null;
  onSuccessCallback?: () => void;
}

export function SolicitudCompraSendApprovalDialog({
  open,
  onOpenChange,
  solicitud,
  onSuccessCallback,
}: SolicitudCompraSendApprovalDialogProps) {
  const mutation = useEnviarAprobacionSolicitudCompra();

  const handleSend = async () => {
    if (!solicitud) return;

    try {
      await mutation.mutateAsync(solicitud.id);
      toast.success(
        `Solicitud "${solicitud.numero}" enviada a revisión y aprobación.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al enviar la solicitud a aprobación.";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Send className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                Enviar a Aprobación
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                La solicitud pasará a revisión de compras y gerencia
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 space-y-2 text-xs">
          <p className="text-muted-foreground">
            ¿Confirmas el envío de la solicitud{" "}
            <span className="font-mono font-semibold text-foreground">
              {solicitud?.numero}
            </span>{" "}
            para su correspondiente revisión y aprobación?
          </p>

          <div className="p-2.5 rounded-lg border bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-2">
            <Info className="size-4 shrink-0 mt-0.5" />
            <span>
              Una vez enviada, la solicitud ya no podrá ser editada directamente hasta que sea evaluada o cancelada.
            </span>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border/40 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
            className="h-7 text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSend}
            disabled={mutation.isPending}
            className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1 font-medium"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <span>Enviar a Aprobación</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
