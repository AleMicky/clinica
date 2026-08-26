"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Clock,
  LogOut,
  Loader2,
  Vault,
  Info,
  AlertCircle,
  Coins,
  FileText,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
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
  useResumenCierreTurnoCaja,
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
    return `${diffMinutes} min`;
  }
  return `${diffHours}h ${diffMinutes}m`;
}

export function TurnoCajaFormDialog({
  open,
  onOpenChange,
  turnoToClose,
  defaultCajaId,
  mode = "open",
  onSuccessCallback,
}: TurnoCajaFormDialogProps) {
  const router = useRouter();
  const isClosing = mode === "close";

  // Fetch Empleados & Cajas para apertura
  const { data: empleadosData, isLoading: isLoadingEmpleados } = useEmpleados(
    STATIC_QUERY_PARAMS
  );
  const { data: cajasData, isLoading: isLoadingCajas } = useCajas(
    STATIC_QUERY_PARAMS
  );

  // Hook para obtener el resumen de cierre del backend (ObtenerResumenCierreAsync)
  const {
    data: resumenCierre,
    isLoading: isLoadingResumen,
    error: errorResumen,
  } = useResumenCierreTurnoCaja(
    turnoToClose?.id,
    isClosing && Boolean(turnoToClose?.id && open)
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

  const handleGoToArqueo = () => {
    onOpenChange(false);
    router.push("/caja/arqueos/nuevo");
  };

  const isLoading =
    abrirMutation.isPending ||
    cerrarMutation.isPending ||
    (isClosing && isLoadingResumen);

  const errorDetail = (errorResumen as { response?: { data?: { detail?: string; message?: string } } })
    ?.response?.data?.detail ||
    (errorResumen as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    null;

  const requiresArqueo = Boolean(errorResumen) || !resumenCierre;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/80 shadow-lg">
        {/* Cabecera del Diálogo */}
        <div className="p-5 pb-4 border-b border-border/60 bg-muted/20">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center font-bold shadow-xs shrink-0",
                  isClosing
                    ? "bg-amber-600 text-white"
                    : "bg-primary text-primary-foreground"
                )}
              >
                {isClosing ? <LogOut className="size-5" /> : <Vault className="size-5" />}
              </div>

              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {isClosing ? "Cierre Operativo y Consolidación de Turno" : "Apertura de Turno de Caja"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {isClosing
                    ? "Audite el resumen de conciliación antes de confirmar el cierre definitivo del turno."
                    : "Asigne la caja registradora, cajero y monto inicial para iniciar la jornada."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* MODAL MODO CIERRE */}
        {isClosing && turnoToClose ? (
          <form onSubmit={closeForm.handleSubmit(handleCloseSubmit)} className="p-5 space-y-4">
            {/* Si está cargando el resumen */}
            {isLoadingResumen ? (
              <div className="p-8 text-center space-y-2">
                <Loader2 className="size-8 animate-spin text-amber-600 mx-auto" />
                <p className="text-xs font-semibold text-foreground">
                  Obteniendo resumen contable de cierre...
                </p>
              </div>
            ) : requiresArqueo ? (
              /* ALERTA: DEBE REALIZAR ARQUEO ANTES DE CERRAR */
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Arqueo de Caja Requerido para el Cierre
                    </h3>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      {errorDetail ||
                        "Debe realizar el arqueo de caja y declarar el conteo físico antes de poder cerrar este turno."}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <Button
                    type="button"
                    onClick={handleGoToArqueo}
                    className="h-8 px-3 text-xs font-semibold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-xs"
                  >
                    <span>Realizar Arqueo Ahora</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              /* RESUMEN DE CIERRE DEL BACKEND (ObtenerResumenCierreAsync) */
              <div className="space-y-3.5">
                {/* Métricas Principales de Auditoría */}
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-primary" />
                      <span className="text-xs font-bold text-foreground">
                        Resumen de Arqueo #{resumenCierre.arqueoCajaId}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 text-muted-foreground" />
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {formatDisplayDate(resumenCierre.fechaHoraArqueo)}
                      </span>
                    </div>
                  </div>

                  {/* 4 Métricas de Balance */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-background border border-border/50 space-y-0.5">
                      <span className="text-[10px] text-muted-foreground block font-medium uppercase">
                        Fondo Inicial
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {formatCurrency(resumenCierre.montoInicial)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 space-y-0.5">
                      <span className="text-[10px] text-primary block font-bold uppercase">
                        Saldo Esperado
                      </span>
                      <span className="font-mono font-extrabold text-primary">
                        {formatCurrency(resumenCierre.totalEsperado)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-background border border-border/50 space-y-0.5">
                      <span className="text-[10px] text-muted-foreground block font-medium uppercase">
                        Total Contado
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {formatCurrency(resumenCierre.totalContado)}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "p-2.5 rounded-lg border space-y-0.5",
                        Math.abs(Number(resumenCierre.diferencia)) < 0.001
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                          : Number(resumenCierre.diferencia) < 0
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                      )}
                    >
                      <span className="text-[10px] block font-bold uppercase">
                        Diferencia
                      </span>
                      <span className="font-mono font-black">
                        {Number(resumenCierre.diferencia) > 0
                          ? `+${formatCurrency(resumenCierre.diferencia)}`
                          : formatCurrency(resumenCierre.diferencia)}
                      </span>
                    </div>
                  </div>

                  {/* Estado de Cuadre */}
                  <div className="flex items-center gap-2 text-xs pt-1 border-t border-border/40">
                    {Math.abs(Number(resumenCierre.diferencia)) < 0.001 ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="size-4" />
                        <span>Arqueo conciliado con cuadre exacto (100% verificado).</span>
                      </div>
                    ) : Number(resumenCierre.diferencia) < 0 ? (
                      <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-medium">
                        <AlertTriangle className="size-4" />
                        <span>Existe un faltante de caja de {formatCurrency(Math.abs(Number(resumenCierre.diferencia)))}.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                        <AlertTriangle className="size-4" />
                        <span>Existe un sobrante de caja de {formatCurrency(resumenCierre.diferencia)}.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Desglose por Método de Pago */}
                {Array.isArray(resumenCierre.detalles) && resumenCierre.detalles.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Desglose de Formas de Pago Auditadas
                    </span>

                    <div className="rounded-xl border border-border/50 divide-y divide-border/40 overflow-hidden bg-background">
                      {resumenCierre.detalles.map((d) => (
                        <div
                          key={d.id}
                          className="p-2.5 flex items-center justify-between text-xs hover:bg-muted/20"
                        >
                          <div className="space-y-0.5">
                            <span className="font-semibold text-foreground block">
                              {d.metodoPago?.nombre || `Método #${d.metodoPagoId}`}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {d.moneda?.nombre || "Boliviano"} ({d.moneda?.simbolo || "Bs."})
                            </span>
                          </div>

                          <div className="text-right space-y-0.5 font-mono">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">Contado:</span>
                              <span className="font-bold text-foreground">
                                {formatCurrency(d.montoContado)}
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              Esperado: {formatCurrency(d.montoEsperado)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observación previa de arqueo */}
                {resumenCierre.observacionArqueo && (
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 text-xs">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Nota de Arqueo:
                    </span>
                    <p className="text-muted-foreground italic mt-0.5">
                      &quot;{resumenCierre.observacionArqueo}&quot;
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Observación de Cierre */}
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="closeObservacion" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <MessageSquare className="size-3.5 text-muted-foreground" />
                Observación Final de Cierre <span className="text-[10px] font-normal text-muted-foreground">(Opcional)</span>
              </Label>
              <Textarea
                id="closeObservacion"
                placeholder="Detalles sobre entrega de remesa, custodia de efectivo o notas finales de entrega de turno..."
                {...closeForm.register("observacion")}
                rows={2}
                maxLength={500}
                className="text-xs bg-background resize-none"
                disabled={isLoading || requiresArqueo}
              />
            </div>

            <DialogFooter className="pt-3 border-t gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="h-9 text-xs cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || requiresArqueo}
                className="h-9 px-4 gap-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer"
              >
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                <span>Confirmar Cierre Definitivo de Turno</span>
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* MODAL MODO APERTURA */
          <form onSubmit={openForm.handleSubmit(handleOpenSubmit)} className="p-5 space-y-4">
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
            <div className="space-y-3 pt-1">
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

            <DialogFooter className="pt-3 border-t gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="h-9 text-xs cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-9 px-4 gap-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
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
