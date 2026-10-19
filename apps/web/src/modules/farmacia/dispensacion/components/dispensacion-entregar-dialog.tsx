"use client";

import * as React from "react";
import { toast } from "sonner";
import { PackageCheck, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEntregarMedicamentosDispensacion } from "../hooks/use-dispensacion";
import type { DispensacionResponse } from "../types/dispensacion.types";

interface DispensacionEntregarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispensacion: DispensacionResponse | null;
  onSuccessCallback?: () => void;
}

export function DispensacionEntregarDialog({
  open,
  onOpenChange,
  dispensacion,
  onSuccessCallback,
}: DispensacionEntregarDialogProps) {
  const entregarMutation = useEntregarMedicamentosDispensacion();

  if (!dispensacion) return null;

  const handleConfirm = async () => {
    try {
      await entregarMutation.mutateAsync(dispensacion.id);
      toast.success(
        `Medicamentos de "${dispensacion.numero}" entregados. Stock descontado en ${dispensacion.almacenNombre}.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al entregar los medicamentos.";
      toast.error(errorMsg);
    }
  };

  const isLoading = entregarMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-5">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <PackageCheck className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Confirmar Entrega de Fármacos
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Esta acción descontará las unidades físicas y los lotes del almacén de Farmacia.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 space-y-2.5 text-xs">
          <p className="text-muted-foreground">
            ¿Confirmas la entrega de los medicamentos del comprobante{" "}
            <strong className="text-foreground font-mono">
              {dispensacion.numero}
            </strong>{" "}
            al paciente{" "}
            <strong className="text-foreground">
              {dispensacion.pacienteNombre || dispensacion.clienteNombre || "Cliente"}
            </strong>
            ?
          </p>

          <div className="p-2.5 rounded-lg border border-border/60 bg-muted/30 space-y-1">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground">
              Detalle a despachar ({dispensacion.detalles.length} ítems):
            </div>
            {dispensacion.detalles.map((d) => (
              <div key={d.id} className="flex justify-between text-xs">
                <span>{d.productoNombre}</span>
                <span className="font-mono font-semibold">{d.cantidad} un.</span>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-lg border border-teal-500/20 bg-teal-500/10 text-teal-800 dark:text-teal-300 text-xs flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>
              Se generará la salida oficial en <strong>{dispensacion.almacenNombre}</strong> y se actualizarán el Kárdex y el saldo de lotes.
            </span>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-xs h-8 cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Descontando stock...</span>
              </>
            ) : (
              <>
                <PackageCheck className="size-3.5" />
                <span>Confirmar Entrega</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
