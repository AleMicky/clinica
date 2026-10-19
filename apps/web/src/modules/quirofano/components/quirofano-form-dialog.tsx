"use client";

import * as React from "react";
import { useForm, useFieldArray, Controller, useWatch, type Control } from "react-hook-form";
import { toast } from "sonner";
import {
  Activity,
  Plus,
  Trash2,
  Copy,
  Package,
  DoorOpen,
  Calendar,
  Loader2,
  FileSpreadsheet,
  AlertTriangle,
  Layers,
  FileText,
  Clock,
  Check,
  User,
  Stethoscope,
  Scissors,
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

import { useCreateCirugia, useMaterialesQuirofanoStock } from "../hooks/use-quirofano";
import { MaterialQuirofanoAutocomplete } from "./material-quirofano-autocomplete";
import { usePacientes } from "@/modules/recepcion/pacientes/hooks/use-pacientes";
import { useAdmisiones } from "@/modules/recepcion/admisiones/hooks/use-admisiones";
import { useMedicos } from "@/modules/recursos-humanos/medico";
import { useAlmacenes } from "@/modules/almacenes/almacen/hooks/use-almacen";
import type {
  CreateCirugiaRequest,
  TipoCirugia,
  TipoAnestesia,
  MaterialQuirofanoStockResponse,
} from "../types/quirofano.types";

interface QuirofanoFormDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccessCallback?: () => void;
}

interface FormDetalleGasto {
  productoId: number;
  partidaInventarioId?: number;
  cantidad: number;
  precioUnitario: number;
  momentoQuirurgico?: string;
  observaciones?: string;
}

interface FormValues {
  tipo: TipoCirugia;
  tipoAnestesia: TipoAnestesia;
  pacienteId: number;
  admisionId?: number;
  cirujanoPrincipalId: number;
  anestesiologoId?: number;
  primerAyudanteId?: number;
  instrumentista?: string;
  circulante?: string;
  salaOperaciones: string;
  procedimientoQuirurgico: string;
  diagnosticoPreOperatorio?: string;
  fechaProgramada: string;
  observaciones?: string;
  gastos: FormDetalleGasto[];
}

interface DetalleGastoRowProps {
  readonly index: number;
  readonly control: Control<FormValues>;
  readonly register: ReturnType<typeof useForm<FormValues>>["register"];
  readonly setValue: ReturnType<typeof useForm<FormValues>>["setValue"];
  readonly onRemove: () => void;
  readonly onDuplicate: () => void;
  readonly canRemove: boolean;
  readonly isDuplicate: boolean;
  readonly materialesStock: MaterialQuirofanoStockResponse[];
}

function DetalleGastoRow({
  index,
  control,
  register,
  setValue,
  onRemove,
  onDuplicate,
  canRemove,
  isDuplicate,
  materialesStock,
}: DetalleGastoRowProps) {
  const detalle = useWatch({
    control,
    name: `gastos.${index}`,
  });

  const currentProductoId = Number(detalle?.productoId) || 0;
  const cantidad = Number(detalle?.cantidad) || 0;
  const precioUnitario = Number(detalle?.precioUnitario) || 0;
  const subtotal = Math.max(0, cantidad * precioUnitario);

  const selectedMat = React.useMemo(() => {
    return materialesStock.find((m) => m.productoId === currentProductoId) ?? null;
  }, [materialesStock, currentProductoId]);

  const lotes = selectedMat?.lotes ?? [];
  const stockDisponible = selectedMat?.stockDisponible ?? 0;
  const isOutOfStock = stockDisponible > 0 && cantidad > stockDisponible;

  const handleMaterialChange = (mat: MaterialQuirofanoStockResponse | null) => {
    if (!mat) {
      setValue(`gastos.${index}.productoId`, 0);
      setValue(`gastos.${index}.partidaInventarioId`, undefined);
      setValue(`gastos.${index}.precioUnitario`, 0);
      return;
    }

    setValue(`gastos.${index}.productoId`, mat.productoId);
    setValue(`gastos.${index}.precioUnitario`, mat.precioReferencial);

    const lot = mat.lotes[0];
    setValue(`gastos.${index}.partidaInventarioId`, lot?.partidaInventarioId);
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

      {/* Autocomplete de Insumo Quirúrgico con Paginación */}
      <td className="px-2 py-1 min-w-64">
        <div className="space-y-0.5">
          <Controller
            name={`gastos.${index}.productoId`}
            control={control}
            render={({ field, fieldState }) => (
              <MaterialQuirofanoAutocomplete
                value={field.value}
                onValueChange={(val, mat) => {
                  field.onChange(val || 0);
                  handleMaterialChange(mat ?? null);
                }}
                error={Boolean(fieldState.error)}
                placeholder="Buscar sutura, anestésico o material..."
                className="h-6.5 text-xs"
              />
            )}
          />

          {/* Badges metadata */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {selectedMat?.codigo && (
              <span className="font-mono text-[9px] bg-muted px-1 py-0.2 rounded text-muted-foreground font-medium">
                {selectedMat.codigo}
              </span>
            )}
            {selectedMat?.categoria && (
              <span className="font-mono text-[9px] bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 px-1 py-0.2 rounded font-semibold">
                {selectedMat.categoria}
              </span>
            )}
            {selectedMat?.unidadMedida && (
              <span className="font-mono text-[9px] bg-primary/10 text-primary px-1 py-0.2 rounded font-semibold">
                {selectedMat.unidadMedida}
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
            {...register(`gastos.${index}.partidaInventarioId`, {
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

      {/* Stock en Quirófano */}
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
        <Input
          type="number"
          step="any"
          min="1"
          {...register(`gastos.${index}.cantidad`, {
            valueAsNumber: true,
          })}
          placeholder="1"
          className={cn(
            "h-6.5 text-xs font-mono text-center font-semibold px-1 shadow-2xs",
            isOutOfStock && "border-destructive text-destructive font-bold focus-visible:ring-destructive"
          )}
        />
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
            {...register(`gastos.${index}.precioUnitario`, {
              setValueAs: (v) => (v === "" || v === null ? 0 : Number(v)),
            })}
            placeholder="0.00"
            className="h-6.5 text-xs font-mono text-right pl-6 pr-1.5 shadow-2xs font-medium"
          />
        </div>
      </td>

      {/* Subtotal */}
      <td className="px-2 py-1 w-26 text-right">
        <div className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 tabular-nums whitespace-nowrap">
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
            className="size-6 text-muted-foreground hover:text-cyan-600 hover:bg-cyan-500/10 cursor-pointer transition-colors rounded"
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

export function QuirofanoFormDialog({
  open,
  onOpenChange,
  onSuccessCallback,
}: QuirofanoFormDialogProps) {
  const { data: pacientesData } = usePacientes({ pageSize: 150 });
  const pacientes = pacientesData?.items ?? [];

  const { data: admisionesData } = useAdmisiones({ pageSize: 150 });
  const admisiones = admisionesData?.items ?? [];

  const { data: medicosData } = useMedicos({ pageSize: 150 });
  const medicos = medicosData?.items ?? [];

  const { data: materialesStock = [], isLoading: loadingMateriales } =
    useMaterialesQuirofanoStock();

  const createMutation = useCreateCirugia();

  const nowDateTime = new Date(Date.now() + 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

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
      tipo: "Programada",
      tipoAnestesia: "General",
      pacienteId: 0,
      salaOperaciones: "Quirófano 1 - Central",
      procedimientoQuirurgico: "",
      diagnosticoPreOperatorio: "",
      fechaProgramada: nowDateTime,
      observaciones: "",
      gastos: [],
    },
  });

  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: "gastos",
  });

  const rawGastos = useWatch({ control, name: "gastos" });
  const watchedGastos = React.useMemo(() => rawGastos ?? [], [rawGastos]);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      reset({
        tipo: "Programada",
        tipoAnestesia: "General",
        pacienteId: pacientes[0]?.id ?? 0,
        cirujanoPrincipalId: medicos[0]?.id ?? 0,
        salaOperaciones: "Quirófano 1 - Central",
        procedimientoQuirurgico: "",
        diagnosticoPreOperatorio: "",
        fechaProgramada: new Date(Date.now() + 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16),
        observaciones: "",
        gastos: [],
      });
    }
  }, [open, pacientes, medicos, reset]);

  // Totals calculations
  const totalItemsCount = watchedGastos.length;
  const totalCantidad = watchedGastos.reduce(
    (acc, curr) => acc + (Number(curr?.cantidad) || 0),
    0
  );
  const calculatedTotal = React.useMemo(() => {
    return watchedGastos.reduce((acc, curr) => {
      const cant = Number(curr?.cantidad) || 0;
      const precio = Number(curr?.precioUnitario) || 0;
      return acc + Math.max(0, cant * precio);
    }, 0);
  }, [watchedGastos]);

  const duplicateProductIds = React.useMemo(() => {
    const counts = new Map<number, number>();
    for (const d of watchedGastos) {
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
  }, [watchedGastos]);

  const hasDuplicates = duplicateProductIds.size > 0;

  const handleAddMaterialQuick = (productoId: number) => {
    const mat = materialesStock.find((m) => m.productoId === productoId);
    if (!mat) return;

    const lot = mat.lotes[0];
    append({
      productoId: mat.productoId,
      partidaInventarioId: lot?.partidaInventarioId,
      cantidad: 1,
      precioUnitario: mat.precioReferencial,
      momentoQuirurgico: "Preoperatorio",
      observaciones: "",
    });
  };

  const handleAddRow = () => {
    append({
      productoId: 0,
      cantidad: 1,
      precioUnitario: 0,
      momentoQuirurgico: "Tiempo Quirúrgico",
    });
  };

  const handleDuplicateRow = (idx: number) => {
    const item = watchedGastos[idx];
    if (item) {
      insert(idx + 1, {
        productoId: item.productoId,
        partidaInventarioId: item.partidaInventarioId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        momentoQuirurgico: item.momentoQuirurgico,
        observaciones: item.observaciones,
      });
    }
  };

  const handleClearAllRows = () => {
    reset((prev) => ({
      ...prev,
      gastos: [],
    }));
  };

  const onSubmit = async (values: FormValues) => {
    if (!values.pacienteId || Number(values.pacienteId) <= 0) {
      toast.error("Debe seleccionar un paciente para la intervención.");
      return;
    }

    if (!values.cirujanoPrincipalId || Number(values.cirujanoPrincipalId) <= 0) {
      toast.error("Debe asignar un Cirujano Principal a la intervención.");
      return;
    }

    if (!values.procedimientoQuirurgico.trim()) {
      toast.error("Especifique el procedimiento quirúrgico a realizar.");
      return;
    }

    try {
      const payload: CreateCirugiaRequest = {
        tipo: values.tipo,
        tipoAnestesia: values.tipoAnestesia,
        pacienteId: Number(values.pacienteId),
        admisionId: values.admisionId ? Number(values.admisionId) : undefined,
        cirujanoPrincipalId: Number(values.cirujanoPrincipalId),
        anestesiologoId: values.anestesiologoId ? Number(values.anestesiologoId) : undefined,
        primerAyudanteId: values.primerAyudanteId ? Number(values.primerAyudanteId) : undefined,
        instrumentista: values.instrumentista?.trim(),
        circulante: values.circulante?.trim(),
        salaOperaciones: values.salaOperaciones.trim(),
        procedimientoQuirurgico: values.procedimientoQuirurgico.trim(),
        diagnosticoPreOperatorio: values.diagnosticoPreOperatorio?.trim(),
        fechaProgramada: new Date(values.fechaProgramada).toISOString(),
        observaciones: values.observaciones?.trim(),
        gastosMaterialesIniciales: values.gastos
          .filter((g) => g.productoId > 0 && g.cantidad > 0)
          .map((g) => ({
            productoId: Number(g.productoId),
            partidaInventarioId: g.partidaInventarioId ? Number(g.partidaInventarioId) : undefined,
            cantidad: Number(g.cantidad),
            precioUnitario: Number(g.precioUnitario),
            momentoQuirurgico: g.momentoQuirurgico?.trim(),
            observaciones: g.observaciones?.trim(),
          })),
      };

      const res = await createMutation.mutateAsync(payload);
      toast.success(
        `Cirugía "${res.numero}" programada exitosamente en ${res.salaOperaciones}.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al programar la cirugía.";
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
              <div className="size-8 rounded-lg flex items-center justify-center shrink-0 border shadow-2xs bg-cyan-500/10 border-cyan-500/25 text-cyan-600 dark:text-cyan-400">
                <Scissors className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
                  Programación de Intervención Quirúrgica
                </DialogTitle>
                <DialogDescription className="text-[11px] text-muted-foreground leading-none pt-0.5">
                  Asigna sala de operaciones, cirujano, paciente y kit de insumos del almacén de quirófano (ALM-QUI).
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Badge
                variant="outline"
                className="text-[10px] h-5 px-2 font-semibold text-blue-700 dark:text-blue-300 border-blue-500/30 bg-blue-500/10 gap-1"
              >
                <Calendar className="size-2.5" />
                <span>Programación</span>
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Compact Form Body */}
        <form
          id="quirofano-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto py-2.5 space-y-2.5 pr-0.5 text-xs"
        >
          {/* Section 1: Cabecera Compacta */}
          <div className="p-2.5 rounded-lg bg-card border border-border/70 flex flex-col gap-2 shadow-2xs">
            <div className="flex items-center justify-between pb-0.5 border-b border-border/30">
              <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider flex items-center gap-1">
                <Layers className="size-3 text-cyan-600" />
                1. Datos Clínicos, Sala y Equipo Quirúrgico
              </span>
              <span className="text-[10px] text-muted-foreground">
                <span className="text-destructive font-bold">*</span> Obligatorios
              </span>
            </div>

            {/* Fila 1: Paciente, Admisión y Cirujano Principal */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-0.5">
                <Label htmlFor="pacienteId" className="text-[11px] font-medium leading-none flex items-center gap-1">
                  <User className="size-2.5 text-muted-foreground" />
                  Paciente <span className="text-destructive">*</span>
                </Label>
                <select
                  id="pacienteId"
                  {...register("pacienteId", { valueAsNumber: true })}
                  className="w-full h-7 px-2 text-xs rounded-md border border-border/60 bg-background text-foreground shadow-2xs"
                >
                  <option value="">Seleccionar paciente...</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.persona.nombres} {p.persona.apellidoPaterno} ({p.persona.numeroDocumento}) - HC: {p.numeroHistoriaClinica}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="admisionId" className="text-[11px] font-medium leading-none flex items-center gap-1">
                  <FileText className="size-2.5 text-muted-foreground" />
                  Admisión Hospitalaria (Opcional)
                </Label>
                <select
                  id="admisionId"
                  {...register("admisionId", {
                    setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)),
                  })}
                  className="w-full h-7 px-2 text-xs rounded-md border border-border/60 bg-background text-foreground shadow-2xs"
                >
                  <option value="">Sin admisión / Cirugía ambulatoria</option>
                  {admisiones.map((a) => (
                    <option key={a.id} value={a.id}>
                      Admisión {a.numero} - {a.paciente?.persona?.nombres} {a.paciente?.persona?.apellidoPaterno}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="cirujanoPrincipalId" className="text-[11px] font-medium leading-none flex items-center gap-1">
                  <Stethoscope className="size-2.5 text-muted-foreground" />
                  Cirujano Principal <span className="text-destructive">*</span>
                </Label>
                <select
                  id="cirujanoPrincipalId"
                  {...register("cirujanoPrincipalId", { valueAsNumber: true })}
                  className="w-full h-7 px-2 text-xs rounded-md border border-border/60 bg-background text-foreground shadow-2xs font-medium"
                >
                  <option value="">Seleccionar cirujano...</option>
                  {medicos.map((m) => (
                    <option key={m.id} value={m.id}>
                      Dr(a). {m.empleado?.persona?.nombres} {m.empleado?.persona?.apellidoPaterno}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fila 2: Procedimiento Quirúrgico, Sala y Diagnóstico Pre-Op */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-0.5 sm:col-span-2">
                <Label htmlFor="procedimientoQuirurgico" className="text-[11px] font-medium leading-none flex items-center gap-1">
                  <Scissors className="size-2.5 text-cyan-600" />
                  Procedimiento Quirúrgico <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="procedimientoQuirurgico"
                  {...register("procedimientoQuirurgico")}
                  placeholder="Ej. Apendicectomía Laparoscópica, Colecistectomía, Hernioplastia..."
                  className="h-7 text-xs bg-background/50 shadow-2xs font-semibold"
                />
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="salaOperaciones" className="text-[11px] font-medium leading-none flex items-center gap-1">
                  <DoorOpen className="size-2.5 text-muted-foreground" />
                  Sala de Operaciones <span className="text-destructive">*</span>
                </Label>
                <select
                  id="salaOperaciones"
                  {...register("salaOperaciones")}
                  className="w-full h-7 px-2 text-xs rounded-md border border-border/60 bg-background text-foreground shadow-2xs font-medium"
                >
                  <option value="Quirófano 1 - Central">Quirófano 1 - Central</option>
                  <option value="Quirófano 2 - Laparoscópico">Quirófano 2 - Laparoscópico</option>
                  <option value="Quirófano 3 - Traumatología / Prótesis">Quirófano 3 - Traumatología / Prótesis</option>
                  <option value="Quirófano 4 - Urgencias">Quirófano 4 - Urgencias</option>
                  <option value="Quirófano 5 - Oftalmología">Quirófano 5 - Oftalmología</option>
                </select>
              </div>
            </div>

            {/* Fila 3: Tipo Cirugía, Anestesia, Fecha y Anestesiólogo */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="space-y-0.5">
                <Label htmlFor="tipo" className="text-[11px] font-medium leading-none">
                  Tipo de Cirugía
                </Label>
                <select
                  id="tipo"
                  {...register("tipo")}
                  className="w-full h-7 px-2 text-xs rounded-md border border-border/60 bg-background text-foreground shadow-2xs"
                >
                  <option value="Programada">Programada (Electiva)</option>
                  <option value="Urgencia">Urgencia Inmediata</option>
                  <option value="Ambulatoria">Cirugía Ambulatoria</option>
                </select>
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="tipoAnestesia" className="text-[11px] font-medium leading-none">
                  Técnica Anestésica
                </Label>
                <select
                  id="tipoAnestesia"
                  {...register("tipoAnestesia")}
                  className="w-full h-7 px-2 text-xs rounded-md border border-border/60 bg-background text-foreground shadow-2xs"
                >
                  <option value="General">General Inhalatoria / Balanceada</option>
                  <option value="RegionalRaquidea">Regional / Raquídea</option>
                  <option value="Epidural">Epidural / Peridural</option>
                  <option value="LocalYSedacion">Local + Sedación Monitoreada</option>
                  <option value="Local">Local Pura</option>
                </select>
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="anestesiologoId" className="text-[11px] font-medium leading-none">
                  Médico Anestesiólogo
                </Label>
                <select
                  id="anestesiologoId"
                  {...register("anestesiologoId", {
                    setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)),
                  })}
                  className="w-full h-7 px-2 text-xs rounded-md border border-border/60 bg-background text-foreground shadow-2xs"
                >
                  <option value="">Sin anestesiólogo / Por asignar</option>
                  {medicos.map((m) => (
                    <option key={m.id} value={m.id}>
                      Dr(a). {m.empleado?.persona?.nombres} {m.empleado?.persona?.apellidoPaterno}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="fechaProgramada" className="text-[11px] font-medium leading-none flex items-center gap-1">
                  <Calendar className="size-2.5 text-muted-foreground" />
                  Fecha / Hora Programada <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fechaProgramada"
                  type="datetime-local"
                  {...register("fechaProgramada")}
                  className="h-7 text-xs bg-background/50 shadow-2xs font-mono"
                />
              </div>
            </div>

            {/* Fila 4: Diagnóstico Pre-Op y Observaciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <Label htmlFor="diagnosticoPreOperatorio" className="text-[11px] font-medium leading-none">
                  Diagnóstico Pre-Operatorio
                </Label>
                <Input
                  id="diagnosticoPreOperatorio"
                  {...register("diagnosticoPreOperatorio")}
                  placeholder="Ej. Apendicitis aguda fase II, Colelitiasis sintomática..."
                  className="h-7 text-xs bg-background/50 shadow-2xs"
                />
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="observaciones" className="text-[11px] font-medium leading-none">
                  Observaciones / Alergias / Indicaciones Especiales
                </Label>
                <Input
                  id="observaciones"
                  {...register("observaciones")}
                  placeholder="Ej. Alergia a penicilina, reserva de 2 unidades de GRE..."
                  className="h-7 text-xs bg-background/50 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Insumos de Quirófano Iniciales */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="size-3.5 text-cyan-600" />
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  2. Insumos y Materiales de Quirófano (ALM-QUI)
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] h-4.5 px-1.5 font-mono font-medium"
                >
                  {totalItemsCount} {totalItemsCount === 1 ? "artículo" : "artículos"}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Quick material selector */}
                <div className="w-56">
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      if (id) {
                        handleAddMaterialQuick(id);
                        e.target.value = "";
                      }
                    }}
                    className="w-full h-6 text-[11px] px-2 rounded-md border border-cyan-500/40 bg-cyan-500/5 text-cyan-700 dark:text-cyan-300 font-medium cursor-pointer shadow-2xs"
                  >
                    <option value="">➕ Kit rápido de insumos...</option>
                    {materialesStock.map((mat) => (
                      <option key={mat.productoId} value={mat.productoId}>
                        {mat.nombre} ({mat.codigo}) - Bs. {mat.precioReferencial}
                      </option>
                    ))}
                  </select>
                </div>

                {fields.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleClearAllRows}
                    className="h-6 text-[11px] px-1.5 text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    Limpiar
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddRow}
                  className="h-6 text-[11px] px-2 gap-1 text-cyan-600 border-cyan-500/30 hover:bg-cyan-500/5 cursor-pointer shadow-2xs font-medium"
                >
                  <Plus className="size-3" />
                  <span>Agregar Material</span>
                </Button>
              </div>
            </div>

            {hasDuplicates && (
              <div className="p-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="size-3 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  Hay insumos repetidos en la lista. Se sugiere consolidar cantidades.
                </span>
              </div>
            )}

            {/* Table */}
            <div className="rounded-lg border border-border/70 overflow-hidden bg-card shadow-2xs">
              <div className="overflow-x-auto max-h-[32vh]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur-xs">
                    <tr className="border-b border-border/70 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">
                      <th className="px-2 py-1 w-8 text-center">#</th>
                      <th className="px-2 py-1 min-w-64">Insumo / Instrumental / Sutura *</th>
                      <th className="px-2 py-1 min-w-36">Lote / Vencimiento</th>
                      <th className="px-2 py-1 w-20 text-center">Stock Disp.</th>
                      <th className="px-2 py-1 w-22 text-center">Cantidad *</th>
                      <th className="px-2 py-1 w-24 text-right">Precio Unit. (Bs.)</th>
                      <th className="px-2 py-1 w-26 text-right">Subtotal (Bs.)</th>
                      <th className="px-1.5 py-1 w-14 text-center">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {loadingMateriales ? (
                      <tr>
                        <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground text-xs">
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <Loader2 className="size-5 animate-spin text-cyan-600" />
                            <span className="font-medium text-xs">Cargando inventario de quirófano...</span>
                          </div>
                        </td>
                      </tr>
                    ) : fields.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-3 py-4 text-center text-muted-foreground text-xs">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <FileSpreadsheet className="size-5 text-muted-foreground/60" />
                            <span className="font-medium text-[11px]">
                              No hay materiales quirúrgicos precargados (se pueden registrar durante o al finalizar la cirugía)
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={handleAddRow}
                              className="h-6 text-[11px] px-2 gap-1 text-cyan-600 border-cyan-500/30"
                            >
                              <Plus className="size-3" />
                              <span>Agregar Insumo Inicial</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      fields.map((field, idx) => {
                        const currentProdId = Number(watchedGastos[idx]?.productoId);
                        const isDup = Boolean(
                          currentProdId > 0 && duplicateProductIds.has(currentProdId)
                        );

                        return (
                          <DetalleGastoRow
                            key={field.id}
                            index={idx}
                            control={control}
                            register={register}
                            setValue={setValue}
                            onRemove={() => remove(idx)}
                            onDuplicate={() => handleDuplicateRow(idx)}
                            canRemove={fields.length > 0}
                            isDuplicate={isDup}
                            materialesStock={materialesStock}
                          />
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Unified Summary Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/50 text-xs">
              <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                <span>
                  Líneas de Insumos: <strong className="text-foreground">{totalItemsCount}</strong>
                </span>
                <span>•</span>
                <span>
                  Unidades:{" "}
                  <strong className="text-cyan-600 dark:text-cyan-400 font-mono font-semibold">
                    {totalCantidad.toLocaleString("es-ES")}
                  </strong>
                </span>
                <span>•</span>
                <span className="font-medium text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="size-3 text-cyan-600" />
                  Almacén Quirófano (ALM-QUI) integrado
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Costo Estimado Materiales:</span>
                <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono tabular-nums">
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
            form="quirofano-form"
            size="sm"
            disabled={isSaving}
            className="h-7.5 px-3.5 text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-medium gap-1.5 cursor-pointer shadow-2xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Programando...</span>
              </>
            ) : (
              <>
                <Check className="size-3" />
                <span>Programar Cirugía</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
