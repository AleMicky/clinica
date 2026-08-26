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
  User,
  Info,
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
  abrirTurnoCajaSchema,
  cerrarTurnoCajaSchema,
  type AbrirTurnoCajaFormValues,
  type CerrarTurnoCajaFormValues,
} from "../schemas/turno-caja.schema";
import {
  useAbrirTurnoCaja,
  useCerrarTurnoCaja,
} from "../hooks/use-turnos-caja";
import type { TurnoCajaResponse } from "../types/turno-caja.types";

interface TurnoCajaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turnoToClose?: TurnoCajaResponse | null;
  defaultCajaId?: number | null;
  mode?: "open" | "close";
  onSuccessCallback?: () => void;
}

const STATIC_QUERY_PARAMS = { page: 1, pageSize: 100 };

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

function calculateDuration(startStr?: string): string {
  if (!startStr) return "";
  const start = new Date(startStr);
  const now = new Date();
  if (isNaN(start.getTime())) return "";

  const diffMs = Math.max(0, now.getTime() - start.getTime());
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
  turnoToClose,
  defaultCajaId,
  mode = "open",
  onSuccessCallback,
}: TurnoCajaFormDialogProps) {
  const isClosing = mode === "close";

  // Fetch Empleados & Cajas para apertura
  const { data: empleadosData, isLoading: isLoadingEmpleados } = useEmpleados(
    STATIC_QUERY_PARAMS
  );
  const { data: cajasData, isLoading: isLoadingCajas } = useCajas(
    STATIC_QUERY_PARAMS
  );

  const abrirMutation = useAbrirTurnoCaja();
  const cerrarMutation = useCerrarTurnoCaja();

  // Formulario de Apertura
  const openForm = useForm<AbrirTurnoCajaFormValues>({
    resolver: zodResolver(abrirTurnoCajaSchema),
    defaultValues: {
      cajaId: defaultCajaId || 0,
      empleadoId: 0,
      montoInicial: 0,
      observacion: "",
    },
  });

  // Formulario de Cierre
  const closeForm = useForm<CerrarTurnoCajaFormValues>({
    resolver: zodResolver(cerrarTurnoCajaSchema),
    defaultValues: {
      observacion: "",
    },
  });

  const selectedCajaId = openForm.watch("cajaId");
  const selectedEmpleadoId = openForm.watch("empleadoId");
  const montoInicialVal = openForm.watch("montoInicial");

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

  // Opciones Autocomplete para Cajeros
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

  // Opciones Autocomplete para Cajas
  const cajaOptions: AutocompleteOption[] = React.useMemo(() => {
    return cajasList.map((caja: CajaResponse) => ({
      value: String(caja.id),
      label: `${caja.codigo} - ${caja.nombre}`,
      description: caja.descripcion || (caja.activo ? "Caja Activa" : "Inactiva"),
    }));
  }, [cajasList]);

  React.useEffect(() => {
    if (open) {
      if (isClosing) {
        closeForm.reset({ observacion: "" });
      } else {
        openForm.reset({
          cajaId: defaultCajaId || 0,
          empleadoId: 0,
          montoInicial: 0,
          observacion: "",
        });
      }
    }
  }, [open, isClosing, defaultCajaId, openForm, closeForm]);

  const setPresetMontoInicial = (monto: number) => {
    openForm.setValue("montoInicial", monto, { shouldValidate: true });
  };

  const handleOpenSubmit = async (values: AbrirTurnoCajaFormValues) => {
    try {
      const targetCajaId = Number(defaultCajaId || values.cajaId);
      if (!targetCajaId) {
        toast.error("Debe seleccionar una caja registradora válida.");
        return;
      }

      await abrirMutation.mutateAsync({
        cajaId: targetCajaId,
        empleadoId: Number(values.empleadoId),
        montoInicial: Number(values.montoInicial || 0),
        observacion: values.observacion?.trim() || null,
      });

      toast.success("Turno de caja abierto correctamente.");
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { detail?: string; message?: string; title?: string } };
        message?: string;
      };
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        "Error al abrir el turno de caja.";
      toast.error(message);
    }
  };

  const handleCloseSubmit = async (values: CerrarTurnoCajaFormValues) => {
    if (!turnoToClose) return;
    try {
      await cerrarMutation.mutateAsync({
        id: turnoToClose.id,
        data: {
          observacion: values.observacion?.trim() || null,
        },
      });

      toast.success("Turno de caja cerrado correctamente.");
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { detail?: string; message?: string; title?: string } };
        message?: string;
      };
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        "Error al cerrar el turno de caja.";
      toast.error(message);
    }
  };

  const isLoading =
    abrirMutation.isPending ||
    cerrarMutation.isPending ||
    openForm.formState.isSubmitting ||
    closeForm.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0 border-border/60 shadow-2xl">
        {/* Encabezado */}
        <div
          className={cn(
            "p-6 pb-5 border-b sticky top-0 bg-background/95 backdrop-blur-xs z-10",
            isClosing
              ? "bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/20"
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
                    : "bg-primary text-primary-foreground border-primary/80 shadow-primary/20"
                )}
              >
                {isClosing ? <LogOut className="size-5.5" /> : <Clock className="size-5.5" />}
              </div>

              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <span>{isClosing ? "Cierre de Turno de Caja" : "Apertura de Turno de Caja"}</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {isClosing
                    ? "Verifique el estado del turno y registre la observación final para consolidar el cierre."
                    : "Asigne la caja registradora, cajero y monto inicial para iniciar la jornada."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* MODAL MODO CIERRE */}
        {isClosing && turnoToClose ? (
          <form onSubmit={closeForm.handleSubmit(handleCloseSubmit)} className="p-6 space-y-4">
            {/* Tarjeta Resumen de la Jornada */}
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.07] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Info className="size-4" />
                  Resumen de la Jornada Actual
                </span>
                <Badge
                  variant="outline"
                  className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 text-[10px] font-semibold"
                >
                  #Turno-{turnoToClose.id}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-background/70 p-2.5 rounded-lg border border-amber-500/20">
                  <span className="text-[10px] text-muted-foreground block font-medium">Caja Registradora</span>
                  <span className="font-bold text-foreground">
                    {turnoToClose.caja?.codigo} - {turnoToClose.caja?.nombre}
                  </span>
                </div>

                <div className="bg-background/70 p-2.5 rounded-lg border border-amber-500/20">
                  <span className="text-[10px] text-muted-foreground block font-medium">Cajero Responsable</span>
                  <span className="font-bold text-foreground truncate block">
                    {turnoToClose.empleado?.nombreCompleto || "Sin asignar"}
                  </span>
                </div>

                <div className="bg-background/70 p-2.5 rounded-lg border border-amber-500/20">
                  <span className="text-[10px] text-muted-foreground block font-medium">Monto Inicial</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(turnoToClose.montoInicial)}
                  </span>
                </div>

                <div className="bg-background/70 p-2.5 rounded-lg border border-amber-500/20">
                  <span className="text-[10px] text-muted-foreground block font-medium">Tiempo Transcurrido</span>
                  <span className="font-mono font-bold text-foreground">
                    {calculateDuration(turnoToClose.fechaHoraApertura) || "-"}
                  </span>
                </div>

                <div className="col-span-2 bg-background/70 p-2.5 rounded-lg border border-amber-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium">Apertura Registrada</span>
                    <span className="font-mono font-semibold text-foreground">
                      {formatDisplayDate(turnoToClose.fechaHoraApertura)}
                    </span>
                  </div>
                  {turnoToClose.observacionApertura && (
                    <div className="text-right max-w-[200px]">
                      <span className="text-[10px] text-muted-foreground block font-medium">Obs. Apertura</span>
                      <span className="text-[11px] text-muted-foreground italic truncate block" title={turnoToClose.observacionApertura}>
                        &quot;{turnoToClose.observacionApertura}&quot;
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Observación de Cierre */}
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="closeObservacion" className="text-xs font-semibold flex items-center gap-1 text-foreground">
                <MessageSquare className="size-3.5 text-amber-600" />
                Observación de Cierre <span className="text-[10px] font-normal text-muted-foreground">(Opcional)</span>
              </Label>
              <Textarea
                id="closeObservacion"
                placeholder="Detalles sobre entrega de remesa, notas finales o novedades del turno..."
                {...closeForm.register("observacion")}
                rows={3}
                maxLength={500}
                className="text-xs bg-background resize-none"
                disabled={isLoading}
              />
            </div>

            <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
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
                className="h-9.5 px-4 gap-2 text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm cursor-pointer"
              >
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                <span>Confirmar Cierre de Turno</span>
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* MODAL MODO APERTURA */
          <form onSubmit={openForm.handleSubmit(handleOpenSubmit)} className="p-6 space-y-4">
            {/* SECCIÓN 1: ASIGNACIÓN DE CAJA Y RESPONSABLE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-border/40">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Vault className="size-3.5 text-primary" />
                  1. Asignación Operativa
                </span>
                <span className="text-[10px] font-medium text-destructive">* Campos requeridos</span>
              </div>

              {/* Selector de Caja */}
              {!defaultCajaId && (
                <div className="space-y-1.5">
                  <Label htmlFor="cajaId" className="text-xs font-semibold flex items-center gap-1">
                    Caja Registradora <span className="text-destructive">*</span>
                  </Label>
                  <Autocomplete
                    id="cajaId"
                    value={selectedCajaId ? String(selectedCajaId) : ""}
                    onValueChange={(val) => openForm.setValue("cajaId", Number(val), { shouldValidate: true })}
                    options={cajaOptions}
                    placeholder="Seleccione la caja registradora..."
                    emptyText="No se encontraron cajas registradas"
                    allowCustomValue={false}
                    isLoading={isLoadingCajas}
                    disabled={isLoading}
                    error={Boolean(openForm.formState.errors.cajaId)}
                  />
                  {openForm.formState.errors.cajaId && (
                    <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      {openForm.formState.errors.cajaId.message}
                    </p>
                  )}
                </div>
              )}

              {/* Cajero / Empleado Responsable */}
              <div className="space-y-1.5">
                <Label htmlFor="empleadoId" className="text-xs font-semibold flex items-center gap-1">
                  Cajero / Empleado Responsable <span className="text-destructive">*</span>
                </Label>
                <Autocomplete
                  id="empleadoId"
                  value={selectedEmpleadoId ? String(selectedEmpleadoId) : ""}
                  onValueChange={(val) => openForm.setValue("empleadoId", Number(val), { shouldValidate: true })}
                  options={empleadoOptions}
                  placeholder="Buscar por código, nombre o DNI de cajero..."
                  emptyText="No se encontraron cajeros/empleados registrados"
                  allowCustomValue={false}
                  isLoading={isLoadingEmpleados}
                  disabled={isLoading}
                  error={Boolean(openForm.formState.errors.empleadoId)}
                />
                {openForm.formState.errors.empleadoId && (
                  <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {openForm.formState.errors.empleadoId.message}
                  </p>
                )}
              </div>
            </div>

            {/* SECCIÓN 2: MONTO INICIAL Y OBSERVACIONES */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-border/40">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="size-3.5 text-primary" />
                  2. Fondo y Notas de Apertura
                </span>
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
                    {...openForm.register("montoInicial", { valueAsNumber: true })}
                    className={cn(
                      "h-9.5 pl-9 text-sm font-mono font-semibold bg-background",
                      openForm.formState.errors.montoInicial && "border-destructive focus-visible:ring-destructive"
                    )}
                    disabled={isLoading}
                  />
                </div>
                {openForm.formState.errors.montoInicial && (
                  <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {openForm.formState.errors.montoInicial.message}
                  </p>
                )}
              </div>

              {/* Observación de Apertura */}
              <div className="space-y-1.5">
                <Label htmlFor="observacion" className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
                  <FileText className="size-3.5" />
                  Observación de Apertura <span className="text-[10px] font-normal text-muted-foreground">(Opcional)</span>
                </Label>
                <Textarea
                  id="observacion"
                  placeholder="Detalles sobre el fondo inicial o notas de inicio del turno..."
                  {...openForm.register("observacion")}
                  rows={2}
                  maxLength={500}
                  className="text-xs bg-background resize-none"
                  disabled={isLoading}
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
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
                className="h-9.5 px-4 gap-2 text-xs sm:text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer"
              >
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                <span>Abrir Turno de Caja</span>
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
