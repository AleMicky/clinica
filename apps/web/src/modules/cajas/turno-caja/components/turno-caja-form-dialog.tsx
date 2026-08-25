"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Clock,
  LogOut,
  Loader2,
  Vault,
  Calendar,
  User,
  Info,
  Pencil,
  Timer,
  AlertCircle,
  Coins,
  FileText,
  MessageSquare,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { cn } from "@/lib/utils";

import { useEmpleados } from "@/modules/recursos-humanos/empleado/hooks/use-empleados";
import type { EmpleadoResponse } from "@/modules/recursos-humanos/empleado/types/empleado.types";
import { useCajas } from "@/modules/cajas/caja/hooks/use-cajas";
import type { CajaResponse } from "@/modules/cajas/caja/types/caja.types";
import {
  turnoCajaSchema,
  type TurnoCajaFormValues,
} from "../schemas/turno-caja.schema";
import {
  useAbrirTurnoCaja,
  useCerrarTurnoCaja,
  useCreateTurnoCaja,
  useUpdateTurnoCaja,
} from "../hooks/use-turnos-caja";
import {
  EstadoTurnoCaja,
  type TurnoCajaResponse,
} from "../types/turno-caja.types";

interface TurnoCajaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turnoToEdit?: TurnoCajaResponse | null;
  defaultCajaId?: number | null;
  mode?: "create" | "edit" | "close";
  onSuccessCallback?: () => void;
}

const STATIC_QUERY_PARAMS = { page: 1, pageSize: 100 };

function toLocalDatetimeString(dateInput?: string | Date | null): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function setTimeOnDate(baseDateInput: string | Date | null | undefined, hours: number, minutes = 0): string {
  const d = baseDateInput ? new Date(baseDateInput) : new Date();
  if (isNaN(d.getTime())) return "";
  d.setHours(hours, minutes, 0, 0);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${h}:${m}`;
}

function formatDisplayDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount?: number | null): string {
  return `Bs. ${Number(amount || 0).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function calculateDiffDuration(startStr?: string, endStr?: string | null): string {
  if (!startStr) return "";
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : new Date();
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";

  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return "Cierre anterior a apertura (Inválido)";

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours === 0) {
    return `${diffMinutes} minutos`;
  }
  return `${diffHours} hora${diffHours > 1 ? "s" : ""} y ${diffMinutes} minuto${diffMinutes !== 1 ? "s" : ""}`;
}

export function TurnoCajaFormDialog({
  open,
  onOpenChange,
  turnoToEdit,
  defaultCajaId,
  mode = "create",
  onSuccessCallback,
}: TurnoCajaFormDialogProps) {
  const isClosing = mode === "close";
  const isEditing = mode === "edit";
  const isAlreadyClosed = turnoToEdit?.estado === EstadoTurnoCaja.Cerrado;

  // Control de secciones
  const showAssignmentAndOpening = !isClosing;
  const showClosureSection = isClosing || (isEditing && isAlreadyClosed);

  // Fetch Empleados
  const { data: empleadosData, isLoading: isLoadingEmpleados } = useEmpleados(
    STATIC_QUERY_PARAMS
  );

  // Fetch Cajas for selection when not bound to a specific defaultCajaId
  const { data: cajasData, isLoading: isLoadingCajas } = useCajas(
    STATIC_QUERY_PARAMS
  );

  const abrirMutation = useAbrirTurnoCaja();
  const cerrarMutation = useCerrarTurnoCaja();
  const updateMutation = useUpdateTurnoCaja();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TurnoCajaFormValues>({
    resolver: zodResolver(turnoCajaSchema),
    defaultValues: {
      cajaId: defaultCajaId || 0,
      empleadoId: 0,
      fechaHoraApertura: toLocalDatetimeString(),
      montoInicial: 0,
      observacionApertura: "",
      fechaHoraCierre: "",
      observacionCierre: "",
      estado: EstadoTurnoCaja.Abierto,
    },
  });

  const selectedCajaId = watch("cajaId");
  const selectedEmpleadoId = watch("empleadoId");
  const fechaAperturaVal = watch("fechaHoraApertura");
  const fechaCierreVal = watch("fechaHoraCierre");
  const montoInicialVal = watch("montoInicial");

  const empleadosList: EmpleadoResponse[] = React.useMemo(() => {
    return Array.isArray(empleadosData?.items)
      ? empleadosData.items
      : Array.isArray(empleadosData)
      ? (empleadosData as unknown as EmpleadoResponse[])
      : [];
  }, [empleadosData]);

  const cajasList: CajaResponse[] = React.useMemo(() => {
    return Array.isArray(cajasData?.items)
      ? cajasData.items
      : Array.isArray(cajasData)
      ? (cajasData as unknown as CajaResponse[])
      : [];
  }, [cajasData]);

  // Mapeo de opciones Autocomplete para Empleados / Cajeros
  const empleadoOptions: AutocompleteOption[] = React.useMemo(() => {
    return empleadosList.map((emp: EmpleadoResponse) => {
      const nombreCompleto = emp.persona
        ? `${emp.persona.nombres} ${emp.persona.apellidoPaterno} ${emp.persona.apellidoMaterno || ""}`.trim()
        : emp.codigoEmpleado;
      return {
        value: String(emp.id),
        label: `${emp.codigoEmpleado} - ${nombreCompleto}`,
        description: emp.persona?.numeroDocumento
          ? `Doc: ${emp.persona.numeroDocumento}`
          : undefined,
      };
    });
  }, [empleadosList]);

  // Mapeo de opciones Autocomplete para Cajas
  const cajaOptions: AutocompleteOption[] = React.useMemo(() => {
    return cajasList.map((caja: CajaResponse) => ({
      value: String(caja.id),
      label: `${caja.codigo} - ${caja.nombre}`,
      description: caja.descripcion || (caja.activo ? "Caja Activa" : "Inactiva"),
    }));
  }, [cajasList]);

  React.useEffect(() => {
    if (open) {
      const nowStr = toLocalDatetimeString();
      if (turnoToEdit) {
        const cId = turnoToEdit.caja?.id || defaultCajaId || 0;
        const eId = turnoToEdit.empleado?.id || 0;
        reset({
          cajaId: cId,
          empleadoId: eId,
          fechaHoraApertura: toLocalDatetimeString(turnoToEdit.fechaHoraApertura),
          montoInicial: turnoToEdit.montoInicial ?? 0,
          observacionApertura: turnoToEdit.observacionApertura || "",
          fechaHoraCierre: isClosing
            ? nowStr
            : turnoToEdit.fechaHoraCierre
            ? toLocalDatetimeString(turnoToEdit.fechaHoraCierre)
            : "",
          observacionCierre: turnoToEdit.observacionCierre || "",
          estado: isClosing ? EstadoTurnoCaja.Cerrado : turnoToEdit.estado,
        });
      } else {
        reset({
          cajaId: defaultCajaId || 0,
          empleadoId: 0,
          fechaHoraApertura: nowStr,
          montoInicial: 0,
          observacionApertura: "",
          fechaHoraCierre: "",
          observacionCierre: "",
          estado: EstadoTurnoCaja.Abierto,
        });
      }
    }
  }, [open, turnoToEdit, defaultCajaId, mode, isClosing, reset]);

  const handleCajaChange = React.useCallback(
    (val: string) => {
      setValue("cajaId", Number(val), { shouldValidate: true });
    },
    [setValue]
  );

  const handleEmpleadoChange = React.useCallback(
    (val: string) => {
      setValue("empleadoId", Number(val), { shouldValidate: true });
    },
    [setValue]
  );

  const setNowForApertura = () => {
    setValue("fechaHoraApertura", toLocalDatetimeString(), { shouldValidate: true });
  };

  const setPresetForApertura = (h: number, m = 0) => {
    setValue("fechaHoraApertura", setTimeOnDate(fechaAperturaVal, h, m), { shouldValidate: true });
  };

  const setPresetMontoInicial = (monto: number) => {
    setValue("montoInicial", monto, { shouldValidate: true });
  };

  const setNowForCierre = () => {
    setValue("fechaHoraCierre", toLocalDatetimeString(), { shouldValidate: true });
  };

  const setPresetForCierre = (h: number, m = 0) => {
    setValue("fechaHoraCierre", setTimeOnDate(fechaCierreVal || fechaAperturaVal, h, m), { shouldValidate: true });
  };

  const onSubmit = async (values: TurnoCajaFormValues) => {
    try {
      const targetCajaId = Number(defaultCajaId || turnoToEdit?.caja?.id || values.cajaId);
      if (!targetCajaId) {
        toast.error("Debe seleccionar la caja asignada.");
        return;
      }

      const aperturaIso = new Date(values.fechaHoraApertura).toISOString();
      const cierreIso = values.fechaHoraCierre
        ? new Date(values.fechaHoraCierre).toISOString()
        : isClosing
        ? new Date().toISOString()
        : null;

      // Determinación automática del estado según si hay cierre o es acción de cierre
      const finalEstado =
        isClosing || Boolean(values.fechaHoraCierre)
          ? EstadoTurnoCaja.Cerrado
          : turnoToEdit?.estado ?? EstadoTurnoCaja.Abierto;

      const payload = {
        cajaId: targetCajaId,
        empleadoId: Number(values.empleadoId),
        fechaHoraApertura: aperturaIso,
        montoInicial: Number(values.montoInicial || 0),
        observacionApertura: values.observacionApertura?.trim() || null,
        fechaHoraCierre: cierreIso,
        observacionCierre: values.observacionCierre?.trim() || null,
        estado: finalEstado,
      };

      if (isClosing && turnoToEdit) {
        await cerrarMutation.mutateAsync({
          id: turnoToEdit.id,
          data: {
            observacion: values.observacionCierre?.trim() || null,
          },
        });
        toast.success(`Turno de caja cerrado correctamente.`);
      } else if (isEditing && turnoToEdit) {
        await updateMutation.mutateAsync({
          id: turnoToEdit.id,
          data: payload,
        });
        toast.success(`Turno de caja actualizado correctamente.`);
      } else {
        await abrirMutation.mutateAsync({
          cajaId: targetCajaId,
          empleadoId: Number(values.empleadoId),
          montoInicial: Number(values.montoInicial || 0),
          observacion: values.observacionApertura?.trim() || null,
        });
        toast.success(`Turno de caja abierto correctamente.`);
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string; title?: string } }; message?: string };
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        err?.message ||
        "Ocurrió un error al guardar el turno de caja.";
      toast.error(message);
    }
  };

  const isLoading =
    abrirMutation.isPending ||
    cerrarMutation.isPending ||
    updateMutation.isPending ||
    isSubmitting;
  const calculatedDuration = calculateDiffDuration(
    fechaAperturaVal,
    isClosing ? (fechaCierreVal || toLocalDatetimeString()) : fechaCierreVal
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0 border-border/60 shadow-2xl">
        {/* Encabezado con Temática de Color Dinámica */}
        <div
          className={cn(
            "p-6 pb-5 border-b sticky top-0 bg-background/95 backdrop-blur-xs z-10",
            isClosing
              ? "bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/20"
              : isEditing
              ? "bg-gradient-to-r from-blue-500/15 via-blue-500/5 to-transparent border-blue-500/20"
              : "bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-primary/20"
          )}
        >
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-2xl border shadow-xs shrink-0",
                  isClosing
                    ? "bg-amber-500 text-white border-amber-600 shadow-amber-500/20"
                    : isEditing
                    ? "bg-blue-600 text-white border-blue-700 shadow-blue-500/20"
                    : "bg-primary text-primary-foreground border-primary/80 shadow-primary/20"
                )}
              >
                {isClosing ? (
                  <LogOut className="size-5.5" />
                ) : isEditing ? (
                  <Pencil className="size-5.5" />
                ) : (
                  <Clock className="size-5.5" />
                )}
              </div>

              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <span>
                    {isClosing
                      ? "Cierre de Turno de Caja"
                      : isEditing
                      ? "Modificar Parámetros del Turno"
                      : "Apertura de Turno de Caja"}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {isClosing
                    ? "Registre la fecha/hora final y observaciones para consolidar el cierre de jornada."
                    : isEditing
                    ? "Modifique los responsables, montos o el horario programado para este turno."
                    : "Asigne la caja registradora, cajero y monto inicial para iniciar la atención."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Tarjeta de Resumen en modo Cierre */}
        {isClosing && turnoToEdit && (
          <div className="mx-6 mt-5 p-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.07] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Info className="size-4" />
                Resumen de la Jornada Actual
              </span>
              <Badge
                variant="outline"
                className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 text-[10px] font-semibold"
              >
                #Turno-{turnoToEdit.id}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="bg-background/70 p-2 rounded-lg border border-amber-500/20">
                <span className="text-[10px] text-muted-foreground block font-medium">Caja Registradora</span>
                <span className="font-bold text-foreground">
                  {turnoToEdit.caja?.codigo} - {turnoToEdit.caja?.nombre}
                </span>
              </div>

              <div className="bg-background/70 p-2 rounded-lg border border-amber-500/20">
                <span className="text-[10px] text-muted-foreground block font-medium">Cajero Responsable</span>
                <span className="font-bold text-foreground truncate block">
                  {turnoToEdit.empleado?.nombreCompleto || "Sin asignar"}
                </span>
              </div>

              <div className="bg-background/70 p-2 rounded-lg border border-amber-500/20">
                <span className="text-[10px] text-muted-foreground block font-medium">Monto Inicial (Apertura)</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(turnoToEdit.montoInicial)}
                </span>
              </div>

              <div className="bg-background/70 p-2 rounded-lg border border-amber-500/20">
                <span className="text-[10px] text-muted-foreground block font-medium">Tiempo Transcurrido</span>
                <span className="font-mono font-bold text-foreground">
                  {calculatedDuration || "-"}
                </span>
              </div>

              <div className="col-span-2 bg-background/70 p-2 rounded-lg border border-amber-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground block font-medium">Apertura Registrada</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatDisplayDate(turnoToEdit.fechaHoraApertura)}
                  </span>
                </div>
                {turnoToEdit.observacionApertura && (
                  <div className="text-right max-w-[200px]">
                    <span className="text-[10px] text-muted-foreground block font-medium">Obs. Apertura</span>
                    <span className="text-[11px] text-muted-foreground italic truncate block" title={turnoToEdit.observacionApertura}>
                      &quot;{turnoToEdit.observacionApertura}&quot;
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Formulario Principal */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-4 space-y-4">
          {/* SECCIÓN 1: ASIGNACIÓN DE CAJA Y RESPONSABLE (Oculto en Cierre) */}
          {showAssignmentAndOpening && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-border/40">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Vault className="size-3.5 text-primary" />
                  1. Asignación Operativa
                </span>
                <span className="text-[10px] font-medium text-destructive">* Campos requeridos</span>
              </div>

              {/* Selector de Caja si no está fija */}
              {!defaultCajaId && (
                <div className="space-y-1.5">
                  <Label htmlFor="cajaId" className="text-xs font-semibold flex items-center gap-1">
                    Caja Registradora <span className="text-destructive">*</span>
                  </Label>
                  <Autocomplete
                    id="cajaId"
                    value={selectedCajaId ? String(selectedCajaId) : ""}
                    onValueChange={handleCajaChange}
                    options={cajaOptions}
                    placeholder="Seleccione la caja registradora..."
                    emptyText="No se encontraron cajas registradas"
                    allowCustomValue={false}
                    isLoading={isLoadingCajas}
                    disabled={isLoading || isEditing}
                    error={Boolean(errors.cajaId)}
                  />
                  {errors.cajaId && (
                    <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      {errors.cajaId.message}
                    </p>
                  )}
                </div>
              )}

              {/* Cajero / Empleado Responsable Autocomplete */}
              <div className="space-y-1.5">
                <Label htmlFor="empleadoId" className="text-xs font-semibold flex items-center gap-1">
                  Cajero / Empleado Responsable <span className="text-destructive">*</span>
                </Label>
                <Autocomplete
                  id="empleadoId"
                  value={selectedEmpleadoId ? String(selectedEmpleadoId) : ""}
                  onValueChange={handleEmpleadoChange}
                  options={empleadoOptions}
                  placeholder="Buscar por código, nombre o DNI de cajero..."
                  emptyText="No se encontraron cajeros/empleados registrados"
                  allowCustomValue={false}
                  isLoading={isLoadingEmpleados}
                  disabled={isLoading}
                  error={Boolean(errors.empleadoId)}
                />
                {errors.empleadoId && (
                  <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.empleadoId.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* SECCIÓN 2: DATOS DE APERTURA (Oculto en Cierre) */}
          {showAssignmentAndOpening && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-border/40">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="size-3.5 text-primary" />
                  2. Apertura del Turno
                </span>
                {calculatedDuration && !isAlreadyClosed && (
                  <span className="text-[11px] font-mono font-medium text-primary flex items-center gap-1">
                    <Timer className="size-3" />
                    {calculatedDuration}
                  </span>
                )}
              </div>

              {/* Monto Inicial de Apertura */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="montoInicial" className="text-xs font-semibold flex items-center gap-1">
                    Monto Inicial en Efectivo (Bs.) <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-1">
                    {[0, 50, 100, 200, 500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setPresetMontoInicial(preset)}
                        className={cn(
                          "text-[10px] font-semibold transition-colors cursor-pointer px-1.5 py-0.5 rounded border",
                          Number(montoInicialVal) === preset
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
                        )}
                      >
                        {preset === 0 ? "0 Bs." : `${preset} Bs.`}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground select-none">
                    Bs.
                  </span>
                  <Input
                    id="montoInicial"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register("montoInicial", { valueAsNumber: true })}
                    className={cn(
                      "h-9.5 pl-9 text-sm font-mono font-semibold bg-background",
                      errors.montoInicial && "border-destructive focus-visible:ring-destructive"
                    )}
                    aria-invalid={Boolean(errors.montoInicial)}
                    disabled={isLoading}
                  />
                </div>
                {errors.montoInicial && (
                  <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.montoInicial.message}
                  </p>
                )}
              </div>

              {/* Fecha y Hora de Apertura */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fechaHoraApertura" className="text-xs font-semibold flex items-center gap-1">
                    Fecha y Hora de Apertura <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPresetForApertura(8, 0)}
                      className="text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded"
                    >
                      08:00 AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetForApertura(14, 0)}
                      className="text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded"
                    >
                      02:00 PM
                    </button>
                    <button
                      type="button"
                      onClick={setNowForApertura}
                      className="text-[10px] font-semibold text-primary hover:underline cursor-pointer bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1"
                    >
                      <Clock className="size-2.5" />
                      Ahora
                    </button>
                  </div>
                </div>
                <Input
                  id="fechaHoraApertura"
                  type="datetime-local"
                  value={fechaAperturaVal}
                  onChange={(e) =>
                    setValue("fechaHoraApertura", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  className={cn(
                    "h-9.5 text-sm font-mono bg-background",
                    errors.fechaHoraApertura && "border-destructive focus-visible:ring-destructive"
                  )}
                  aria-invalid={Boolean(errors.fechaHoraApertura)}
                  disabled={isLoading}
                />
                {errors.fechaHoraApertura && (
                  <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.fechaHoraApertura.message}
                  </p>
                )}
              </div>

              {/* Observación de Apertura */}
              <div className="space-y-1.5">
                <Label htmlFor="observacionApertura" className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
                  <FileText className="size-3" />
                  Observación de Apertura <span className="text-[10px] font-normal text-muted-foreground">(Opcional)</span>
                </Label>
                <Textarea
                  id="observacionApertura"
                  placeholder="Detalles sobre el fondo inicial o notas de inicio del turno..."
                  {...register("observacionApertura")}
                  rows={2}
                  maxLength={500}
                  className={cn(
                    "text-xs bg-background resize-none",
                    errors.observacionApertura && "border-destructive focus-visible:ring-destructive"
                  )}
                  disabled={isLoading}
                />
                {errors.observacionApertura && (
                  <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.observacionApertura.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* SECCIÓN 3: CIERRE DEL TURNO (Solo visible cuando se va a cerrar o si el turno ya fue cerrado) */}
          {showClosureSection && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-border/40">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <LogOut className="size-3.5" />
                  {isClosing ? "Datos de Cierre del Turno" : "3. Cierre del Turno"}
                </span>
                {isClosing && (
                  <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    Completar datos de salida
                  </span>
                )}
              </div>

              {/* Fecha y Hora de Cierre */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fechaHoraCierre" className="text-xs font-semibold flex items-center gap-1 text-foreground">
                    Fecha y Hora de Cierre {isClosing && <span className="text-destructive">*</span>}
                  </Label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPresetForCierre(16, 0)}
                      className="text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded"
                    >
                      04:00 PM
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetForCierre(20, 0)}
                      className="text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded"
                    >
                      08:00 PM
                    </button>
                    <button
                      type="button"
                      onClick={setNowForCierre}
                      className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1"
                    >
                      <Clock className="size-2.5" />
                      Ahora
                    </button>
                  </div>
                </div>
                <Input
                  id="fechaHoraCierre"
                  type="datetime-local"
                  value={fechaCierreVal || ""}
                  onChange={(e) => {
                    setValue("fechaHoraCierre", e.target.value);
                    if (e.target.value) {
                      setValue("estado", EstadoTurnoCaja.Cerrado);
                    }
                  }}
                  className={cn(
                    "h-9.5 text-sm font-mono bg-background",
                    errors.fechaHoraCierre && "border-destructive focus-visible:ring-destructive"
                  )}
                  aria-invalid={Boolean(errors.fechaHoraCierre)}
                  disabled={isLoading}
                />
                {errors.fechaHoraCierre && (
                  <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.fechaHoraCierre.message}
                  </p>
                )}
              </div>

              {/* Observación de Cierre */}
              <div className="space-y-1.5">
                <Label htmlFor="observacionCierre" className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
                  <MessageSquare className="size-3" />
                  Observación de Cierre <span className="text-[10px] font-normal text-muted-foreground">(Opcional)</span>
                </Label>
                <Textarea
                  id="observacionCierre"
                  placeholder="Detalles sobre el arqueo de salida, entrega de remesa o novedades al cierre..."
                  {...register("observacionCierre")}
                  rows={2}
                  maxLength={500}
                  className={cn(
                    "text-xs bg-background resize-none",
                    errors.observacionCierre && "border-destructive focus-visible:ring-destructive"
                  )}
                  disabled={isLoading}
                />
                {errors.observacionCierre && (
                  <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.observacionCierre.message}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="pt-5 border-t gap-2 sm:gap-0 sticky bottom-0 bg-background/95 backdrop-blur-xs z-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-9.5 text-xs sm:text-sm cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "h-9.5 px-4 gap-2 text-xs sm:text-sm font-semibold cursor-pointer shadow-sm transition-all",
                isClosing
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                  : isEditing
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
              )}
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              <span>
                {isClosing
                  ? "Confirmar Cierre de Turno"
                  : isEditing
                  ? "Guardar Modificaciones"
                  : "Abrir Turno de Caja"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
