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
  anularRecepcionSchema,
  type AnularRecepcionFormValues,
} from "../schemas/recepcion-compra.schema";
import { useAnularRecepcionCompra } from "../hooks/use-recepcion-compra";
import type { RecepcionCompraResponse } from "../types/recepcion-compra.types";

interface RecepcionCompraAnularDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recepcion?: RecepcionCompraResponse | null;
  onSuccessCallback?: () => void;
}

export function RecepcionCompraAnularDialog({
  open,
  onOpenChange,
  recepcion,
  onSuccessCallback,
}: RecepcionCompraAnularDialogProps) {
  const anularMutation = useAnularRecepcionCompra();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnularRecepcionFormValues>({
    resolver: zodResolver(anularRecepcionSchema),
    defaultValues: {
      motivoAnulacion: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({ motivoAnulacion: "" });
    }
  }, [open, reset]);

  const onSubmit = async (values: AnularRecepcionFormValues) => {
    if (!recepcion) return;

    try {
      await anularMutation.mutateAsync({
        id: recepcion.id,
        data: { motivoAnulacion: values.motivoAnulacion.trim() },
      });
      toast.success(`Recepción "${recepcion.numero}" anulada y stock revertido.`);
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al anular la recepción.";
      toast.error(errorMsg);
    }
  };

  const isSaving = anularMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <Ban className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                Anular Recepción de Compra
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                Esta acción revertirá las existencias ingresadas al almacén
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2 text-xs">
          <p className="text-muted-foreground">
            Indica el motivo por el cual se anula la recepción{" "}
            <span className="font-mono font-semibold text-foreground">
              {recepcion?.numero}
            </span>
            :
          </p>

          <div className="flex flex-col gap-1">
            <Label htmlFor="motivoAnulacion" className="text-xs font-medium">
              Motivo de Anulación <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="motivoAnulacion"
              {...register("motivoAnulacion")}
              placeholder="Ej. Error en cantidad física, devolución total en rampa..."
              rows={3}
              className="text-xs resize-none bg-background/50"
            />
            {errors.motivoAnulacion && (
              <span className="text-[10px] text-destructive">
                {errors.motivoAnulacion.message}
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
              className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white gap-1 font-medium cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
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
