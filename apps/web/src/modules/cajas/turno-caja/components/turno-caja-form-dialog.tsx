"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Clock,
  LogOut,
  Loader2,
  Vault,
  AlertCircle,
  Coins,
  FileText,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  User,
  Info,
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
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { Badge } from "@/components/ui/badge";
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
  useAbrirMiTurnoCaja,
  useAbrirTurnoCaja,
  useCerrarTurnoCaja,
  useResumenCierreTurnoCaja,
} from "../hooks/use-turnos-caja";
import type {
  MiSesionTurnoCajaResponse,
  ResumenCierreTurnoCajaResponse,
  TurnoCajaResponse,
} from "../types/turno-caja.types";

interface TurnoCajaFormDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly turnoToClose?: TurnoCajaResponse | null;
  readonly defaultCajaId?: number | null;
  readonly mode?: "open" | "close";
  readonly personalMode?: boolean;
  readonly sessionData?: MiSesionTurnoCajaResponse | null;
  readonly onSuccessCallback?: () => void;
}

const STATIC_QUERY_PARAMS = { page: 1, pageSize: 100 };
const PRESET_MONTOS = [0, 50, 100, 200, 500];

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

function extractErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;
  const err = error as {
    response?: { data?: { detail?: string; message?: string; title?: string } };
    message?: string;
  };
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.response?.data?.title ||
    err?.message ||
    fallback
  );
}

function normalizeList<T>(data: unknown): T[] {
  if (!data) return [];
  const list = data as { items?: T[] };
  if (Array.isArray(list.items)) return list.items;
  if (Array.isArray(data)) return data as T[];
  return [];
}

function getEmpleadoDisplayName(emp: EmpleadoResponse): string {
  if (!emp.persona) return emp.codigoEmpleado;
  const { nombres, apellidoPaterno, apellidoMaterno } = emp.persona;
  return `${nombres} ${apellidoPaterno} ${apellidoMaterno || ""}`.trim();
}

function getDifferenceBadgeStyle(diff: number): string {
  if (Math.abs(diff) < 0.001) {
    return "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400";
  }
  if (diff < 0) {
    return "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400";
  }
  return "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400";
}

interface DifferenceStatusMessageProps {
  readonly diff: number;
}

function DifferenceStatusMessage({ diff }: Readonly<DifferenceStatusMessageProps>) {
  if (Math.abs(diff) < 0.001) {
    return (
      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium text-xs">
        <CheckCircle2 className="size-4 shrink-0" />
        <span>Arqueo conciliado con cuadre exacto (100% verificado).</span>
      </div>
    );
  }
  if (diff < 0) {
    return (
      <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-medium text-xs">
        <AlertTriangle className="size-4 shrink-0" />
        <span>
          Existe un <strong>faltante</strong> de caja de {formatCurrency(Math.abs(diff))}.
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium text-xs">
      <AlertTriangle className="size-4 shrink-0" />
      <span>
        Existe un <strong>sobrante</strong> de caja de {formatCurrency(diff)}.
      </span>
    </div>
  );
}

interface TurnoInfoSummaryCardProps {
  readonly turno: TurnoCajaResponse;
}

function TurnoInfoSummaryCard({ turno }: Readonly<TurnoInfoSummaryCardProps>) {
  const cajaLabel = turno.caja
    ? `${turno.caja.codigo} - ${turno.caja.nombre}`
    : "Caja no especificada";
  const cajeroLabel =
    turno.empleado?.nombreCompleto ||
    turno.empleado?.codigoEmpleado ||
    "Cajero no asignado";

  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-2.5 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <Vault className="size-3.5 text-primary" />
          Turno Operativo a Consolidar #{turno.id}
        </span>
        <Badge
          variant="outline"
          className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
        >
          En Curso
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="flex items-start gap-2">
          <Vault className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Caja Asignada
            </span>
            <span className="font-semibold text-foreground">{cajaLabel}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <User className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Cajero Responsable
            </span>
            <span className="font-medium text-foreground">{cajeroLabel}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Clock className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Fecha y Hora de Apertura
            </span>
            <span className="font-mono text-foreground">
              {formatDisplayDate(turno.fechaHoraApertura)}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Coins className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Fondo Inicial en Caja
            </span>
            <span className="font-mono font-semibold text-foreground">
              {formatCurrency(turno.montoInicial)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TurnoCajaDialogHeaderProps {
  readonly isClosing: boolean;
}

function TurnoCajaDialogHeader({ isClosing }: Readonly<TurnoCajaDialogHeaderProps>) {
  return (
    <div
      className={cn(
        "p-5 pb-4 border-b border-border/60",
        isClosing
          ? "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent"
          : "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
      )}
    >
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
              {isClosing
                ? "Cierre Operativo y Consolidación de Turno"
                : "Apertura de Turno de Caja"}
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
  );
}

interface ResumenCierreDetalleProps {
  readonly resumen: ResumenCierreTurnoCajaResponse;
}

function ResumenCierreDetalle({
  resumen,
}: Readonly<ResumenCierreDetalleProps>) {
  const diff = Number(resumen.diferencia || 0);
  const formattedDiff =
    diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff);
  const hasDiscrepancy = Math.abs(diff) >= 0.01;

  return (
    <div className="space-y-3.5">
      {/* Métricas Principales de Auditoría */}
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <span className="text-xs font-bold text-foreground">
              Resumen de Arqueo #{resumen.arqueoCajaId}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="size-3 text-muted-foreground" />
            <span className="text-[11px] font-mono text-muted-foreground">
              {formatDisplayDate(resumen.fechaHoraArqueo)}
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
              {formatCurrency(resumen.montoInicial)}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 space-y-0.5">
            <span className="text-[10px] text-primary block font-bold uppercase">
              Saldo Esperado
            </span>
            <span className="font-mono font-extrabold text-primary">
              {formatCurrency(resumen.totalEsperado)}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-background border border-border/50 space-y-0.5">
            <span className="text-[10px] text-muted-foreground block font-medium uppercase">
              Total Contado
            </span>
            <span className="font-mono font-bold text-foreground">
              {formatCurrency(resumen.totalContado)}
            </span>
          </div>

          <div
            className={cn(
              "p-2.5 rounded-lg border space-y-0.5",
              getDifferenceBadgeStyle(diff)
            )}
          >
            <span className="text-[10px] block font-bold uppercase">
              Diferencia
            </span>
            <span className="font-mono font-black">{formattedDiff}</span>
          </div>
        </div>

        {/* Estado de Cuadre */}
        <div className="flex items-center gap-2 text-xs pt-1 border-t border-border/40">
          <DifferenceStatusMessage diff={diff} />
        </div>
      </div>

      {/* Alerta de advertencia si existe discrepancia */}
      {hasDiscrepancy && (
        <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <Info className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <span className="font-bold block">Discrepancia contable detectada</span>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              El arqueo presenta una diferencia de {formattedDiff}. Por favor, documente
              la causa en la observación de cierre antes de finalizar.
            </p>
          </div>
        </div>
      )}

      {/* Desglose por Método de Pago */}
      {Array.isArray(resumen.detalles) && resumen.detalles.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Desglose de Formas de Pago Auditadas
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {resumen.detalles.length} método(s)
            </span>
          </div>

          <div className="rounded-xl border border-border/50 divide-y divide-border/40 overflow-hidden bg-background">
            {resumen.detalles.map((d) => {
              const metodoDiff = Number(d.montoContado || 0) - Number(d.montoEsperado || 0);
              const hasMetodoDiff = Math.abs(metodoDiff) >= 0.01;

              return (
                <div
                  key={d.id}
                  className="p-2.5 flex items-center justify-between text-xs hover:bg-muted/20 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">
                        {d.metodoPago?.nombre || `Método #${d.metodoPagoId}`}
                      </span>
                      {hasMetodoDiff && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] px-1 py-0 h-4 font-mono font-semibold",
                            metodoDiff < 0
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          )}
                        >
                          {metodoDiff < 0 ? "Faltante" : "Sobrante"}
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {d.moneda?.nombre || "Boliviano"} ({d.moneda?.simbolo || "Bs."})
                    </span>
                  </div>

                  <div className="text-right space-y-0.5 font-mono">
                    <div className="flex items-center justify-end gap-2">
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
              );
            })}
          </div>
        </div>
      )}

      {/* Observación previa de arqueo */}
      {resumen.observacionArqueo && (
        <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 text-xs">
          <span className="text-[10px] font-bold text-muted-foreground uppercase block">
            Nota registrada en Arqueo:
          </span>
          <p className="text-muted-foreground italic mt-0.5">
            &quot;{resumen.observacionArqueo}&quot;
          </p>
        </div>
      )}
    </div>
  );
}

interface ArqueoRequeridoAlertProps {
  readonly errorDetail?: string | null;
  readonly onGoToArqueo: () => void;
}

function ArqueoRequeridoAlert({
  errorDetail,
  onGoToArqueo,
}: Readonly<ArqueoRequeridoAlertProps>) {
  return (
    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">
            Arqueo de Caja Requerido para el Cierre
          </h3>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            {errorDetail ||
              "Debe realizar el arqueo de caja y registrar el conteo físico antes de poder confirmar el cierre definitivo de este turno."}
          </p>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-end">
        <Button
          type="button"
          onClick={onGoToArqueo}
          className="h-8 px-3 text-xs font-semibold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-xs"
        >
          <span>Realizar Arqueo Ahora</span>
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

interface TurnoCajaCierreFormProps {
  readonly open: boolean;
  readonly turnoToClose: TurnoCajaResponse;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccessCallback?: () => void;
}

function TurnoCajaCierreForm({
  open,
  turnoToClose,
  onOpenChange,
  onSuccessCallback,
}: Readonly<TurnoCajaCierreFormProps>) {
  const router = useRouter();

  const {
    data: resumenCierre,
    isLoading: isLoadingResumen,
    error: errorResumen,
  } = useResumenCierreTurnoCaja(turnoToClose.id, Boolean(turnoToClose.id && open));

  const cerrarMutation = useCerrarTurnoCaja();

  const closeForm = useForm<CerrarTurnoCajaFormValues>({
    resolver: zodResolver(cerrarTurnoCajaSchema),
    defaultValues: {
      observacion: "",
    },
  });

  const observacionText =
    useWatch({ control: closeForm.control, name: "observacion" }) || "";

  React.useEffect(() => {
    if (open) {
      closeForm.reset({ observacion: "" });
    }
  }, [open, closeForm]);

  const handleCloseSubmit = async (values: CerrarTurnoCajaFormValues) => {
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
      const message = extractErrorMessage(error, "Error al cerrar el turno de caja.");
      toast.error(message);
    }
  };

  const handleGoToArqueo = () => {
    onOpenChange(false);
    router.push(`/caja/arqueos/nuevo?turnoId=${turnoToClose.id}`);
  };

  const isLoading = cerrarMutation.isPending || isLoadingResumen;
  const requiresArqueo = Boolean(errorResumen) || !resumenCierre;
  const errorDetail = extractErrorMessage(errorResumen, "");

  let resumenContent: React.ReactNode;
  if (isLoadingResumen) {
    resumenContent = (
      <div className="p-8 text-center space-y-2">
        <Loader2 className="size-8 animate-spin text-amber-600 mx-auto" />
        <p className="text-xs font-semibold text-foreground">
          Consultando resumen contable y arqueo de cierre...
        </p>
      </div>
    );
  } else if (requiresArqueo || !resumenCierre) {
    resumenContent = (
      <ArqueoRequeridoAlert
        errorDetail={errorDetail}
        onGoToArqueo={handleGoToArqueo}
      />
    );
  } else {
    resumenContent = <ResumenCierreDetalle resumen={resumenCierre} />;
  }

  return (
    <form onSubmit={closeForm.handleSubmit(handleCloseSubmit)} className="p-5 space-y-4">
      {/* Resumen de la caja y cajero activo */}
      <TurnoInfoSummaryCard turno={turnoToClose} />

      {/* Contenido de Conciliación y Arqueo */}
      {resumenContent}

      {/* Observación de Cierre */}
      <div className="space-y-1.5 pt-1">
        <Label
          htmlFor="closeObservacion"
          className="text-xs font-semibold flex items-center justify-between text-foreground"
        >
          <span className="flex items-center gap-1.5">
            <MessageSquare className="size-3.5 text-muted-foreground" />
            Observación Final de Cierre{" "}
            <span className="text-[10px] font-normal text-muted-foreground">
              (Opcional)
            </span>
          </span>
          <span
            className={cn(
              "text-[10px] font-mono",
              observacionText.length >= 480
                ? "text-destructive font-bold"
                : "text-muted-foreground"
            )}
          >
            {observacionText.length}/500
          </span>
        </Label>
        <Textarea
          id="closeObservacion"
          placeholder="Detalles sobre entrega de remesa, custodia de efectivo o novedades de guardia..."
          {...closeForm.register("observacion")}
          rows={2}
          maxLength={500}
          className="text-xs bg-background resize-none"
          disabled={isLoading || requiresArqueo}
        />
        <p className="text-[11px] text-muted-foreground">
          {Math.abs(Number(resumenCierre?.diferencia || 0)) >= 0.01
            ? "Recomendado: registre la justificación de la diferencia detectada."
            : "Esta observación quedará registrada en el histórico de cierre del turno."}
        </p>
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
  );
}

interface PersonalCajeroCardProps {
  readonly sessionData?: MiSesionTurnoCajaResponse | null;
}

function PersonalCajeroCard({ sessionData }: Readonly<PersonalCajeroCardProps>) {
  const cajeroNombre =
    sessionData?.empleado?.nombreCompleto ||
    sessionData?.nombreCompleto ||
    "Usuario Autenticado";

  const cajeroSubtitulo = sessionData?.empleado?.codigoEmpleado
    ? `Código Empleado: ${sessionData.empleado.codigoEmpleado}`
    : `Usuario: @${sessionData?.userName || "-"}`;

  const faltaEmpleado = Boolean(sessionData && !sessionData.empleado);

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold flex items-center gap-1 text-foreground">
        Cajero en Sesión (Asignación Automática)
      </span>
      <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <User className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                {cajeroNombre}
              </span>
              <Badge
                variant="outline"
                className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
              >
                Sesión Activa
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
              {cajeroSubtitulo}
            </p>
          </div>
        </div>
      </div>
      {faltaEmpleado && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 pt-0.5">
          <AlertTriangle className="size-3 shrink-0" />
          Su cuenta de usuario no tiene una ficha de empleado activa vinculada.
        </p>
      )}
    </div>
  );
}

interface TurnoCajaAperturaFormProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly defaultCajaId?: number | null;
  readonly personalMode?: boolean;
  readonly sessionData?: MiSesionTurnoCajaResponse | null;
  readonly onSuccessCallback?: () => void;
}

function TurnoCajaAperturaForm({
  open,
  onOpenChange,
  defaultCajaId,
  personalMode = false,
  sessionData,
  onSuccessCallback,
}: Readonly<TurnoCajaAperturaFormProps>) {
  const { data: empleadosData, isLoading: isLoadingEmpleados } = useEmpleados(
    STATIC_QUERY_PARAMS
  );
  const { data: cajasData, isLoading: isLoadingCajas } = useCajas(
    STATIC_QUERY_PARAMS
  );

  const abrirMutation = useAbrirTurnoCaja();
  const abrirMiTurnoMutation = useAbrirMiTurnoCaja();

  const personalEmpleadoId = sessionData?.empleado?.id || (personalMode ? 1 : 0);

  const openForm = useForm<AbrirTurnoCajaFormValues>({
    resolver: zodResolver(abrirTurnoCajaSchema),
    defaultValues: {
      cajaId: defaultCajaId || 0,
      empleadoId: personalEmpleadoId,
      montoInicial: 0,
      observacion: "",
    },
  });

  const selectedCajaId = useWatch({
    control: openForm.control,
    name: "cajaId",
  });
  const selectedEmpleadoId = useWatch({
    control: openForm.control,
    name: "empleadoId",
  });
  const montoInicialVal = useWatch({
    control: openForm.control,
    name: "montoInicial",
  });
  const observacionText =
    useWatch({ control: openForm.control, name: "observacion" }) || "";

  const empleadosList = React.useMemo(() => {
    return normalizeList<EmpleadoResponse>(empleadosData);
  }, [empleadosData]);

  const cajasList = React.useMemo(() => {
    return normalizeList<CajaResponse>(cajasData);
  }, [cajasData]);

  const defaultCaja = React.useMemo(() => {
    if (!defaultCajaId) return null;
    return cajasList.find((c) => c.id === defaultCajaId) || null;
  }, [cajasList, defaultCajaId]);

  const empleadoOptions: AutocompleteOption[] = React.useMemo(() => {
    return empleadosList.map((emp) => ({
      value: String(emp.id),
      label: `${emp.codigoEmpleado} - ${getEmpleadoDisplayName(emp)}`,
      description: emp.persona?.numeroDocumento
        ? `Documento: ${emp.persona.numeroDocumento}`
        : undefined,
    }));
  }, [empleadosList]);

  const cajaOptions: AutocompleteOption[] = React.useMemo(() => {
    return cajasList.map((caja) => ({
      value: String(caja.id),
      label: `${caja.codigo} - ${caja.nombre}`,
      description: caja.descripcion || (caja.activo ? "Caja Activa" : "Inactiva"),
    }));
  }, [cajasList]);

  React.useEffect(() => {
    if (open) {
      openForm.reset({
        cajaId: defaultCajaId || 0,
        empleadoId: sessionData?.empleado?.id || (personalMode ? 1 : 0),
        montoInicial: 0,
        observacion: "",
      });
    }
  }, [open, defaultCajaId, personalMode, sessionData?.empleado?.id, openForm]);

  const handleAddAmount = (amountToAdd: number) => {
    const currentVal = Number(openForm.getValues("montoInicial") || 0);
    const updatedVal = Math.round((currentVal + amountToAdd) * 100) / 100;
    openForm.setValue("montoInicial", updatedVal, { shouldValidate: true });
  };

  const handleOpenSubmit = async (values: AbrirTurnoCajaFormValues) => {
    try {
      const targetCajaId = Number(defaultCajaId || values.cajaId);
      if (!targetCajaId) {
        toast.error("Debe seleccionar una caja registradora válida.");
        return;
      }

      if (personalMode) {
        await abrirMiTurnoMutation.mutateAsync({
          cajaId: targetCajaId,
          montoInicial: Number(values.montoInicial || 0),
          observacion: values.observacion?.trim() || null,
        });
      } else {
        await abrirMutation.mutateAsync({
          cajaId: targetCajaId,
          empleadoId: Number(values.empleadoId),
          montoInicial: Number(values.montoInicial || 0),
          observacion: values.observacion?.trim() || null,
        });
      }

      toast.success("Turno de caja abierto correctamente.");
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Error al abrir el turno de caja.");
      toast.error(message);
    }
  };

  const isLoading = abrirMutation.isPending || abrirMiTurnoMutation.isPending;

  return (
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

        {/* Visualización de Caja: Preseleccionada o Selector */}
        {defaultCajaId ? (
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Vault className="size-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    {defaultCaja
                      ? `${defaultCaja.codigo} - ${defaultCaja.nombre}`
                      : `Caja Asignada #${defaultCajaId}`}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-primary/10 text-primary border-primary/20"
                  >
                    Caja Preseleccionada
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {defaultCaja?.descripcion || "Caja operativa vinculada para la apertura."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="cajaId" className="text-xs font-semibold flex items-center gap-1">
              Caja Registradora <span className="text-destructive">*</span>
            </Label>
            <Autocomplete
              id="cajaId"
              value={selectedCajaId ? String(selectedCajaId) : ""}
              onValueChange={(val) =>
                openForm.setValue("cajaId", Number(val), { shouldValidate: true })
              }
              options={cajaOptions}
              placeholder="Seleccione la caja registradora..."
              emptyText="No se encontraron cajas registradas"
              allowCustomValue={false}
              isLoading={isLoadingCajas}
              disabled={isLoading}
              openOnFocus={false}
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
        {personalMode ? (
          <PersonalCajeroCard sessionData={sessionData} />
        ) : (
          <div className="space-y-1.5">
            <Label
              htmlFor="empleadoId"
              className="text-xs font-semibold flex items-center gap-1"
            >
              Cajero / Empleado Responsable <span className="text-destructive">*</span>
            </Label>
            <Autocomplete
              id="empleadoId"
              value={selectedEmpleadoId ? String(selectedEmpleadoId) : ""}
              onValueChange={(val) =>
                openForm.setValue("empleadoId", Number(val), { shouldValidate: true })
              }
              options={empleadoOptions}
              placeholder="Buscar por código, nombre o documento de cajero..."
              emptyText="No se encontraron cajeros/empleados registrados"
              allowCustomValue={false}
              isLoading={isLoadingEmpleados}
              disabled={isLoading}
              openOnFocus={false}
              error={Boolean(openForm.formState.errors.empleadoId)}
            />
            {openForm.formState.errors.empleadoId && (
              <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                <AlertCircle className="size-3" />
                {openForm.formState.errors.empleadoId.message}
              </p>
            )}
          </div>
        )}
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="montoInicial"
              className="text-xs font-semibold flex items-center gap-1"
            >
              Monto Inicial en Efectivo (Bs.) <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap items-center gap-1">
              {PRESET_MONTOS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    openForm.setValue("montoInicial", preset, { shouldValidate: true })
                  }
                  className={cn(
                    "text-[10px] font-semibold transition-colors cursor-pointer px-2 py-0.5 rounded border",
                    Number(montoInicialVal) === preset
                      ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                      : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
                  )}
                >
                  {preset === 0 ? "0 Bs." : `${preset} Bs.`}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleAddAmount(50)}
                className="text-[10px] font-semibold transition-colors cursor-pointer px-1.5 py-0.5 rounded border border-dashed border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Sumar 50 Bs. al fondo inicial"
              >
                +50
              </button>
              <button
                type="button"
                onClick={() => handleAddAmount(100)}
                className="text-[10px] font-semibold transition-colors cursor-pointer px-1.5 py-0.5 rounded border border-dashed border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Sumar 100 Bs. al fondo inicial"
              >
                +100
              </button>
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground select-none pointer-events-none">
              Bs.
            </span>
            <Input
              id="montoInicial"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...openForm.register("montoInicial", {
                valueAsNumber: true,
                setValueAs: (v) =>
                  v === "" || v === null || isNaN(Number(v)) ? 0 : Number(v),
              })}
              className={cn(
                "h-9.5 pl-9 text-sm font-mono font-semibold bg-background",
                openForm.formState.errors.montoInicial &&
                  "border-destructive focus-visible:ring-destructive"
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
          <Label
            htmlFor="observacion"
            className="text-xs font-semibold flex items-center justify-between text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <FileText className="size-3.5" />
              Observación de Apertura{" "}
              <span className="text-[10px] font-normal text-muted-foreground">
                (Opcional)
              </span>
            </span>
            <span
              className={cn(
                "text-[10px] font-mono",
                observacionText.length >= 480
                  ? "text-destructive font-bold"
                  : "text-muted-foreground"
              )}
            >
              {observacionText.length}/500
            </span>
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
          disabled={isLoading || (personalMode && Boolean(sessionData && !sessionData.empleado))}
          className="h-9 px-4 gap-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
        >
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          <span>Abrir Turno de Caja</span>
        </Button>
      </DialogFooter>
    </form>
  );
}

export function TurnoCajaFormDialog({
  open,
  onOpenChange,
  turnoToClose,
  defaultCajaId,
  mode = "open",
  personalMode = false,
  sessionData,
  onSuccessCallback,
}: Readonly<TurnoCajaFormDialogProps>) {
  const isClosing = mode === "close";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        initialFocus={false}
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/80 shadow-lg"
      >
        <TurnoCajaDialogHeader isClosing={isClosing} />

        {isClosing && turnoToClose ? (
          <TurnoCajaCierreForm
            open={open}
            turnoToClose={turnoToClose}
            onOpenChange={onOpenChange}
            onSuccessCallback={onSuccessCallback}
          />
        ) : (
          <TurnoCajaAperturaForm
            open={open}
            defaultCajaId={defaultCajaId}
            personalMode={personalMode}
            sessionData={sessionData}
            onOpenChange={onOpenChange}
            onSuccessCallback={onSuccessCallback}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
