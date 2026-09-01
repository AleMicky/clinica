"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ban, AlertTriangle, Loader2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  anularMovimientoSchema,
  type AnularMovimientoFormValues,
} from "../schemas/movimiento-inventario.schema";
import { useAnularMovimientoInventario } from "../hooks/use-movimiento-inventario";
import type { MovimientoInventarioResponse } from "../types/movimiento-inventario.types";

interface MovimientoInventarioAnularDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimientoToAnular?: MovimientoInventarioResponse | null;
  onSuccessCallback?: () => void;
}

export function MovimientoInventarioAnularDialog({
  open,
  onOpenChange,
  movimientoToAnular,
  onSuccessCallback,
}: MovimientoInventarioAnularDialogProps) {
  const anularMutation = useAnularMovimientoInventario();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnularMovimientoFormValues>({
    resolver: zodResolver(anularMovimientoSchema),
    defaultValues: {
      motivoAnulacion: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({ motivoAnulacion: "" });
    }
  }, [open, reset]);

  const onSubmit = async (values: AnularMovimientoFormValues) => {
    if (!movimientoToAnular) return;

    try {
      await anularMutation.mutateAsync({
        id: movimientoToAnular.id,
        data: {
          motivoAnulacion: values.motivoAnulacion.trim(),
        },
      });
      toast.success(
        `Movimiento "${movimientoToAnular.numero}" anulado correctamente.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al anular el movimiento.";
      toast.error(errorMsg);
    }
  };

  const isLoading = anularMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="flex flex-col items-center text-center gap-2 pb-2">
          <div className="size-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Ban className="size-6" />
          </div>
          <DialogTitle className="text-base font-bold text-foreground">
            ¿Anular Movimiento de Inventario?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Estás a punto de anular el comprobante{" "}
            <strong className="text-foreground font-mono">
              {movimientoToAnular?.numero}
            </strong>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 my-2">
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
            <AlertTriangle className="size-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <p className="text-[11px] leading-relaxed opacity-95">
              Esta acción revertirá el impacto del movimiento en los registros de
              stock y no se podrá deshacer. Por favor especifica el motivo.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="motivoAnulacion" className="text-xs font-medium">
              Motivo de la Anulación <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="motivoAnulacion"
              {...register("motivoAnulacion")}
              placeholder="Escribe la razón detallada de la anulación..."
              rows={3}
              className="text-xs resize-none"
            />
            {errors.motivoAnulacion && (
              <span className="text-[10px] text-destructive">
                {errors.motivoAnulacion.message}
              </span>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-8 text-xs cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="destructive"
              disabled={isLoading}
              className="h-8 text-xs gap-1.5 shadow-xs cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Anulando...</span>
                </>
              ) : (
                <span>Confirmar Anulación</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
