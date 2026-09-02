"use client";

import * as React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ClipboardCheck,
  Plus,
  Trash2,
  Package,
  Warehouse,
  Calendar,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
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
  inventarioFisicoSchema,
  type InventarioFisicoFormValues,
} from "../schemas/inventario-fisico.schema";
import {
  useCreateInventarioFisico,
  useUpdateInventarioFisico,
  useInventarioFisico,
} from "../hooks/use-inventario-fisico";
import type { InventarioFisicoResponse } from "../types/inventario-fisico.types";
import { AlmacenAutocomplete } from "../../almacen";
import { ProductoAutocomplete } from "../../producto";
import { LoteAutocomplete } from "../../lote";
import { useExistencias } from "../../existencia";

interface InventarioFisicoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventarioToEdit?: InventarioFisicoResponse | null;
  onSuccessCallback?: () => void;
}

export function InventarioFisicoFormDialog({
  open,
  onOpenChange,
  inventarioToEdit,
  onSuccessCallback,
}: InventarioFisicoFormDialogProps) {
  const isEditing = Boolean(inventarioToEdit);

  const { data: fullInventario } = useInventarioFisico(
    inventarioToEdit?.id ?? 0,
    open && isEditing
  );

  const createMutation = useCreateInventarioFisico();
  const updateMutation = useUpdateInventarioFisico();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InventarioFisicoFormValues>({
    resolver: zodResolver(inventarioFisicoSchema),
    defaultValues: {
      almacenId: 0,
      fechaInicio: new Date().toISOString().slice(0, 16),
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

  // Obtener existencias actuales del almacén seleccionado para autocompletar la cantidad en sistema
  const { data: existenciasData } = useExistencias(
    open && selectedAlmacenId && selectedAlmacenId > 0
      ? {
          almacenId: selectedAlmacenId,
          pageSize: 1000,
        }
      : undefined
  );

  const totalSistema = watchedDetalles.reduce(
    (acc, curr) => acc + (Number(curr.cantidadSistema) || 0),
    0
  );

  const calculateStock = React.useCallback(
    (productoId?: number | null, loteId?: number | null) => {
      if (!productoId || productoId <= 0 || !existenciasData?.items) return 0;
      if (loteId && loteId > 0) {
        const found = existenciasData.items.find(
          (ex) => ex.productoId === productoId && ex.loteId === loteId
        );
        return found ? Number(found.cantidad) : 0;
      }
      return existenciasData.items
        .filter((ex) => ex.productoId === productoId)
        .reduce((sum, ex) => sum + Number(ex.cantidad), 0);
    },
    [existenciasData]
  );

  React.useEffect(() => {
    if (!open) return;

    if (isEditing) {
      const target = fullInventario || inventarioToEdit;
      if (target) {
        const formattedDate = target.fechaInicio
          ? new Date(target.fechaInicio).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16);

        reset({
          almacenId: target.almacenId,
          fechaInicio: formattedDate,
          observacion: target.observacion || "",
          detalles: (target.detalles || []).map((d) => ({
            productoId: d.productoId,
            productoNombre: d.productoNombre || "",
            loteId: d.loteId || null,
            cantidadSistema: Number(d.cantidadSistema),
            cantidadContada:
              d.cantidadContada !== null && d.cantidadContada !== undefined
                ? Number(d.cantidadContada)
                : null,
          })),
        });
      }
    } else {
      reset({
        almacenId: 0,
        fechaInicio: new Date().toISOString().slice(0, 16),
        observacion: "",
        detalles: [
          {
            productoId: 0,
            productoNombre: "",
            loteId: null,
            cantidadSistema: 0,
            cantidadContada: null,
          },
        ],
      });
    }
  }, [open, isEditing, fullInventario, inventarioToEdit, reset]);

  const handleAddRow = () => {
    append({
      productoId: 0,
      productoNombre: "",
      loteId: null,
      cantidadSistema: 0,
      cantidadContada: null,
    });
  };

  const onSubmit = async (values: InventarioFisicoFormValues) => {
    if (values.detalles.length === 0) {
      toast.error("Debe agregar al menos un producto al inventario.");
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
      almacenId: Number(values.almacenId),
      fechaInicio: new Date(values.fechaInicio).toISOString(),
      observacion: values.observacion?.trim() || null,
      detalles: values.detalles.map((d) => ({
        productoId: Number(d.productoId),
        loteId: d.loteId ? Number(d.loteId) : null,
        cantidadSistema: Number(d.cantidadSistema),
        cantidadContada:
          d.cantidadContada !== null && d.cantidadContada !== undefined
            ? Number(d.cantidadContada)
            : null,
      })),
    };

    try {
      if (isEditing && inventarioToEdit) {
        await updateMutation.mutateAsync({
          id: inventarioToEdit.id,
          data: payload,
        });
        toast.success(
          `Inventario "${inventarioToEdit.numero || "actualizado"}" actualizado.`
        );
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Inventario guardado como borrador.");
      }
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al procesar el inventario físico.";
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
                <ClipboardCheck className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {isEditing
                    ? `Editar Inventario: ${inventarioToEdit?.numero}`
                    : "Nuevo Inventario Físico / Arqueo"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {isEditing
                    ? "Modifica los datos del borrador de inventario"
                    : "Planifica un proceso de conteo y arqueo de existencias"}
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
          id="inventario-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto py-4 space-y-4 pr-1"
        >
          {/* Section 1: General Info */}
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 flex flex-col gap-3.5 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      onValueChange={(val) => {
                        field.onChange(val || 0);
                        // Limpiar lotes y recalcular cantidades
                        watchedDetalles.forEach((_, idx) => {
                          setValue(`detalles.${idx}.loteId`, null);
                          setValue(`detalles.${idx}.cantidadSistema`, 0);
                        });
                      }}
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

              {/* Fecha Inicio */}
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="fechaInicio"
                  className="text-xs font-medium flex items-center gap-1"
                >
                  <Calendar className="size-3 text-muted-foreground" />
                  Fecha de Programación <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fechaInicio"
                  type="datetime-local"
                  {...register("fechaInicio")}
                  className="h-8 text-xs"
                />
                {errors.fechaInicio && (
                  <span className="text-[10px] text-destructive">
                    {errors.fechaInicio.message}
                  </span>
                )}
              </div>
            </div>

            {/* Observación */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="observacion" className="text-xs font-medium">
                Observaciones o Justificación del Arqueo
              </Label>
              <Textarea
                id="observacion"
                {...register("observacion")}
                placeholder="Motivo del conteo, responsables del arqueo, notas adicionales..."
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
                  2. Lista de Productos a Auditar
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
                    <th className="px-2.5 py-1.5 w-44">Lote (Opcional)</th>
                    <th className="px-2.5 py-1.5 w-32 text-center">Cant. en Sistema</th>
                    <th className="px-2 py-1.5 w-9 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {fields.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-6 text-center text-muted-foreground text-xs"
                      >
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <FileSpreadsheet className="size-5 text-muted-foreground/60" />
                          <span className="font-medium text-xs">
                            No hay productos agregados al arqueo
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
                                    }
                                    setValue(`detalles.${idx}.loteId`, null);
                                    const autoStock = calculateStock(val, null);
                                    setValue(
                                      `detalles.${idx}.cantidadSistema`,
                                      autoStock
                                    );
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
                                  onValueChange={(val) => {
                                    lField.onChange(val || null);
                                    const autoStock = calculateStock(
                                      currentProdId,
                                      val
                                    );
                                    setValue(
                                      `detalles.${idx}.cantidadSistema`,
                                      autoStock
                                    );
                                  }}
                                  placeholder="Sin lote / Seleccionar..."
                                />
                              )}
                            />
                          </td>
                          <td className="px-2.5 py-1">
                            <Input
                              type="number"
                              disabled
                              readOnly
                              value={watch(`detalles.${idx}.cantidadSistema`) ?? 0}
                              className="h-7 text-xs font-mono text-center bg-muted/60 text-foreground cursor-not-allowed font-semibold opacity-90"
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

            {/* Totals */}
            <div className="flex justify-end py-1.5 px-3 rounded-lg bg-muted/40 border border-border/40 text-xs gap-4 font-mono">
              <div>
                <span className="text-muted-foreground text-[11px]">Total Teórico en Sistema: </span>
                <span className="font-bold text-primary text-xs">
                  {totalSistema.toLocaleString("es-ES")}
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
            form="inventario-form"
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
              <span>{isEditing ? "Actualizar Inventario" : "Guardar Borrador"}</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
