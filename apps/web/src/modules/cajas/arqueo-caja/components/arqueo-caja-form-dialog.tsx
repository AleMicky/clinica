"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Calculator, Loader2, Plus, Trash2 } from "lucide-react";
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

export function ArqueoCajaFormDialog({
  open,
  onOpenChange,
  arqueoToEdit,
  onSuccessCallback,
}: ArqueoCajaFormDialogProps) {
  const isEditing = Boolean(arqueoToEdit);

  // Real dependencies from API
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

  const turnosList = Array.isArray(turnosData?.items)
    ? turnosData.items
    : Array.isArray(turnosData)
    ? turnosData
    : [];
  const metodosList = Array.isArray(metodosData?.items)
    ? metodosData.items
    : Array.isArray(metodosData)
    ? metodosData
    : [];
  const monedasList = Array.isArray(monedasData?.items)
    ? monedasData.items
    : Array.isArray(monedasData)
    ? monedasData
    : [];

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

  const turnoOptions: AutocompleteOption[] = React.useMemo(() => {
    return turnosList.map((t) => {
      const cajaLabel = t.caja ? `${t.caja.codigo} - ${t.caja.nombre}` : `Turno #${t.id}`;
      const empleadoLabel = t.empleado ? ` (${t.empleado.nombreCompleto})` : "";
      return {
        value: String(t.id),
        label: `${cajaLabel}${empleadoLabel}`,
        description: `Estado: ${t.estado === 1 ? "Abierto" : "Cerrado"}`,
      };
    });
  }, [turnosList]);

  React.useEffect(() => {
    if (open) {
      if (arqueoToEdit) {
        reset({
          turnoCajaId: arqueoToEdit.turnoCaja?.id || 0,
          fechaHora: toLocalDatetimeString(arqueoToEdit.fechaHora),
          observacion: arqueoToEdit.observacion || "",
          detalles:
            arqueoToEdit.detalles.length > 0
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
        const defaultTurno = turnosList.find((t) => t.estado === 1) || turnosList[0];
        reset({
          turnoCajaId: defaultTurno ? defaultTurno.id : 0,
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
  }, [open, arqueoToEdit, turnosList, defaultMetodoId, defaultMonedaId, reset]);

  // Cálculos de resumen en tiempo real
  const totalEsperadoCalc = (detallesWatch || []).reduce(
    (acc, item) => acc + (Number(item?.montoEsperado) || 0),
    0
  );
  const totalContadoCalc = (detallesWatch || []).reduce(
    (acc, item) => acc + (Number(item?.montoContado) || 0),
    0
  );
  const diferenciaCalc = totalContadoCalc - totalEsperadoCalc;

  const onSubmit = async (values: ArqueoCajaFormValues) => {
    try {
      const fechaHoraIso = new Date(values.fechaHora).toISOString();
      const payload = {
        turnoCajaId: Number(values.turnoCajaId),
        fechaHora: fechaHoraIso,
        observacion: values.observacion?.trim() || null,
        detalles: values.detalles.map((d) => ({
          metodoPagoId: Number(d.metodoPagoId || defaultMetodoId),
          monedaId: Number(d.monedaId || defaultMonedaId),
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
        toast.success("Arqueo de caja registrado correctamente.");
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string; title?: string } }; message?: string };
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        err?.message ||
        "Ocurrió un error al guardar el arqueo de caja.";
      toast.error(message);
    }
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    isSubmitting ||
    isLoadingTurnos ||
    isLoadingMetodos ||
    isLoadingMonedas;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calculator className="size-5" />
            </div>
            <span>{isEditing ? "Editar Arqueo de Caja" : "Nuevo Arqueo y Conciliación"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique los montos contados físicamente por método de pago."
              : "Ingrese el conteo físico de caja por método de pago para calcular diferencias con el sistema."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Indicador de campos obligatorios */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md border border-border/40">
            <span>Configuración de Arqueo</span>
            <span className="text-destructive font-medium">* Requeridos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Turno de Caja */}
            <div className="space-y-1.5">
              <Label htmlFor="turnoCajaId" className="text-xs flex items-center gap-1">
                Turno de Caja <span className="text-destructive">*</span>
              </Label>
              <Autocomplete
                id="turnoCajaId"
                value={selectedTurnoId ? String(selectedTurnoId) : ""}
                onValueChange={(val) =>
                  setValue("turnoCajaId", Number(val), { shouldValidate: true })
                }
                options={turnoOptions}
                placeholder="Seleccionar turno..."
                emptyText="No hay turnos disponibles"
                allowCustomValue={false}
                isLoading={isLoadingTurnos}
                disabled={isSubmitting}
                error={Boolean(errors.turnoCajaId)}
              />
              {errors.turnoCajaId && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.turnoCajaId.message}
                </p>
              )}
            </div>

            {/* Fecha y Hora de Conteo */}
            <div className="space-y-1.5">
              <Label htmlFor="fechaHora" className="text-xs flex items-center gap-1">
                Fecha y Hora de Conteo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fechaHora"
                type="datetime-local"
                value={fechaHoraVal}
                onChange={(e) =>
                  setValue("fechaHora", e.target.value, { shouldValidate: true })
                }
                className={cn(
                  "h-9 text-xs font-mono",
                  errors.fechaHora && "border-destructive focus-visible:ring-destructive"
                )}
                disabled={isSubmitting}
              />
              {errors.fechaHora && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.fechaHora.message}
                </p>
              )}
            </div>
          </div>

          {/* Desglose por Método de Pago */}
          <div className="space-y-2 pt-1 border-t border-border/40">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                Desglose por Método de Pago <span className="text-destructive">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    metodoPagoId: defaultMetodoId,
                    monedaId: defaultMonedaId,
                    montoEsperado: 0,
                    montoContado: 0,
                  })
                }
                className="h-7 text-[11px] gap-1 px-2.5 cursor-pointer"
                disabled={isSubmitting}
              >
                <Plus className="size-3" />
                <span>Agregar Método</span>
              </Button>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg border border-border/60 bg-muted/20 text-xs"
                >
                  <div className="col-span-5">
                    <Select
                      value={String(detallesWatch?.[index]?.metodoPagoId || defaultMetodoId)}
                      onValueChange={(val) =>
                        setValue(`detalles.${index}.metodoPagoId`, Number(val), {
                          shouldValidate: true,
                        })
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue placeholder="Método Pago" />
                      </SelectTrigger>
                      <SelectContent>
                        {metodosList.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-3">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Esperado"
                      {...register(`detalles.${index}.montoEsperado`, { valueAsNumber: true })}
                      className="h-8 text-xs font-mono bg-background"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="col-span-3">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Contado"
                      {...register(`detalles.${index}.montoContado`, { valueAsNumber: true })}
                      className="h-8 text-xs font-mono font-semibold bg-background text-emerald-600 dark:text-emerald-400"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="col-span-1 text-right">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="size-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors.detalles && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.detalles.message}
              </p>
            )}
          </div>

          {/* Resumen de totales calculado en vivo */}
          <div className="p-2.5 rounded-lg bg-card border border-border/80 grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-1.5 rounded bg-muted/40 text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-sans block">Total Esperado</span>
              <strong className="text-foreground font-bold">S/ {totalEsperadoCalc.toFixed(2)}</strong>
            </div>
            <div className="p-1.5 rounded bg-muted/40 text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-sans block">Total Contado</span>
              <strong className="text-foreground font-bold">S/ {totalContadoCalc.toFixed(2)}</strong>
            </div>
            <div
              className={cn(
                "p-1.5 rounded text-center border",
                Math.abs(diferenciaCalc) < 0.01
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                  : diferenciaCalc > 0
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400"
              )}
            >
              <span className="text-[10px] uppercase font-sans block">Diferencia</span>
              <strong className="font-bold">S/ {diferenciaCalc.toFixed(2)}</strong>
            </div>
          </div>

          {/* Observación */}
          <div className="space-y-1.5">
            <Label htmlFor="observacion" className="text-xs flex items-center gap-1">
              Observaciones <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
            </Label>
            <Textarea
              id="observacion"
              placeholder="Ej: Conciliación física realizada al término de jornada sin discrepancias..."
              className="min-h-[55px] text-xs resize-none"
              disabled={isSubmitting}
              {...register("observacion")}
            />
          </div>

          <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-9 text-xs sm:text-sm cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-9 gap-2 text-xs sm:text-sm cursor-pointer"
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              <span>{isEditing ? "Guardar Cambios" : "Confirmar Arqueo"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
