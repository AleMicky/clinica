"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Ban, Loader2 } from "lucide-react";
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
import {
  cancelarCotizacionSchema,
  type CancelarCotizacionFormValues,
} from "../schemas/cotizacion-compra.schema";
import { useCancelarCotizacionCompra } from "../hooks/use-cotizacion-compra";
import type { CotizacionCompraResponse } from "../types/cotizacion-compra.types";

interface CotizacionCompraCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cotizacion?: CotizacionCompraResponse | null;
  onSuccessCallback?: () => void;
}

export function CotizacionCompraCancelDialog({
  open,
  onOpenChange,
  cotizacion,
  onSuccessCallback,
}: CotizacionCompraCancelDialogProps) {
  const cancelMutation = useCancelarCotizacionCompra();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CancelarCotizacionFormValues>({
    resolver: zodResolver(cancelarCotizacionSchema),
    defaultValues: {
      motivoCancelacion: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({ motivoCancelacion: "" });
    }
  }, [open, reset]);

  const onSubmit = async (values: CancelarCotizacionFormValues) => {
    if (!cotizacion) return;

    try {
      await cancelMutation.mutateAsync({
        id: cotizacion.id,
        data: { motivoCancelacion: values.motivoCancelacion.trim() },
      });
      toast.success(`Cotización "${cotizacion.numero}" cancelada.`);
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al cancelar la cotización.";
      toast.error(errorMsg);
    }
  };

  const isSaving = cancelMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-zinc-500/10 text-zinc-600 flex items-center justify-center">
              <Ban className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                Cancelar Cotización
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                Esta acción descartará formalmente esta propuesta de compra
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2 text-xs">
          <p className="text-muted-foreground">
            Indica el motivo de cancelación para la cotización{" "}
            <span className="font-mono font-semibold text-foreground">
              {cotizacion?.numero}
            </span>
            :
          </p>

          <div className="flex flex-col gap-1">
            <Label htmlFor="motivoCancelacion" className="text-xs font-medium">
              Motivo de Cancelación <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="motivoCancelacion"
              {...register("motivoCancelacion")}
              placeholder="Ej. Oferta desestimada, cambio en especificaciones..."
              rows={3}
              className="text-xs resize-none bg-background/50"
            />
            {errors.motivoCancelacion && (
              <span className="text-[10px] text-destructive">
                {errors.motivoCancelacion.message}
              </span>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-border/40 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="h-7 text-xs"
            >
              Cerrar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="h-7 text-xs bg-zinc-700 hover:bg-zinc-800 text-white gap-1 font-medium cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  <span>Cancelando...</span>
                </>
              ) : (
                <span>Confirmar Cancelación</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
