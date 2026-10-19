"use client";

import * as React from "react";
import { useForm, useFieldArray, Controller, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Trash2,
  Copy,
  Package,
  Warehouse,
  Calendar,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
  AlertTriangle,
  Layers,
  FileText,
  Clock,
  Check,
  Hash,
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
import { cn } from "@/lib/utils";

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
import {
  TipoMovimientoInventarioAutocomplete,
  NaturalezaMovimiento,
  useTiposMovimientoInventario,
} from "../../tipo-movimiento-inventario";
import { ProductoAutocomplete, type ProductoResponse } from "../../producto";

interface MovimientoInventarioFormDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly movimientoToEdit?: MovimientoInventarioResponse | null;
  readonly onSuccessCallback?: () => void;
}

const REFERENCIA_SUGGESTIONS = [
  "Factura",
  "Orden de Compra",
  "Guía de Remisión",
  "Ajuste Físico",
  "Merma",
  "Traslado",
  "Venta Directa",
  "Muestras",
  "Devolución",
];

interface ProductMeta {
  codigo?: string;
  unidad?: string;
}

function getNatureConfig(isEntrada: boolean, isSalida: boolean) {
  if (isEntrada) {
    return {
      containerClass:
        "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400",
      badgeClass:
        "text-emerald-700 dark:text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
      label: "Entrada (+ Stock)",
      impactText: "Incrementará existencias en almacén",
      impactColor: "text-emerald-600 dark:text-emerald-400",
    };
  }
  if (isSalida) {
    return {
      containerClass:
        "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400",
      badgeClass:
        "text-amber-700 dark:text-amber-300 border-amber-500/30 bg-amber-500/10",
      label: "Salida (- Stock)",
      impactText: "Descontará existencias del almacén",
      impactColor: "text-amber-600 dark:text-amber-400",
    };
  }
  return {
    containerClass: "bg-primary/10 border-primary/20 text-primary",
    badgeClass: "text-primary border-primary/30 bg-primary/10",
    label: "Movimiento General",
    impactText: "Afectación según tipo de movimiento",
    impactColor: "text-muted-foreground",
  };
}

function MovementHeaderIcon({
  isEntrada,
  isSalida,
}: {
  readonly isEntrada: boolean;
  readonly isSalida: boolean;
}) {
  if (isEntrada) {
    return <ArrowDownLeft className="size-4" />;
  }
  if (isSalida) {
    return <ArrowUpRight className="size-4" />;
  }
  return <ArrowLeftRight className="size-4" />;
}

interface DetalleRowProps {
  readonly index: number;
  readonly control: Control<MovimientoInventarioFormValues>;
  readonly register: ReturnType<typeof useForm<MovimientoInventarioFormValues>>["register"];
  readonly onRemove: () => void;
  readonly onDuplicate: () => void;
  readonly canRemove: boolean;
  readonly isDuplicate: boolean;
  readonly meta?: ProductMeta;
  readonly onProductSelect: (prod: ProductoResponse | null) => void;
}

function DetalleRow({
  index,
  control,
  register,
  onRemove,
  onDuplicate,
  canRemove,
  isDuplicate,
  meta,
  onProductSelect,
}: DetalleRowProps) {
  const detalle = useWatch({
    control,
    name: `detalles.${index}`,
  });

  const cantidad = Number(detalle?.cantidad) || 0;
  const costoUnitario = Number(detalle?.costoUnitario) || 0;
  const subtotal = Math.max(0, cantidad * costoUnitario);

  return (
    <tr
      className={cn(
        "group hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0",
        isDuplicate && "bg-amber-500/5 hover:bg-amber-500/10"
      )}
    >
      {/* Index */}
      <td className="px-2 py-1 text-center text-muted-foreground font-mono text-[11px] w-8">
        <span className="size-4.5 rounded inline-flex items-center justify-center bg-muted/70 text-[10px] font-semibold text-foreground/80">
          {index + 1}
        </span>
      </td>

      {/* Producto */}
      <td className="px-2 py-1 min-w-56">
        <div className="space-y-0.5">
          <Controller
            name={`detalles.${index}.productoId`}
            control={control}
            render={({ field, fieldState }) => (
              <ProductoAutocomplete
                value={field.value}
                onValueChange={(val, prod) => {
                  field.onChange(val || 0);
                  onProductSelect(prod ?? null);
                }}
                error={Boolean(fieldState.error)}
                placeholder="Buscar por código o nombre..."
                className="h-6.5 text-xs"
              />
            )}
          />

          <div className="flex items-center gap-1.5 flex-wrap">
            {meta?.codigo && (
              <span className="font-mono text-[9px] bg-muted px-1 py-0.2 rounded text-muted-foreground font-medium">
                {meta.codigo}
              </span>
            )}
            {meta?.unidad && (
              <span className="font-mono text-[9px] bg-primary/10 text-primary px-1 py-0.2 rounded font-semibold">
                {meta.unidad}
              </span>
            )}
            {isDuplicate && (
              <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-1 py-0.2 rounded">
                <AlertTriangle className="size-2 shrink-0" />
                Duplicado
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Cantidad */}
      <td className="px-2 py-1 w-24">
        <Input
          type="number"
          step="any"
          min="0.01"
          {...register(`detalles.${index}.cantidad`, {
            valueAsNumber: true,
          })}
          placeholder="1"
          className="h-6.5 text-xs font-mono text-center font-semibold px-1 shadow-2xs"
        />
      </td>

      {/* Costo Unitario */}
      <td className="px-2 py-1 w-28">
        <div className="relative flex items-center">
          <span className="absolute left-1.5 text-[10px] text-muted-foreground font-medium pointer-events-none select-none">
            Bs.
          </span>
          <Input
            type="number"
            step="any"
            min="0"
            {...register(`detalles.${index}.costoUnitario`, {
              setValueAs: (v) => (v === "" || v === null ? 0 : Number(v)),
            })}
            placeholder="0.00"
            className="h-6.5 text-xs font-mono text-right pl-6 pr-1.5 shadow-2xs"
          />
        </div>
      </td>

      {/* Subtotal */}
      <td className="px-2 py-1 w-28 text-right">
        <div className="font-mono text-xs font-bold text-foreground tabular-nums whitespace-nowrap">
          Bs.{" "}
          {subtotal.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </td>

      {/* Acciones */}
      <td className="px-1.5 py-1 text-center w-14">
        <div className="flex items-center justify-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDuplicate}
            title="Duplicar fila"
            className="size-6 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer transition-colors rounded"
          >
            <Copy className="size-3" />
            <span className="sr-only">Duplicar</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            disabled={!canRemove}
            title={canRemove ? "Eliminar fila" : "Mínimo 1 fila requerida"}
            className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded"
          >
            <Trash2 className="size-3" />
            <span className="sr-only">Eliminar</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function MovimientoInventarioFormDialog({
  open,
  onOpenChange,
  movimientoToEdit,
  onSuccessCallback,
}: MovimientoInventarioFormDialogProps) {
  const isEditing = Boolean(movimientoToEdit);

  const { data: fullMovimiento, isLoading: isLoadingFull } =
    useMovimientoInventario(movimientoToEdit?.id ?? 0, open && isEditing);

  const createMutation = useCreateMovimientoInventario();
  const updateMutation = useUpdateMovimientoInventario();

  const { data: tiposData } = useTiposMovimientoInventario({
    pageSize: 150,
  });

  const [productMetaMap, setProductMetaMap] = React.useState<
    Record<number, ProductMeta>
  >({});

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MovimientoInventarioFormValues>({
    resolver: zodResolver(movimientoInventarioSchema),
    defaultValues: {
      tipoMovimientoInventarioId: 0,
      almacenId: 0,
      fechaMovimiento: new Date().toISOString().slice(0, 16),
      referenciaTipo: "",
      referenciaId: null,
      observacion: "",
      detalles: [],
    },
  });

  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: "detalles",
  });

  const watchedTipoId = useWatch({
    control,
    name: "tipoMovimientoInventarioId",
  });

  const selectedTipoInfo = React.useMemo(() => {
    if (!watchedTipoId || Number(watchedTipoId) <= 0) return null;
    return tiposData?.items?.find((t) => t.id === Number(watchedTipoId)) ?? null;
  }, [tiposData, watchedTipoId]);

  const rawDetalles = useWatch({
    control,
    name: "detalles",
  });
  const watchedDetalles = React.useMemo(() => rawDetalles ?? [], [rawDetalles]);

  // Totals calculations
  const totalItemsCount = watchedDetalles.length;
  const totalCantidad = watchedDetalles.reduce(
    (acc, curr) => acc + (Number(curr?.cantidad) || 0),
    0
  );
  const totalCosto = watchedDetalles.reduce((acc, curr) => {
    const qty = Number(curr?.cantidad) || 0;
    const cost = Number(curr?.costoUnitario) || 0;
    return acc + Math.max(0, qty * cost);
  }, 0);

  // Duplicate product IDs
  const duplicateProductIds = React.useMemo(() => {
    const counts = new Map<number, number>();
    for (const d of watchedDetalles) {
      const pid = Number(d?.productoId);
      if (pid > 0) {
        counts.set(pid, (counts.get(pid) || 0) + 1);
      }
    }
    const duplicates = new Set<number>();
    counts.forEach((count, pid) => {
      if (count > 1) duplicates.add(pid);
    });
    return duplicates;
  }, [watchedDetalles]);

  const hasDuplicates = duplicateProductIds.size > 0;

  // Sync initial form values
  React.useEffect(() => {
    if (!open) return;

    if (isEditing) {
      const target = fullMovimiento || movimientoToEdit;
      if (target) {
        const formattedDate = target.fechaMovimiento
          ? new Date(target.fechaMovimiento).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16);

        reset({
          tipoMovimientoInventarioId: target.tipoMovimientoInventarioId,
          almacenId: target.almacenId,
          fechaMovimiento: formattedDate,
          referenciaTipo: target.referenciaTipo || "",
          referenciaId: target.referenciaId || null,
          observacion: target.observacion || "",
          detalles: (target.detalles || []).map((d) => ({
            productoId: d.productoId,
            productoNombre: d.productoNombre || "",
            cantidad: Number(d.cantidad),
            costoUnitario:
              d.costoUnitario !== null && d.costoUnitario !== undefined
                ? Number(d.costoUnitario)
                : 0,
          })),
        });
      }
    } else {
      reset({
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
      cantidad: 1,
      costoUnitario: 0,
    });
  };

  const handleDuplicateRow = (idx: number) => {
    const item = watchedDetalles[idx];
    if (item) {
      insert(idx + 1, {
        productoId: item.productoId,
        productoNombre: item.productoNombre,
        cantidad: item.cantidad,
        costoUnitario: item.costoUnitario,
      });
    }
  };

  const handleClearAllRows = () => {
    reset((prev) => ({
      ...prev,
      detalles: [
        {
          productoId: 0,
          productoNombre: "",
          cantidad: 1,
          costoUnitario: 0,
        },
      ],
    }));
  };

  const handleSetCurrentDateTime = () => {
    setValue("fechaMovimiento", new Date().toISOString().slice(0, 16), {
      shouldValidate: true,
    });
  };

  const handleProductSelect = (
    index: number,
    prod: ProductoResponse | null
  ) => {
    if (prod) {
      setValue(`detalles.${index}.productoNombre`, prod.nombre);

      if (
        prod.ultimoCostoUnitario !== undefined &&
        prod.ultimoCostoUnitario !== null &&
        Number(prod.ultimoCostoUnitario) > 0
      ) {
        setValue(
          `detalles.${index}.costoUnitario`,
          Number(prod.ultimoCostoUnitario),
          { shouldValidate: true }
        );
      }

      setProductMetaMap((prev) => ({
        ...prev,
        [prod.id]: {
          codigo: prod.codigo,
          unidad: prod.unidadMedidaSimbolo || undefined,
        },
      }));
    } else {
      setValue(`detalles.${index}.productoNombre`, "");
      setValue(`detalles.${index}.costoUnitario`, 0, { shouldValidate: true });
    }
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

    const hasInvalidQuantity = values.detalles.some(
      (d) => !d.cantidad || Number(d.cantidad) <= 0
    );
    if (hasInvalidQuantity) {
      toast.error("La cantidad de todos los productos debe ser mayor a 0.");
      return;
    }

    const payload = {
      tipoMovimientoInventarioId: Number(values.tipoMovimientoInventarioId),
      almacenId: Number(values.almacenId),
      fechaMovimiento: new Date(values.fechaMovimiento).toISOString(),
      referenciaTipo: values.referenciaTipo?.trim() || null,
      referenciaId: values.referenciaId ? Number(values.referenciaId) : null,
      observacion: values.observacion?.trim() || null,
      detalles: values.detalles.map((d) => ({
        productoId: Number(d.productoId),
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
        toast.success(
          `Movimiento "${movimientoToEdit.numero}" actualizado correctamente.`
        );
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Movimiento guardado exitosamente como borrador.");
      }
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; detail?: string } };
        message?: string;
      };
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Ocurrió un error al procesar el movimiento de inventario.";
      toast.error(errorMsg);
    }
  };

  const isSaving =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  const isEntrada =
    selectedTipoInfo?.naturaleza === NaturalezaMovimiento.Entrada;
  const isSalida =
    selectedTipoInfo?.naturaleza === NaturalezaMovimiento.Salida;

  const natureConfig = getNatureConfig(isEntrada, isSalida);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[92vh] flex flex-col p-3.5 sm:p-4.5 overflow-hidden gap-0">
        {/* Compact Header */}
        <DialogHeader className="pb-2.5 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "size-8 rounded-lg flex items-center justify-center shrink-0 border shadow-2xs transition-colors",
                  natureConfig.containerClass
                )}
              >
                <MovementHeaderIcon isEntrada={isEntrada} isSalida={isSalida} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
                    {isEditing
                      ? "Editar Movimiento de Inventario"
                      : "Nuevo Movimiento de Inventario"}
                  </DialogTitle>
                  {isEditing && movimientoToEdit?.numero && (
                    <Badge
                      variant="secondary"
                      className="font-mono text-[10px] font-semibold px-1.5 py-0.2"
                    >
                      {movimientoToEdit.numero}
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-[11px] text-muted-foreground leading-none pt-0.5">
                  {isEditing
                    ? "Modifica datos de cabecera y líneas del comprobante."
                    : "Registra cabecera y artículos para el kardex del almacén."}
                </DialogDescription>
              </div>
            </div>

            {/* Badges de naturaleza y estado */}
            <div className="flex items-center gap-1.5 shrink-0">
              {selectedTipoInfo && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] h-5 px-2 font-semibold gap-1 border",
                    natureConfig.badgeClass
                  )}
                >
                  {isEntrada && <ArrowDownLeft className="size-2.5" />}
                  {isSalida && <ArrowUpRight className="size-2.5" />}
                  <span>{natureConfig.label}</span>
                </Badge>
              )}

              <Badge
                variant="outline"
                className="text-[10px] h-5 px-2 font-medium text-slate-700 dark:text-slate-300 border-slate-500/30 bg-slate-500/10 gap-1"
              >
                <Clock className="size-2.5 text-slate-500" />
                <span>Borrador</span>
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Compact Form Body */}
        <form
          id="movimiento-inventario-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto py-2.5 space-y-2.5 pr-0.5 text-xs"
        >
          {/* Section 1: Cabecera Compacta */}
          <div className="p-2.5 rounded-lg bg-card border border-border/70 flex flex-col gap-2 shadow-2xs">
            <div className="flex items-center justify-between pb-0.5 border-b border-border/30">
              <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider flex items-center gap-1">
                <Layers className="size-3 text-primary" />
                1. Datos Generales y Almacén
              </span>
              <span className="text-[10px] text-muted-foreground">
                <span className="text-destructive font-bold">*</span> Obligatorios
              </span>
            </div>

            {/* Fila 1: Tipo, Almacén, Fecha */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Tipo de Movimiento */}
              <div className="space-y-0.5">
                <Label
                  htmlFor="tipoMovimientoInventarioId"
                  className="text-[11px] font-medium leading-none flex items-center gap-0.5"
                >
                  Tipo Movimiento <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="tipoMovimientoInventarioId"
                  control={control}
                  render={({ field }) => (
                    <TipoMovimientoInventarioAutocomplete
                      id="tipoMovimientoInventarioId"
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val || 0);
                      }}
                      error={Boolean(errors.tipoMovimientoInventarioId)}
                      placeholder="Seleccionar tipo..."
                      className="h-7 text-xs"
                    />
                  )}
                />
                {errors.tipoMovimientoInventarioId && (
                  <span className="text-[10px] text-destructive leading-none block">
                    {errors.tipoMovimientoInventarioId.message}
                  </span>
                )}
              </div>

              {/* Almacén */}
              <div className="space-y-0.5">
                <Label
                  htmlFor="almacenId"
                  className="text-[11px] font-medium leading-none flex items-center gap-1"
                >
                  <Warehouse className="size-2.5 text-muted-foreground" />
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
                      className="h-7 text-xs"
                    />
                  )}
                />
                {errors.almacenId && (
                  <span className="text-[10px] text-destructive leading-none block">
                    {errors.almacenId.message}
                  </span>
                )}
              </div>

              {/* Fecha y Hora */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between leading-none">
                  <Label
                    htmlFor="fechaMovimiento"
                    className="text-[11px] font-medium flex items-center gap-1"
                  >
                    <Calendar className="size-2.5 text-muted-foreground" />
                    Fecha / Hora <span className="text-destructive">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={handleSetCurrentDateTime}
                    className="text-[10px] text-primary hover:underline cursor-pointer"
                  >
                    Ahora
                  </button>
                </div>
                <Input
                  id="fechaMovimiento"
                  type="datetime-local"
                  {...register("fechaMovimiento")}
                  className={cn(
                    "h-7 text-xs bg-background/50",
                    errors.fechaMovimiento && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.fechaMovimiento && (
                  <span className="text-[10px] text-destructive leading-none block">
                    {errors.fechaMovimiento.message}
                  </span>
                )}
              </div>
            </div>

            {/* Fila 2: Referencia Tipo, N° Referencia, y Observación */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-0.5">
                <Label
                  htmlFor="referenciaTipo"
                  className="text-[11px] font-medium leading-none flex items-center gap-1"
                >
                  <FileText className="size-2.5 text-muted-foreground" />
                  Doc. Referencia
                </Label>
                <Input
                  id="referenciaTipo"
                  list="referencia-compact-list"
                  {...register("referenciaTipo")}
                  placeholder="Ej. Factura, Ajuste..."
                  className="h-7 text-xs bg-background/50"
                />
                <datalist id="referencia-compact-list">
                  {REFERENCIA_SUGGESTIONS.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-0.5">
                <Label
                  htmlFor="referenciaId"
                  className="text-[11px] font-medium leading-none flex items-center gap-1"
                >
                  <Hash className="size-2.5 text-muted-foreground" />
                  N° Folio / ID
                </Label>
                <Input
                  id="referenciaId"
                  type="number"
                  {...register("referenciaId", {
                    setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
                  })}
                  placeholder="Ej. 1042"
                  className="h-7 text-xs font-mono bg-background/50"
                />
              </div>

              <div className="space-y-0.5">
                <Label
                  htmlFor="observacion"
                  className="text-[11px] font-medium leading-none"
                >
                  Observación / Justificación
                </Label>
                <Input
                  id="observacion"
                  {...register("observacion")}
                  placeholder="Motivo o justificación técnica..."
                  className="h-7 text-xs bg-background/50"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Items Table Compact */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="size-3.5 text-primary" />
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  2. Artículos del Movimiento
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] h-4.5 px-1.5 font-mono font-medium"
                >
                  {totalItemsCount} {totalItemsCount === 1 ? "artículo" : "artículos"}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5">
                {fields.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleClearAllRows}
                    className="h-6 text-[11px] px-1.5 text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    Reiniciar
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddRow}
                  className="h-6 text-[11px] px-2 gap-1 text-primary border-primary/30 hover:bg-primary/5 cursor-pointer shadow-2xs font-medium"
                >
                  <Plus className="size-3" />
                  <span>Agregar Producto</span>
                </Button>
              </div>
            </div>

            {/* Alert if duplicates */}
            {hasDuplicates && (
              <div className="p-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="size-3 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  Hay productos duplicados en la lista. Se sugiere consolidar cantidades.
                </span>
              </div>
            )}

            {/* Form Error in Detalles */}
            {errors.detalles && typeof errors.detalles.message === "string" && (
              <div className="p-1.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-[11px] flex items-center gap-1.5">
                <AlertCircle className="size-3 shrink-0" />
                <span>{errors.detalles.message}</span>
              </div>
            )}

            {/* Compact Table */}
            <div className="rounded-lg border border-border/70 overflow-hidden bg-card shadow-2xs">
              <div className="overflow-x-auto max-h-[36vh]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur-xs">
                    <tr className="border-b border-border/70 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">
                      <th className="px-2 py-1 w-8 text-center">#</th>
                      <th className="px-2 py-1 min-w-56">Producto *</th>
                      <th className="px-2 py-1 w-24 text-center">Cantidad *</th>
                      <th className="px-2 py-1 w-28 text-right">Costo Unit. (Bs.)</th>
                      <th className="px-2 py-1 w-28 text-right">Subtotal (Bs.)</th>
                      <th className="px-1.5 py-1 w-14 text-center">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {isEditing && isLoadingFull && !fullMovimiento ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-6 text-center text-muted-foreground text-xs"
                        >
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <Loader2 className="size-5 animate-spin text-primary" />
                            <span className="font-medium text-xs">
                              Cargando artículos...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : fields.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-4 text-center text-muted-foreground text-xs"
                        >
                          <div className="flex flex-col items-center justify-center gap-1">
                            <FileSpreadsheet className="size-5 text-muted-foreground/60" />
                            <span className="font-medium text-[11px]">
                              No hay artículos registrados
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={handleAddRow}
                              className="h-6 text-[11px] px-2 gap-1 text-primary border-primary/30"
                            >
                              <Plus className="size-3" />
                              <span>Agregar Producto</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      fields.map((field, idx) => {
                        const currentProdId = Number(watchedDetalles[idx]?.productoId);
                        const isDup = Boolean(
                          currentProdId > 0 && duplicateProductIds.has(currentProdId)
                        );
                        const meta = currentProdId > 0 ? productMetaMap[currentProdId] : undefined;

                        return (
                          <DetalleRow
                            key={field.id}
                            index={idx}
                            control={control}
                            register={register}
                            onRemove={() => remove(idx)}
                            onDuplicate={() => handleDuplicateRow(idx)}
                            canRemove={fields.length > 1}
                            isDuplicate={isDup}
                            meta={meta}
                            onProductSelect={(prod) => handleProductSelect(idx, prod)}
                          />
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Single Unified Compact Summary Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/50 text-xs">
              <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                <span>
                  Líneas: <strong className="text-foreground">{totalItemsCount}</strong>
                </span>
                <span>•</span>
                <span>
                  Unidades:{" "}
                  <strong className="text-primary font-mono font-semibold">
                    {totalCantidad.toLocaleString("es-ES")}
                  </strong>
                </span>
                <span>•</span>
                <span className={cn("font-medium", natureConfig.impactColor)}>
                  {natureConfig.impactText}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Total Estimado:</span>
                <span className="text-sm font-bold text-primary font-mono tabular-nums">
                  Bs.{" "}
                  {totalCosto.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </form>

        {/* Compact Footer */}
        <DialogFooter className="pt-2 border-t border-border/40 shrink-0 flex flex-row items-center justify-between sm:justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="h-7.5 px-3 text-xs cursor-pointer"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            form="movimiento-inventario-form"
            size="sm"
            disabled={isSaving || fields.length === 0}
            className="h-7.5 px-3.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-1.5 cursor-pointer shadow-2xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Check className="size-3" />
                <span>{isEditing ? "Actualizar" : "Guardar Borrador"}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
