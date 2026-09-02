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
  ShoppingCart,
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
  solicitudCompraSchema,
  type SolicitudCompraFormValues,
} from "../schemas/solicitud-compra.schema";
import {
  useCreateSolicitudCompra,
  useUpdateSolicitudCompra,
  useSolicitudCompra,
} from "../hooks/use-solicitud-compra";
import type { SolicitudCompraResponse } from "../types/solicitud-compra.types";
import { AlmacenAutocomplete } from "@/modules/almacenes/almacen";
import { ProductoAutocomplete } from "@/modules/almacenes/producto";

interface SolicitudCompraFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solicitudToEdit?: SolicitudCompraResponse | null;
  onSuccessCallback?: () => void;
}

export function SolicitudCompraFormDialog({
  open,
  onOpenChange,
  solicitudToEdit,
  onSuccessCallback,
}: SolicitudCompraFormDialogProps) {
  const isEditing = Boolean(solicitudToEdit);

  const { data: fullSolicitud } = useSolicitudCompra(
    solicitudToEdit?.id ?? 0,
    open && isEditing
  );

  const createMutation = useCreateSolicitudCompra();
  const updateMutation = useUpdateSolicitudCompra();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SolicitudCompraFormValues>({
    resolver: zodResolver(solicitudCompraSchema),
    defaultValues: {
      almacenId: 0,
      fechaSolicitud: new Date().toISOString().slice(0, 16),
      fechaRequerida: "",
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
    (acc, curr) => acc + (Number(curr.cantidadSolicitada) || 0),
    0
  );

  React.useEffect(() => {
    if (!open) return;

    if (isEditing) {
      const target = fullSolicitud || solicitudToEdit;
      if (target) {
        reset({
          almacenId: target.almacenId,
          fechaSolicitud: target.fechaSolicitud
            ? new Date(target.fechaSolicitud).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          fechaRequerida: target.fechaRequerida
            ? new Date(target.fechaRequerida).toISOString().slice(0, 10)
            : "",
          observacion: target.observacion || "",
          detalles: (target.detalles || []).map((d) => ({
            productoId: d.productoId,
            productoNombre: d.productoNombre || "",
            productoCodigo: d.productoCodigo || "",
            cantidadSolicitada: Number(d.cantidadSolicitada),
            observacion: d.observacion || "",
          })),
        });
      }
    } else {
      reset({
        almacenId: 0,
        fechaSolicitud: new Date().toISOString().slice(0, 16),
        fechaRequerida: "",
        observacion: "",
        detalles: [
          {
            productoId: 0,
            productoNombre: "",
            productoCodigo: "",
            cantidadSolicitada: 1,
            observacion: "",
          },
        ],
      });
    }
  }, [open, isEditing, fullSolicitud, solicitudToEdit, reset]);

  const handleAddDetalle = () => {
    append({
      productoId: 0,
      productoNombre: "",
      productoCodigo: "",
      cantidadSolicitada: 1,
      observacion: "",
    });
  };

  const onSubmit = async (values: SolicitudCompraFormValues) => {
    try {
      const payload = {
        almacenId: Number(values.almacenId),
        fechaSolicitud: new Date(values.fechaSolicitud).toISOString(),
        fechaRequerida: values.fechaRequerida
          ? new Date(values.fechaRequerida).toISOString()
          : null,
        observacion: values.observacion ? values.observacion.trim() : null,
        detalles: values.detalles.map((d) => ({
          productoId: Number(d.productoId),
          cantidadSolicitada: Number(d.cantidadSolicitada),
          observacion: d.observacion ? d.observacion.trim() : null,
        })),
      };

      if (isEditing && solicitudToEdit) {
        await updateMutation.mutateAsync({
          id: solicitudToEdit.id,
          data: payload,
        });
        toast.success(
          `Solicitud "${solicitudToEdit.numero}" actualizada correctamente.`
        );
      } else {
        const res = await createMutation.mutateAsync(payload);
        toast.success(
          `Solicitud "${res.numero || "creada"}" registrada en borrador.`
        );
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al guardar la solicitud de compra.";
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
              <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-2xs">
                <ShoppingCart className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
                  {isEditing
                    ? `Editar Solicitud ${solicitudToEdit?.numero}`
                    : "Nueva Solicitud de Compra"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                  {isEditing
                    ? "Modifica los detalles del borrador de la solicitud"
                    : "Registra los insumos o productos requeridos para el almacén"}
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
          id="solicitud-compra-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto pr-1 py-2.5 space-y-3 text-xs"
        >
          {/* Section 1: General Info */}
          <div className="bg-muted/20 border border-border/40 rounded-lg p-2.5 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Almacen Selector */}
              <div className="space-y-1">
                <Label htmlFor="almacenId" className="text-xs font-medium">
                  Almacén Destino <span className="text-destructive">*</span>
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

              {/* Fecha Solicitud */}
              <div className="space-y-1">
                <Label htmlFor="fechaSolicitud" className="text-xs font-medium">
                  Fecha de Emisión <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fechaSolicitud"
                  type="datetime-local"
                  {...register("fechaSolicitud")}
                  className="h-7.5 text-xs bg-background/50"
                />
                {errors.fechaSolicitud && (
                  <span className="text-[10px] text-destructive">
                    {errors.fechaSolicitud.message}
                  </span>
                )}
              </div>

              {/* Fecha Requerida */}
              <div className="space-y-1">
                <Label htmlFor="fechaRequerida" className="text-xs font-medium">
                  Fecha Requerida
                </Label>
                <Input
                  id="fechaRequerida"
                  type="date"
                  {...register("fechaRequerida")}
                  className="h-7.5 text-xs bg-background/50"
                />
              </div>
            </div>

            {/* Observacion */}
            <div className="space-y-1">
              <Label htmlFor="observacion" className="text-xs font-medium">
                Observaciones / Justificación General
              </Label>
              <Input
                id="observacion"
                {...register("observacion")}
                placeholder="Indica el motivo o contexto del pedido de abastecimiento..."
                className="h-7.5 text-xs bg-background/50"
              />
              {errors.observacion && (
                <span className="text-[10px] text-destructive">
                  {errors.observacion.message}
                </span>
              )}
            </div>
          </div>

          {/* Section 2: Items Table View */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Productos Requeridos
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
                className="h-6.5 text-xs px-2.5 gap-1 text-indigo-600 border-indigo-500/30 hover:bg-indigo-500/5 cursor-pointer shadow-2xs"
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
                    <th className="px-2.5 py-1.5 min-w-[240px]">Producto *</th>
                    <th className="px-2.5 py-1.5 w-32 text-center">Cantidad *</th>
                    <th className="px-2.5 py-1.5 min-w-[200px]">Observación / Especificación</th>
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
                            No hay productos agregados a la solicitud
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleAddDetalle}
                            className="h-6.5 text-xs px-2 gap-1 text-indigo-600 border-indigo-500/30 hover:bg-indigo-500/5 cursor-pointer"
                          >
                            <Plus className="size-3" />
                            <span>Agregar Primer Producto</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    fields.map((field, idx) => {
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
                                  }}
                                  placeholder="Buscar producto por código o nombre..."
                                  className="h-7 text-xs"
                                  error={Boolean(
                                    errors.detalles?.[idx]?.productoId
                                  )}
                                />
                              )}
                            />
                            {errors.detalles?.[idx]?.productoId && (
                              <span className="text-[10px] text-destructive">
                                {errors.detalles[idx]?.productoId?.message}
                              </span>
                            )}
                          </td>
                          <td className="px-2.5 py-1">
                            <Input
                              type="number"
                              step="any"
                              min="0.01"
                              {...register(
                                `detalles.${idx}.cantidadSolicitada`,
                                {
                                  valueAsNumber: true,
                                }
                              )}
                              placeholder="0.00"
                              className="h-7 text-xs font-mono text-center"
                            />
                            {errors.detalles?.[idx]?.cantidadSolicitada && (
                              <span className="text-[10px] text-destructive">
                                {
                                  errors.detalles[idx]?.cantidadSolicitada
                                    ?.message
                                }
                              </span>
                            )}
                          </td>
                          <td className="px-2.5 py-1">
                            <Input
                              type="text"
                              placeholder="Nota de presentación, especificación..."
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
                        colSpan={2}
                        className="px-2.5 py-1.5 text-right text-muted-foreground"
                      >
                        Total unidades solicitadas:
                      </td>
                      <td className="px-2.5 py-1.5 text-center font-mono font-bold text-foreground">
                        {totalCantidad.toLocaleString("es-ES", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td colSpan={2}></td>
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
            form="solicitud-compra-form"
            size="sm"
            disabled={isSaving}
            className="h-7.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 font-medium shadow-2xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <span>
                {isEditing ? "Actualizar Solicitud" : "Guardar Borrador"}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
