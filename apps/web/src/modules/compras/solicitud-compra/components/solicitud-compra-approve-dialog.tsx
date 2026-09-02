"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
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
  aprobarSolicitudSchema,
  type AprobarSolicitudFormValues,
} from "../schemas/solicitud-compra.schema";
import { useAprobarSolicitudCompra } from "../hooks/use-solicitud-compra";
import type { SolicitudCompraResponse } from "../types/solicitud-compra.types";

interface SolicitudCompraApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solicitud?: SolicitudCompraResponse | null;
  onSuccessCallback?: () => void;
}

export function SolicitudCompraApproveDialog({
  open,
  onOpenChange,
  solicitud,
  onSuccessCallback,
}: SolicitudCompraApproveDialogProps) {
  const approveMutation = useAprobarSolicitudCompra();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AprobarSolicitudFormValues>({
    resolver: zodResolver(aprobarSolicitudSchema),
    defaultValues: {
      observacionAprobacion: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({ observacionAprobacion: "" });
    }
  }, [open, reset]);

  const onSubmit = async (values: AprobarSolicitudFormValues) => {
    if (!solicitud) return;

    try {
      await approveMutation.mutateAsync({
        id: solicitud.id,
        data: {
          observacionAprobacion: values.observacionAprobacion?.trim() || null,
        },
      });
      toast.success(`Solicitud "${solicitud.numero}" aprobada exitosamente.`);
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al aprobar la solicitud de compra.";
      toast.error(errorMsg);
    }
  };

  const isSaving = approveMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                Aprobar Solicitud de Compra
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                Autoriza el requerimiento para proceder a la orden de compra
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2 text-xs">
          <p className="text-muted-foreground">
            ¿Confirmas la aprobación formal de la solicitud{" "}
            <span className="font-mono font-semibold text-foreground">
              {solicitud?.numero}
            </span>{" "}
            para el almacén{" "}
            <strong className="text-foreground">
              {solicitud?.almacenNombre}
            </strong>
            ?
          </p>

          <div className="flex flex-col gap-1">
            <Label htmlFor="observacionAprobacion" className="text-xs font-medium">
              Observaciones de Aprobación (Opcional)
            </Label>
            <Textarea
              id="observacionAprobacion"
              {...register("observacionAprobacion")}
              placeholder="Ej. Aprobado según presupuesto de abastecimiento mensual..."
              rows={3}
              className="text-xs resize-none bg-background/50"
            />
            {errors.observacionAprobacion && (
              <span className="text-[10px] text-destructive">
                {errors.observacionAprobacion.message}
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
              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-medium"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  <span>Aprobando...</span>
                </>
              ) : (
                <span>Confirmar Aprobación</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
