"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calculator,
  Loader2,
  Plus,
  Trash2,
  Vault,
  AlertCircle,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Coins,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Check,
  CreditCard,
} from "lucide-react";
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

interface ArqueoCajaPageFormProps {
  defaultTurnoId?: number | null;
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

export function ArqueoCajaPageForm({ defaultTurnoId }: ArqueoCajaPageFormProps) {
  const router = useRouter();

  // Queries
  const { data: turnosData, isLoading: isLoadingTurnos } = useTurnosCaja({
    page: 1,
    pageSize: 100,
  });
  const { data: metodosData, isLoading: isLoadingMetodos } = useMetodosPago({
    page: 1,
    pageSize: 100,
  });
  const { data: monedasData, isLoading: isLoadingMonedas } = useMonedas({
    page: 1,
    pageSize: 100,
  });

  const registrarMutation = useRegistrarArqueoCaja();

  const turnosList = React.useMemo(() => {
    const list = Array.isArray(turnosData?.items)
      ? turnosData.items
      : Array.isArray(turnosData)
      ? turnosData
      : [];
    return list.filter(
      (t: TurnoCajaResponse) =>
        t.estado === EstadoTurnoCaja.Abierto || t.id === defaultTurnoId
    );
  }, [turnosData, defaultTurnoId]);

  const {
    register,
    control,
    handleSubmit,
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

  // Query resumen previo del turno seleccionado
  const {
    data: resumenData,
    isLoading: isLoadingResumen,
    refetch: refetchResumen,
  } = useResumenArqueoCaja(
    selectedTurnoId,
    Boolean(selectedTurnoId && selectedTurnoId > 0)
  );

  // Lista consolidada de métodos de pago
  const metodosList = React.useMemo(() => {
    const apiItems = Array.isArray(metodosData?.items) ? metodosData.items : [];
    const map = new Map<number, { id: number; nombre: string; codigo?: string }>();

    apiItems.forEach((m) => {
      map.set(m.id, { id: m.id, nombre: m.nombre, codigo: m.codigo });
    });

    if (resumenData?.detalles) {
      resumenData.detalles.forEach((d) => {
        if (!map.has(d.metodoPagoId)) {
          map.set(d.metodoPagoId, {
            id: d.metodoPagoId,
            nombre: d.metodoPagoNombre || `Método #${d.metodoPagoId}`,
          });
        }
      });
    }

    return Array.from(map.values());
  }, [metodosData, resumenData]);

  // Lista consolidada de monedas con nombres limpios
  const monedasList = React.useMemo(() => {
    const apiItems = Array.isArray(monedasData?.items) ? monedasData.items : [];
    const map = new Map<
      number,
      { id: number; nombre: string; codigo: string; simbolo: string; label: string }
    >();

    apiItems.forEach((m) => {
      const simboloClean = m.simbolo && m.simbolo !== m.codigo ? m.simbolo : "Bs.";
      map.set(m.id, {
        id: m.id,
        nombre: m.nombre || "Boliviano",
        codigo: m.codigo,
        simbolo: simboloClean,
        label: `${m.nombre || "Boliviano"} (${simboloClean})`,
      });
    });

    if (resumenData?.detalles) {
      resumenData.detalles.forEach((d) => {
        if (!map.has(d.monedaId)) {
          const simboloClean = d.monedaSimbolo && d.monedaSimbolo !== "BOB" ? d.monedaSimbolo : "Bs.";
          map.set(d.monedaId, {
            id: d.monedaId,
            nombre: d.monedaNombre || "Boliviano",
            codigo: "BOB",
            simbolo: simboloClean,
            label: `${d.monedaNombre || "Boliviano"} (${simboloClean})`,
          });
        }
      });
    }

    return Array.from(map.values());
  }, [monedasData, resumenData]);

  const defaultMonedaId = monedasList[0]?.id ?? 1;
  const defaultMetodoId = metodosList[0]?.id ?? 1;

  // Options para Autocomplete
  const turnoOptions: AutocompleteOption[] = React.useMemo(() => {
    return turnosList.map((t: TurnoCajaResponse) => {
      const cName = t.caja?.nombre || "Caja";
      const cCode = t.caja?.codigo || "CAJA";
      const empName =
        t.empleado?.nombreCompleto || `Cajero #${t.empleado?.id || t.id}`;
      return {
        value: String(t.id),
        label: `${empName} — ${cCode} (${cName})`,
        description: `Turno #${t.id} · Apertura: ${formatDatetime(t.fechaHoraApertura)}`,
      };
    });
  }, [turnosList]);

  const selectedTurno = React.useMemo(() => {
    return (
      turnosList.find((t: TurnoCajaResponse) => t.id === selectedTurnoId) || null
    );
  }, [turnosList, selectedTurnoId]);

  // Sincronizar montos esperados automáticamente desde el backend al seleccionar turno
  React.useEffect(() => {
    if (
      resumenData &&
      Array.isArray(resumenData.detalles) &&
      resumenData.detalles.length > 0
    ) {
      const mappedDetalles = resumenData.detalles.map((d) => ({
        metodoPagoId: d.metodoPagoId,
        monedaId: d.monedaId,
        montoEsperado: Number(d.montoEsperado || 0),
        montoContado: 0,
      }));
      replace(mappedDetalles);
    }
  }, [resumenData, replace]);

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
      router.push("/arqueos");
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
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in-50 duration-300 pb-16 px-1">
      {/* Cabecera Limpia */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.push("/arqueos")}
            className="size-9 rounded-lg hover:bg-accent cursor-pointer shrink-0"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Conciliación y Arqueo de Caja
              </h1>
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 text-[10px] font-semibold"
              >
                Nuevo Arqueo
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Declare el conteo físico de caja para auditar los saldos y cerrar diferencias.
            </p>
          </div>
        </div>

        {selectedTurnoId > 0 && (
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-muted/60 border border-border/50">
            <TrendingUp className="size-4 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block leading-none">
                Saldo Esperado
              </span>
              <span className="text-sm font-extrabold font-mono text-foreground leading-tight">
                {formatCurrency(totalEsperadoCalc)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Formulario Principal Responsive */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUMNA PRINCIPAL IZQUIERDA (8 cols en desktop, 100% en mobile) */}
          <div className="lg:col-span-8 space-y-5">
            {/* 1. Turno de Caja */}
            <div className="bg-card rounded-xl border border-border/60 p-4 sm:p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <Vault className="size-4.5 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Turno de Caja a Conciliar</h2>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="turnoCajaId" className="text-xs text-muted-foreground font-medium">
                  Cajero / Turno Abierto <span className="text-destructive">*</span>
                </Label>
                <Autocomplete
                  id="turnoCajaId"
                  value={selectedTurnoId ? String(selectedTurnoId) : ""}
                  onValueChange={handleTurnoChange}
                  options={turnoOptions}
                  placeholder="Seleccione el cajero o turno abierto..."
                  emptyText="No se encontraron turnos abiertos"
                  allowCustomValue={false}
                  isLoading={isLoadingTurnos}
                  disabled={isLoading || Boolean(defaultTurnoId)}
                  error={Boolean(errors.turnoCajaId)}
                />
                {errors.turnoCajaId && (
                  <p className="text-xs text-destructive font-medium flex items-center gap-1">
                    <AlertCircle className="size-3.5" />
                    {errors.turnoCajaId.message}
                  </p>
                )}
              </div>

              {/* Ficha Resumen del Turno */}
              {selectedTurno && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/40 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium">Caja:</span>
                    <span className="font-semibold text-foreground">
                      {selectedTurno.caja?.codigo} · {selectedTurno.caja?.nombre}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium">Fondo Inicial:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(selectedTurno.montoInicial)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium">Apertura:</span>
                    <span className="font-mono text-muted-foreground text-[11px]">
                      {formatDatetime(selectedTurno.fechaHoraApertura)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Desglose Físico por Métodos de Pago (LISTA RESPONSIVE MODERNA) */}
            <div className="bg-card rounded-xl border border-border/60 p-4 sm:p-5 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Coins className="size-4.5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <h2 className="text-sm font-bold text-foreground">Desglose Físico por Métodos de Pago</h2>
                    <p className="text-[11px] text-muted-foreground">
                      Declare los montos en efectivo y comprobantes físicos contados en caja.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {selectedTurnoId > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => refetchResumen()}
                      disabled={isLoadingResumen}
                      className="h-8 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Recalcular montos del sistema"
                    >
                      <RefreshCw className={cn("size-3.5", isLoadingResumen && "animate-spin")} />
                      <span>Recalcular</span>
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddDetalleRow}
                    className="h-8 px-2.5 text-xs font-semibold gap-1 text-primary cursor-pointer border-dashed"
                  >
                    <Plus className="size-3.5" />
                    <span>Agregar Fila</span>
                  </Button>
                </div>
              </div>

              {/* Lista Responsive de Métodos de Pago */}
              <div className="space-y-3 pt-1">
                {fields.length === 0 ? (
                  <div className="p-8 text-center border border-dashed rounded-xl space-y-2">
                    <Coins className="size-8 text-muted-foreground/40 mx-auto" />
                    <p className="text-xs font-semibold text-foreground">
                      No hay métodos de pago registrados
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddDetalleRow}
                      className="h-8 text-xs gap-1"
                    >
                      <Plus className="size-3.5" /> Agregar Método
                    </Button>
                  </div>
                ) : (
                  fields.map((field, index) => {
                    const curMetodoId = Number(watch(`detalles.${index}.metodoPagoId`));
                    const curMonedaId = Number(watch(`detalles.${index}.monedaId`));
                    const curMetodo = metodosList.find((m) => m.id === curMetodoId);
                    const curMoneda = monedasList.find((m) => m.id === curMonedaId);

                    const diffRow =
                      (Number(detallesWatch?.[index]?.montoContado) || 0) -
                      (Number(detallesWatch?.[index]?.montoEsperado) || 0);

                    const isRowExact = Math.abs(diffRow) < 0.001;

                    return (
                      <div
                        key={field.id}
                        className="p-4 rounded-xl border border-border/50 bg-muted/15 hover:bg-muted/25 transition-all space-y-3"
                      >
                        {/* Fila Superior: Selectores de Método, Moneda y Botón Eliminar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-border/40">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                            {/* Selector Método */}
                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-muted-foreground">
                                Método de Pago
                              </Label>
                              <Select
                                value={curMetodoId ? String(curMetodoId) : ""}
                                onValueChange={(val) =>
                                  setValue(`detalles.${index}.metodoPagoId`, Number(val), {
                                    shouldValidate: true,
                                  })
                                }
                                disabled={isLoadingMetodos || isLoading}
                              >
                                <SelectTrigger className="h-9 text-xs bg-background">
                                  <SelectValue placeholder="Seleccione método">
                                    {curMetodo?.nombre || "Seleccione método"}
                                  </SelectValue>
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

                            {/* Selector Moneda */}
                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-muted-foreground">
                                Moneda
                              </Label>
                              <Select
                                value={curMonedaId ? String(curMonedaId) : ""}
                                onValueChange={(val) =>
                                  setValue(`detalles.${index}.monedaId`, Number(val), {
                                    shouldValidate: true,
                                  })
                                }
                                disabled={isLoadingMonedas || isLoading}
                              >
                                <SelectTrigger className="h-9 text-xs bg-background">
                                  <SelectValue placeholder="Moneda">
                                    {curMoneda?.label || "Boliviano (Bs.)"}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {monedasList.map((mon) => (
                                    <SelectItem key={mon.id} value={String(mon.id)} className="text-xs">
                                      {mon.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Quitar fila */}
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 self-end sm:self-center gap-1 cursor-pointer rounded-lg shrink-0"
                            >
                              <Trash2 className="size-3.5" />
                              <span className="sm:hidden">Eliminar</span>
                            </Button>
                          )}
                        </div>

                        {/* Fila Inferior: 3 Bloques Responsivos (Esperado, Contado Físico, Diferencia) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                          {/* Esperado (Sistema) */}
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground block">
                              Esperado (Sistema)
                            </Label>
                            <div className="h-9 px-3 rounded-md bg-muted/50 border border-border/40 flex items-center justify-between sm:justify-end font-mono text-xs font-bold text-foreground">
                              <span className="sm:hidden text-muted-foreground font-sans font-normal text-[11px]">Sistema:</span>
                              <span>{formatCurrency(Number(detallesWatch?.[index]?.montoEsperado) || 0)}</span>
                            </div>
                          </div>

                          {/* Contado (Físico) */}
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                              Contado (Físico)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...register(`detalles.${index}.montoContado`, {
                                valueAsNumber: true,
                              })}
                              className="h-9 text-xs font-mono font-bold bg-background text-emerald-600 dark:text-emerald-400 text-right"
                              disabled={isLoading}
                              placeholder="0.00"
                            />
                          </div>

                          {/* Diferencia en vivo */}
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground block">
                              Diferencia Fila
                            </Label>
                            <div
                              className={cn(
                                "h-9 px-3 rounded-md border flex items-center justify-between sm:justify-end font-mono text-xs font-bold",
                                isRowExact
                                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400"
                                  : diffRow < 0
                                  ? "bg-rose-500/10 border-rose-500/25 text-rose-700 dark:text-rose-400"
                                  : "bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-400"
                              )}
                            >
                              <span className="sm:hidden font-sans font-medium text-[11px]">
                                {isRowExact ? "Exacto" : diffRow < 0 ? "Faltante" : "Sobrante"}:
                              </span>
                              <span>
                                {diffRow > 0
                                  ? `+${formatCurrency(diffRow)}`
                                  : formatCurrency(diffRow)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 3. Observaciones */}
            <div className="bg-card rounded-xl border border-border/60 p-4 sm:p-5 space-y-2 shadow-2xs">
              <Label
                htmlFor="observacion"
                className="text-xs font-semibold flex items-center gap-1.5 text-foreground"
              >
                <FileText className="size-3.5 text-muted-foreground" />
                Observaciones y Justificación de Arqueo
              </Label>
              <Textarea
                id="observacion"
                placeholder="Justificación de sobrantes/faltantes o notas de auditoría de cierre..."
                rows={2}
                className="text-xs resize-none bg-background"
                {...register("observacion")}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* COLUMNA DERECHA: TERMINAL DE CONCILIACIÓN STICKY (4 cols) */}
          <div className="lg:col-span-4 sticky top-6 space-y-4">
            <div className="bg-card rounded-xl border border-border/60 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4.5 text-primary" />
                  <h2 className="text-sm font-bold text-foreground">Terminal de Conciliación</h2>
                </div>

                {isExacto ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[10px] py-0.5 px-2 font-semibold"
                  >
                    <Check className="size-3 mr-0.5" /> Cuadrado
                  </Badge>
                ) : isFaltante ? (
                  <Badge
                    variant="outline"
                    className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 text-[10px] py-0.5 px-2 font-semibold"
                  >
                    <AlertTriangle className="size-3 mr-0.5" /> Faltante
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[10px] py-0.5 px-2 font-semibold"
                  >
                    <AlertTriangle className="size-3 mr-0.5" /> Sobrante
                  </Badge>
                )}
              </div>

              {/* Lista limpia de Totales */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-1 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground block">
                      Saldo Esperado (Sistema)
                    </span>
                    <span className="text-[10px] text-muted-foreground/80">Fondo + Cobros confirmados</span>
                  </div>
                  <span className="text-sm font-extrabold font-mono text-primary">
                    {formatCurrency(totalEsperadoCalc)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 text-xs border-t border-border/40 pt-2">
                  <div>
                    <span className="text-[11px] font-semibold text-foreground block">
                      Total Contado (Físico)
                    </span>
                    <span className="text-[10px] text-muted-foreground">Declarado en ventanilla</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-foreground">
                    {formatCurrency(totalContadoCalc)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 text-xs border-t border-border/40 pt-2.5">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider block">
                      Diferencia Global
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {isExacto
                        ? "Cuadre exacto"
                        : isFaltante
                        ? "Faltante en caja"
                        : "Sobrante en caja"}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-base font-black font-mono",
                      isExacto
                        ? "text-emerald-600 dark:text-emerald-400"
                        : isFaltante
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-amber-600 dark:text-amber-400"
                    )}
                  >
                    {diferenciaCalc > 0
                      ? `+${formatCurrency(diferenciaCalc)}`
                      : formatCurrency(diferenciaCalc)}
                  </span>
                </div>
              </div>

              {/* Mensaje Contextual de Auditoría */}
              <div
                className={cn(
                  "p-3 rounded-lg text-xs flex items-center gap-2",
                  isExacto
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : isFaltante
                    ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                )}
              >
                {isExacto ? (
                  <>
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>El arqueo cuadra al 100% con los saldos del sistema.</span>
                  </>
                ) : isFaltante ? (
                  <>
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>Existe un faltante en caja. Justifíquelo en observaciones.</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>Existe un sobrante en el conteo físico.</span>
                  </>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <Button
                  type="submit"
                  disabled={isLoading || selectedTurnoId === 0 || fields.length === 0}
                  className="w-full h-9.5 gap-2 text-xs font-semibold cursor-pointer shadow-xs bg-amber-600 hover:bg-amber-700 text-white transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  <span>Conciliar y Registrar Arqueo</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/arqueos")}
                  disabled={isLoading}
                  className="w-full h-8.5 text-xs cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
