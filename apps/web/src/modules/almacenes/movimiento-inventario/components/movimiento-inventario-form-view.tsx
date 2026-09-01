"use client";

import * as React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
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
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface MovimientoInventarioFormViewProps {
  movimientoToEdit?: MovimientoInventarioResponse | null;
  onCancel: () => void;
  onSuccess: () => void;
}

function generateDefaultNumero() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `MOV-${year}${month}-${randomSuffix}`;
}

export function MovimientoInventarioFormView({
  movimientoToEdit,
  onCancel,
  onSuccess,
}: MovimientoInventarioFormViewProps) {
  const isEditing = Boolean(movimientoToEdit);

  // Fetch full detail if editing an existing draft
  const { data: fullMovimiento, isLoading: isLoadingDetail } =
    useMovimientoInventario(movimientoToEdit?.id ?? 0, isEditing);

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

  // Live totals calculation
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

  // Initialize or reset form state
  React.useEffect(() => {
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
  }, [isEditing, fullMovimiento, movimientoToEdit, reset]);

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
      onSuccess();
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

  if (isLoadingDetail) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-3 bg-card border border-border/60 rounded-xl shadow-2xs">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground font-medium">
          Cargando datos del movimiento de inventario...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card rounded-xl p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onCancel}
            className="size-9 rounded-lg border-border/60 text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs"
            title="Volver a la lista"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                {isEditing
                  ? `Editar Movimiento: ${movimientoToEdit?.numero}`
                  : "Nuevo Movimiento de Inventario"}
              </h1>
              <Badge
                variant="outline"
                className="text-[10px] font-semibold text-primary border-primary/30 bg-primary/5"
              >
                {isEditing ? "Modo Edición" : "Nuevo Borrador"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEditing
                ? "Modifica los datos del comprobante y actualiza los detalles de stock."
                : "Registra los datos de cabecera e ingresa las líneas de artículos correspondientes."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSaving}
            className="h-8.5 px-3.5 text-xs cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="movimiento-inventario-form"
            size="sm"
            disabled={isSaving}
            className="h-8.5 px-4 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs cursor-pointer font-medium"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                <span>{isEditing ? "Actualizar Movimiento" : "Guardar Borrador"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <form
        id="movimiento-inventario-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        {/* Section 1: Cabecera */}
        <Card className="shadow-2xs border-0 bg-card overflow-visible">
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Warehouse className="size-4 text-primary" />
                <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                  1. Información Principal del Movimiento
                </CardTitle>
              </div>
              <span className="text-[11px] text-muted-foreground">
                * Campos obligatorios
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2 flex flex-col gap-4 overflow-visible">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Número */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="numero" className="text-xs font-semibold flex items-center gap-1.5">
                  <Hash className="size-3.5 text-muted-foreground" />
                  Número de Comprobante <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="numero"
                  {...register("numero")}
                  placeholder="MOV-2026-0001"
                  className="h-8.5 text-xs font-mono"
                />
                {errors.numero && (
                  <span className="text-[11px] text-destructive">
                    {errors.numero.message}
                  </span>
                )}
              </div>

              {/* Tipo Movimiento */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <ArrowLeftRight className="size-3.5 text-muted-foreground" />
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
                      placeholder="Seleccionar tipo de movimiento..."
                    />
                  )}
                />
                {errors.tipoMovimientoInventarioId && (
                  <span className="text-[11px] text-destructive">
                    {errors.tipoMovimientoInventarioId.message}
                  </span>
                )}
              </div>

              {/* Almacén */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Warehouse className="size-3.5 text-muted-foreground" />
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
                  <span className="text-[11px] text-destructive">
                    {errors.almacenId.message}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fecha Movimiento */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fechaMovimiento" className="text-xs font-semibold flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  Fecha y Hora <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fechaMovimiento"
                  type="datetime-local"
                  {...register("fechaMovimiento")}
                  className="h-8.5 text-xs"
                />
                {errors.fechaMovimiento && (
                  <span className="text-[11px] text-destructive">
                    {errors.fechaMovimiento.message}
                  </span>
                )}
              </div>

              {/* Referencia Tipo */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="referenciaTipo" className="text-xs font-semibold">
                  Tipo de Referencia / Origen
                </Label>
                <Input
                  id="referenciaTipo"
                  {...register("referenciaTipo")}
                  placeholder="Ej. Factura, Orden de Compra, Ajuste"
                  className="h-8.5 text-xs"
                />
              </div>

              {/* Referencia ID */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="referenciaId" className="text-xs font-semibold">
                  N° ID / Código Referencia
                </Label>
                <Input
                  id="referenciaId"
                  type="number"
                  {...register("referenciaId", {
                    setValueAs: (v) => (v === "" ? null : Number(v)),
                  })}
                  placeholder="Ej. 1042"
                  className="h-8.5 text-xs font-mono"
                />
              </div>
            </div>

            {/* Observación */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="observacion" className="text-xs font-semibold">
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
          </CardContent>
        </Card>

        {/* Section 2: Detalle de Productos */}
        <Card className="shadow-2xs border-0 bg-card overflow-visible">
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Package className="size-4 text-primary" />
                <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                  2. Artículos del Movimiento
                </CardTitle>
                <Badge variant="secondary" className="text-[11px] h-5 px-2 font-mono">
                  {fields.length} {fields.length === 1 ? "artículo" : "artículos"}
                </Badge>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddRow}
                className="h-7.5 px-3 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/5 cursor-pointer shadow-2xs"
              >
                <Plus className="size-3.5" />
                <span>Agregar Producto</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2 flex flex-col gap-3 overflow-visible">
            {errors.detalles && typeof errors.detalles.message === "string" && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errors.detalles.message}</span>
              </div>
            )}

            {/* Table Container - limpio sin bordes cortantes y con overflow-visible */}
            <div className="w-full overflow-visible">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-muted-foreground font-semibold">
                    <th className="px-3 py-2 w-10 text-center">#</th>
                    <th className="px-3 py-2 min-w-[260px]">Producto *</th>
                    <th className="px-3 py-2 min-w-[180px] w-56">Lote</th>
                    <th className="px-3 py-2 w-28 min-w-[90px]">Cantidad *</th>
                    <th className="px-3 py-2 w-32 min-w-[100px]">Costo Unit.</th>
                    <th className="px-3 py-2 w-28 text-right">Subtotal</th>
                    <th className="px-2 py-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                    {fields.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-3 py-12 text-center text-muted-foreground text-xs"
                        >
                          <div className="flex flex-col items-center justify-center gap-2.5">
                            <FileSpreadsheet className="size-8 text-muted-foreground/50" />
                            <span className="font-medium text-sm">No hay productos agregados al movimiento</span>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={handleAddRow}
                              className="h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/5 cursor-pointer mt-1"
                            >
                              <Plus className="size-3.5" />
                              <span>Agregar Primer Producto</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      fields.map((field, idx) => {
                        const currentProductId = Number(watch(`detalles.${idx}.productoId`)) || 0;
                        const currentQty = Number(watch(`detalles.${idx}.cantidad`)) || 0;
                        const currentCost = Number(watch(`detalles.${idx}.costoUnitario`)) || 0;
                        const subtotal = currentQty * currentCost;

                        return (
                          <tr key={field.id} className="hover:bg-muted/20 transition-colors rounded-lg">
                            <td className="px-3 py-2 text-center text-muted-foreground font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="px-3 py-2">
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
                                        setValue(`detalles.${idx}.productoNombre`, "");
                                      }
                                      // Reset lote when product changes
                                      setValue(`detalles.${idx}.loteId`, null);
                                    }}
                                    placeholder="Buscar por código o nombre de producto..."
                                  />
                                )}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Controller
                                name={`detalles.${idx}.loteId`}
                                control={control}
                                render={({ field: lField }) => (
                                  <LoteAutocomplete
                                    productoId={currentProductId}
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
                                    placeholder="Seleccionar lote..."
                                  />
                                )}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                step="any"
                                min="0.01"
                                {...register(`detalles.${idx}.cantidad`, {
                                  valueAsNumber: true,
                                })}
                                className="h-7.5 text-xs font-mono"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                step="any"
                                min="0"
                                {...register(`detalles.${idx}.costoUnitario`, {
                                  setValueAs: (v) => (v === "" ? 0 : Number(v)),
                                })}
                                placeholder="0.00"
                                className="h-7.5 text-xs font-mono"
                              />
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-foreground whitespace-nowrap">
                              Bs. {subtotal.toLocaleString("es-ES", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-2 py-2 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(idx)}
                                disabled={fields.length === 1}
                                className="size-7 text-muted-foreground hover:text-destructive cursor-pointer disabled:opacity-30 transition-colors"
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

            {/* Total Calculation Footer */}
            <div className="flex flex-wrap items-center justify-between p-4 rounded-xl bg-muted/30 text-xs shadow-2xs">
              <div className="flex items-center gap-5 text-muted-foreground">
                <span>
                  Total Líneas:{" "}
                  <strong className="text-foreground">{totalItemsCount}</strong>
                </span>
                <span>
                  Cantidad Total:{" "}
                  <strong className="text-foreground font-mono">
                    {totalCantidad.toLocaleString("es-ES")}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">
                  Costo Total Estimado:
                </span>
                <span className="text-base font-bold font-mono text-primary">
                  Bs. {totalCosto.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
