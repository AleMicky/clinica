"use client";

import * as React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Trash2,
  Plus,
  Package,
  Warehouse,
  Undo2,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
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

import {
  devolucionProveedorSchema,
  type DevolucionProveedorFormValues,
} from "../schemas/devolucion-proveedor.schema";
import {
  useCreateDevolucionProveedor,
  useUpdateDevolucionProveedor,
  useDevolucionProveedor,
} from "../hooks/use-devolucion-proveedor";
import type { DevolucionProveedorResponse } from "../types/devolucion-proveedor.types";
import { ProveedorAutocomplete } from "@/modules/compras/proveedor";
import { AlmacenAutocomplete } from "@/modules/almacenes/almacen";
import { ProductoAutocomplete } from "@/modules/almacenes/producto";
import { LoteAutocomplete } from "@/modules/almacenes/lote";

interface DevolucionProveedorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devolucionToEdit?: DevolucionProveedorResponse | null;
  onSuccessCallback?: () => void;
}

export function DevolucionProveedorFormDialog({
  open,
  onOpenChange,
  devolucionToEdit,
  onSuccessCallback,
}: DevolucionProveedorFormDialogProps) {
  const isEditing = Boolean(devolucionToEdit);

  const { data: fullDevolucion } = useDevolucionProveedor(
    devolucionToEdit?.id ?? 0,
    open && isEditing
  );

  const createMutation = useCreateDevolucionProveedor();
  const updateMutation = useUpdateDevolucionProveedor();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DevolucionProveedorFormValues>({
    resolver: zodResolver(devolucionProveedorSchema),
    defaultValues: {
      proveedorId: 0,
      almacenId: 0,
      recepcionCompraId: null,
      fecha: new Date().toISOString().slice(0, 16),
      motivo: "",
      observacion: "",
      detalles: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "detalles",
  });

  const watchedDetalles = watch("detalles") || [];
  const selectedAlmacenId = watch("almacenId");

  const totalCantidad = watchedDetalles.reduce(
    (acc, curr) => acc + (Number(curr.cantidad) || 0),
    0
  );

  React.useEffect(() => {
    if (!open) return;

    if (isEditing) {
      const target = fullDevolucion || devolucionToEdit;
      if (target) {
        reset({
          proveedorId: target.proveedorId,
          almacenId: target.almacenId,
          recepcionCompraId: target.recepcionCompraId ?? null,
          fecha: target.fecha
            ? new Date(target.fecha).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          motivo: target.motivo || "",
          observacion: target.observacion || "",
          detalles: (target.detalles || []).map((d) => ({
            productoId: d.productoId,
            productoNombre: d.productoNombre || "",
            productoCodigo: d.productoCodigo || "",
            loteId: d.loteId ?? null,
            cantidad: Number(d.cantidad),
            motivo: d.motivo || "",
            observacion: d.observacion || "",
          })),
        });
      }
    } else {
      reset({
        proveedorId: 0,
        almacenId: 0,
        recepcionCompraId: null,
        fecha: new Date().toISOString().slice(0, 16),
        motivo: "",
        observacion: "",
        detalles: [
          {
            productoId: 0,
            productoNombre: "",
            productoCodigo: "",
            loteId: null,
            cantidad: 1,
            motivo: "",
            observacion: "",
          },
        ],
      });
    }
  }, [open, isEditing, fullDevolucion, devolucionToEdit, reset]);

  const handleAddDetalle = () => {
    append({
      productoId: 0,
      productoNombre: "",
      productoCodigo: "",
      loteId: null,
      cantidad: 1,
      motivo: "",
      observacion: "",
    });
  };

  const onSubmit = async (values: DevolucionProveedorFormValues) => {
    try {
      const payload = {
        proveedorId: Number(values.proveedorId),
        almacenId: Number(values.almacenId),
        recepcionCompraId: values.recepcionCompraId
          ? Number(values.recepcionCompraId)
          : null,
        fecha: new Date(values.fecha).toISOString(),
        motivo: values.motivo.trim(),
        observacion: values.observacion ? values.observacion.trim() : null,
        detalles: values.detalles.map((d) => ({
          productoId: Number(d.productoId),
          loteId: d.loteId ? Number(d.loteId) : null,
          cantidad: Number(d.cantidad),
          motivo: d.motivo ? d.motivo.trim() : null,
          observacion: d.observacion ? d.observacion.trim() : null,
        })),
      };

      if (isEditing && devolucionToEdit) {
        await updateMutation.mutateAsync({
          id: devolucionToEdit.id,
          data: payload,
        });
        toast.success(
          `Devolución "${devolucionToEdit.numero}" actualizada.`
        );
      } else {
        const res = await createMutation.mutateAsync(payload);
        toast.success(
          `Devolución "${res.numero || "creada"}" registrada en borrador.`
        );
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al guardar la devolución a proveedor.";
      toast.error(errorMsg);
    }
  };

  const isSaving =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[92vh] flex flex-col p-4 sm:p-5 overflow-hidden">
        {/* Header */}
        <DialogHeader className="pb-2.5 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 shadow-2xs">
                <Undo2 className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
                  {isEditing
                    ? `Editar Devolución ${devolucionToEdit?.numero}`
                    : "Nueva Devolución a Proveedor"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                  {isEditing
                    ? "Modifica el borrador de la devolución"
                    : "Registra productos a retornar por defectos, roturas, vencimiento o no conformidad"}
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className="text-[10px] h-5 px-2 font-semibold text-slate-700 dark:text-slate-300 border-slate-500/30 bg-slate-500/10"
            >
              Borrador
            </Badge>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form
          id="devolucion-proveedor-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto pr-1 py-2.5 space-y-3 text-xs"
        >
          {/* Section 1: General Info */}
          <div className="bg-muted/20 border border-border/40 rounded-lg p-2.5 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              {/* Proveedor */}
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="proveedorId" className="text-xs font-medium">
                  Proveedor Destino <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="proveedorId"
                  render={({ field }) => (
                    <ProveedorAutocomplete
                      value={field.value || null}
                      onValueChange={(id) => field.onChange(id || 0)}
                      placeholder="Seleccionar proveedor..."
                      className="h-7.5 text-xs"
                      error={Boolean(errors.proveedorId)}
                    />
                  )}
                />
                {errors.proveedorId && (
                  <span className="text-[10px] text-destructive">
                    {errors.proveedorId.message}
                  </span>
                )}
              </div>

              {/* Almacén */}
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="almacenId" className="text-xs font-medium">
                  Almacén Origen <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="almacenId"
                  render={({ field }) => (
                    <AlmacenAutocomplete
                      value={field.value || null}
                      onValueChange={(id) => field.onChange(id || 0)}
                      placeholder="Seleccionar almacén..."
                      className="h-7.5 text-xs"
                      error={Boolean(errors.almacenId)}
                    />
                  )}
                />
                {errors.almacenId && (
                  <span className="text-[10px] text-destructive">
                    {errors.almacenId.message}
                  </span>
                )}
              </div>

              {/* Fecha */}
              <div className="space-y-1">
                <Label htmlFor="fecha" className="text-xs font-medium">
                  Fecha Emisión <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fecha"
                  type="datetime-local"
                  {...register("fecha")}
                  className="h-7.5 text-xs bg-background/50"
                />
              </div>

              {/* ID Recepcion Compra */}
              <div className="space-y-1">
                <Label htmlFor="recepcionCompraId" className="text-xs font-medium">
                  ID Recepción (Opcional)
                </Label>
                <Input
                  id="recepcionCompraId"
                  type="number"
                  {...register("recepcionCompraId", {
                    setValueAs: (v) => (v === "" ? null : Number(v)),
                  })}
                  placeholder="ID Recepción..."
                  className="h-7.5 text-xs font-mono bg-background/50"
                />
              </div>

              {/* Motivo Principal */}
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="motivo" className="text-xs font-medium">
                  Motivo Principal de Devolución <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="motivo"
                  {...register("motivo")}
                  placeholder="Ej. Producto defectuoso, fecha corta de caducidad, empaque roto..."
                  className="h-7.5 text-xs bg-background/50"
                />
                {errors.motivo && (
                  <span className="text-[10px] text-destructive">
                    {errors.motivo.message}
                  </span>
                )}
              </div>
            </div>

            {/* Observacion */}
            <div className="space-y-1">
              <Label htmlFor="observacion" className="text-xs font-medium">
                Observaciones Adicionales
              </Label>
              <Input
                id="observacion"
                {...register("observacion")}
                placeholder="Detalle de acuerdos con el proveedor o número de nota de crédito acordada..."
                className="h-7.5 text-xs bg-background/50"
              />
            </div>
          </div>

          {/* Section 2: Items Table View */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="size-3.5 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Productos a Retornar
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] h-4.5 px-1.5 font-mono"
                >
                  {fields.length} {fields.length === 1 ? "ítem" : "ítems"}
                </Badge>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddDetalle}
                className="h-6.5 text-xs px-2.5 gap-1 text-orange-600 border-orange-500/30 hover:bg-orange-500/5 cursor-pointer shadow-2xs"
              >
                <Plus className="size-3" />
                <span>Agregar Producto</span>
              </Button>
            </div>

            {errors.detalles?.root && (
              <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-1.5">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{errors.detalles.root.message}</span>
              </div>
            )}

            {/* Compact Table */}
            <div className="rounded-lg border border-border/60 overflow-x-auto bg-card shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold text-[11px]">
                    <th className="px-2.5 py-1.5 w-8 text-center">#</th>
                    <th className="px-2.5 py-1.5 min-w-[200px]">Producto *</th>
                    <th className="px-2.5 py-1.5 w-36">Lote (Opcional)</th>
                    <th className="px-2.5 py-1.5 w-24 text-center">Cantidad *</th>
                    <th className="px-2.5 py-1.5 min-w-[140px]">Causa Específica</th>
                    <th className="px-2.5 py-1.5 min-w-[120px]">Nota</th>
                    <th className="px-2 py-1.5 w-8 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {fields.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-6 text-center text-muted-foreground text-xs"
                      >
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <FileSpreadsheet className="size-5 text-muted-foreground/60" />
                          <span className="font-medium text-xs">
                            No hay productos en esta devolución
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleAddDetalle}
                            className="h-6.5 text-xs px-2 gap-1 text-orange-600 border-orange-500/30 hover:bg-orange-500/5 cursor-pointer"
                          >
                            <Plus className="size-3" />
                            <span>Agregar Primer Producto</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    fields.map((field, idx) => {
                      const currentProdId = watch(`detalles.${idx}.productoId`);

                      return (
                        <tr
                          key={field.id}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-2.5 py-1 text-center text-muted-foreground font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="px-2.5 py-1">
                            <Controller
                              name={`detalles.${idx}.productoId`}
                              control={control}
                              render={({ field: pField }) => (
                                <ProductoAutocomplete
                                  value={pField.value || null}
                                  onValueChange={(val, prod) => {
                                    pField.onChange(val || 0);
                                    if (prod) {
                                      setValue(
                                        `detalles.${idx}.productoNombre`,
                                        prod.nombre
                                      );
                                      setValue(
                                        `detalles.${idx}.productoCodigo`,
                                        prod.codigo
                                      );
                                    }
                                    setValue(`detalles.${idx}.loteId`, null);
                                  }}
                                  placeholder="Buscar producto..."
                                  className="h-7 text-xs"
                                  error={Boolean(
                                    errors.detalles?.[idx]?.productoId
                                  )}
                                />
                              )}
                            />
                          </td>
                          <td className="px-2.5 py-1">
                            <Controller
                              name={`detalles.${idx}.loteId`}
                              control={control}
                              render={({ field: lField }) => (
                                <LoteAutocomplete
                                  productoId={currentProdId}
                                  almacenId={selectedAlmacenId}
                                  value={lField.value}
                                  onValueChange={(val) =>
                                    lField.onChange(val || null)
                                  }
                                  placeholder="Sin lote / Seleccionar..."
                                />
                              )}
                            />
                          </td>
                          <td className="px-2.5 py-1">
                            <Input
                              type="number"
                              step="any"
                              min="0.01"
                              {...register(`detalles.${idx}.cantidad`, {
                                valueAsNumber: true,
                              })}
                              className="h-7 text-xs font-mono text-center"
                            />
                          </td>
                          <td className="px-2.5 py-1">
                            <Input
                              type="text"
                              placeholder="Ej. Frasco quebrado..."
                              {...register(`detalles.${idx}.motivo`)}
                              className="h-7 text-xs"
                            />
                          </td>
                          <td className="px-2.5 py-1">
                            <Input
                              type="text"
                              placeholder="Nota..."
                              {...register(`detalles.${idx}.observacion`)}
                              className="h-7 text-xs"
                            />
                          </td>
                          <td className="px-2 py-1 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(idx)}
                              disabled={fields.length === 1}
                              className="size-6 text-muted-foreground hover:text-destructive cursor-pointer disabled:opacity-30 transition-colors"
                              title="Quitar ítem"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {fields.length > 0 && (
                  <tfoot className="border-t border-border/60 bg-muted/30 font-semibold text-xs">
                    <tr>
                      <td
                        colSpan={3}
                        className="px-2.5 py-1.5 text-right text-muted-foreground"
                      >
                        Total Unidades a Retornar:
                      </td>
                      <td className="px-2.5 py-1.5 text-center font-mono font-bold text-foreground">
                        {totalCantidad.toLocaleString("es-ES", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </form>

        {/* Footer */}
        <DialogFooter className="pt-2.5 border-t border-border/40 shrink-0 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="h-7.5 text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="devolucion-proveedor-form"
            size="sm"
            disabled={isSaving}
            className="h-7.5 text-xs bg-orange-600 hover:bg-orange-700 text-white gap-1.5 font-medium shadow-2xs cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <span>
                {isEditing ? "Actualizar Devolución" : "Guardar Devolución"}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
