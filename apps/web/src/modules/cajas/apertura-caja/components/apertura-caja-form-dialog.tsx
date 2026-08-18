"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Coins, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  aperturaCajaSchema,
  type AperturaCajaFormValues,
} from "../schemas/apertura-caja.schema";
import {
  useCreateAperturaCaja,
  useUpdateAperturaCaja,
} from "../hooks/use-aperturas-caja";
import type { AperturaCajaResponse } from "../types/apertura-caja.types";

interface AperturaCajaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turnoCajaId: number;
  cajeroNombre?: string;
  cajaNombre?: string;
  aperturaToEdit?: AperturaCajaResponse | null;
  onSuccessCallback?: () => void;
}

function toLocalDatetimeString(dateInput?: string | Date | null): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function AperturaCajaFormDialog({
  open,
  onOpenChange,
  turnoCajaId,
  cajeroNombre,
  cajaNombre,
  aperturaToEdit,
  onSuccessCallback,
}: AperturaCajaFormDialogProps) {
  const isEditing = Boolean(aperturaToEdit);

  const createMutation = useCreateAperturaCaja();
  const updateMutation = useUpdateAperturaCaja();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AperturaCajaFormValues>({
    resolver: zodResolver(aperturaCajaSchema),
    defaultValues: {
      turnoCajaId: turnoCajaId || 0,
      fechaHora: toLocalDatetimeString(),
      montoInicial: 0,
      observacion: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      if (aperturaToEdit) {
        reset({
          turnoCajaId: aperturaToEdit.turnoCaja?.id || turnoCajaId,
          fechaHora: toLocalDatetimeString(aperturaToEdit.fechaHora),
          montoInicial: Number(aperturaToEdit.montoInicial),
          observacion: aperturaToEdit.observacion || "",
        });
      } else {
        reset({
          turnoCajaId: turnoCajaId || 0,
          fechaHora: toLocalDatetimeString(),
          montoInicial: 0,
          observacion: "",
        });
      }
    }
  }, [open, aperturaToEdit, turnoCajaId, reset]);

  const onSubmit = async (values: AperturaCajaFormValues) => {
    try {
      const fechaIso = new Date(values.fechaHora).toISOString();
      const payload = {
        turnoCajaId: Number(turnoCajaId || values.turnoCajaId),
        fechaHora: fechaIso,
        montoInicial: Number(values.montoInicial),
        observacion: values.observacion?.trim() || null,
      };

      if (isEditing && aperturaToEdit) {
        await updateMutation.mutateAsync({
          id: aperturaToEdit.id,
          data: payload,
        });
        toast.success("Apertura de caja actualizada correctamente.");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Apertura de caja registrada correctamente.");
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string; title?: string } }; message?: string };
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        err?.message ||
        "Ocurrió un error al guardar la apertura de caja.";
      toast.error(message);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Coins className="size-5" />
            </div>
            <span>{isEditing ? "Editar Apertura de Caja" : "Registrar Fondo Inicial de Apertura"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {cajeroNombre ? `Cajero: ${cajeroNombre}` : ""} {cajaNombre ? `• Caja: ${cajaNombre}` : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Indicador de campos obligatorios */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md border border-border/40">
            <span>Fondo Inicial y Declaración</span>
            <span className="text-destructive font-medium">* Requeridos</span>
          </div>

          {/* Monto Inicial */}
          <div className="space-y-1.5">
            <Label htmlFor="montoInicial" className="text-xs flex items-center gap-1">
              Monto Inicial / Saldo Base (S/) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="montoInicial"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className={cn(
                "h-9 text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400",
                errors.montoInicial && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={Boolean(errors.montoInicial)}
              disabled={isLoading}
              {...register("montoInicial", { valueAsNumber: true })}
            />
            {errors.montoInicial && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.montoInicial.message}
              </p>
            )}
          </div>

          {/* Fecha y Hora de Apertura */}
          <div className="space-y-1.5">
            <Label htmlFor="fechaHora" className="text-xs flex items-center gap-1">
              Fecha y Hora de la Apertura <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fechaHora"
              type="datetime-local"
              className={cn(
                "h-9 text-sm font-mono",
                errors.fechaHora && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={Boolean(errors.fechaHora)}
              disabled={isLoading}
              {...register("fechaHora")}
            />
            {errors.fechaHora && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.fechaHora.message}
              </p>
            )}
          </div>

          {/* Observación */}
          <div className="space-y-1.5">
            <Label htmlFor="observacion" className="text-xs flex items-center gap-1">
              Observación <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
            </Label>
            <Textarea
              id="observacion"
              placeholder="Ej: Saldo entregado en billetes de denominación menor para cambio."
              className="min-h-[75px] text-sm resize-none"
              disabled={isLoading}
              {...register("observacion")}
            />
            {errors.observacion && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.observacion.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-9 text-xs sm:text-sm cursor-pointer"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="h-9 gap-2 text-xs sm:text-sm cursor-pointer">
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              <span>{isEditing ? "Guardar Cambios" : "Confirmar Apertura"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
