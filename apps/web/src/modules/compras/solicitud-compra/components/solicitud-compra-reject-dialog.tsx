"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { XCircle, Loader2 } from "lucide-react";
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
  rechazarSolicitudSchema,
  type RechazarSolicitudFormValues,
} from "../schemas/solicitud-compra.schema";
import { useRechazarSolicitudCompra } from "../hooks/use-solicitud-compra";
import type { SolicitudCompraResponse } from "../types/solicitud-compra.types";

interface SolicitudCompraRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solicitud?: SolicitudCompraResponse | null;
  onSuccessCallback?: () => void;
}

export function SolicitudCompraRejectDialog({
  open,
  onOpenChange,
  solicitud,
  onSuccessCallback,
}: SolicitudCompraRejectDialogProps) {
  const rejectMutation = useRechazarSolicitudCompra();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RechazarSolicitudFormValues>({
    resolver: zodResolver(rechazarSolicitudSchema),
    defaultValues: {
      motivoRechazo: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({ motivoRechazo: "" });
    }
  }, [open, reset]);

  const onSubmit = async (values: RechazarSolicitudFormValues) => {
    if (!solicitud) return;

    try {
      await rejectMutation.mutateAsync({
        id: solicitud.id,
        data: { motivoRechazo: values.motivoRechazo.trim() },
      });
      toast.success(`Solicitud "${solicitud.numero}" rechazada.`);
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al rechazar la solicitud de compra.";
      toast.error(errorMsg);
    }
  };

  const isSaving = rejectMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <XCircle className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                Rechazar Solicitud de Compra
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                Indica la razón por la cual no procede esta solicitud
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2 text-xs">
          <p className="text-muted-foreground">
            Rechazar solicitud{" "}
            <span className="font-mono font-semibold text-foreground">
              {solicitud?.numero}
            </span>
            :
          </p>

          <div className="flex flex-col gap-1">
            <Label htmlFor="motivoRechazo" className="text-xs font-medium">
              Motivo de Rechazo <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="motivoRechazo"
              {...register("motivoRechazo")}
              placeholder="Ej. Stock suficiente en almacén central, precio fuera de rango..."
              rows={3}
              className="text-xs resize-none bg-background/50"
            />
            {errors.motivoRechazo && (
              <span className="text-[10px] text-destructive">
                {errors.motivoRechazo.message}
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
                  <span>Rechazando...</span>
                </>
              ) : (
                <span>Confirmar Rechazo</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
