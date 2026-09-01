"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Boxes, Loader2, Warehouse, Package, Tag, Calculator } from "lucide-react";

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
import type { AlmacenResponse } from "../../almacen/types/almacen.types";
import type { ProductoResponse } from "../../producto/types/producto.types";
import type { LoteResponse } from "../../lote/types/lote.types";

interface ExistenciaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existenciaToEdit?: ExistenciaResponse | null;
  almacenes?: AlmacenResponse[];
  productos?: ProductoResponse[];
  lotes?: LoteResponse[];
  onSuccessCallback?: () => void;
}

export function ExistenciaFormDialog({
  open,
  onOpenChange,
  existenciaToEdit,
  almacenes = [],
  productos = [],
  lotes = [],
  onSuccessCallback,
}: ExistenciaFormDialogProps) {
  const isEditing = Boolean(existenciaToEdit);

  const createMutation = useCreateExistencia();
  const updateMutation = useUpdateExistencia();

  const {
    register,
    handleSubmit,
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
          almacenId: almacenes[0]?.id || 0,
          productoId: productos[0]?.id || 0,
          loteId: null,
          cantidad: 0,
          cantidadReservada: 0,
        });
      }
    }
  }, [open, existenciaToEdit, reset, almacenes, productos]);

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
          <DialogTitle className="flex items-center gap-2 text-xl">
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
          {/* Warehouse & Product Selection */}
          <div className="space-y-3">
            {/* Almacén */}
            <div className="space-y-1">
              <Label
                htmlFor="almacenId"
                className="text-xs font-medium text-foreground flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Warehouse className="size-3.5 text-primary" />
                  <span>Almacén de Destino</span>
                </span>
                <span className="text-destructive">*</span>
              </Label>
              <select
                id="almacenId"
                {...register("almacenId", { valueAsNumber: true })}
                disabled={isLoading || isEditing}
                className={cn(
                  "w-full h-8 px-2.5 text-xs rounded-md border border-border/60 bg-muted/30 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer",
                  errors.almacenId && "border-destructive focus:ring-destructive",
                  isEditing && "opacity-70 cursor-not-allowed"
                )}
              >
                <option value={0}>Seleccione un almacén...</option>
                {almacenes.map((alm) => (
                  <option key={alm.id} value={alm.id}>
                    {alm.nombre} ({alm.codigo})
                  </option>
                ))}
              </select>
              {errors.almacenId && (
                <p className="text-destructive text-[11px]">
                  {errors.almacenId.message}
                </p>
              )}
            </div>

            {/* Producto */}
            <div className="space-y-1">
              <Label
                htmlFor="productoId"
                className="text-xs font-medium text-foreground flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Package className="size-3.5 text-primary" />
                  <span>Producto</span>
                </span>
                <span className="text-destructive">*</span>
              </Label>
              <select
                id="productoId"
                {...register("productoId", { valueAsNumber: true })}
                disabled={isLoading || isEditing}
                className={cn(
                  "w-full h-8 px-2.5 text-xs rounded-md border border-border/60 bg-muted/30 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer",
                  errors.productoId && "border-destructive focus:ring-destructive",
                  isEditing && "opacity-70 cursor-not-allowed"
                )}
              >
                <option value={0}>Seleccione un producto...</option>
                {productos.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.nombre} {prod.codigo ? `[${prod.codigo}]` : ""}
                  </option>
                ))}
              </select>
              {errors.productoId && (
                <p className="text-destructive text-[11px]">
                  {errors.productoId.message}
                </p>
              )}
            </div>

            {/* Lote (Opcional) */}
            <div className="space-y-1">
              <Label
                htmlFor="loteId"
                className="text-xs font-medium text-foreground flex items-center gap-1.5"
              >
                <Tag className="size-3.5 text-muted-foreground" />
                <span>Lote (Opcional)</span>
              </Label>
              <select
                id="loteId"
                {...register("loteId", {
                  setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
                })}
                disabled={isLoading}
                className="w-full h-8 px-2.5 text-xs rounded-md border border-border/60 bg-muted/30 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="">Sin lote específico</option>
                {lotes.map((lote) => (
                  <option key={lote.id} value={lote.id}>
                    Lote: {lote.numeroLote || lote.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantities Section */}
          <div className="p-3 bg-muted/30 rounded-lg border border-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calculator className="size-3.5 text-primary" />
                <span>Control de Cantidades</span>
              </span>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-muted-foreground">Disponible Calculado:</span>
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
              className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs"
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
