"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Calendar, DollarSign, Layers, Loader2 } from "lucide-react";

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
import { cn } from "@/lib/utils";

import { loteSchema, type LoteFormValues } from "../schemas/lote.schema";
import { useCreateLote, useUpdateLote } from "../hooks/use-lote";
import type { LoteResponse } from "../types/lote.types";
import type { ProductoResponse } from "../../producto/types/producto.types";

interface LoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loteToEdit?: LoteResponse | null;
  producto: ProductoResponse | null;
  onSuccessCallback?: () => void;
}

export function LoteFormDialog({
  open,
  onOpenChange,
  loteToEdit,
  producto,
  onSuccessCallback,
}: LoteFormDialogProps) {
  const isEditing = Boolean(loteToEdit);

  const createMutation = useCreateLote();
  const updateMutation = useUpdateLote();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoteFormValues>({
    resolver: zodResolver(loteSchema),
    defaultValues: {
      productoId: producto?.id ?? 0,
      numeroLote: "",
      fechaFabricacion: "",
      fechaVencimiento: "",
      costoUnitario: null,
    },
  });

  React.useEffect(() => {
    if (open) {
      if (loteToEdit) {
        reset({
          productoId: loteToEdit.productoId,
          numeroLote: loteToEdit.numeroLote,
          fechaFabricacion: loteToEdit.fechaFabricacion || "",
          fechaVencimiento: loteToEdit.fechaVencimiento || "",
          costoUnitario:
            loteToEdit.costoUnitario !== null && loteToEdit.costoUnitario !== undefined
              ? Number(loteToEdit.costoUnitario)
              : null,
        });
      } else {
        reset({
          productoId: producto?.id ?? 0,
          numeroLote: "",
          fechaFabricacion: "",
          fechaVencimiento: "",
          costoUnitario: null,
        });
      }
    }
  }, [open, loteToEdit, producto, reset]);

  const onSubmit = async (values: LoteFormValues) => {
    if (!producto && !values.productoId) {
      toast.error("Debe seleccionar un producto.");
      return;
    }

    try {
      const payload = {
        productoId: values.productoId || producto!.id,
        numeroLote: values.numeroLote.trim().toUpperCase(),
        fechaFabricacion: values.fechaFabricacion ? values.fechaFabricacion : null,
        fechaVencimiento: values.fechaVencimiento ? values.fechaVencimiento : null,
        costoUnitario: values.costoUnitario !== null && values.costoUnitario !== undefined ? Number(values.costoUnitario) : null,
      };

      if (isEditing && loteToEdit) {
        await updateMutation.mutateAsync({
          id: loteToEdit.id,
          data: payload,
        });
        toast.success(`Lote ${values.numeroLote} actualizado correctamente.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Lote ${values.numeroLote} registrado correctamente.`);
      }
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al guardar el lote.";
      toast.error(errorMsg);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="size-5" />
            </div>
            <span>{isEditing ? "Editar Lote" : "Nuevo Lote de Producto"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {producto ? (
              <span>
                Asociado al producto: <strong className="text-foreground">{producto.codigo} - {producto.nombre}</strong>
              </span>
            ) : (
              "Ingrese los datos del nuevo lote."
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Número de Lote */}
          <div className="space-y-1.5">
            <Label htmlFor="numeroLote" className="text-xs flex items-center gap-1">
              Número / Código de Lote <span className="text-destructive">*</span>
            </Label>
            <Input
              id="numeroLote"
              placeholder="ej: LOT-2026-001"
              className={cn(
                "uppercase font-mono text-xs h-9",
                errors.numeroLote && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={Boolean(errors.numeroLote)}
              {...register("numeroLote")}
            />
            {errors.numeroLote && (
              <p className="text-[11px] text-destructive font-medium">{errors.numeroLote.message}</p>
            )}
          </div>

          {/* Fechas de Fabricación y Vencimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fechaFabricacion" className="text-xs flex items-center gap-1">
                <Calendar className="size-3 text-muted-foreground" /> Fabricación
              </Label>
              <Input
                id="fechaFabricacion"
                type="date"
                className="text-xs h-9"
                {...register("fechaFabricacion")}
              />
              {errors.fechaFabricacion && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.fechaFabricacion.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fechaVencimiento" className="text-xs flex items-center gap-1">
                <Calendar className="size-3 text-amber-500" /> Vencimiento
              </Label>
              <Input
                id="fechaVencimiento"
                type="date"
                className={cn(
                  "text-xs h-9",
                  errors.fechaVencimiento && "border-destructive focus-visible:ring-destructive"
                )}
                {...register("fechaVencimiento")}
              />
              {errors.fechaVencimiento && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.fechaVencimiento.message}
                </p>
              )}
            </div>
          </div>

          {/* Costo Unitario */}
          <div className="space-y-1.5">
            <Label htmlFor="costoUnitario" className="text-xs flex items-center gap-1">
              <DollarSign className="size-3 text-emerald-500" /> Costo Unitario (Opcional)
            </Label>
            <Input
              id="costoUnitario"
              type="number"
              step="any"
              placeholder="0.00"
              className={cn(
                "text-xs h-9 font-mono",
                errors.costoUnitario && "border-destructive focus-visible:ring-destructive"
              )}
              {...register("costoUnitario", {
                setValueAs: (v) => (v === "" || isNaN(v) ? null : Number(v)),
              })}
            />
            {errors.costoUnitario && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.costoUnitario.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-3 border-t gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="text-xs gap-1.5">
              {isLoading && <Loader2 className="size-3.5 animate-spin" />}
              {isEditing ? "Guardar Cambios" : "Registrar Lote"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
