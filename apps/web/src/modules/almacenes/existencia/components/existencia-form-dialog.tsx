"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Boxes,
  Loader2,
  Warehouse,
  Package,
  Tag,
  Calculator,
} from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  existenciaSchema,
  type ExistenciaFormValues,
} from "../schemas/existencia.schema";
import {
  useCreateExistencia,
  useUpdateExistencia,
} from "../hooks/use-existencia";
import type { ExistenciaResponse } from "../types/existencia.types";
import { AlmacenAutocomplete } from "../../almacen";
import { ProductoAutocomplete } from "../../producto";
import { LoteAutocomplete } from "../../lote";

interface ExistenciaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existenciaToEdit?: ExistenciaResponse | null;
  onSuccessCallback?: () => void;
}

export function ExistenciaFormDialog({
  open,
  onOpenChange,
  existenciaToEdit,
  onSuccessCallback,
}: ExistenciaFormDialogProps) {
  const isEditing = Boolean(existenciaToEdit);

  const createMutation = useCreateExistencia();
  const updateMutation = useUpdateExistencia();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExistenciaFormValues>({
    resolver: zodResolver(existenciaSchema),
    defaultValues: {
      almacenId: 0,
      productoId: 0,
      loteId: null,
      cantidad: 0,
      cantidadReservada: 0,
    },
  });

  const selectedProductoId = watch("productoId");
  const watchedCantidad = watch("cantidad") || 0;
  const watchedReservada = watch("cantidadReservada") || 0;
  const calculatedDisponible = Math.max(0, watchedCantidad - watchedReservada);

  React.useEffect(() => {
    if (open) {
      if (existenciaToEdit) {
        reset({
          almacenId: existenciaToEdit.almacenId,
          productoId: existenciaToEdit.productoId,
          loteId: existenciaToEdit.loteId || null,
          cantidad: existenciaToEdit.cantidad,
          cantidadReservada: existenciaToEdit.cantidadReservada,
        });
      } else {
        reset({
          almacenId: 0,
          productoId: 0,
          loteId: null,
          cantidad: 0,
          cantidadReservada: 0,
        });
      }
    }
  }, [open, existenciaToEdit, reset]);

  const onSubmit = async (values: ExistenciaFormValues) => {
    try {
      if (isEditing && existenciaToEdit) {
        await updateMutation.mutateAsync({
          id: existenciaToEdit.id,
          data: {
            almacenId: Number(values.almacenId),
            productoId: Number(values.productoId),
            loteId: values.loteId ? Number(values.loteId) : null,
            cantidad: Number(values.cantidad),
            cantidadReservada: Number(values.cantidadReservada),
          },
        });
        toast.success("Existencia actualizada correctamente.");
      } else {
        await createMutation.mutateAsync({
          almacenId: Number(values.almacenId),
          productoId: Number(values.productoId),
          loteId: values.loteId ? Number(values.loteId) : null,
          cantidad: Number(values.cantidad),
          cantidadReservada: Number(values.cantidadReservada),
        });
        toast.success("Existencia registrada exitosamente.");
      }
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al guardar la existencia.";
      toast.error(errorMsg);
    }
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Boxes className="size-5" />
            </div>
            <span>
              {isEditing ? "Modificar Existencia" : "Registrar Nueva Existencia"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Ajuste las cantidades de stock físico y reservado para este registro."
              : "Asocie un producto a un almacén e inicialice sus existencias."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Selectores */}
          <div className="space-y-3">
            {/* Almacén */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Warehouse className="size-3.5 text-primary" />
                <span>Almacén de Destino</span>
                <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="almacenId"
                control={control}
                render={({ field }) => (
                  <AlmacenAutocomplete
                    value={field.value}
                    onValueChange={(val) => field.onChange(val || 0)}
                    disabled={isLoading || isEditing}
                    error={Boolean(errors.almacenId)}
                    placeholder="Seleccionar almacén..."
                  />
                )}
              />
              {errors.almacenId && (
                <p className="text-destructive text-[11px]">
                  {errors.almacenId.message}
                </p>
              )}
            </div>

            {/* Producto */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Package className="size-3.5 text-primary" />
                <span>Producto</span>
                <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="productoId"
                control={control}
                render={({ field }) => (
                  <ProductoAutocomplete
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val || 0);
                      // Reset lote selection if product changes
                      setValue("loteId", null);
                    }}
                    disabled={isLoading || isEditing}
                    error={Boolean(errors.productoId)}
                    placeholder="Buscar producto por código o nombre..."
                  />
                )}
              />
              {errors.productoId && (
                <p className="text-destructive text-[11px]">
                  {errors.productoId.message}
                </p>
              )}
            </div>

            {/* Lote (Opcional) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Tag className="size-3.5 text-muted-foreground" />
                <span>Lote (Opcional)</span>
              </Label>
              <Controller
                name="loteId"
                control={control}
                render={({ field }) => (
                  <LoteAutocomplete
                    productoId={selectedProductoId}
                    value={field.value}
                    onValueChange={(val) => field.onChange(val || null)}
                    disabled={isLoading || !selectedProductoId}
                    error={Boolean(errors.loteId)}
                    placeholder="Seleccionar lote del producto..."
                  />
                )}
              />
            </div>
          </div>

          {/* Cantidades */}
          <div className="p-3.5 bg-muted/30 rounded-xl border border-border/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calculator className="size-3.5 text-primary" />
                <span>Control de Cantidades</span>
              </span>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-muted-foreground">Disponible:</span>
                <Badge
                  variant="outline"
                  className="font-mono text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 px-1.5 py-0"
                >
                  {calculatedDisponible.toLocaleString()}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Cantidad Total */}
              <div className="space-y-1">
                <Label
                  htmlFor="cantidad"
                  className="text-xs font-medium text-foreground flex items-center justify-between"
                >
                  <span>Cantidad Físico</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cantidad"
                  type="number"
                  step="any"
                  min={0}
                  placeholder="0.00"
                  {...register("cantidad", { valueAsNumber: true })}
                  disabled={isLoading}
                  className={cn(
                    "font-mono text-xs h-8 bg-background border-border/60",
                    errors.cantidad && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.cantidad && (
                  <p className="text-destructive text-[10px]">
                    {errors.cantidad.message}
                  </p>
                )}
              </div>

              {/* Cantidad Reservada */}
              <div className="space-y-1">
                <Label
                  htmlFor="cantidadReservada"
                  className="text-xs font-medium text-foreground flex items-center justify-between"
                >
                  <span>Cantidad Reservada</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cantidadReservada"
                  type="number"
                  step="any"
                  min={0}
                  placeholder="0.00"
                  {...register("cantidadReservada", { valueAsNumber: true })}
                  disabled={isLoading}
                  className={cn(
                    "font-mono text-xs h-8 bg-background border-border/60",
                    errors.cantidadReservada && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.cantidadReservada && (
                  <p className="text-destructive text-[10px]">
                    {errors.cantidadReservada.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-border/40">
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
              disabled={isLoading}
              className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs font-medium"
            >
              {isLoading && <Loader2 className="size-3.5 animate-spin" />}
              <span>{isEditing ? "Actualizar Stock" : "Registrar Stock"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
