"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Ban, Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAnularDispensacion } from "../hooks/use-dispensacion";
import type { DispensacionResponse } from "../types/dispensacion.types";
import { getApiErrorMessage } from "@/lib/api/api-error";

interface DispensacionAnularDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispensacion: DispensacionResponse | null;
  onSuccessCallback?: () => void;
}

interface FormValues {
  motivoAnulacion: string;
}

export function DispensacionAnularDialog({
  open,
  onOpenChange,
  dispensacion,
  onSuccessCallback,
}: DispensacionAnularDialogProps) {
  const anularMutation = useAnularDispensacion();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      motivoAnulacion: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({ motivoAnulacion: "" });
    }
  }, [open, reset]);

  if (!dispensacion) return null;

  const onSubmit = async (values: FormValues) => {
    if (!values.motivoAnulacion.trim()) {
      toast.error("Debe especificar el motivo de anulación.");
      return;
    }

    try {
      await anularMutation.mutateAsync({
        id: dispensacion.id,
        data: {
          motivoAnulacion: values.motivoAnulacion.trim(),
        },
      });

      toast.success(
        `Dispensación "${dispensacion.numero}" anulada exitosamente.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-5">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
              <Ban className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Anular Orden de Dispensación
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Esta acción cancelará la orden{" "}
                <span className="font-mono font-semibold">
                  {dispensacion.numero}
                </span>
                .
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2 text-xs">
          {dispensacion.estado === "Entregado" ? (
            <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <span>
                Los medicamentos ya habían sido entregados. Al anular, se anulará el movimiento de inventario{" "}
                <strong>{dispensacion.movimientoInventarioNumero || (dispensacion.movimientoInventarioId ? `#${dispensacion.movimientoInventarioId}` : "")}</strong>, se restituirá el stock en <strong>{dispensacion.almacenNombre}</strong> y se registrará la devolución en Caja (`EGR-DEV`).
              </span>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg border border-border/60 bg-muted/30 text-muted-foreground text-xs flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                Se liberará inmediatamente el stock reservado en <strong>{dispensacion.almacenNombre}</strong> y se revertirá el cobro o cargo asociado en Caja.
              </span>
            </div>
          )}

          <div>
            <Label className="text-xs font-semibold">Motivo de Anulación *</Label>
            <Textarea
              {...register("motivoAnulacion")}
              placeholder="Indica la razón por la cual se anula la venta o dispensación..."
              className="mt-1 text-xs min-h-[80px]"
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8 cursor-pointer"
            >
              Cerrar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white cursor-pointer gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Anulando...</span>
                </>
              ) : (
                <>
                  <Ban className="size-3.5" />
                  <span>Confirmar Anulación</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
