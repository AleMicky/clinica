"use client";

import * as React from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  useWatch,
  type Control,
} from "react-hook-form";
import { toast } from "sonner";
import {
  Pill,
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
  User,
  Stethoscope,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
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
import { cn, formatDate } from "@/lib/utils";

import {
  useCreateDispensacion,
  useMedicamentosStock,
} from "../hooks/use-dispensacion";
import { MedicamentoAutocomplete } from "./medicamento-autocomplete";
import { useAlmacenes } from "@/modules/almacenes/almacen/hooks/use-almacen";
import { usePacientes } from "@/modules/recepcion/pacientes/hooks/use-pacientes";
import { useMedicos } from "@/modules/recursos-humanos/medico";
import type {
  CreateDispensacionRequest,
  TipoDispensacion,
  MedicamentoStockResponse,
} from "../types/dispensacion.types";

interface DispensacionFormDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccessCallback?: () => void;
}

interface FormDetalle {
  productoId: number;
  partidaInventarioId?: number;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  indicaciones?: string;
}

interface FormValues {
  tipo: TipoDispensacion;
  almacenId: number;
  isWalkIn: boolean;
  pacienteId?: number;
  clienteNombre?: string;
  clienteDocumento?: string;
  medicoId?: number;
  observaciones?: string;
  detalles: FormDetalle[];
}

interface DetalleRowProps {
  readonly index: number;
  readonly control: Control<FormValues>;
  readonly register: ReturnType<typeof useForm<FormValues>>["register"];
  readonly setValue: ReturnType<typeof useForm<FormValues>>["setValue"];
  readonly onRemove: () => void;
  readonly onDuplicate: () => void;
  readonly canRemove: boolean;
  readonly isDuplicate: boolean;
  readonly almacenId: number;
  readonly stockMedicamentos: MedicamentoStockResponse[];
}

function DetalleRow({
  index,
  almacenId,
  control,
  register,
  setValue,
  onRemove,
  onDuplicate,
  canRemove,
  isDuplicate,
  stockMedicamentos,
}: DetalleRowProps) {
  const detalle = useWatch({
    control,
    name: `detalles.${index}`,
  });

  const currentProductoId = Number(detalle?.productoId) || 0;
  const cantidad = Number(detalle?.cantidad) || 0;
  const precioUnitario = Number(detalle?.precioUnitario) || 0;
  const descuento = Number(detalle?.descuento) || 0;
  const subtotal = Math.max(0, cantidad * precioUnitario - descuento);

  // Medicamento metadata
  const selectedMed = React.useMemo(() => {
    return stockMedicamentos.find((m) => m.productoId === currentProductoId) ?? null;
  }, [stockMedicamentos, currentProductoId]);

  const lotes = selectedMed?.lotes ?? [];
  const stockDisponible = selectedMed?.stockDisponible ?? 0;
  const isOutOfStock = stockDisponible > 0 && cantidad > stockDisponible;

  const handleMedicineChange = (med: MedicamentoStockResponse | null) => {
    if (!med) {
      setValue(`detalles.${index}.productoId`, 0);
      setValue(`detalles.${index}.partidaInventarioId`, undefined);
      setValue(`detalles.${index}.precioUnitario`, 0);
      setValue(`detalles.${index}.descuento`, 0);
      return;
    }

    setValue(`detalles.${index}.productoId`, med.productoId);
    setValue(`detalles.${index}.precioUnitario`, med.precioReferencial);
    setValue(`detalles.${index}.descuento`, 0);

    // Pick first available lot
    const lot = med.lotes[0];
    setValue(`detalles.${index}.partidaInventarioId`, lot?.partidaInventarioId);
  };

  return (
    <tr
      className={cn(
        "group hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0",
        isDuplicate && "bg-amber-500/5 hover:bg-amber-500/10",
        isOutOfStock && "bg-destructive/5 hover:bg-destructive/10"
      )}
    >
      {/* Index */}
      <td className="px-2 py-1 text-center text-muted-foreground font-mono text-[11px] w-8">
        <span className="size-4.5 rounded inline-flex items-center justify-center bg-muted/70 text-[10px] font-semibold text-foreground/80">
          {index + 1}
        </span>
      </td>

      {/* Producto Selector con Autocomplete y Paginado */}
      <td className="px-2 py-1 min-w-64">
        <div className="space-y-0.5">
          <Controller
            name={`detalles.${index}.productoId`}
            control={control}
            render={({ field, fieldState }) => (
              <MedicamentoAutocomplete
                almacenId={almacenId}
                value={field.value}
                onValueChange={(val, med) => {
                  field.onChange(val || 0);
                  handleMedicineChange(med ?? null);
                }}
                error={Boolean(fieldState.error)}
                placeholder="Buscar por código, nombre..."
                className="h-6.5 text-xs"
              />
            )}
          />

          {/* Badges metadata */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {selectedMed?.codigo && (
              <span className="font-mono text-[9px] bg-muted px-1 py-0.2 rounded text-muted-foreground font-medium">
                {selectedMed.codigo}
              </span>
            )}
            {selectedMed?.categoria && (
              <span className="font-mono text-[9px] bg-teal-500/10 text-teal-700 dark:text-teal-300 px-1 py-0.2 rounded font-semibold">
                {selectedMed.categoria}
              </span>
            )}
            {selectedMed?.unidadMedida && (
              <span className="font-mono text-[9px] bg-primary/10 text-primary px-1 py-0.2 rounded font-semibold">
                {selectedMed.unidadMedida}
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

      {/* Lote / Vencimiento */}
      <td className="px-2 py-1 min-w-36">
        {lotes.length > 0 ? (
          <select
            {...register(`detalles.${index}.partidaInventarioId`, {
              setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)),
            })}
            className="w-full h-6.5 text-[11px] px-1.5 rounded-md border border-border/60 bg-background font-mono shadow-2xs"
          >
            {lotes.map((lt) => (
              <option key={lt.partidaInventarioId} value={lt.partidaInventarioId}>
                {lt.lote || "LOTE-S/N"} {lt.fechaVencimiento ? `(Vcto: ${formatDate(lt.fechaVencimiento)})` : ""} [Disp: {lt.cantidadDisponible}]
              </option>
            ))}
          </select>
        ) : (
          <span className="text-[10px] text-muted-foreground italic">
            {currentProductoId ? "Sin lotes reg." : "—"}
          </span>
        )}
      </td>

      {/* Stock Disponible */}
      <td className="px-2 py-1 w-20 text-center">
        <Badge
          variant="outline"
          className={cn(
            "font-mono text-[10px] px-1.5 py-0.2 font-semibold tabular-nums border",
            stockDisponible > 10
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
              : stockDisponible > 0
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
              : "bg-destructive/10 text-destructive border-destructive/30"
          )}
        >
          {stockDisponible}
        </Badge>
      </td>

      {/* Cantidad */}
      <td className="px-2 py-1 w-22">
        <div className="relative">
          <Input
            type="number"
            step="any"
            min="1"
            max={stockDisponible > 0 ? stockDisponible : undefined}
            {...register(`detalles.${index}.cantidad`, {
              valueAsNumber: true,
            })}
            placeholder="1"
            className={cn(
              "h-6.5 text-xs font-mono text-center font-semibold px-1 shadow-2xs",
              isOutOfStock && "border-destructive text-destructive font-bold focus-visible:ring-destructive"
            )}
          />
        </div>
      </td>

      {/* Precio Unitario */}
      <td className="px-2 py-1 w-24">
        <div className="relative flex items-center">
          <span className="absolute left-1.5 text-[10px] text-muted-foreground font-medium pointer-events-none select-none">
            Bs.
          </span>
          <Input
            type="number"
            step="0.01"
            min="0"
            {...register(`detalles.${index}.precioUnitario`, {
              setValueAs: (v) => (v === "" || v === null ? 0 : Number(v)),
            })}
            placeholder="0.00"
            className="h-6.5 text-xs font-mono text-right pl-6 pr-1.5 shadow-2xs font-medium"
          />
        </div>
      </td>

      {/* Descuento */}
      <td className="px-2 py-1 w-22">
        <div className="relative flex items-center">
          <span className="absolute left-1.5 text-[10px] text-muted-foreground font-medium pointer-events-none select-none">
            Bs.
          </span>
          <Input
            type="number"
            step="0.01"
            min="0"
            {...register(`detalles.${index}.descuento`, {
              setValueAs: (v) => (v === "" || v === null ? 0 : Number(v)),
            })}
            placeholder="0.00"
            className="h-6.5 text-xs font-mono text-right pl-6 pr-1.5 shadow-2xs text-muted-foreground"
          />
        </div>
      </td>

      {/* Subtotal */}
      <td className="px-2 py-1 w-26 text-right">
        <div className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 tabular-nums whitespace-nowrap">
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
            className="size-6 text-muted-foreground hover:text-teal-600 hover:bg-teal-500/10 cursor-pointer transition-colors rounded"
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

export function DispensacionFormDialog({
  open,
  onOpenChange,
  onSuccessCallback,
}: DispensacionFormDialogProps) {
  const { data: almacenesData } = useAlmacenes({ pageSize: 50 });
  const almacenes = almacenesData?.items ?? [];

  // Default to Farmacia Central if exists
  const defaultAlmacenId = React.useMemo(() => {
    const farm = almacenes.find((a) => a.codigo === "ALM-FARM");
    return farm?.id || (almacenes[0]?.id ?? 0);
  }, [almacenes]);

  const { data: pacientesData } = usePacientes({ pageSize: 100 });
  const pacientes = pacientesData?.items ?? [];

  const { data: medicosData } = useMedicos({ pageSize: 100 });
  const medicos = medicosData?.items ?? [];

  const createMutation = useCreateDispensacion();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      tipo: "VentaAmbulatoria",
      almacenId: defaultAlmacenId,
      isWalkIn: true,
      clienteNombre: "",
      clienteDocumento: "",
      observaciones: "",
      detalles: [
        {
          productoId: 0,
          cantidad: 1,
          precioUnitario: 0,
          descuento: 0,
        },
      ],
    },
  });

  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: "detalles",
  });

  const selectedAlmacenId = watch("almacenId") || defaultAlmacenId;
  const isWalkIn = watch("isWalkIn");
  const selectedTipo = watch("tipo");
  const rawDetalles = useWatch({
    control,
    name: "detalles",
  });
  const watchedDetalles = React.useMemo(() => rawDetalles ?? [], [rawDetalles]);

  // Fetch medicines in the selected warehouse
  const { data: stockMedicamentos = [], isLoading: loadingStock } =
    useMedicamentosStock(selectedAlmacenId);

  // Set default warehouse when list loads
  React.useEffect(() => {
    if (defaultAlmacenId && !watch("almacenId")) {
      setValue("almacenId", defaultAlmacenId);
    }
  }, [defaultAlmacenId, setValue, watch]);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      reset({
        tipo: "VentaAmbulatoria",
        almacenId: defaultAlmacenId,
        isWalkIn: true,
        clienteNombre: "",
        clienteDocumento: "",
        observaciones: "",
        detalles: [
          {
            productoId: 0,
            cantidad: 1,
            precioUnitario: 0,
            descuento: 0,
          },
        ],
      });
    }
  }, [open, defaultAlmacenId, reset]);

  // Totals calculations
  const totalItemsCount = watchedDetalles.length;
  const totalCantidad = watchedDetalles.reduce(
    (acc, curr) => acc + (Number(curr?.cantidad) || 0),
    0
  );
  const totalDescuento = watchedDetalles.reduce(
    (acc, curr) => acc + (Number(curr?.descuento) || 0),
    0
  );
  const calculatedTotal = React.useMemo(() => {
    return watchedDetalles.reduce((acc, curr) => {
      const cant = Number(curr?.cantidad) || 0;
      const precio = Number(curr?.precioUnitario) || 0;
      const desc = Number(curr?.descuento) || 0;
      return acc + Math.max(0, cant * precio - desc);
    }, 0);
  }, [watchedDetalles]);

  // Duplicate product IDs check
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

  const handleAddMedicineQuick = (productoId: number) => {
    const med = stockMedicamentos.find((m) => m.productoId === productoId);
    if (!med) return;

    // Pick first available lot
    const lot = med.lotes[0];

    // If first row is empty, replace it
    if (fields.length === 1 && (!watchedDetalles[0]?.productoId || watchedDetalles[0]?.productoId === 0)) {
      setValue("detalles.0.productoId", med.productoId);
      setValue("detalles.0.partidaInventarioId", lot?.partidaInventarioId);
      setValue("detalles.0.cantidad", 1);
      setValue("detalles.0.precioUnitario", med.precioReferencial);
      setValue("detalles.0.descuento", 0);
      return;
    }

    append({
      productoId: med.productoId,
      partidaInventarioId: lot?.partidaInventarioId,
      cantidad: 1,
      precioUnitario: med.precioReferencial,
      descuento: 0,
      indicaciones: "",
    });
  };

  const handleAddRow = () => {
    append({
      productoId: 0,
      cantidad: 1,
      precioUnitario: 0,
      descuento: 0,
    });
  };

  const handleDuplicateRow = (idx: number) => {
    const item = watchedDetalles[idx];
    if (item) {
      insert(idx + 1, {
        productoId: item.productoId,
        partidaInventarioId: item.partidaInventarioId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        descuento: item.descuento,
        indicaciones: item.indicaciones,
      });
    }
  };

  const handleClearAllRows = () => {
    reset((prev) => ({
      ...prev,
      detalles: [
        {
          productoId: 0,
          cantidad: 1,
          precioUnitario: 0,
          descuento: 0,
        },
      ],
    }));
  };

  const onSubmit = async (values: FormValues) => {
    if (values.detalles.length === 0) {
      toast.error("Debe agregar al menos un medicamento a la orden.");
      return;
    }

    const hasInvalidMedicines = values.detalles.some(
      (d) => !d.productoId || Number(d.productoId) <= 0
    );
    if (hasInvalidMedicines) {
      toast.error("Por favor seleccione un medicamento válido en cada fila.");
      return;
    }

    const hasInvalidQuantity = values.detalles.some(
      (d) => !d.cantidad || Number(d.cantidad) <= 0
    );
    if (hasInvalidQuantity) {
      toast.error("La cantidad de todos los medicamentos debe ser mayor a 0.");
      return;
    }

    try {
      const payload: CreateDispensacionRequest = {
        tipo: values.tipo,
        almacenId: Number(values.almacenId),
        pacienteId: !values.isWalkIn && values.pacienteId ? Number(values.pacienteId) : undefined,
        clienteNombre: values.isWalkIn ? values.clienteNombre?.trim() : undefined,
        clienteDocumento: values.isWalkIn ? values.clienteDocumento?.trim() : undefined,
        medicoId: values.medicoId ? Number(values.medicoId) : undefined,
        observaciones: values.observaciones?.trim(),
        detalles: values.detalles.map((d) => ({
          productoId: Number(d.productoId),
          partidaInventarioId: d.partidaInventarioId ? Number(d.partidaInventarioId) : undefined,
          cantidad: Number(d.cantidad),
          precioUnitario: Number(d.precioUnitario),
          descuento: Number(d.descuento || 0),
          indicaciones: d.indicaciones?.trim(),
        })),
      };

      const res = await createMutation.mutateAsync(payload);
      toast.success(
        `Dispensación "${res.numero}" emitida exitosamente. Pase el ticket para cobro en Caja.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al emitir la orden de farmacia.";
      toast.error(errorMsg);
    }
  };

  const isSaving = createMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[92vh] flex flex-col p-3.5 sm:p-4.5 overflow-hidden gap-0">
        {/* Compact Header */}
        <DialogHeader className="pb-2.5 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg flex items-center justify-center shrink-0 border shadow-2xs transition-colors bg-teal-500/10 border-teal-500/25 text-teal-600 dark:text-teal-400">
                <Pill className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
                    Nueva Orden de Venta / Dispensación de Farmacia
                  </DialogTitle>
                </div>
                <DialogDescription className="text-[11px] text-muted-foreground leading-none pt-0.5">
                  Venta de mostrador (sin médico requerido) o dispensación por receta médica con control FEFO y cobro en Caja.
                </DialogDescription>
              </div>
            </div>

            {/* Badges de Tipo y Estado */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge
                variant="outline"
                className="text-[10px] h-5 px-2 font-semibold text-teal-700 dark:text-teal-300 border-teal-500/30 bg-teal-500/10 gap-1"
              >
                <ShoppingBag className="size-2.5" />
                <span>
                  {selectedTipo === "VentaAmbulatoria"
                    ? "Venta Mostrador"
                    : selectedTipo === "Hospitalaria"
                    ? "Hospitalaria"
                    : "Urgencia"}
                </span>
              </Badge>

              <Badge
                variant="outline"
                className="text-[10px] h-5 px-2 font-medium text-amber-700 dark:text-amber-300 border-amber-500/30 bg-amber-500/10 gap-1"
              >
                <Clock className="size-2.5" />
                <span>Pendiente Pago</span>
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Compact Form Body */}
        <form
          id="dispensacion-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto py-2.5 space-y-2.5 pr-0.5 text-xs"
        >
          {/* Section 1: Cabecera Compacta */}
          <div className="p-2.5 rounded-lg bg-card border border-border/70 flex flex-col gap-2 shadow-2xs">
            <div className="flex items-center justify-between pb-0.5 border-b border-border/30">
              <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider flex items-center gap-1">
                <Layers className="size-3 text-teal-600" />
                1. Datos de Emisión y Destinatario
              </span>
              <span className="text-[10px] text-muted-foreground">
                <span className="text-destructive font-bold">*</span> Obligatorios
              </span>
            </div>

            {/* Fila 1: Almacén, Tipo y Modalidad de Paciente */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Almacén */}
              <div className="space-y-0.5">
                <Label
                  htmlFor="almacenId"
                  className="text-[11px] font-medium leading-none flex items-center gap-1"
                >
                  <Warehouse className="size-2.5 text-muted-foreground" />
                  Almacén Emisor (Farmacia) <span className="text-destructive">*</span>
                </Label>
                <select
                  id="almacenId"
                  {...register("almacenId", { valueAsNumber: true })}
                  className="w-full h-7 px-2 text-xs rounded-md border border-border/60 bg-background text-foreground shadow-2xs"
                >
                  {almacenes.map((alm) => (
                    <option key={alm.id} value={alm.id}>
                      {alm.nombre} ({alm.codigo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Dispensación */}
              <div className="space-y-0.5">
                <Label
                  htmlFor="tipo"
                  className="text-[11px] font-medium leading-none flex items-center gap-1"
                >
                  <FileText className="size-2.5 text-muted-foreground" />
                  Tipo de Dispensación <span className="text-destructive">*</span>
                </Label>
                <select
                  id="tipo"
                  {...register("tipo")}
                  className="w-full h-7 px-2 text-xs rounded-md border border-border/60 bg-background text-foreground shadow-2xs"
                >
                  <option value="VentaAmbulatoria">Venta Mostrador (Ticket a Caja)</option>
                  <option value="Hospitalaria">Hospitalización (Cargo Internación)</option>
                  <option value="Urgencia">Urgencias (Atención Inmediata)</option>
                </select>
              </div>

              {/* Selector Modo: Particular vs Registrado */}
              <div className="space-y-0.5">
                <Label className="text-[11px] font-medium leading-none flex items-center gap-1">
                  <User className="size-2.5 text-muted-foreground" />
                  Modalidad de Cliente
                </Label>
                <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-md border border-border/50 h-7">
                  <button
                    type="button"
                    onClick={() => setValue("isWalkIn", true)}
                    className={cn(
                      "flex-1 h-5.5 text-[10px] rounded font-medium transition-colors cursor-pointer",
                      isWalkIn
                        ? "bg-background text-foreground font-semibold shadow-2xs border border-border/40"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Particular / Mostrador
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("isWalkIn", false)}
                    className={cn(
                      "flex-1 h-5.5 text-[10px] rounded font-medium transition-colors cursor-pointer",
                      !isWalkIn
                        ? "bg-background text-foreground font-semibold shadow-2xs border border-border/40"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Paciente con HC
                  </button>
                </div>
              </div>
            </div>

            {/* Fila 2: Datos de Cliente, Médico y Observaciones */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {isWalkIn ? (
                <>
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="clienteNombre"
                      className="text-[11px] font-medium leading-none flex items-center gap-1"
                    >
                      Nombre Cliente (Opcional)
                    </Label>
                    <Input
                      id="clienteNombre"
                      {...register("clienteNombre")}
                      placeholder="Ej. Juan Pérez (o Venta Mostrador)"
                      className="h-7 text-xs bg-background/50 shadow-2xs"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <Label
                      htmlFor="clienteDocumento"
                      className="text-[11px] font-medium leading-none flex items-center gap-1"
                    >
                      <Hash className="size-2.5 text-muted-foreground" />
                      Documento / C.I. / NIT (Opcional)
                    </Label>
                    <Input
                      id="clienteDocumento"
                      {...register("clienteDocumento")}
                      placeholder="Ej. 1234567 LP"
                      className="h-7 text-xs font-mono bg-background/50 shadow-2xs"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-0.5 sm:col-span-2">
                  <Label
                    htmlFor="pacienteId"
                    className="text-[11px] font-medium leading-none flex items-center gap-1"
                  >
                    Paciente de la Clínica <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="pacienteId"
                    {...register("pacienteId", { valueAsNumber: true })}
                    className="w-full h-7 px-2 text-xs rounded-md border border-border/60 bg-background text-foreground shadow-2xs"
                  >
                    <option value="">Seleccionar paciente registrado...</option>
                    {pacientes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.persona.nombres} {p.persona.apellidoPaterno} ({p.persona.numeroDocumento}) - HC: {p.numeroHistoriaClinica}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Médico Prescriptor (Opcional) */}
              <div className="space-y-0.5">
                <Label
                  htmlFor="medicoId"
                  className="text-[11px] font-medium leading-none flex items-center gap-1"
                >
                  <Stethoscope className="size-2.5 text-muted-foreground" />
                  Médico Prescriptor (Opcional)
                </Label>
                <select
                  id="medicoId"
                  {...register("medicoId", { valueAsNumber: true })}
                  className="w-full h-7 px-2 text-xs rounded-md border border-border/60 bg-background text-foreground shadow-2xs"
                >
                  <option value="">Sin médico / Venta directa libre</option>
                  {medicos.map((m) => (
                    <option key={m.id} value={m.id}>
                      Dr(a). {m.empleado?.persona?.nombres} {m.empleado?.persona?.apellidoPaterno}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Observaciones Row */}
            <div className="space-y-0.5">
              <Label
                htmlFor="observaciones"
                className="text-[11px] font-medium leading-none"
              >
                Observación / Indicaciones de Dispensación
              </Label>
              <Input
                id="observaciones"
                {...register("observaciones")}
                placeholder="Observaciones generales para el ticket de cobro y despacho..."
                className="h-7 text-xs bg-background/50 shadow-2xs"
              />
            </div>
          </div>

          {/* Section 2: Items Table Compact */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="size-3.5 text-teal-600" />
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  2. Medicamentos e Insumos a Dispensar
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] h-4.5 px-1.5 font-mono font-medium"
                >
                  {totalItemsCount} {totalItemsCount === 1 ? "artículo" : "artículos"}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Quick medicine adder */}
                <div className="w-56">
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      if (id) {
                        handleAddMedicineQuick(id);
                        e.target.value = "";
                      }
                    }}
                    className="w-full h-6 text-[11px] px-2 rounded-md border border-teal-500/40 bg-teal-500/5 text-teal-700 dark:text-teal-300 font-medium cursor-pointer shadow-2xs"
                  >
                    <option value="">➕ Agregar medicamento rápido...</option>
                    {stockMedicamentos.map((med) => (
                      <option key={med.productoId} value={med.productoId}>
                        {med.nombre} ({med.codigo}) - Bs. {med.precioReferencial}
                      </option>
                    ))}
                  </select>
                </div>

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
                  className="h-6 text-[11px] px-2 gap-1 text-teal-600 border-teal-500/30 hover:bg-teal-500/5 cursor-pointer shadow-2xs font-medium"
                >
                  <Plus className="size-3" />
                  <span>Agregar Línea</span>
                </Button>
              </div>
            </div>

            {/* Alert if duplicates */}
            {hasDuplicates && (
              <div className="p-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="size-3 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  Hay medicamentos repetidos en la lista. Se sugiere consolidar cantidades para evitar duplicidad de ticket.
                </span>
              </div>
            )}

            {/* Compact Table */}
            <div className="rounded-lg border border-border/70 overflow-hidden bg-card shadow-2xs">
              <div className="overflow-x-auto max-h-[36vh]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur-xs">
                    <tr className="border-b border-border/70 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">
                      <th className="px-2 py-1 w-8 text-center">#</th>
                      <th className="px-2 py-1 min-w-64">Medicamento / Presentación *</th>
                      <th className="px-2 py-1 min-w-36">Lote / Vencimiento</th>
                      <th className="px-2 py-1 w-20 text-center">Stock</th>
                      <th className="px-2 py-1 w-22 text-center">Cantidad *</th>
                      <th className="px-2 py-1 w-24 text-right">Precio Unit. (Bs.)</th>
                      <th className="px-2 py-1 w-22 text-right">Desc. (Bs.)</th>
                      <th className="px-2 py-1 w-26 text-right">Subtotal (Bs.)</th>
                      <th className="px-1.5 py-1 w-14 text-center">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {loadingStock ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-3 py-6 text-center text-muted-foreground text-xs"
                        >
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <Loader2 className="size-5 animate-spin text-teal-600" />
                            <span className="font-medium text-xs">
                              Cargando catálogo y existencias de farmacia...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : fields.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-3 py-4 text-center text-muted-foreground text-xs"
                        >
                          <div className="flex flex-col items-center justify-center gap-1">
                            <FileSpreadsheet className="size-5 text-muted-foreground/60" />
                            <span className="font-medium text-[11px]">
                              No hay medicamentos agregados a la orden
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={handleAddRow}
                              className="h-6 text-[11px] px-2 gap-1 text-teal-600 border-teal-500/30"
                            >
                              <Plus className="size-3" />
                              <span>Agregar Medicamento</span>
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

                        return (
                          <DetalleRow
                            key={field.id}
                            index={idx}
                            almacenId={selectedAlmacenId}
                            control={control}
                            register={register}
                            setValue={setValue}
                            onRemove={() => remove(idx)}
                            onDuplicate={() => handleDuplicateRow(idx)}
                            canRemove={fields.length > 1}
                            isDuplicate={isDup}
                            stockMedicamentos={stockMedicamentos}
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
                  <strong className="text-teal-600 dark:text-teal-400 font-mono font-semibold">
                    {totalCantidad.toLocaleString("es-ES")}
                  </strong>
                </span>
                {totalDescuento > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      Descuento: Bs. {totalDescuento.toFixed(2)}
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="font-medium text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="size-3 text-teal-600" />
                  FEFO automático & ticket para Caja
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Total a Cobrar:</span>
                <span className="text-sm font-bold text-teal-600 dark:text-teal-400 font-mono tabular-nums">
                  Bs.{" "}
                  {calculatedTotal.toLocaleString("es-ES", {
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
            form="dispensacion-form"
            size="sm"
            disabled={isSaving || fields.length === 0}
            className="h-7.5 px-3.5 text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium gap-1.5 cursor-pointer shadow-2xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Emitiendo Orden...</span>
              </>
            ) : (
              <>
                <Check className="size-3" />
                <span>Emitir Orden de Venta</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
