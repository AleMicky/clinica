"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
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
  anularCobroSchema,
  type AnularCobroFormValues,
} from "../schemas/cobro.schema";
import { useAnularCobro } from "../hooks/use-cobros";
import type { CobroResponse } from "../types/cobro.types";

interface CobroAnularDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cobro?: CobroResponse | null;
  onSuccessCallback?: () => void;
}

export function CobroAnularDialog({
  open,
  onOpenChange,
  cobro,
  onSuccessCallback,
}: CobroAnularDialogProps) {
  const anularMutation = useAnularCobro();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnularCobroFormValues>({
    resolver: zodResolver(anularCobroSchema),
    defaultValues: {
      motivoAnulacion: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({ motivoAnulacion: "" });
    }
  }, [open, reset]);

  if (!cobro) return null;

  const onSubmit = async (values: AnularCobroFormValues) => {
    try {
      await anularMutation.mutateAsync({
        id: cobro.id,
        data: { motivoAnulacion: values.motivoAnulacion.trim() },
      });
      toast.success(`Cobro N° ${cobro.numero} anulado correctamente.`);
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { detail?: string; title?: string } };
        message?: string;
      };
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        err?.message ||
        "Error al anular el cobro.";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Anular Cobro</DialogTitle>
          </div>
          <DialogDescription className="pt-1 text-xs">
            ¿Está seguro de que desea anular el cobro{" "}
            <strong className="text-foreground">N° {cobro.numero}</strong> por el monto de{" "}
            <strong className="text-foreground">S/ {Number(cobro.total).toFixed(2)}</strong>?
            Ingrese la justificación de anulación requerida.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="motivoAnulacion" className="required font-medium text-xs">
              Motivo de Anulación
            </Label>
            <Textarea
              id="motivoAnulacion"
              placeholder="Ej: Cobro duplicado por error de digitación en ventanilla..."
              {...register("motivoAnulacion")}
              className="min-h-[80px] text-xs resize-none"
              disabled={anularMutation.isPending}
            />
            {errors.motivoAnulacion && (
              <p className="text-xs text-destructive">
                {errors.motivoAnulacion.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={anularMutation.isPending}
              className="h-9 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={anularMutation.isPending}
              className="h-9 gap-2 text-xs"
            >
              {anularMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <span>Confirmar Anulación</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
