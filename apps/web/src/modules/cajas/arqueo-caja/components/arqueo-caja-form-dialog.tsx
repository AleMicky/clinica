"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Calculator,
  Loader2,
  Plus,
  Trash2,
  Clock,
  Vault,
  AlertCircle,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Coins,
  RefreshCw,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { cn } from "@/lib/utils";

import { useTurnosCaja } from "../../turno-caja/hooks/use-turnos-caja";
import { useMetodosPago } from "@/modules/parametros/metodo-pago/hooks/use-metodos-pago";
import { useMonedas } from "@/modules/parametros/moneda/hooks/use-monedas";
import {
  registrarArqueoCajaSchema,
  type RegistrarArqueoCajaFormValues,
} from "../schemas/arqueo-caja.schema";
import {
  useRegistrarArqueoCaja,
  useResumenArqueoCaja,
} from "../hooks/use-arqueos-caja";
import { EstadoTurnoCaja, type TurnoCajaResponse } from "../../turno-caja/types/turno-caja.types";

interface ArqueoCajaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTurnoId?: number | null;
  onSuccessCallback?: () => void;
}

function formatDatetime(dateStr?: string | null): string {
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

function formatCurrency(val?: number | null): string {
  return `Bs. ${Number(val || 0).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function ArqueoCajaFormDialog({
  open,
  onOpenChange,
  defaultTurnoId,
  onSuccessCallback,
}: ArqueoCajaFormDialogProps) {
  // Queries
  const { data: turnosData, isLoading: isLoadingTurnos } = useTurnosCaja(
    { page: 1, pageSize: 100 },
    open
  );
  const { data: metodosData, isLoading: isLoadingMetodos } = useMetodosPago(
    { page: 1, pageSize: 100 },
    open
  );
  const { data: monedasData, isLoading: isLoadingMonedas } = useMonedas(
    { page: 1, pageSize: 100 }
  );

  const registrarMutation = useRegistrarArqueoCaja();

  const turnosList = React.useMemo(() => {
    const list = Array.isArray(turnosData?.items)
      ? turnosData.items
      : Array.isArray(turnosData)
      ? turnosData
      : [];
    // Filtrar preferentemente turnos abiertos para el arqueo
    return list.filter((t: TurnoCajaResponse) => t.estado === EstadoTurnoCaja.Abierto || t.id === defaultTurnoId);
  }, [turnosData, defaultTurnoId]);

  const metodosList = React.useMemo(() => {
    return Array.isArray(metodosData?.items)
      ? metodosData.items
      : Array.isArray(metodosData)
      ? metodosData
      : [];
  }, [metodosData]);

  const monedasList = React.useMemo(() => {
    return Array.isArray(monedasData?.items)
      ? monedasData.items
      : Array.isArray(monedasData)
      ? monedasData
      : [];
  }, [monedasData]);

  const defaultMonedaId = monedasList.length > 0 ? monedasList[0].id : 1;
  const defaultMetodoId = metodosList.length > 0 ? metodosList[0].id : 1;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegistrarArqueoCajaFormValues>({
    resolver: zodResolver(registrarArqueoCajaSchema),
    defaultValues: {
      turnoCajaId: defaultTurnoId || 0,
      observacion: "",
      detalles: [
        {
          metodoPagoId: 1,
          monedaId: 1,
          montoEsperado: 0,
          montoContado: 0,
        },
      ],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "detalles",
  });

  const selectedTurnoId = watch("turnoCajaId");
  const detallesWatch = watch("detalles");

  // Query resumen previo del turno
  const { data: resumenData, isLoading: isLoadingResumen, refetch: refetchResumen } =
    useResumenArqueoCaja(selectedTurnoId, Boolean(open && selectedTurnoId > 0));

  // Options para Turnos con nombre limpio del cajero
  const turnoOptions: AutocompleteOption[] = React.useMemo(() => {
    return turnosList.map((t: TurnoCajaResponse) => {
      const cName = t.caja?.nombre || "Caja";
      const cCode = t.caja?.codigo || "CAJA";
      const empName = t.empleado?.nombreCompleto || `Cajero #${t.empleado?.id || t.id}`;
      return {
        value: String(t.id),
        label: empName,
        description: `${cCode} · ${cName} • Turno #${t.id} (Abierto)`,
      };
    });
  }, [turnosList]);

  const selectedTurno = React.useMemo(() => {
    return turnosList.find((t: TurnoCajaResponse) => t.id === selectedTurnoId) || null;
  }, [turnosList, selectedTurnoId]);

  // Cuando cambia el resumen del backend, auto-cargar los métodos y montos esperados
  React.useEffect(() => {
    if (resumenData && Array.isArray(resumenData.detalles) && resumenData.detalles.length > 0) {
      const mappedDetalles = resumenData.detalles.map((d) => ({
        metodoPagoId: d.metodoPagoId,
        monedaId: d.monedaId,
        montoEsperado: Number(d.montoEsperado || 0),
        montoContado: Number(d.montoEsperado || 0), // Prellenar con el monto esperado sugerido
      }));
      replace(mappedDetalles);
    }
  }, [resumenData, replace]);

  React.useEffect(() => {
    if (open) {
      reset({
        turnoCajaId: defaultTurnoId || 0,
        observacion: "",
        detalles: [
          {
            metodoPagoId: defaultMetodoId,
            monedaId: defaultMonedaId,
            montoEsperado: 0,
            montoContado: 0,
          },
        ],
      });
    }
  }, [open, defaultTurnoId, defaultMetodoId, defaultMonedaId, reset]);

  // Totales calculados en tiempo real
  const totalEsperadoCalc = (detallesWatch || []).reduce(
    (acc, item) => acc + (Number(item?.montoEsperado) || 0),
    0
  );
  const totalContadoCalc = (detallesWatch || []).reduce(
    (acc, item) => acc + (Number(item?.montoContado) || 0),
    0
  );
  const diferenciaCalc = totalContadoCalc - totalEsperadoCalc;
  const isExacto = Math.abs(diferenciaCalc) < 0.001;
  const isFaltante = diferenciaCalc < -0.001;

  const handleTurnoChange = React.useCallback(
    (val: string) => {
      setValue("turnoCajaId", Number(val), { shouldValidate: true });
    },
    [setValue]
  );

  const handleAddDetalleRow = () => {
    append({
      metodoPagoId: defaultMetodoId,
      monedaId: defaultMonedaId,
      montoEsperado: 0,
      montoContado: 0,
    });
  };

  const onSubmit = async (values: RegistrarArqueoCajaFormValues) => {
    try {
      const payload = {
        turnoCajaId: Number(values.turnoCajaId),
        observacion: values.observacion?.trim() || null,
        detalles: values.detalles.map((d) => ({
          metodoPagoId: Number(d.metodoPagoId),
          monedaId: Number(d.monedaId),
          montoContado: Number(d.montoContado || 0),
        })),
      };

      await registrarMutation.mutateAsync(payload);
      toast.success("Arqueo de caja conciliado y registrado exitosamente.");

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { detail?: string; message?: string; title?: string } };
        message?: string;
      };
      const errorMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        "Ocurrió un error al procesar el arqueo de caja.";
      toast.error(errorMsg);
    }
  };

  const isLoading = registrarMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-border/60 shadow-2xl">
        {/* Header con temática y Saldo Esperado */}
        <div className="p-6 pb-5 border-b bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/20">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl border shadow-xs shrink-0 bg-amber-500 text-white border-amber-600 shadow-amber-500/20">
                  <Calculator className="size-5.5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                      Conciliación y Arqueo de Caja
                    </DialogTitle>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    >
                      Nuevo Arqueo
                    </Badge>
                  </div>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Declare los montos físicos contados en caja para conciliar los ingresos del turno.
                  </DialogDescription>
                </div>
              </div>

              {/* Saldo Esperado Destacado en Header */}
              {selectedTurnoId > 0 && (
                <div className="hidden sm:flex flex-col items-end pr-1 text-right shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Saldo Esperado
                  </span>
                  <span className="text-base font-extrabold text-primary font-mono">
                    {formatCurrency(totalEsperadoCalc)}
                  </span>
                </div>
              )}
            </div>
          </DialogHeader>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Fila: Selector de Turno */}
          <div className="space-y-1.5">
            <Label htmlFor="turnoCajaId" className="text-xs font-semibold flex items-center gap-1">
              Turno de Caja Abierto <span className="text-destructive">*</span>
            </Label>
            <Autocomplete
              id="turnoCajaId"
              value={selectedTurnoId ? String(selectedTurnoId) : ""}
              onValueChange={handleTurnoChange}
              options={turnoOptions}
              placeholder="Seleccione el cajero o turno abierto..."
              emptyText="No se encontraron turnos de caja abiertos"
              allowCustomValue={false}
              isLoading={isLoadingTurnos}
              disabled={isLoading || Boolean(defaultTurnoId)}
              error={Boolean(errors.turnoCajaId)}
            />
            {errors.turnoCajaId && (
              <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                <AlertCircle className="size-3" />
                {errors.turnoCajaId.message}
              </p>
            )}
          </div>

          {/* Tarjeta de Resumen del Turno con Saldo Esperado y Fondo Inicial */}
          {selectedTurno && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-9 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold shrink-0 border border-amber-500/30">
                    <Vault className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-foreground truncate block">
                      {selectedTurno.caja?.nombre || "Caja Principal"} ({selectedTurno.caja?.codigo || "CAJA"})
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate block">
                      Cajero: <strong className="text-foreground">{selectedTurno.empleado?.nombreCompleto || "Asignado"}</strong>
                    </span>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="bg-background text-amber-800 dark:text-amber-300 border-amber-500/30 text-[10px] font-mono shrink-0"
                >
                  Turno #{selectedTurno.id}
                </Badge>
              </div>

              {/* Indicadores Clave del Turno: Fondo, Saldo Esperado y Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-amber-500/20 text-xs">
                {/* 1. Fondo Inicial */}
                <div className="p-2 rounded-lg bg-background/80 border border-border/50 flex items-center justify-between sm:flex-col sm:items-start gap-1">
                  <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Coins className="size-3 text-emerald-600 dark:text-emerald-400" />
                    Fondo Inicial:
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(selectedTurno.montoInicial || 0)}
                  </span>
                </div>

                {/* 2. Saldo Esperado Total */}
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between sm:flex-col sm:items-start gap-1">
                  <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                    <TrendingUp className="size-3" />
                    Saldo Esperado:
                  </span>
                  <span className="font-mono font-extrabold text-primary text-xs sm:text-sm">
                    {formatCurrency(totalEsperadoCalc)}
                  </span>
                </div>

                {/* 3. Fecha/Hora Apertura */}
                <div className="p-2 rounded-lg bg-background/80 border border-border/50 flex items-center justify-between sm:flex-col sm:items-start gap-1">
                  <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3 text-amber-600" />
                    Apertura:
                  </span>
                  <span className="font-mono text-[11px] font-medium text-foreground truncate">
                    {formatDatetime(selectedTurno.fechaHoraApertura)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN DETALLES: ARQUEO POR MÉTODO DE PAGO */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-border/50">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Coins className="size-3.5 text-amber-600" />
                Desglose Físico por Métodos de Pago
              </span>

              <div className="flex items-center gap-1.5">
                {selectedTurnoId > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => refetchResumen()}
                    disabled={isLoadingResumen}
                    className="h-7 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Recalcular montos del sistema"
                  >
                    <RefreshCw className={cn("size-3", isLoadingResumen && "animate-spin")} />
                    <span>Recalcular</span>
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddDetalleRow}
                  className="h-7 text-xs font-semibold gap-1 text-primary hover:text-primary cursor-pointer border-dashed"
                >
                  <Plus className="size-3" />
                  <span>Agregar Fila</span>
                </Button>
              </div>
            </div>

            {fields.map((field, index) => {
              const diffRow =
                (Number(detallesWatch?.[index]?.montoContado) || 0) -
                (Number(detallesWatch?.[index]?.montoEsperado) || 0);

              return (
                <div
                  key={field.id}
                  className="p-3 rounded-xl border border-border/60 bg-card hover:border-border transition-all space-y-2.5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
                    {/* Método de Pago */}
                    <div className="space-y-1 sm:col-span-1">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Método</Label>
                      <Select
                        value={String(watch(`detalles.${index}.metodoPagoId`))}
                        onValueChange={(val) =>
                          setValue(`detalles.${index}.metodoPagoId`, Number(val), { shouldValidate: true })
                        }
                        disabled={isLoadingMetodos || isLoading}
                      >
                        <SelectTrigger className="h-8.5 text-xs bg-background">
                          <SelectValue placeholder="Método" />
                        </SelectTrigger>
                        <SelectContent>
                          {metodosList.map((m) => (
                            <SelectItem key={m.id} value={String(m.id)} className="text-xs">
                              {m.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Moneda */}
                    <div className="space-y-1 sm:col-span-1">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Moneda</Label>
                      <Select
                        value={String(watch(`detalles.${index}.monedaId`))}
                        onValueChange={(val) =>
                          setValue(`detalles.${index}.monedaId`, Number(val), { shouldValidate: true })
                        }
                        disabled={isLoadingMonedas || isLoading}
                      >
                        <SelectTrigger className="h-8.5 text-xs bg-background font-mono">
                          <SelectValue placeholder="Moneda" />
                        </SelectTrigger>
                        <SelectContent>
                          {monedasList.map((mon) => (
                            <SelectItem key={mon.id} value={String(mon.id)} className="text-xs">
                              {mon.codigo} ({mon.simbolo})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Monto Esperado (Calculado por Sistema) */}
                    <div className="space-y-1 sm:col-span-1">
                      <Label className="text-[11px] font-semibold text-muted-foreground">
                        Saldo Esperado (Sistema)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        readOnly
                        {...register(`detalles.${index}.montoEsperado`, { valueAsNumber: true })}
                        className="h-8.5 text-xs font-mono bg-muted/40 text-muted-foreground cursor-not-allowed font-semibold"
                      />
                    </div>

                    {/* Monto Contado (Físico declarado por cajero) + Delete */}
                    <div className="space-y-1 sm:col-span-1 flex items-end gap-1.5">
                      <div className="flex-1 space-y-1">
                        <Label className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          Saldo Contado (Físico)
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...register(`detalles.${index}.montoContado`, { valueAsNumber: true })}
                          className="h-8.5 text-xs font-mono font-bold bg-background text-emerald-600 dark:text-emerald-400"
                          disabled={isLoading}
                        />
                      </div>

                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="size-8.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0 rounded-lg"
                          title="Quitar fila"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Diferencia por fila */}
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-border/30 font-mono">
                    <span className="text-muted-foreground">Diferencia:</span>
                    <span
                      className={cn(
                        "font-bold",
                        Math.abs(diffRow) < 0.001
                          ? "text-emerald-600 dark:text-emerald-400"
                          : diffRow < 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {diffRow > 0 ? `+${formatCurrency(diffRow)} (Sobrante)` : diffRow < 0 ? `${formatCurrency(diffRow)} (Faltante)` : "Bs. 0.00 (Cuadre exacto)"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TARJETA TOTALES Y CONCILIACIÓN */}
          <div className="rounded-xl border p-4 bg-muted/25 space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-background p-2.5 rounded-lg border border-primary/20 space-y-0.5">
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider block">
                  Saldo Esperado Total
                </span>
                <span className="text-sm sm:text-base font-mono font-extrabold text-primary">
                  {formatCurrency(totalEsperadoCalc)}
                </span>
              </div>

              <div className="bg-background p-2.5 rounded-lg border border-border/50 space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                  Total Contado (Físico)
                </span>
                <span className="text-sm sm:text-base font-mono font-bold text-foreground">
                  {formatCurrency(totalContadoCalc)}
                </span>
              </div>

              <div
                className={cn(
                  "p-2.5 rounded-lg border space-y-0.5",
                  isExacto
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                    : isFaltante
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                )}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider block">
                  Diferencia Global
                </span>
                <span className="text-sm sm:text-base font-mono font-black">
                  {diferenciaCalc > 0 ? `+${formatCurrency(diferenciaCalc)}` : formatCurrency(diferenciaCalc)}
                </span>
              </div>
            </div>

            {/* Aviso Contextual */}
            <div className="flex items-center gap-2 text-xs">
              {isExacto ? (
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="size-4" />
                  <span>El arqueo cuadra exactamente con el saldo esperado del sistema.</span>
                </div>
              ) : isFaltante ? (
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-medium">
                  <AlertTriangle className="size-4" />
                  <span>Existe un faltante en el efectivo contado con respecto al saldo esperado. Deberá justificar la diferencia.</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                  <AlertTriangle className="size-4" />
                  <span>Existe un sobrante en el efectivo contado con respecto al saldo esperado.</span>
                </div>
              )}
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-1.5">
            <Label htmlFor="observacion" className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
              <FileText className="size-3.5" />
              Observaciones y Justificación de Arqueo
            </Label>
            <Textarea
              id="observacion"
              placeholder="Justificación de sobrantes/faltantes o notas de conciliación de cierre..."
              rows={2}
              className="text-xs resize-none bg-background"
              {...register("observacion")}
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
              disabled={isLoading || selectedTurnoId === 0}
              className="h-9.5 px-4 gap-2 text-xs sm:text-sm font-semibold cursor-pointer shadow-sm bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              <span>Conciliar y Registrar Arqueo</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
