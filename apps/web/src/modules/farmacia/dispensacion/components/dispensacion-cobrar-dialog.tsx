"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CreditCard, Loader2, Coins } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { useRegistrarCobroDispensacion } from "../hooks/use-dispensacion";
import type { DispensacionResponse } from "../types/dispensacion.types";

interface DispensacionCobrarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispensacion: DispensacionResponse | null;
  onSuccessCallback?: () => void;
}

interface FormValues {
  metodoPago: string;
  comprobanteCobro?: string;
}

export function DispensacionCobrarDialog({
  open,
  onOpenChange,
  dispensacion,
  onSuccessCallback,
}: DispensacionCobrarDialogProps) {
  const cobrarMutation = useRegistrarCobroDispensacion();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      metodoPago: "Efectivo",
      comprobanteCobro: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        metodoPago: "Efectivo",
        comprobanteCobro: "",
      });
    }
  }, [open, reset]);

  if (!dispensacion) return null;

  const onSubmit = async (values: FormValues) => {
    try {
      await cobrarMutation.mutateAsync({
        id: dispensacion.id,
        data: {
          metodoPago: values.metodoPago,
          comprobanteCobro: values.comprobanteCobro?.trim(),
        },
      });

      toast.success(
        `Cobro de "${dispensacion.numero}" registrado exitosamente. La orden ya está liberada para entrega física en Farmacia.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al registrar el cobro en Caja.";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-5">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <CreditCard className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Cobro en Caja • Ticket {dispensacion.numero}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Registra el pago del paciente para autorizar la entrega de medicamentos.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 py-2">
          <div className="p-3 bg-muted/30 border border-border/60 rounded-lg flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase font-semibold">
              Monto a Cobrar:
            </span>
            <span className="font-mono text-xl font-bold text-teal-600 dark:text-teal-400">
              ${dispensacion.total.toFixed(2)}
            </span>
          </div>

          <div>
            <Label className="text-xs font-semibold">Método de Pago</Label>
            <select
              {...register("metodoPago")}
              className="mt-1 w-full h-8 px-2 text-xs rounded-md border border-border/60 bg-background text-foreground"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta de Débito">Tarjeta de Débito</option>
              <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
              <option value="Transferencia / QR">Transferencia / QR</option>
              <option value="Convenio Institucional">Convenio Institucional</option>
            </select>
          </div>

          <div>
            <Label className="text-xs font-semibold">N° Recibo / Comprobante de Caja</Label>
            <Input
              {...register("comprobanteCobro")}
              placeholder="Ej. REC-2026-0045"
              className="mt-1 h-8 text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Procesando cobro...</span>
                </>
              ) : (
                <>
                  <Coins className="size-3.5" />
                  <span>Confirmar Pago en Caja</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
