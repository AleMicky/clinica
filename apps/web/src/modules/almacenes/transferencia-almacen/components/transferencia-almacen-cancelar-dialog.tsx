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
  cancelarTransferenciaSchema,
  type CancelarTransferenciaFormValues,
} from "../schemas/transferencia-almacen.schema";
import { useCancelarTransferenciaAlmacen } from "../hooks/use-transferencia-almacen";
import type { TransferenciaAlmacenResponse } from "../types/transferencia-almacen.types";

interface TransferenciaAlmacenCancelarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transferenciaToCancelar?: TransferenciaAlmacenResponse | null;
  onSuccessCallback?: () => void;
}

export function TransferenciaAlmacenCancelarDialog({
  open,
  onOpenChange,
  transferenciaToCancelar,
  onSuccessCallback,
}: TransferenciaAlmacenCancelarDialogProps) {
  const cancelarMutation = useCancelarTransferenciaAlmacen();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CancelarTransferenciaFormValues>({
    resolver: zodResolver(cancelarTransferenciaSchema),
    defaultValues: {
      motivoCancelacion: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({ motivoCancelacion: "" });
    }
  }, [open, reset]);

  const onSubmit = async (values: CancelarTransferenciaFormValues) => {
    if (!transferenciaToCancelar) return;

    try {
      await cancelarMutation.mutateAsync({
        id: transferenciaToCancelar.id,
        data: { motivoCancelacion: values.motivoCancelacion.trim() },
      });
      toast.success(
        `Transferencia "${transferenciaToCancelar.numero}" cancelada.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al cancelar la transferencia.";
      toast.error(errorMsg);
    }
  };

  const isSaving = cancelarMutation.isPending || isSubmitting;

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
                Cancelar Transferencia
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                Esta acción anulará el proceso de traslado
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
          <p className="text-xs text-muted-foreground">
            Indica el motivo por el cual se cancela la transferencia{" "}
            <span className="font-mono font-semibold text-foreground">
              {transferenciaToCancelar?.numero}
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
              placeholder="Ej. Error en solicitud de cantidades, almacén emisor sin stock suficiente..."
              rows={3}
              className="text-xs resize-none"
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
              className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white gap-1 font-medium"
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
