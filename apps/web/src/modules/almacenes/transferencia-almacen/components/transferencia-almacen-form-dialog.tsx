"use client";

import * as React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
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
  ArrowRight,
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

interface TransferenciaAlmacenFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transferenciaToEdit?: TransferenciaAlmacenResponse | null;
  onSuccessCallback?: () => void;
}

function generateDefaultNumero() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `TRA-${year}${month}-${randomSuffix}`;
}

export function TransferenciaAlmacenFormDialog({
  open,
  onOpenChange,
  transferenciaToEdit,
  onSuccessCallback,
}: TransferenciaAlmacenFormDialogProps) {
  const isEditing = Boolean(transferenciaToEdit);

  const { data: fullTransferencia } = useTransferenciaAlmacen(
    transferenciaToEdit?.id ?? 0,
    open && isEditing
  );

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
  const selectedAlmacenOrigenId = watch("almacenOrigenId");

  const totalItemsCount = watchedDetalles.length;
  const totalCantidad = watchedDetalles.reduce(
    (acc, curr) => acc + (Number(curr.cantidadSolicitada) || 0),
    0
  );

  React.useEffect(() => {
    if (!open) return;

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
  }, [open, isEditing, fullTransferencia, transferenciaToEdit, reset]);

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
      onSuccessCallback?.();
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-6 overflow-hidden">
        {/* Modal Header */}
        <DialogHeader className="pb-3 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xs">
                <GitCompareArrows className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {isEditing
                    ? `Editar Transferencia: ${transferenciaToEdit?.numero}`
                    : "Nueva Transferencia entre Almacenes"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {isEditing
                    ? "Modifica los datos del comprobante y actualiza los artículos a traspasar."
                    : "Registra la solicitud de traslado entre almacenes e ingresa las cantidades requeridas."}
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
          id="transferencia-almacen-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto py-4 space-y-4 pr-1"
        >
          {/* Section 1: General Info */}
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 flex flex-col gap-3.5 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Número de Comprobante */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="numero" className="text-xs font-medium flex items-center gap-1">
                  <Hash className="size-3 text-muted-foreground" />
                  N° Comprobante <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="numero"
                  {...register("numero")}
                  placeholder="TRA-2026-0001"
                  className="h-8 text-xs font-mono"
                />
                {errors.numero && (
                  <span className="text-[10px] text-destructive">
                    {errors.numero.message}
                  </span>
                )}
              </div>

              {/* Fecha y Hora de Solicitud */}
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="fechaSolicitud"
                  className="text-xs font-medium flex items-center gap-1"
                >
                  <Calendar className="size-3 text-muted-foreground" />
                  Fecha y Hora <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fechaSolicitud"
                  type="datetime-local"
                  {...register("fechaSolicitud")}
                  className="h-8 text-xs"
                />
                {errors.fechaSolicitud && (
                  <span className="text-[10px] text-destructive">
                    {errors.fechaSolicitud.message}
                  </span>
                )}
              </div>
            </div>

            {/* Almacén Origen y Destino */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <Warehouse className="size-3 text-muted-foreground" />
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
                  <span className="text-[10px] text-destructive">
                    {errors.almacenOrigenId.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <Warehouse className="size-3 text-primary" />
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
                  <span className="text-[10px] text-destructive">
                    {errors.almacenDestinoId.message}
                  </span>
                )}
              </div>
            </div>

            {/* Observaciones */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="observacion" className="text-xs font-medium">
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
          </div>

          {/* Section 2: Items Table */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="size-3.5 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  2. Detalle de Productos a Transferir
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
                className="h-6.5 text-xs px-2.5 gap-1 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/5 cursor-pointer shadow-2xs"
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
                    <th className="px-2.5 py-1.5 w-28 text-center">Cant. Solicitada *</th>
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
                            No hay productos agregados a la transferencia
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleAddRow}
                            className="h-6.5 text-xs px-2 gap-1 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/5"
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
                                  almacenId={selectedAlmacenOrigenId}
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
                              {...register(`detalles.${idx}.cantidadSolicitada`, {
                                valueAsNumber: true,
                              })}
                              className="h-7 text-xs font-mono text-center"
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

            {/* Totals Summary */}
            <div className="flex flex-wrap items-center justify-between py-1.5 px-3 rounded-lg bg-muted/40 border border-border/40 text-xs font-mono gap-3">
              <div className="flex items-center gap-4 text-muted-foreground text-[11px]">
                <span>
                  Líneas: <strong className="text-foreground font-sans">{totalItemsCount}</strong>
                </span>
                <span>
                  Total Unidades Solicitadas:{" "}
                  <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {totalCantidad.toLocaleString("es-ES")}
                  </strong>
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
            form="transferencia-almacen-form"
            size="sm"
            disabled={isSaving}
            className="h-8 px-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-1.5 cursor-pointer shadow-2xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <span>{isEditing ? "Actualizar Transferencia" : "Guardar Borrador"}</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
