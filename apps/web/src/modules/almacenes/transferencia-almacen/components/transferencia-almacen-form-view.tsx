"use client";

import * as React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  GitCompareArrows,
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
  Layers,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  transferenciaAlmacenSchema,
  type TransferenciaAlmacenFormValues,
} from "../schemas/transferencia-almacen.schema";
import {
  useCreateTransferenciaAlmacen,
  useUpdateTransferenciaAlmacen,
  useTransferenciaAlmacen,
} from "../hooks/use-transferencia-almacen";
import type { TransferenciaAlmacenResponse } from "../types/transferencia-almacen.types";
import { AlmacenAutocomplete } from "../../almacen";
import { ProductoAutocomplete } from "../../producto";
import { LoteAutocomplete } from "../../lote";

interface TransferenciaAlmacenFormViewProps {
  transferenciaToEdit?: TransferenciaAlmacenResponse | null;
  onCancel: () => void;
  onSuccess: () => void;
}

function generateDefaultNumero() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `TRA-${year}${month}-${randomSuffix}`;
}

export function TransferenciaAlmacenFormView({
  transferenciaToEdit,
  onCancel,
  onSuccess,
}: TransferenciaAlmacenFormViewProps) {
  const isEditing = Boolean(transferenciaToEdit);

  // Fetch full detail if editing an existing draft
  const { data: fullTransferencia, isLoading: isLoadingDetail } =
    useTransferenciaAlmacen(transferenciaToEdit?.id ?? 0, isEditing);

  const createMutation = useCreateTransferenciaAlmacen();
  const updateMutation = useUpdateTransferenciaAlmacen();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransferenciaAlmacenFormValues>({
    resolver: zodResolver(transferenciaAlmacenSchema),
    defaultValues: {
      numero: "",
      almacenOrigenId: 0,
      almacenDestinoId: 0,
      fechaSolicitud: new Date().toISOString().slice(0, 16),
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
    (acc, curr) => acc + (Number(curr.cantidadSolicitada) || 0),
    0
  );

  // Initialize or reset form state
  React.useEffect(() => {
    if (isEditing) {
      const target = fullTransferencia || transferenciaToEdit;
      if (target) {
        const formattedDate = target.fechaSolicitud
          ? new Date(target.fechaSolicitud).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16);

        reset({
          numero: target.numero,
          almacenOrigenId: target.almacenOrigenId,
          almacenDestinoId: target.almacenDestinoId,
          fechaSolicitud: formattedDate,
          observacion: target.observacion || "",
          detalles: (target.detalles || []).map((d) => ({
            productoId: d.productoId,
            productoNombre: d.productoNombre || "",
            loteId: d.loteId || null,
            cantidadSolicitada: Number(d.cantidadSolicitada),
          })),
        });
      }
    } else {
      reset({
        numero: generateDefaultNumero(),
        almacenOrigenId: 0,
        almacenDestinoId: 0,
        fechaSolicitud: new Date().toISOString().slice(0, 16),
        observacion: "",
        detalles: [
          {
            productoId: 0,
            productoNombre: "",
            loteId: null,
            cantidadSolicitada: 1,
          },
        ],
      });
    }
  }, [isEditing, fullTransferencia, transferenciaToEdit, reset]);

  const handleAddRow = () => {
    append({
      productoId: 0,
      productoNombre: "",
      loteId: null,
      cantidadSolicitada: 1,
    });
  };

  const onSubmit = async (values: TransferenciaAlmacenFormValues) => {
    if (values.detalles.length === 0) {
      toast.error("Debe agregar al menos un producto a la transferencia.");
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
      almacenOrigenId: Number(values.almacenOrigenId),
      almacenDestinoId: Number(values.almacenDestinoId),
      fechaSolicitud: new Date(values.fechaSolicitud).toISOString(),
      observacion: values.observacion?.trim() || null,
      detalles: values.detalles.map((d) => ({
        productoId: Number(d.productoId),
        loteId: d.loteId ? Number(d.loteId) : null,
        cantidadSolicitada: Number(d.cantidadSolicitada),
      })),
    };

    try {
      if (isEditing && transferenciaToEdit) {
        await updateMutation.mutateAsync({
          id: transferenciaToEdit.id,
          data: payload,
        });
        toast.success(`Transferencia "${payload.numero}" actualizada correctamente.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Transferencia "${payload.numero}" guardada como borrador.`);
      }
      onSuccess();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al procesar la transferencia.";
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
          Cargando datos de la transferencia entre almacenes...
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
                  ? `Editar Transferencia: ${transferenciaToEdit?.numero}`
                  : "Nueva Transferencia entre Almacenes"}
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
                ? "Modifica los datos del comprobante y actualiza los artículos a traspasar."
                : "Registra la solicitud de traslado entre almacenes e ingresa las cantidades requeridas."}
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
            form="transferencia-almacen-form"
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
                <span>{isEditing ? "Actualizar Transferencia" : "Guardar Borrador"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary KPI Mini-cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-card flex items-center justify-between shadow-2xs">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Líneas / Ítems
            </span>
            <span className="text-base font-bold font-mono text-foreground">
              {totalItemsCount}
            </span>
          </div>
          <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Layers className="size-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-card flex items-center justify-between shadow-2xs">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Total Solicitado
            </span>
            <span className="text-base font-bold font-mono text-foreground">
              {totalCantidad.toLocaleString("es-ES")}
            </span>
          </div>
          <div className="size-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Package className="size-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-card flex items-center justify-between shadow-2xs">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Tipo Traspaso
            </span>
            <span className="text-xs font-semibold text-foreground truncate">
              Inter-Almacén
            </span>
          </div>
          <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <GitCompareArrows className="size-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-card flex items-center justify-between shadow-2xs">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Estado Inicial
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Borrador
            </span>
          </div>
          <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Warehouse className="size-4" />
          </div>
        </div>
      </div>

      <form
        id="transferencia-almacen-form"
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
                  1. Información Principal de la Transferencia
                </CardTitle>
              </div>
              <span className="text-[11px] text-muted-foreground">
                * Campos obligatorios
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2 flex flex-col gap-4 overflow-visible">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Número */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="numero" className="text-xs font-semibold flex items-center gap-1.5">
                  <Hash className="size-3.5 text-muted-foreground" />
                  Número de Comprobante <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="numero"
                  {...register("numero")}
                  placeholder="TRA-2026-0001"
                  className="h-8.5 text-xs font-mono"
                />
                {errors.numero && (
                  <span className="text-[11px] text-destructive">
                    {errors.numero.message}
                  </span>
                )}
              </div>

              {/* Fecha Solicitud */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fechaSolicitud" className="text-xs font-semibold flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  Fecha y Hora de Solicitud <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fechaSolicitud"
                  type="datetime-local"
                  {...register("fechaSolicitud")}
                  className="h-8.5 text-xs"
                />
                {errors.fechaSolicitud && (
                  <span className="text-[11px] text-destructive">
                    {errors.fechaSolicitud.message}
                  </span>
                )}
              </div>
            </div>

            {/* Almacén Origen y Destino */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Warehouse className="size-3.5 text-muted-foreground" />
                  Almacén Origen (Emisor) <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="almacenOrigenId"
                  control={control}
                  render={({ field }) => (
                    <AlmacenAutocomplete
                      value={field.value}
                      onValueChange={(val) => field.onChange(val || 0)}
                      error={Boolean(errors.almacenOrigenId)}
                      placeholder="Seleccionar almacén emisor..."
                    />
                  )}
                />
                {errors.almacenOrigenId && (
                  <span className="text-[11px] text-destructive">
                    {errors.almacenOrigenId.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Warehouse className="size-3.5 text-primary" />
                  Almacén Destino (Receptor) <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="almacenDestinoId"
                  control={control}
                  render={({ field }) => (
                    <AlmacenAutocomplete
                      value={field.value}
                      onValueChange={(val) => field.onChange(val || 0)}
                      error={Boolean(errors.almacenDestinoId)}
                      placeholder="Seleccionar almacén receptor..."
                    />
                  )}
                />
                {errors.almacenDestinoId && (
                  <span className="text-[11px] text-destructive">
                    {errors.almacenDestinoId.message}
                  </span>
                )}
              </div>
            </div>

            {/* Observación */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="observacion" className="text-xs font-semibold">
                Observaciones o Justificación del Traspaso
              </Label>
              <Textarea
                id="observacion"
                {...register("observacion")}
                placeholder="Motivo del traslado, área de destino, nivel de urgencia o instrucciones..."
                rows={2}
                className="text-xs resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Items Table */}
        <Card className="shadow-2xs border-0 bg-card overflow-visible">
          <CardHeader className="p-4 pb-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-primary" />
                <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                  2. Detalle de Productos a Transferir
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-mono px-1.5 py-0"
                >
                  {fields.length} {fields.length === 1 ? "artículo" : "artículos"}
                </Badge>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddRow}
                className="h-8 px-3 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/5 cursor-pointer shadow-2xs self-start sm:self-auto"
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
                    <th className="px-3 py-2 min-w-[280px]">Producto *</th>
                    <th className="px-3 py-2 min-w-[180px] w-64">Lote (Opcional)</th>
                    <th className="px-3 py-2 w-36 min-w-[110px]">Cant. Solicitada *</th>
                    <th className="px-2 py-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-12 text-center text-muted-foreground text-xs"
                      >
                        <div className="flex flex-col items-center justify-center gap-2.5">
                          <FileSpreadsheet className="size-8 text-muted-foreground/50" />
                          <span className="font-medium text-sm">
                            No hay productos agregados a la transferencia
                          </span>
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
                      const currentProductId =
                        Number(watch(`detalles.${idx}.productoId`)) || 0;

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
                                  onValueChange={(val) => {
                                    lField.onChange(val || null);
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
                              {...register(`detalles.${idx}.cantidadSolicitada`, {
                                valueAsNumber: true,
                              })}
                              className="h-7.5 text-xs font-mono"
                            />
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
                  Cantidad Total Solicitada:{" "}
                  <strong className="text-foreground font-mono">
                    {totalCantidad.toLocaleString("es-ES")}
                  </strong>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
