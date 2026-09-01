"use client";

import * as React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Utensils,
  Plus,
  Trash2,
  Package,
  Warehouse,
  Calendar,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
  Building2,
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
  consumoInternoSchema,
  type ConsumoInternoFormValues,
} from "../schemas/consumo-interno.schema";
import {
  useCreateConsumoInterno,
  useUpdateConsumoInterno,
  useConsumoInterno,
} from "../hooks/use-consumo-interno";
import type { ConsumoInternoResponse } from "../types/consumo-interno.types";
import { AlmacenAutocomplete } from "../../almacen";
import { ProductoAutocomplete } from "../../producto";
import { AreaTreeSelect } from "@/modules/recursos-humanos/area/components/area-tree-select";

interface ConsumoInternoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consumoToEdit?: ConsumoInternoResponse | null;
  onSuccessCallback?: () => void;
}

function generateDefaultNumero() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CON-${year}${month}-${randomSuffix}`;
}

export function ConsumoInternoFormDialog({
  open,
  onOpenChange,
  consumoToEdit,
  onSuccessCallback,
}: ConsumoInternoFormDialogProps) {
  const isEditing = Boolean(consumoToEdit);

  const { data: fullConsumo } = useConsumoInterno(
    consumoToEdit?.id ?? 0,
    open && isEditing
  );

  const createMutation = useCreateConsumoInterno();
  const updateMutation = useUpdateConsumoInterno();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ConsumoInternoFormValues>({
    resolver: zodResolver(consumoInternoSchema),
    defaultValues: {
      numero: "",
      almacenId: 0,
      areaId: 0,
      fecha: new Date().toISOString().slice(0, 16),
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

  const totalCantidad = watchedDetalles.reduce(
    (acc, curr) => acc + (Number(curr.cantidad) || 0),
    0
  );

  React.useEffect(() => {
    if (!open) return;

    if (isEditing) {
      const target = fullConsumo || consumoToEdit;
      if (target) {
        const formattedDate = target.fecha
          ? new Date(target.fecha).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16);

        reset({
          numero: target.numero,
          almacenId: target.almacenId,
          areaId: target.areaId,
          fecha: formattedDate,
          referenciaTipo: target.referenciaTipo || "",
          referenciaId: target.referenciaId || null,
          observacion: target.observacion || "",
          detalles: (target.detalles || []).map((d) => ({
            productoId: d.productoId,
            productoNombre: d.productoNombre || "",
            loteId: d.loteId || null,
            cantidad: Number(d.cantidad),
          })),
        });
      }
    } else {
      reset({
        numero: generateDefaultNumero(),
        almacenId: 0,
        areaId: 0,
        fecha: new Date().toISOString().slice(0, 16),
        referenciaTipo: "",
        referenciaId: null,
        observacion: "",
        detalles: [
          {
            productoId: 0,
            productoNombre: "",
            loteId: null,
            cantidad: 1,
          },
        ],
      });
    }
  }, [open, isEditing, fullConsumo, consumoToEdit, reset]);

  const handleAddRow = () => {
    append({
      productoId: 0,
      productoNombre: "",
      loteId: null,
      cantidad: 1,
    });
  };

  const onSubmit = async (values: ConsumoInternoFormValues) => {
    if (values.detalles.length === 0) {
      toast.error("Debe agregar al menos un producto al vale de consumo.");
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
      almacenId: Number(values.almacenId),
      areaId: Number(values.areaId),
      fecha: new Date(values.fecha).toISOString(),
      referenciaTipo: values.referenciaTipo?.trim() || null,
      referenciaId: values.referenciaId ? Number(values.referenciaId) : null,
      observacion: values.observacion?.trim() || null,
      detalles: values.detalles.map((d) => ({
        productoId: Number(d.productoId),
        loteId: d.loteId ? Number(d.loteId) : null,
        cantidad: Number(d.cantidad),
      })),
    };

    try {
      if (isEditing && consumoToEdit) {
        await updateMutation.mutateAsync({
          id: consumoToEdit.id,
          data: payload,
        });
        toast.success(`Vale de consumo "${payload.numero}" actualizado.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Vale de consumo "${payload.numero}" guardado como borrador.`);
      }
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al procesar el vale de consumo interno.";
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
              <div className="size-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-2xs">
                <Utensils className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {isEditing
                    ? `Editar Vale de Consumo: ${consumoToEdit?.numero}`
                    : "Nuevo Vale de Consumo Interno"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {isEditing
                    ? "Modifica los datos del borrador de consumo"
                    : "Registra el despacho de materiales e insumos a un área o servicio"}
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
          id="consumo-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto py-4 space-y-4 pr-1"
        >
          {/* Section 1: General Info */}
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 flex flex-col gap-3.5 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Número */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="numero" className="text-xs font-medium">
                  N° Vale <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="numero"
                  {...register("numero")}
                  placeholder="CON-2026-0001"
                  className="h-8 text-xs font-mono font-semibold"
                />
                {errors.numero && (
                  <span className="text-[10px] text-destructive">
                    {errors.numero.message}
                  </span>
                )}
              </div>

              {/* Almacén Emisor */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <Warehouse className="size-3 text-muted-foreground" />
                  Almacén Emisor <span className="text-destructive">*</span>
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

              {/* Área Solicitante */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <Building2 className="size-3 text-muted-foreground" />
                  Área Solicitante <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="areaId"
                  control={control}
                  render={({ field }) => (
                    <AreaTreeSelect
                      value={field.value || null}
                      onValueChange={(val) => field.onChange(val || 0)}
                      error={Boolean(errors.areaId)}
                      placeholder="Seleccionar área clínica..."
                    />
                  )}
                />
                {errors.areaId && (
                  <span className="text-[10px] text-destructive">
                    {errors.areaId.message}
                  </span>
                )}
              </div>

              {/* Fecha */}
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="fecha"
                  className="text-xs font-medium flex items-center gap-1"
                >
                  <Calendar className="size-3 text-muted-foreground" />
                  Fecha <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fecha"
                  type="datetime-local"
                  {...register("fecha")}
                  className="h-8 text-xs"
                />
                {errors.fecha && (
                  <span className="text-[10px] text-destructive">
                    {errors.fecha.message}
                  </span>
                )}
              </div>
            </div>

            {/* Referencia Tipo y ID (opcional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="referenciaTipo" className="text-xs font-medium">
                  Tipo de Referencia (Opcional)
                </Label>
                <Input
                  id="referenciaTipo"
                  {...register("referenciaTipo")}
                  placeholder="Ej. QUIROFANO, ADMISION, CONSULTA..."
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="referenciaId" className="text-xs font-medium">
                  ID de Referencia (Opcional)
                </Label>
                <Input
                  id="referenciaId"
                  type="number"
                  {...register("referenciaId", { valueAsNumber: true })}
                  placeholder="Ej. 124"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            {/* Observación */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="observacion" className="text-xs font-medium">
                Observaciones / Justificación
              </Label>
              <Textarea
                id="observacion"
                {...register("observacion")}
                placeholder="Insumos para procedimientos del turno tarde..."
                rows={2}
                className="text-xs resize-none"
              />
            </div>
          </div>

          {/* Section 2: Items Table */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  2. Artículos a Despachar
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 px-1.5 font-mono"
                >
                  {fields.length} {fields.length === 1 ? "artículo" : "artículos"}
                </Badge>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddRow}
                className="h-7 text-xs gap-1.5 text-teal-600 border-teal-500/30 hover:bg-teal-500/5 cursor-pointer shadow-2xs"
              >
                <Plus className="size-3" />
                <span>Agregar Producto</span>
              </Button>
            </div>

            {errors.detalles && typeof errors.detalles.message === "string" && (
              <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errors.detalles.message}</span>
              </div>
            )}

            {/* Table */}
            <div className="rounded-xl border border-border/60 overflow-x-auto bg-card shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold">
                    <th className="px-3 py-2 w-10 text-center">#</th>
                    <th className="px-3 py-2 min-w-72">Producto *</th>
                    <th className="px-3 py-2 w-36">Cantidad Despachada *</th>
                    <th className="px-3 py-2 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {fields.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-8 text-center text-muted-foreground text-xs"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileSpreadsheet className="size-6 text-muted-foreground/60" />
                          <span className="font-medium">
                            No hay productos agregados al vale
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleAddRow}
                            className="h-7 text-xs gap-1 text-teal-600 border-teal-500/30 hover:bg-teal-500/5"
                          >
                            <Plus className="size-3" />
                            <span>Agregar Primer Producto</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    fields.map((field, idx) => (
                      <tr
                        key={field.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
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
                                  }
                                }}
                                placeholder="Buscar por código o nombre..."
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
                            className="h-8 text-xs font-mono"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end p-2.5 rounded-lg bg-muted/40 border border-border/40 text-xs gap-4 font-mono">
              <div>
                <span className="text-muted-foreground">Total Insumos a Despachar: </span>
                <span className="font-bold text-teal-600 dark:text-teal-400">
                  {totalCantidad.toLocaleString("es-ES")}
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
            form="consumo-form"
            size="sm"
            disabled={isSaving}
            className="h-8 px-4 text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium gap-1.5 cursor-pointer shadow-2xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <span>{isEditing ? "Actualizar Vale" : "Guardar Borrador"}</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
