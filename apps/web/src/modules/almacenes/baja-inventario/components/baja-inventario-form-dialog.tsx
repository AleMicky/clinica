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
  Calendar,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
  CalendarX,
  AlertTriangle,
  Flame,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  bajaInventarioSchema,
  type BajaInventarioFormValues,
} from "../schemas/baja-inventario.schema";
import {
  useCreateBajaInventario,
  useUpdateBajaInventario,
  useBajaInventario,
} from "../hooks/use-baja-inventario";
import {
  TipoBajaInventario,
  type BajaInventarioResponse,
} from "../types/baja-inventario.types";
import { AlmacenAutocomplete } from "../../almacen";
import { ProductoAutocomplete } from "../../producto";

interface BajaInventarioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bajaToEdit?: BajaInventarioResponse | null;
  onSuccessCallback?: () => void;
}

function generateDefaultNumero() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `BAJ-${year}${month}-${randomSuffix}`;
}

export function BajaInventarioFormDialog({
  open,
  onOpenChange,
  bajaToEdit,
  onSuccessCallback,
}: BajaInventarioFormDialogProps) {
  const isEditing = Boolean(bajaToEdit);

  const { data: fullBaja } = useBajaInventario(
    bajaToEdit?.id ?? 0,
    open && isEditing
  );

  const createMutation = useCreateBajaInventario();
  const updateMutation = useUpdateBajaInventario();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BajaInventarioFormValues>({
    resolver: zodResolver(bajaInventarioSchema),
    defaultValues: {
      numero: "",
      almacenId: 0,
      tipo: TipoBajaInventario.Vencimiento,
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

  const totalCantidad = watchedDetalles.reduce(
    (acc, curr) => acc + (Number(curr.cantidad) || 0),
    0
  );

  React.useEffect(() => {
    if (!open) return;

    if (isEditing) {
      const target = fullBaja || bajaToEdit;
      if (target) {
        const formattedDate = target.fecha
          ? new Date(target.fecha).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16);

        reset({
          numero: target.numero,
          almacenId: target.almacenId,
          tipo: target.tipo,
          fecha: formattedDate,
          motivo: target.motivo,
          observacion: target.observacion || "",
          detalles: (target.detalles || []).map((d) => ({
            productoId: d.productoId,
            productoNombre: d.productoNombre || "",
            loteId: d.loteId || null,
            cantidad: Number(d.cantidad),
            observacion: d.observacion || "",
          })),
        });
      }
    } else {
      reset({
        numero: generateDefaultNumero(),
        almacenId: 0,
        tipo: TipoBajaInventario.Vencimiento,
        fecha: new Date().toISOString().slice(0, 16),
        motivo: "",
        observacion: "",
        detalles: [
          {
            productoId: 0,
            productoNombre: "",
            loteId: null,
            cantidad: 1,
            observacion: "",
          },
        ],
      });
    }
  }, [open, isEditing, fullBaja, bajaToEdit, reset]);

  const handleAddRow = () => {
    append({
      productoId: 0,
      productoNombre: "",
      loteId: null,
      cantidad: 1,
      observacion: "",
    });
  };

  const onSubmit = async (values: BajaInventarioFormValues) => {
    if (values.detalles.length === 0) {
      toast.error("Debe agregar al menos un producto a la lista de bajas.");
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
      tipo: Number(values.tipo) as TipoBajaInventario,
      fecha: new Date(values.fecha).toISOString(),
      motivo: values.motivo.trim(),
      observacion: values.observacion?.trim() || null,
      detalles: values.detalles.map((d) => ({
        productoId: Number(d.productoId),
        loteId: d.loteId ? Number(d.loteId) : null,
        cantidad: Number(d.cantidad),
        observacion: d.observacion?.trim() || null,
      })),
    };

    try {
      if (isEditing && bajaToEdit) {
        await updateMutation.mutateAsync({
          id: bajaToEdit.id,
          data: payload,
        });
        toast.success(`Baja "${payload.numero}" actualizada.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Baja "${payload.numero}" registrada como borrador.`);
      }
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al procesar la baja de inventario.";
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
              <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-2xs">
                <Trash2 className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {isEditing
                    ? `Editar Baja: ${bajaToEdit?.numero}`
                    : "Nueva Baja de Inventario"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {isEditing
                    ? "Modifica los datos del borrador de baja"
                    : "Registra productos a descartar por vencimiento, rotura o merma"}
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
          id="baja-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto py-4 space-y-4 pr-1"
        >
          {/* Section 1: General Info */}
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 flex flex-col gap-3.5 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Número */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="numero" className="text-xs font-medium">
                  N° Baja <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="numero"
                  {...register("numero")}
                  placeholder="BAJ-2026-0001"
                  className="h-8 text-xs font-mono font-semibold"
                />
                {errors.numero && (
                  <span className="text-[10px] text-destructive">
                    {errors.numero.message}
                  </span>
                )}
              </div>

              {/* Tipo / Causa */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="tipo" className="text-xs font-medium">
                  Causa de la Baja <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="tipo"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={String(field.value)}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Seleccionar causa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={String(TipoBajaInventario.Vencimiento)}>
                          <span className="flex items-center gap-1.5 text-amber-600">
                            <CalendarX className="size-3" />
                            Vencimiento / Caducidad
                          </span>
                        </SelectItem>
                        <SelectItem value={String(TipoBajaInventario.Danio)}>
                          <span className="flex items-center gap-1.5 text-orange-600">
                            <AlertTriangle className="size-3" />
                            Daño / Rotura / Deterioro
                          </span>
                        </SelectItem>
                        <SelectItem value={String(TipoBajaInventario.Merma)}>
                          <span className="flex items-center gap-1.5 text-purple-600">
                            <Flame className="size-3" />
                            Merma / Pérdida Clínica
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.tipo && (
                  <span className="text-[10px] text-destructive">
                    {errors.tipo.message}
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

            {/* Motivo */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="motivo" className="text-xs font-medium">
                Motivo / Justificación <span className="text-destructive">*</span>
              </Label>
              <Input
                id="motivo"
                {...register("motivo")}
                placeholder="Ej. Frasco quebrado durante manipulación en quirófano, lote vencido el mes anterior..."
                className="h-8 text-xs"
              />
              {errors.motivo && (
                <span className="text-[10px] text-destructive">
                  {errors.motivo.message}
                </span>
              )}
            </div>

            {/* Observación */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="observacion" className="text-xs font-medium">
                Observaciones adicionales
              </Label>
              <Textarea
                id="observacion"
                {...register("observacion")}
                placeholder="Acta de destrucción, informe de farmacia..."
                rows={2}
                className="text-xs resize-none"
              />
            </div>
          </div>

          {/* Section 2: Items Table */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-rose-600 dark:text-rose-400" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  2. Artículos a Descartar
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
                className="h-7 text-xs gap-1.5 text-rose-600 border-rose-500/30 hover:bg-rose-500/5 cursor-pointer shadow-2xs"
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
                    <th className="px-3 py-2 min-w-64">Producto *</th>
                    <th className="px-3 py-2 w-32">Cantidad a Descartar *</th>
                    <th className="px-3 py-2 min-w-44">Nota / Detalle</th>
                    <th className="px-3 py-2 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {fields.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-8 text-center text-muted-foreground text-xs"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileSpreadsheet className="size-6 text-muted-foreground/60" />
                          <span className="font-medium">
                            No hay productos agregados a la baja
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleAddRow}
                            className="h-7 text-xs gap-1 text-rose-600 border-rose-500/30 hover:bg-rose-500/5"
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
                        <td className="px-3 py-2">
                          <Input
                            type="text"
                            placeholder="Ej. Ampolla rota, vencido..."
                            {...register(`detalles.${idx}.observacion`)}
                            className="h-8 text-xs"
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
                <span className="text-muted-foreground">Total Unidades a Descartar: </span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
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
            form="baja-form"
            size="sm"
            disabled={isSaving}
            className="h-8 px-4 text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium gap-1.5 cursor-pointer shadow-2xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <span>{isEditing ? "Actualizar Baja" : "Guardar Borrador"}</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
