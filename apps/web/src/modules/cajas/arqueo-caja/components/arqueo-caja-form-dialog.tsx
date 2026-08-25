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
  Calendar,
  Clock,
  User,
  Vault,
  Pencil,
  AlertCircle,
  FileText,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Coins,
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
  arqueoCajaSchema,
  type ArqueoCajaFormValues,
} from "../schemas/arqueo-caja.schema";
import {
  useCreateArqueoCaja,
  useUpdateArqueoCaja,
} from "../hooks/use-arqueos-caja";
import type { ArqueoCajaResponse } from "../types/arqueo-caja.types";

interface ArqueoCajaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  arqueoToEdit?: ArqueoCajaResponse | null;
  onSuccessCallback?: () => void;
}

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

function formatCurrency(val?: number | null): string {
  return `Bs. ${Number(val || 0).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ArqueoCajaFormDialog({
  open,
  onOpenChange,
  arqueoToEdit,
  onSuccessCallback,
}: ArqueoCajaFormDialogProps) {
  const isEditing = Boolean(arqueoToEdit);

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

  const createMutation = useCreateArqueoCaja();
  const updateMutation = useUpdateArqueoCaja();

  const turnosList = React.useMemo(() => {
    return Array.isArray(turnosData?.items)
      ? turnosData.items
      : Array.isArray(turnosData)
      ? turnosData
      : [];
  }, [turnosData]);

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
  } = useForm<ArqueoCajaFormValues>({
    resolver: zodResolver(arqueoCajaSchema),
    defaultValues: {
      turnoCajaId: 0,
      fechaHora: toLocalDatetimeString(),
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "detalles",
  });

  const selectedTurnoId = watch("turnoCajaId");
  const fechaHoraVal = watch("fechaHora");
  const detallesWatch = watch("detalles");

  // Options para Turnos con nombre limpio del cajero
  const turnoOptions: AutocompleteOption[] = React.useMemo(() => {
    return turnosList.map((t) => {
      const cName = t.caja?.nombre || "Caja";
      const cCode = t.caja?.codigo || "CAJA";
      const empName = t.empleado?.nombreCompleto || `Cajero #${t.empleado?.id || t.id}`;
      return {
        value: String(t.id),
        label: empName,
        description: `${cCode} · ${cName} • Turno #${t.id}`,
      };
    });
  }, [turnosList]);

  const selectedTurno = React.useMemo(() => {
    return turnosList.find((t) => t.id === selectedTurnoId) || arqueoToEdit?.turnoCaja || null;
  }, [turnosList, selectedTurnoId, arqueoToEdit]);

  React.useEffect(() => {
    if (open) {
      if (arqueoToEdit) {
        reset({
          turnoCajaId: arqueoToEdit.turnoCaja?.id || 0,
          fechaHora: toLocalDatetimeString(arqueoToEdit.fechaHora),
          observacion: arqueoToEdit.observacion || "",
          detalles:
            arqueoToEdit.detalles && arqueoToEdit.detalles.length > 0
              ? arqueoToEdit.detalles.map((d) => ({
                  metodoPagoId: d.metodoPagoId || defaultMetodoId,
                  monedaId: d.monedaId || defaultMonedaId,
                  montoEsperado: Number(d.montoEsperado || 0),
                  montoContado: Number(d.montoContado || 0),
                }))
              : [
                  {
                    metodoPagoId: defaultMetodoId,
                    monedaId: defaultMonedaId,
                    montoEsperado: 0,
                    montoContado: 0,
                  },
                ],
        });
      } else {
        reset({
          turnoCajaId: 0,
          fechaHora: toLocalDatetimeString(),
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
    }
  }, [open, arqueoToEdit, defaultMetodoId, defaultMonedaId, reset]);

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

  const setNowForFechaHora = () => {
    setValue("fechaHora", toLocalDatetimeString(), { shouldValidate: true });
  };

  const handleAddDetalleRow = () => {
    append({
      metodoPagoId: defaultMetodoId,
      monedaId: defaultMonedaId,
      montoEsperado: 0,
      montoContado: 0,
    });
  };

  const onSubmit = async (values: ArqueoCajaFormValues) => {
    try {
      const payload = {
        turnoCajaId: Number(values.turnoCajaId),
        fechaHora: new Date(values.fechaHora).toISOString(),
        observacion: values.observacion?.trim() || null,
        detalles: values.detalles.map((d) => ({
          metodoPagoId: Number(d.metodoPagoId),
          monedaId: Number(d.monedaId),
          montoEsperado: Number(d.montoEsperado || 0),
          montoContado: Number(d.montoContado || 0),
        })),
      };

      if (isEditing && arqueoToEdit) {
        await updateMutation.mutateAsync({
          id: arqueoToEdit.id,
          data: payload,
        });
        toast.success("Arqueo de caja actualizado correctamente.");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Arqueo de caja conciliado y registrado exitosamente.");
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Ocurrió un error al procesar el arqueo de caja.";
      toast.error(errorMsg);
    }
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-border/60 shadow-2xl">
        {/* Header con temática */}
        <div
          className={cn(
            "p-6 pb-5 border-b",
            isEditing
              ? "bg-gradient-to-r from-blue-500/15 via-blue-500/5 to-transparent border-blue-500/20"
              : "bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/20"
          )}
        >
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-2xl border shadow-xs shrink-0",
                  isEditing
                    ? "bg-blue-600 text-white border-blue-700 shadow-blue-500/20"
                    : "bg-amber-500 text-white border-amber-600 shadow-amber-500/20"
                )}
              >
                {isEditing ? <Pencil className="size-5.5" /> : <Calculator className="size-5.5" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                    {isEditing ? "Modificar Arqueo de Caja" : "Conciliación de Arqueo de Caja"}
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                      isEditing
                        ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    )}
                  >
                    {isEditing ? "Edición" : "Nuevo Arqueo"}
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Declare los montos físicos contados por método de pago para conciliar el turno.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Fila 1: Selector de Turno y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="turnoCajaId" className="text-xs font-semibold flex items-center gap-1">
                Turno de Caja <span className="text-destructive">*</span>
              </Label>
              <Autocomplete
                id="turnoCajaId"
                value={selectedTurnoId ? String(selectedTurnoId) : ""}
                onValueChange={handleTurnoChange}
                options={turnoOptions}
                placeholder="Seleccione el cajero o turno..."
                emptyText="No se encontraron turnos de caja"
                allowCustomValue={false}
                isLoading={isLoadingTurnos}
                disabled={isLoading || isEditing}
                error={Boolean(errors.turnoCajaId)}
              />
              {errors.turnoCajaId && (
                <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.turnoCajaId.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="fechaHora" className="text-xs font-semibold flex items-center gap-1">
                  Fecha y Hora <span className="text-destructive">*</span>
                </Label>
                <button
                  type="button"
                  onClick={setNowForFechaHora}
                  className="text-[10px] font-semibold text-primary hover:underline cursor-pointer bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1"
                >
                  <Clock className="size-2.5" />
                  Ahora
                </button>
              </div>
              <Input
                id="fechaHora"
                type="datetime-local"
                value={fechaHoraVal}
                onChange={(e) => setValue("fechaHora", e.target.value, { shouldValidate: true })}
                className={cn(
                  "h-9.5 text-xs font-mono bg-background",
                  errors.fechaHora && "border-destructive focus-visible:ring-destructive"
                )}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Tarjeta de Resumen del Turno */}
          {selectedTurno && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-3 flex items-center justify-between gap-3 text-xs">
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
          )}

          {/* SECCIÓN DETALLES: ARQUEO POR MÉTODO DE PAGO */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-border/50">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Coins className="size-3.5 text-amber-600" />
                Desglose por Métodos de Pago
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDetalleRow}
                className="h-7 text-xs font-semibold gap-1 text-primary hover:text-primary cursor-pointer border-dashed"
              >
                <Plus className="size-3" />
                <span>Agregar Método</span>
              </Button>
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

                    {/* Monto Esperado */}
                    <div className="space-y-1 sm:col-span-1">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Esperado (Sistema)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`detalles.${index}.montoEsperado`, { valueAsNumber: true })}
                        className="h-8.5 text-xs font-mono bg-background"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Monto Contado + Delete */}
                    <div className="space-y-1 sm:col-span-1 flex items-end gap-1.5">
                      <div className="flex-1 space-y-1">
                        <Label className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          Contado (Físico)
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
                    <span className="text-muted-foreground">Diferencia método:</span>
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
              <div className="bg-background p-2.5 rounded-lg border border-border/50 space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                  Total Esperado
                </span>
                <span className="text-sm sm:text-base font-mono font-bold text-foreground">
                  {formatCurrency(totalEsperadoCalc)}
                </span>
              </div>

              <div className="bg-background p-2.5 rounded-lg border border-border/50 space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                  Total Contado
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
                  <span>El arqueo cuadra exactamente con el total del sistema.</span>
                </div>
              ) : isFaltante ? (
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-medium">
                  <AlertTriangle className="size-4" />
                  <span>Existe un faltante en el efectivo contado. Deberá justificar la diferencia.</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                  <AlertTriangle className="size-4" />
                  <span>Existe un sobrante en el efectivo contado.</span>
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
              placeholder="Justificación de sobrantes/faltantes, billetes observados o notas de cierre..."
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
              disabled={isLoading}
              className={cn(
                "h-9.5 px-4 gap-2 text-xs sm:text-sm font-semibold cursor-pointer shadow-sm transition-all",
                isEditing
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                  : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
              )}
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              <span>{isEditing ? "Guardar Modificaciones" : "Conciliar y Guardar Arqueo"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
