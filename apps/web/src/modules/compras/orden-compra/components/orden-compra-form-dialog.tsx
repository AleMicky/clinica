"use client";

import * as React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Trash2,
  Plus,
  Package,
  ShoppingBag,
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
  ordenCompraSchema,
  type OrdenCompraFormValues,
} from "../schemas/orden-compra.schema";
import {
  useCreateOrdenCompra,
  useUpdateOrdenCompra,
  useOrdenCompra,
} from "../hooks/use-orden-compra";
import type { OrdenCompraResponse } from "../types/orden-compra.types";
import { ProveedorAutocomplete } from "@/modules/compras/proveedor";
import { AlmacenAutocomplete } from "@/modules/almacenes/almacen";
import { ProductoAutocomplete } from "@/modules/almacenes/producto";
import {
  SolicitudCompraAutocomplete,
  EstadoSolicitudCompra,
  getSolicitudCompraById,
} from "@/modules/compras/solicitud-compra";
import {
  CotizacionCompraAutocomplete,
  EstadoCotizacionCompra,
  getCotizacionCompraById,
} from "@/modules/compras/cotizacion-compra";

interface OrdenCompraFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ordenToEdit?: OrdenCompraResponse | null;
  onSuccessCallback?: () => void;
}

export function OrdenCompraFormDialog({
  open,
  onOpenChange,
  ordenToEdit,
  onSuccessCallback,
}: OrdenCompraFormDialogProps) {
  const isEditing = Boolean(ordenToEdit);

  const { data: fullOrden } = useOrdenCompra(
    ordenToEdit?.id ?? 0,
    open && isEditing
  );

  const createMutation = useCreateOrdenCompra();
  const updateMutation = useUpdateOrdenCompra();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrdenCompraFormValues>({
    resolver: zodResolver(ordenCompraSchema),
    defaultValues: {
      proveedorId: 0,
      almacenId: 0,
      solicitudCompraId: null,
      cotizacionCompraId: null,
      fecha: new Date().toISOString().slice(0, 16),
      fechaEntregaEsperada: "",
      condicionPago: "Contado",
      observacion: "",
      detalles: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "detalles",
  });

  const watchedDetalles = watch("detalles") || [];

  const subtotalSum = watchedDetalles.reduce((acc, curr) => {
    const cant = Number(curr.cantidad) || 0;
    const precio = Number(curr.precioUnitario) || 0;
    const desc = Number(curr.descuento) || 0;
    return acc + Math.max(0, cant * precio - desc);
  }, 0);

  React.useEffect(() => {
    if (!open) return;

    if (isEditing) {
      const target = fullOrden || ordenToEdit;
      if (target) {
        reset({
          proveedorId: target.proveedorId,
          almacenId: target.almacenId,
          solicitudCompraId: target.solicitudCompraId ?? null,
          cotizacionCompraId: target.cotizacionCompraId ?? null,
          fecha: target.fecha
            ? new Date(target.fecha).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          fechaEntregaEsperada: target.fechaEntregaEsperada
            ? new Date(target.fechaEntregaEsperada).toISOString().slice(0, 10)
            : "",
          condicionPago: target.condicionPago || "",
          observacion: target.observacion || "",
          detalles: (target.detalles || []).map((d) => ({
            productoId: d.productoId,
            productoNombre: d.productoNombre || "",
            productoCodigo: d.productoCodigo || "",
            cantidad: Number(d.cantidad),
            precioUnitario: Number(d.precioUnitario),
            descuento: Number(d.descuento || 0),
            observacion: d.observacion || "",
          })),
        });
      }
    } else {
      reset({
        proveedorId: 0,
        almacenId: 0,
        solicitudCompraId: null,
        cotizacionCompraId: null,
        fecha: new Date().toISOString().slice(0, 16),
        fechaEntregaEsperada: "",
        condicionPago: "Contado",
        observacion: "",
        detalles: [
          {
            productoId: 0,
            productoNombre: "",
            productoCodigo: "",
            cantidad: 1,
            precioUnitario: 0,
            descuento: 0,
            observacion: "",
          },
        ],
      });
    }
  }, [open, isEditing, fullOrden, ordenToEdit, reset]);

  const handleAddDetalle = () => {
    append({
      productoId: 0,
      productoNombre: "",
      productoCodigo: "",
      cantidad: 1,
      precioUnitario: 0,
      descuento: 0,
      observacion: "",
    });
  };

  const onSubmit = async (values: OrdenCompraFormValues) => {
    try {
      const payload = {
        proveedorId: Number(values.proveedorId),
        almacenId: Number(values.almacenId),
        solicitudCompraId: values.solicitudCompraId
          ? Number(values.solicitudCompraId)
          : null,
        cotizacionCompraId: values.cotizacionCompraId
          ? Number(values.cotizacionCompraId)
          : null,
        fecha: new Date(values.fecha).toISOString(),
        fechaEntregaEsperada: values.fechaEntregaEsperada
          ? new Date(values.fechaEntregaEsperada).toISOString()
          : null,
        condicionPago: values.condicionPago ? values.condicionPago.trim() : null,
        observacion: values.observacion ? values.observacion.trim() : null,
        detalles: values.detalles.map((d) => ({
          productoId: Number(d.productoId),
          cantidad: Number(d.cantidad),
          precioUnitario: Number(d.precioUnitario),
          descuento: Number(d.descuento || 0),
          observacion: d.observacion ? d.observacion.trim() : null,
        })),
      };

      if (isEditing && ordenToEdit) {
        await updateMutation.mutateAsync({
          id: ordenToEdit.id,
          data: payload,
        });
        toast.success(
          `Orden de compra "${ordenToEdit.numero}" actualizada.`
        );
      } else {
        const res = await createMutation.mutateAsync(payload);
        toast.success(
          `Orden "${res.numero || "creada"}" registrada en borrador.`
        );
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al guardar la orden de compra.";
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
              <div className="size-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                <ShoppingBag className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
                  {isEditing
                    ? `Editar Orden ${ordenToEdit?.numero}`
                    : "Nueva Orden de Compra"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                  {isEditing
                    ? "Modifica los detalles del borrador de la orden de compra"
                    : "Registra un pedido formal de compra para abastecimiento"}
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
          id="orden-compra-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto pr-1 py-2.5 space-y-3 text-xs"
        >
          {/* Section 1: General Info */}
          <div className="bg-muted/20 border border-border/40 rounded-lg p-2.5 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              {/* 1. Solicitud de Compra (Primero - Estado 3 Aprobada) */}
              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="solicitudCompraId" className="text-xs font-medium">
                    1. Solicitud de Compra <span className="text-muted-foreground font-normal text-[10px]">(Opcional)</span>
                  </Label>
                  <Badge
                    variant="outline"
                    className="text-[9px] h-4 px-1.5 font-normal text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
                  >
                    Aprobadas (Est. 3)
                  </Badge>
                </div>
                <Controller
                  control={control}
                  name="solicitudCompraId"
                  render={({ field }) => (
                    <SolicitudCompraAutocomplete
                      value={field.value || null}
                      estado={EstadoSolicitudCompra.Aprobada}
                      onValueChange={async (id) => {
                        field.onChange(id || null);
                        setValue("cotizacionCompraId", null);
                        if (!id) return;
                        try {
                          const fullSolicitud = await getSolicitudCompraById(id);
                          if (fullSolicitud?.almacenId) {
                            setValue("almacenId", fullSolicitud.almacenId, {
                              shouldValidate: true,
                            });
                          }
                        } catch (error) {
                          console.error("Error al obtener solicitud", error);
                        }
                      }}
                      placeholder="Seleccionar solicitud aprobada..."
                      className="h-7.5 text-xs"
                      error={Boolean(errors.solicitudCompraId)}
                    />
                  )}
                />
                {errors.solicitudCompraId && (
                  <span className="text-[10px] text-destructive">
                    {errors.solicitudCompraId.message}
                  </span>
                )}
              </div>

              {/* 2. Cotización de Compra (Segundo - Estado 3 Seleccionada) */}
              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cotizacionCompraId" className="text-xs font-medium">
                    2. Cotización de Compra <span className="text-muted-foreground font-normal text-[10px]">(Opcional)</span>
                  </Label>
                  <Badge
                    variant="outline"
                    className="text-[9px] h-4 px-1.5 font-normal text-teal-600 dark:text-teal-400 border-teal-500/30 bg-teal-500/5"
                  >
                    Seleccionadas (Est. 3)
                  </Badge>
                </div>
                <Controller
                  control={control}
                  name="cotizacionCompraId"
                  render={({ field }) => (
                    <CotizacionCompraAutocomplete
                      value={field.value || null}
                      solicitudCompraId={watch("solicitudCompraId") || undefined}
                      proveedorId={watch("proveedorId") || undefined}
                      estado={EstadoCotizacionCompra.Seleccionada}
                      onValueChange={async (id) => {
                        field.onChange(id || null);
                        if (!id) return;
                        try {
                          const fullCotizacion =
                            await getCotizacionCompraById(id);
                          if (fullCotizacion) {
                            // Cabecera: Proveedor
                            if (fullCotizacion.proveedorId) {
                              setValue(
                                "proveedorId",
                                fullCotizacion.proveedorId,
                                { shouldValidate: true }
                              );
                            }
                            // Cabecera: Condición de Pago
                            if (fullCotizacion.condicionPago) {
                              setValue(
                                "condicionPago",
                                fullCotizacion.condicionPago,
                                { shouldValidate: true }
                              );
                            }
                            // Cabecera: Solicitud de Compra vinculada
                            if (fullCotizacion.solicitudCompraId) {
                              setValue(
                                "solicitudCompraId",
                                fullCotizacion.solicitudCompraId,
                                { shouldValidate: true }
                              );
                            }
                            // Cabecera: Observación si aplica
                            if (fullCotizacion.observacion) {
                              setValue(
                                "observacion",
                                fullCotizacion.observacion,
                                { shouldValidate: true }
                              );
                            }
                            // Detalle completo: Productos, cantidades, precios unitarios, descuentos y observaciones
                            if (
                              fullCotizacion.detalles &&
                              fullCotizacion.detalles.length > 0
                            ) {
                              const newDetalles = fullCotizacion.detalles.map(
                                (d) => ({
                                  productoId: d.productoId,
                                  productoNombre: d.productoNombre || "",
                                  productoCodigo: d.productoCodigo || "",
                                  cantidad: Number(d.cantidad),
                                  precioUnitario: Number(d.precioUnitario),
                                  descuento: Number(d.descuento || 0),
                                  observacion: d.observacion || "",
                                })
                              );
                              setValue("detalles", newDetalles, {
                                shouldValidate: true,
                              });
                              toast.success(
                                `Se cargaron todos los datos y ${newDetalles.length} producto(s) desde la cotización ${fullCotizacion.numero}.`
                              );
                            }
                          }
                        } catch (error) {
                          console.error("Error al obtener cotización", error);
                        }
                      }}
                      placeholder="Seleccionar cotización ganadora/seleccionada..."
                      className="h-7.5 text-xs"
                      error={Boolean(errors.cotizacionCompraId)}
                    />
                  )}
                />
                {errors.cotizacionCompraId && (
                  <span className="text-[10px] text-destructive">
                    {errors.cotizacionCompraId.message}
                  </span>
                )}
              </div>

              {/* Proveedor */}
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="proveedorId" className="text-xs font-medium">
                  Proveedor <span className="text-destructive">*</span>
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

              {/* Fecha Emisión */}
              <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="fecha" className="text-xs font-medium">
                  Fecha Emisión <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fecha"
                  type="datetime-local"
                  {...register("fecha")}
                  className="h-7.5 text-xs bg-background/50"
                />
                {errors.fecha && (
                  <span className="text-[10px] text-destructive">
                    {errors.fecha.message}
                  </span>
                )}
              </div>

              {/* Fecha Entrega Esperada */}
              <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="fechaEntregaEsperada" className="text-xs font-medium">
                  Entrega Esperada
                </Label>
                <Input
                  id="fechaEntregaEsperada"
                  type="date"
                  {...register("fechaEntregaEsperada")}
                  className="h-7.5 text-xs bg-background/50"
                />
              </div>

              {/* Condicion de Pago */}
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="condicionPago" className="text-xs font-medium">
                  Condición de Pago
                </Label>
                <Input
                  id="condicionPago"
                  {...register("condicionPago")}
                  placeholder="Ej. Crédito 30 días, Pago contra entrega..."
                  className="h-7.5 text-xs bg-background/50"
                />
              </div>
            </div>

            {/* Observacion */}
            <div className="space-y-1">
              <Label htmlFor="observacion" className="text-xs font-medium">
                Observaciones / Instrucciones de Entrega
              </Label>
              <Input
                id="observacion"
                {...register("observacion")}
                placeholder="Horario de recepción, lugar de descarga, etc..."
                className="h-7.5 text-xs bg-background/50"
              />
            </div>
          </div>

          {/* Section 2: Items Table View */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="size-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Productos Ordenados
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
                className="h-6.5 text-xs px-2.5 gap-1 text-blue-600 border-blue-500/30 hover:bg-blue-500/5 cursor-pointer shadow-2xs"
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
                    <th className="px-2.5 py-1.5 w-24 text-center">Cantidad *</th>
                    <th className="px-2.5 py-1.5 w-28 text-center">Precio Unit. *</th>
                    <th className="px-2.5 py-1.5 w-24 text-center">Descuento</th>
                    <th className="px-2.5 py-1.5 w-28 text-right">Subtotal</th>
                    <th className="px-2.5 py-1.5 min-w-[140px]">Nota</th>
                    <th className="px-2 py-1.5 w-8 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {fields.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-3 py-6 text-center text-muted-foreground text-xs"
                      >
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <FileSpreadsheet className="size-5 text-muted-foreground/60" />
                          <span className="font-medium text-xs">
                            No hay productos en esta orden
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleAddDetalle}
                            className="h-6.5 text-xs px-2 gap-1 text-blue-600 border-blue-500/30 hover:bg-blue-500/5 cursor-pointer"
                          >
                            <Plus className="size-3" />
                            <span>Agregar Primer Producto</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    fields.map((field, idx) => {
                      const cant = Number(watchedDetalles[idx]?.cantidad) || 0;
                      const pu =
                        Number(watchedDetalles[idx]?.precioUnitario) || 0;
                      const desc =
                        Number(watchedDetalles[idx]?.descuento) || 0;
                      const subtotalLine = Math.max(0, cant * pu - desc);

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
                              {...register(`detalles.${idx}.precioUnitario`, {
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
                              {...register(`detalles.${idx}.descuento`, {
                                valueAsNumber: true,
                              })}
                              className="h-7 text-xs font-mono text-center"
                            />
                          </td>
                          <td className="px-2.5 py-1 text-right font-mono font-bold text-foreground">
                            {subtotalLine.toLocaleString("es-ES", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
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
                        colSpan={5}
                        className="px-2.5 py-1.5 text-right text-muted-foreground"
                      >
                        Subtotal Estimado:
                      </td>
                      <td className="px-2.5 py-1.5 text-right font-mono font-bold text-foreground">
                        {subtotalSum.toLocaleString("es-ES", {
                          minimumFractionDigits: 2,
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
            form="orden-compra-form"
            size="sm"
            disabled={isSaving}
            className="h-7.5 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 font-medium shadow-2xs cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <span>
                {isEditing ? "Actualizar Orden" : "Guardar Orden"}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
