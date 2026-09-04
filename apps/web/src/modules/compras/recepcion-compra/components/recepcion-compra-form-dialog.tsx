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
  PackageCheck,
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
  recepcionCompraSchema,
  type RecepcionCompraFormValues,
} from "../schemas/recepcion-compra.schema";
import {
  useCreateRecepcionCompra,
  useUpdateRecepcionCompra,
  useRecepcionCompra,
} from "../hooks/use-recepcion-compra";
import type { RecepcionCompraResponse } from "../types/recepcion-compra.types";
import { AlmacenAutocomplete } from "@/modules/almacenes/almacen";
import { ProductoAutocomplete } from "@/modules/almacenes/producto";
import { LoteAutocomplete } from "@/modules/almacenes/lote";
import {
  OrdenCompraAutocomplete,
  EstadoOrdenCompra,
  getOrdenCompraById,
} from "@/modules/compras/orden-compra";

interface RecepcionCompraFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recepcionToEdit?: RecepcionCompraResponse | null;
  onSuccessCallback?: () => void;
}

export function RecepcionCompraFormDialog({
  open,
  onOpenChange,
  recepcionToEdit,
  onSuccessCallback,
}: RecepcionCompraFormDialogProps) {
  const isEditing = Boolean(recepcionToEdit);

  const { data: fullRecepcion } = useRecepcionCompra(
    recepcionToEdit?.id ?? 0,
    open && isEditing
  );

  const createMutation = useCreateRecepcionCompra();
  const updateMutation = useUpdateRecepcionCompra();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RecepcionCompraFormValues>({
    resolver: zodResolver(recepcionCompraSchema),
    defaultValues: {
      ordenCompraId: 0,
      almacenId: 0,
      fechaRecepcion: new Date().toISOString().slice(0, 16),
      numeroFactura: "",
      numeroRemision: "",
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
    (acc, curr) => acc + (Number(curr.cantidadRecibida) || 0),
    0
  );

  React.useEffect(() => {
    if (!open) return;

    if (isEditing) {
      const target = fullRecepcion || recepcionToEdit;
      if (target) {
        reset({
          ordenCompraId: target.ordenCompraId,
          almacenId: target.almacenId,
          fechaRecepcion: target.fechaRecepcion
            ? new Date(target.fechaRecepcion).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          numeroFactura: target.numeroFactura || "",
          numeroRemision: target.numeroRemision || "",
          observacion: target.observacion || "",
          detalles: (target.detalles || []).map((d) => ({
            ordenCompraDetalleId: d.ordenCompraDetalleId || 1,
            productoId: d.productoId,
            productoNombre: d.productoNombre || "",
            productoCodigo: d.productoCodigo || "",
            loteId: d.loteId ?? null,
            cantidadRecibida: Number(d.cantidadRecibida),
            precioUnitario: Number(d.precioUnitario),
            observacion: d.observacion || "",
          })),
        });
      }
    } else {
      reset({
        ordenCompraId: 0,
        almacenId: 0,
        fechaRecepcion: new Date().toISOString().slice(0, 16),
        numeroFactura: "",
        numeroRemision: "",
        observacion: "",
        detalles: [
          {
            ordenCompraDetalleId: 1,
            productoId: 0,
            productoNombre: "",
            productoCodigo: "",
            loteId: null,
            cantidadRecibida: 1,
            precioUnitario: 0,
            observacion: "",
          },
        ],
      });
    }
  }, [open, isEditing, fullRecepcion, recepcionToEdit, reset]);

  const handleAddDetalle = () => {
    append({
      ordenCompraDetalleId: 1,
      productoId: 0,
      productoNombre: "",
      productoCodigo: "",
      loteId: null,
      cantidadRecibida: 1,
      precioUnitario: 0,
      observacion: "",
    });
  };

  const onSubmit = async (values: RecepcionCompraFormValues) => {
    try {
      const payload = {
        ordenCompraId: Number(values.ordenCompraId),
        almacenId: Number(values.almacenId),
        fechaRecepcion: new Date(values.fechaRecepcion).toISOString(),
        numeroFactura: values.numeroFactura ? values.numeroFactura.trim() : null,
        numeroRemision: values.numeroRemision
          ? values.numeroRemision.trim()
          : null,
        observacion: values.observacion ? values.observacion.trim() : null,
        detalles: values.detalles.map((d) => ({
          ordenCompraDetalleId: Number(d.ordenCompraDetalleId || 1),
          productoId: Number(d.productoId),
          loteId: d.loteId ? Number(d.loteId) : null,
          cantidadRecibida: Number(d.cantidadRecibida),
          precioUnitario: Number(d.precioUnitario),
          observacion: d.observacion ? d.observacion.trim() : null,
        })),
      };

      if (isEditing && recepcionToEdit) {
        await updateMutation.mutateAsync({
          id: recepcionToEdit.id,
          data: payload,
        });
        toast.success(
          `Recepción "${recepcionToEdit.numero}" actualizada.`
        );
      } else {
        const res = await createMutation.mutateAsync(payload);
        toast.success(
          `Recepción "${res.numero || "creada"}" registrada en borrador.`
        );
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al guardar la recepción de compra.";
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
              <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                <PackageCheck className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
                  {isEditing
                    ? `Editar Recepción ${recepcionToEdit?.numero}`
                    : "Nueva Recepción de Mercadería"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                  {isEditing
                    ? "Modifica los datos del borrador de recepción"
                    : "Registra el ingreso de ítems recibidos de una orden de compra"}
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
          id="recepcion-compra-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto pr-1 py-2.5 space-y-3 text-xs"
        >
          {/* Section 1: General Info */}
          <div className="bg-muted/20 border border-border/40 rounded-lg p-2.5 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              {/* Orden de Compra (Filtrada a Estado 4 - Enviada a Proveedor) */}
              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ordenCompraId" className="text-xs font-medium">
                    Orden de Compra <span className="text-destructive">*</span>
                  </Label>
                  <Badge
                    variant="outline"
                    className="text-[9px] h-4 px-1.5 font-normal text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/5"
                  >
                    Enviadas (Est. 4)
                  </Badge>
                </div>
                <Controller
                  control={control}
                  name="ordenCompraId"
                  render={({ field }) => (
                    <OrdenCompraAutocomplete
                      value={field.value || null}
                      estado={EstadoOrdenCompra.EnviadaProveedor}
                      onValueChange={async (id) => {
                        field.onChange(id || 0);
                        if (!id) return;
                        try {
                          const fullOrden = await getOrdenCompraById(id);
                          if (fullOrden) {
                            if (fullOrden.almacenId) {
                              setValue("almacenId", fullOrden.almacenId, {
                                shouldValidate: true,
                              });
                            }
                            if (
                              fullOrden.detalles &&
                              fullOrden.detalles.length > 0
                            ) {
                              const newDetalles = fullOrden.detalles.map(
                                (d) => ({
                                  ordenCompraDetalleId: d.id,
                                  productoId: d.productoId,
                                  productoNombre: d.productoNombre || "",
                                  productoCodigo: d.productoCodigo || "",
                                  loteId: null,
                                  cantidadRecibida: Math.max(
                                    0,
                                    Number(d.cantidad) -
                                      Number(d.cantidadRecibida || 0)
                                  ) || Number(d.cantidad),
                                  precioUnitario: Number(d.precioUnitario),
                                  observacion: d.observacion || "",
                                })
                              );
                              setValue("detalles", newDetalles, {
                                shouldValidate: true,
                              });
                              toast.success(
                                `Se cargaron ${newDetalles.length} producto(s) desde la orden ${fullOrden.numero}.`
                              );
                            }
                          }
                        } catch (error) {
                          console.error(
                            "Error al obtener detalles de la orden",
                            error
                          );
                        }
                      }}
                      placeholder="Seleccionar orden de compra enviada..."
                      className="h-7.5 text-xs"
                      error={Boolean(errors.ordenCompraId)}
                    />
                  )}
                />
                {errors.ordenCompraId && (
                  <span className="text-[10px] text-destructive">
                    {errors.ordenCompraId.message}
                  </span>
                )}
              </div>

              {/* Almacén */}
              <div className="space-y-1 sm:col-span-2">
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

              {/* Fecha Recepción */}
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="fechaRecepcion" className="text-xs font-medium">
                  Fecha Recepción <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fechaRecepcion"
                  type="datetime-local"
                  {...register("fechaRecepcion")}
                  className="h-7.5 text-xs bg-background/50"
                />
                {errors.fechaRecepcion && (
                  <span className="text-[10px] text-destructive">
                    {errors.fechaRecepcion.message}
                  </span>
                )}
              </div>

              {/* Factura */}
              <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="numeroFactura" className="text-xs font-medium">
                  N° Factura
                </Label>
                <Input
                  id="numeroFactura"
                  {...register("numeroFactura")}
                  placeholder="Ej. FAC-001248"
                  className="h-7.5 text-xs bg-background/50"
                />
              </div>

              {/* Remisión */}
              <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="numeroRemision" className="text-xs font-medium">
                  N° Guía Remisión
                </Label>
                <Input
                  id="numeroRemision"
                  {...register("numeroRemision")}
                  placeholder="Ej. GR-883492"
                  className="h-7.5 text-xs bg-background/50"
                />
              </div>
            </div>

            {/* Observacion */}
            <div className="space-y-1">
              <Label htmlFor="observacion" className="text-xs font-medium">
                Observaciones de Descarga / Control Físico
              </Label>
              <Input
                id="observacion"
                {...register("observacion")}
                placeholder="Estado del embalaje, precintos, transportista..."
                className="h-7.5 text-xs bg-background/50"
              />
            </div>
          </div>

          {/* Section 2: Items Table View */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Productos Recibidos
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
                className="h-6.5 text-xs px-2.5 gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/5 cursor-pointer shadow-2xs"
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
                    <th className="px-2.5 py-1.5 w-24 text-center">Cant. Recibida *</th>
                    <th className="px-2.5 py-1.5 w-24 text-center">Precio Unit.</th>
                    <th className="px-2.5 py-1.5 min-w-[140px]">Nota</th>
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
                            No hay productos en esta recepción
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleAddDetalle}
                            className="h-6.5 text-xs px-2 gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/5 cursor-pointer"
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
                              {...register(
                                `detalles.${idx}.cantidadRecibida`,
                                {
                                  valueAsNumber: true,
                                }
                              )}
                              className="h-7 text-xs font-mono text-center"
                            />
                          </td>
                          <td className="px-2.5 py-1">
                            <Input
                              type="number"
                              step="any"
                              min="0"
                              {...register(`detalles.${idx}.precioUnitario`, {
                                valueAsNumber: true,
                              })}
                              className="h-7 text-xs font-mono text-center"
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
                        Total Unidades Recibidas:
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
            form="recepcion-compra-form"
            size="sm"
            disabled={isSaving}
            className="h-7.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-medium shadow-2xs cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <span>
                {isEditing ? "Actualizar Recepción" : "Guardar Borrador"}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
