"use client";

import * as React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeftRight,
  Plus,
  Trash2,
  Package,
  Warehouse,
  Calendar,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
  Hash,
  Layers,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import {
  movimientoInventarioSchema,
  type MovimientoInventarioFormValues,
} from "../schemas/movimiento-inventario.schema";
import {
  useCreateMovimientoInventario,
  useUpdateMovimientoInventario,
  useMovimientoInventario,
} from "../hooks/use-movimiento-inventario";
import type { MovimientoInventarioResponse } from "../types/movimiento-inventario.types";
import { AlmacenAutocomplete } from "../../almacen";
import { TipoMovimientoInventarioAutocomplete } from "../../tipo-movimiento-inventario";
import { ProductoAutocomplete } from "../../producto";
import { LoteAutocomplete } from "../../lote";

interface MovimientoInventarioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimientoToEdit?: MovimientoInventarioResponse | null;
  onSuccessCallback?: () => void;
}

function generateDefaultNumero() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `MOV-${year}${month}-${randomSuffix}`;
}

export function MovimientoInventarioFormDialog({
  open,
  onOpenChange,
  movimientoToEdit,
  onSuccessCallback,
}: MovimientoInventarioFormDialogProps) {
  const isEditing = Boolean(movimientoToEdit);

  const { data: fullMovimiento } = useMovimientoInventario(
    movimientoToEdit?.id ?? 0,
    open && isEditing
  );

  const createMutation = useCreateMovimientoInventario();
  const updateMutation = useUpdateMovimientoInventario();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MovimientoInventarioFormValues>({
    resolver: zodResolver(movimientoInventarioSchema),
    defaultValues: {
      numero: "",
      tipoMovimientoInventarioId: 0,
      almacenId: 0,
      fechaMovimiento: new Date().toISOString().slice(0, 16),
      referenciaTipo: "",
      referenciaId: null,
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

  // Summary calculations
  const totalItemsCount = watchedDetalles.length;
  const totalCantidad = watchedDetalles.reduce(
    (acc, curr) => acc + (Number(curr.cantidad) || 0),
    0
  );
  const totalCosto = watchedDetalles.reduce((acc, curr) => {
    const qty = Number(curr.cantidad) || 0;
    const cost = Number(curr.costoUnitario) || 0;
    return acc + qty * cost;
  }, 0);

  React.useEffect(() => {
    if (!open) return;

    if (isEditing) {
      const target = fullMovimiento || movimientoToEdit;
      if (target) {
        const formattedDate = target.fechaMovimiento
          ? new Date(target.fechaMovimiento).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16);

        reset({
          numero: target.numero,
          tipoMovimientoInventarioId: target.tipoMovimientoInventarioId,
          almacenId: target.almacenId,
          fechaMovimiento: formattedDate,
          referenciaTipo: target.referenciaTipo || "",
          referenciaId: target.referenciaId || null,
          observacion: target.observacion || "",
          detalles: (target.detalles || []).map((d) => ({
            productoId: d.productoId,
            productoNombre: d.productoNombre || "",
            loteId: d.loteId || null,
            cantidad: Number(d.cantidad),
            costoUnitario:
              d.costoUnitario !== null && d.costoUnitario !== undefined
                ? Number(d.costoUnitario)
                : null,
          })),
        });
      }
    } else {
      reset({
        numero: generateDefaultNumero(),
        tipoMovimientoInventarioId: 0,
        almacenId: 0,
        fechaMovimiento: new Date().toISOString().slice(0, 16),
        referenciaTipo: "",
        referenciaId: null,
        observacion: "",
        detalles: [
          {
            productoId: 0,
            productoNombre: "",
            loteId: null,
            cantidad: 1,
            costoUnitario: 0,
          },
        ],
      });
    }
  }, [open, isEditing, fullMovimiento, movimientoToEdit, reset]);

  const handleAddRow = () => {
    append({
      productoId: 0,
      productoNombre: "",
      loteId: null,
      cantidad: 1,
      costoUnitario: 0,
    });
  };

  const onSubmit = async (values: MovimientoInventarioFormValues) => {
    if (values.detalles.length === 0) {
      toast.error("Debe agregar al menos un producto al movimiento.");
      return;
    }

    const hasInvalidProducts = values.detalles.some(
      (d) => !d.productoId || d.productoId <= 0
    );
    if (hasInvalidProducts) {
      toast.error("Por favor seleccione un producto válido en cada fila.");
      return;
    }

    const payload = {
      numero: values.numero.trim(),
      tipoMovimientoInventarioId: Number(values.tipoMovimientoInventarioId),
      almacenId: Number(values.almacenId),
      fechaMovimiento: new Date(values.fechaMovimiento).toISOString(),
      referenciaTipo: values.referenciaTipo?.trim() || null,
      referenciaId: values.referenciaId ? Number(values.referenciaId) : null,
      observacion: values.observacion?.trim() || null,
      detalles: values.detalles.map((d) => ({
        productoId: Number(d.productoId),
        loteId: d.loteId ? Number(d.loteId) : null,
        cantidad: Number(d.cantidad),
        costoUnitario:
          d.costoUnitario !== null && d.costoUnitario !== undefined
            ? Number(d.costoUnitario)
            : null,
      })),
    };

    try {
      if (isEditing && movimientoToEdit) {
        await updateMutation.mutateAsync({
          id: movimientoToEdit.id,
          data: payload,
        });
        toast.success(`Movimiento "${payload.numero}" actualizado correctamente.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Movimiento "${payload.numero}" guardado como borrador.`);
      }
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al procesar el movimiento de inventario.";
      toast.error(errorMsg);
    }
  };

  const isSaving =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-6 overflow-hidden">
        {/* Modal Header */}
        <DialogHeader className="pb-3 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs">
                <ArrowLeftRight className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {isEditing
                    ? `Editar Movimiento: ${movimientoToEdit?.numero}`
                    : "Nuevo Movimiento de Inventario"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {isEditing
                    ? "Modifica los datos del comprobante y actualiza los detalles de stock."
                    : "Registra los datos de cabecera e ingresa las líneas de artículos correspondientes."}
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className="text-[11px] h-6 px-2.5 font-semibold text-blue-600 border-blue-500/30 bg-blue-500/10"
            >
              Borrador
            </Badge>
          </div>
        </DialogHeader>

        {/* Scrollable Form Content */}
        <form
          id="movimiento-inventario-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto py-4 space-y-4 pr-1"
        >
          {/* Section 1: General Info */}
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 flex flex-col gap-3.5 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Número de Comprobante */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="numero" className="text-xs font-medium flex items-center gap-1">
                  <Hash className="size-3 text-muted-foreground" />
                  N° Comprobante <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="numero"
                  {...register("numero")}
                  placeholder="MOV-2026-0001"
                  className="h-8 text-xs font-mono"
                />
                {errors.numero && (
                  <span className="text-[10px] text-destructive">
                    {errors.numero.message}
                  </span>
                )}
              </div>

              {/* Tipo de Movimiento */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <Layers className="size-3 text-muted-foreground" />
                  Tipo de Movimiento <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="tipoMovimientoInventarioId"
                  control={control}
                  render={({ field }) => (
                    <TipoMovimientoInventarioAutocomplete
                      value={field.value}
                      onValueChange={(val) => field.onChange(val || 0)}
                      error={Boolean(errors.tipoMovimientoInventarioId)}
                      placeholder="Seleccionar tipo..."
                    />
                  )}
                />
                {errors.tipoMovimientoInventarioId && (
                  <span className="text-[10px] text-destructive">
                    {errors.tipoMovimientoInventarioId.message}
                  </span>
                )}
              </div>

              {/* Almacén */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <Warehouse className="size-3 text-muted-foreground" />
                  Almacén <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="almacenId"
                  control={control}
                  render={({ field }) => (
                    <AlmacenAutocomplete
                      value={field.value}
                      onValueChange={(val) => field.onChange(val || 0)}
                      error={Boolean(errors.almacenId)}
                      placeholder="Seleccionar almacén..."
                    />
                  )}
                />
                {errors.almacenId && (
                  <span className="text-[10px] text-destructive">
                    {errors.almacenId.message}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Fecha y Hora */}
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="fechaMovimiento"
                  className="text-xs font-medium flex items-center gap-1"
                >
                  <Calendar className="size-3 text-muted-foreground" />
                  Fecha y Hora <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fechaMovimiento"
                  type="datetime-local"
                  {...register("fechaMovimiento")}
                  className="h-8 text-xs"
                />
                {errors.fechaMovimiento && (
                  <span className="text-[10px] text-destructive">
                    {errors.fechaMovimiento.message}
                  </span>
                )}
              </div>

              {/* Tipo de Referencia */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="referenciaTipo" className="text-xs font-medium">
                  Tipo Referencia / Origen
                </Label>
                <Input
                  id="referenciaTipo"
                  {...register("referenciaTipo")}
                  placeholder="Ej. Factura, Orden de Compra"
                  className="h-8 text-xs"
                />
              </div>

              {/* ID de Referencia */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="referenciaId" className="text-xs font-medium">
                  N° ID / Código Referencia
                </Label>
                <Input
                  id="referenciaId"
                  type="number"
                  {...register("referenciaId", {
                    setValueAs: (v) => (v === "" ? null : Number(v)),
                  })}
                  placeholder="Ej. 1042"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            {/* Observaciones */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="observacion" className="text-xs font-medium">
                Observaciones o Justificación
              </Label>
              <Textarea
                id="observacion"
                {...register("observacion")}
                placeholder="Ingresa detalles complementarios, justificación técnica o notas relevantes..."
                rows={2}
                className="text-xs resize-none"
              />
            </div>
          </div>

          {/* Section 2: Items Table */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="size-3.5 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  2. Artículos del Movimiento
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] h-4.5 px-1.5 font-mono"
                >
                  {fields.length} {fields.length === 1 ? "artículo" : "artículos"}
                </Badge>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddRow}
                className="h-6.5 text-xs px-2.5 gap-1 text-primary border-primary/30 hover:bg-primary/5 cursor-pointer shadow-2xs"
              >
                <Plus className="size-3" />
                <span>Agregar Producto</span>
              </Button>
            </div>

            {errors.detalles && typeof errors.detalles.message === "string" && (
              <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-1.5">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{errors.detalles.message}</span>
              </div>
            )}

            {/* Table */}
            <div className="rounded-lg border border-border/60 overflow-x-auto bg-card shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold text-[11px]">
                    <th className="px-2.5 py-1.5 w-8 text-center">#</th>
                    <th className="px-2.5 py-1.5 min-w-56">Producto *</th>
                    <th className="px-2.5 py-1.5 w-36">Lote (Opcional)</th>
                    <th className="px-2.5 py-1.5 w-24 text-center">Cantidad *</th>
                    <th className="px-2.5 py-1.5 w-28 text-center">Costo Unit.</th>
                    <th className="px-2.5 py-1.5 w-28 text-right">Subtotal</th>
                    <th className="px-2 py-1.5 w-9 text-center"></th>
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
                            No hay productos agregados al movimiento
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleAddRow}
                            className="h-6.5 text-xs px-2 gap-1 text-primary border-primary/30 hover:bg-primary/5"
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
                      const qty = Number(watch(`detalles.${idx}.cantidad`)) || 0;
                      const cost = Number(watch(`detalles.${idx}.costoUnitario`)) || 0;
                      const subtotal = qty * cost;

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
                                  value={pField.value}
                                  onValueChange={(val, prod) => {
                                    pField.onChange(val || 0);
                                    if (prod) {
                                      setValue(
                                        `detalles.${idx}.productoNombre`,
                                        prod.nombre
                                      );
                                    } else {
                                      setValue(
                                        `detalles.${idx}.productoNombre`,
                                        ""
                                      );
                                    }
                                    setValue(`detalles.${idx}.loteId`, null);
                                  }}
                                  placeholder="Buscar por código o nombre..."
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
                                  onValueChange={(val, lote) => {
                                    lField.onChange(val || null);
                                    if (
                                      lote?.costoUnitario !== null &&
                                      lote?.costoUnitario !== undefined &&
                                      Number(lote.costoUnitario) > 0
                                    ) {
                                      setValue(
                                        `detalles.${idx}.costoUnitario`,
                                        Number(lote.costoUnitario)
                                      );
                                    }
                                  }}
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
                              type="number"
                              step="any"
                              min="0"
                              {...register(`detalles.${idx}.costoUnitario`, {
                                setValueAs: (v) => (v === "" ? 0 : Number(v)),
                              })}
                              placeholder="0.00"
                              className="h-7 text-xs font-mono text-center"
                            />
                          </td>
                          <td className="px-2.5 py-1 text-right font-mono font-semibold text-foreground text-xs whitespace-nowrap">
                            Bs. {subtotal.toLocaleString("es-ES", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-2 py-1 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(idx)}
                              disabled={fields.length === 1}
                              className="size-6 text-muted-foreground hover:text-destructive cursor-pointer disabled:opacity-30 transition-colors"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="flex flex-wrap items-center justify-between py-1.5 px-3 rounded-lg bg-muted/40 border border-border/40 text-xs font-mono gap-3">
              <div className="flex items-center gap-4 text-muted-foreground text-[11px]">
                <span>
                  Líneas: <strong className="text-foreground font-sans">{totalItemsCount}</strong>
                </span>
                <span>
                  Unidades:{" "}
                  <strong className="text-primary font-bold">
                    {totalCantidad.toLocaleString("es-ES")}
                  </strong>
                </span>
              </div>
              <div>
                <span className="text-muted-foreground text-[11px]">Costo Estimado: </span>
                <span className="font-bold text-primary text-xs">
                  Bs. {totalCosto.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <DialogFooter className="pt-3 border-t border-border/40 shrink-0 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="h-8 px-3 text-xs cursor-pointer"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            form="movimiento-inventario-form"
            size="sm"
            disabled={isSaving}
            className="h-8 px-4 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-1.5 cursor-pointer shadow-2xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <span>{isEditing ? "Actualizar Movimiento" : "Guardar Borrador"}</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
