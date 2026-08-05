"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { TrendingUp, Loader2 } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  tipoCambioSchema,
  type TipoCambioFormValues,
} from "../schemas/tipo-cambio.schema";
import {
  useCreateTipoCambio,
  useUpdateTipoCambio,
} from "../hooks/use-tipos-cambio";
import { useMonedas } from "../../moneda/hooks/use-monedas";
import type { TipoCambioResponse } from "../types/tipo-cambio.types";
import type { TipoCambioItem } from "./tipo-cambio-table";

interface TipoCambioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoCambioToEdit?: TipoCambioResponse | TipoCambioItem | null;
  onSuccessCallback?: () => void;
}

export function TipoCambioFormDialog({
  open,
  onOpenChange,
  tipoCambioToEdit,
  onSuccessCallback,
}: TipoCambioFormDialogProps) {
  const isEditing = Boolean(tipoCambioToEdit);

  const createMutation = useCreateTipoCambio();
  const updateMutation = useUpdateTipoCambio();

  // Fetch currencies list for select dropdowns
  const { data: monedasData } = useMonedas({ pageSize: 100 });
  const monedas = monedasData?.items || [];

  const getTodayDate = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TipoCambioFormValues>({
    resolver: zodResolver(tipoCambioSchema),
    defaultValues: {
      monedaOrigenId: 0,
      monedaDestinoId: 0,
      compra: 1,
      venta: 1,
      fecha: getTodayDate(),
    },
  });

  const origenIdValue = watch("monedaOrigenId");
  const destinoIdValue = watch("monedaDestinoId");

  const selectedOrigen = React.useMemo(
    () => monedas.find((m) => Number(m.id) === Number(origenIdValue)),
    [monedas, origenIdValue]
  );

  const selectedDestino = React.useMemo(
    () => monedas.find((m) => Number(m.id) === Number(destinoIdValue)),
    [monedas, destinoIdValue]
  );

  React.useEffect(() => {
    if (open) {
      if (tipoCambioToEdit) {
        reset({
          monedaOrigenId: tipoCambioToEdit.monedaOrigenId,
          monedaDestinoId: tipoCambioToEdit.monedaDestinoId,
          compra: tipoCambioToEdit.compra,
          venta: tipoCambioToEdit.venta,
          fecha: tipoCambioToEdit.fecha,
        });
      } else {
        const baseMoneda = monedas.find((m) => m.esBase);
        const secondMoneda = monedas.find((m) => !m.esBase);

        reset({
          monedaOrigenId: baseMoneda?.id || (monedas[0]?.id ?? 0),
          monedaDestinoId: secondMoneda?.id || (monedas[1]?.id ?? 0),
          compra: 1.0,
          venta: 1.0,
          fecha: getTodayDate(),
        });
      }
    }
  }, [open, tipoCambioToEdit, reset, monedas]);

  const onSubmit = async (values: TipoCambioFormValues) => {
    try {
      if (isEditing && tipoCambioToEdit) {
        await updateMutation.mutateAsync({
          id: tipoCambioToEdit.id,
          data: {
            monedaOrigenId: values.monedaOrigenId,
            monedaDestinoId: values.monedaDestinoId,
            compra: values.compra,
            venta: values.venta,
            fecha: values.fecha,
          },
        });
        toast.success("Tipo de cambio actualizado correctamente.");
      } else {
        await createMutation.mutateAsync({
          monedaOrigenId: values.monedaOrigenId,
          monedaDestinoId: values.monedaDestinoId,
          compra: values.compra,
          venta: values.venta,
          fecha: values.fecha,
        });
        toast.success("Tipo de cambio registrado correctamente.");
      }
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al procesar la solicitud.";
      toast.error(errorMsg);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="size-5" />
            </div>
            <span>{isEditing ? "Editar Tipo de Cambio" : "Nuevo Tipo de Cambio"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique los valores de cotización de la fecha seleccionada."
              : "Registre los valores oficiales de compra y venta para la conversión de divisas."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          {/* Indicador de campos obligatorios */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md border border-border/40">
            <span>Configuración de Cotización</span>
            <span className="text-destructive font-medium">* Requeridos</span>
          </div>

          {/* Fecha del Tipo de Cambio */}
          <div className="space-y-1.5">
            <Label htmlFor="fecha" className="text-xs flex items-center gap-1">
              Fecha de Cotización <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fecha"
              type="date"
              className={cn(
                "text-sm h-9",
                errors.fecha && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={Boolean(errors.fecha)}
              {...register("fecha")}
            />
            {errors.fecha && (
              <p className="text-[11px] text-destructive font-medium">{errors.fecha.message}</p>
            )}
          </div>

          {/* Selección de Monedas (Origen y Destino) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
            {/* Moneda Origen */}
            <div className="space-y-1.5">
              <Label htmlFor="monedaOrigenId" className="text-xs flex items-center gap-1">
                Moneda Origen <span className="text-destructive">*</span>
              </Label>
              <Select
                value={origenIdValue ? String(origenIdValue) : ""}
                onValueChange={(val) => setValue("monedaOrigenId", Number(val))}
              >
                <SelectTrigger id="monedaOrigenId" className={cn("w-full h-9 text-sm", errors.monedaOrigenId && "border-destructive")}>
                  <SelectValue placeholder="Seleccione moneda origen">
                    {selectedOrigen && (
                      <span className="font-medium text-xs truncate">
                        <strong className="font-mono text-primary font-bold">{selectedOrigen.codigo}</strong> ({selectedOrigen.simbolo}) - {selectedOrigen.nombre}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-[240px]">
                  {monedas.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      <span className="font-bold font-mono text-primary">{m.codigo}</span> ({m.simbolo}) - {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.monedaOrigenId && (
                <p className="text-[11px] text-destructive font-medium">{errors.monedaOrigenId.message}</p>
              )}
            </div>

            {/* Moneda Destino */}
            <div className="space-y-1.5">
              <Label htmlFor="monedaDestinoId" className="text-xs flex items-center gap-1">
                Moneda Destino <span className="text-destructive">*</span>
              </Label>
              <Select
                value={destinoIdValue ? String(destinoIdValue) : ""}
                onValueChange={(val) => setValue("monedaDestinoId", Number(val))}
              >
                <SelectTrigger id="monedaDestinoId" className={cn("w-full h-9 text-sm", errors.monedaDestinoId && "border-destructive")}>
                  <SelectValue placeholder="Seleccione moneda destino">
                    {selectedDestino && (
                      <span className="font-medium text-xs truncate">
                        <strong className="font-mono text-primary font-bold">{selectedDestino.codigo}</strong> ({selectedDestino.simbolo}) - {selectedDestino.nombre}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-[240px]">
                  {monedas.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      <span className="font-bold font-mono text-primary">{m.codigo}</span> ({m.simbolo}) - {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.monedaDestinoId && (
                <p className="text-[11px] text-destructive font-medium">{errors.monedaDestinoId.message}</p>
              )}
            </div>
          </div>

          {/* Tasas de Compra y Venta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
            {/* Tasa Compra */}
            <div className="space-y-1.5">
              <Label htmlFor="compra" className="text-xs flex items-center gap-1">
                Tasa de Compra <span className="text-destructive">*</span>
              </Label>
              <Input
                id="compra"
                type="number"
                step="0.0001"
                placeholder="ej: 3.7200"
                className={cn(
                  "font-mono text-sm h-9",
                  errors.compra && "border-destructive focus-visible:ring-destructive"
                )}
                aria-invalid={Boolean(errors.compra)}
                {...register("compra", { valueAsNumber: true })}
              />
              {errors.compra && (
                <p className="text-[11px] text-destructive font-medium">{errors.compra.message}</p>
              )}
            </div>

            {/* Tasa Venta */}
            <div className="space-y-1.5">
              <Label htmlFor="venta" className="text-xs flex items-center gap-1">
                Tasa de Venta <span className="text-destructive">*</span>
              </Label>
              <Input
                id="venta"
                type="number"
                step="0.0001"
                placeholder="ej: 3.7600"
                className={cn(
                  "font-mono text-sm h-9 font-semibold text-primary",
                  errors.venta && "border-destructive focus-visible:ring-destructive"
                )}
                aria-invalid={Boolean(errors.venta)}
                {...register("venta", { valueAsNumber: true })}
              />
              {errors.venta && (
                <p className="text-[11px] text-destructive font-medium">{errors.venta.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Guardar Cambios" : "Registrar Tasa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
