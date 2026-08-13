"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
  const isEditing = !!arqueoToEdit;

  // Real dependencies from API
  const { data: turnosData, isLoading: isLoadingTurnos } = useTurnosCaja(
    { page: 1, pageSize: 100 },
    open
  );
  const { data: metodosData } = useMetodosPago({ page: 1, pageSize: 100 }, open);
  const { data: monedasData } = useMonedas({ page: 1, pageSize: 100 });

  const createMutation = useCreateArqueoCaja();
  const updateMutation = useUpdateArqueoCaja();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ArqueoCajaFormValues>({
    resolver: zodResolver(arqueoCajaSchema),
    defaultValues: {
      turnoCajaId: 0,
      fechaHora: toLocalDatetimeString(),
      observacion: "",
      detalles: [
        {
          metodoPagoId: 0,
          monedaId: 0,
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

  // Default moneda ID
  const defaultMonedaId = React.useMemo(() => {
    return monedasList.length > 0 ? monedasList[0].id : 0;
  }, [monedasList]);

  // Default metodo ID
  const defaultMetodoId = React.useMemo(() => {
    return metodosList.length > 0 ? metodosList[0].id : 0;
  }, [metodosList]);

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
          detalles: arqueoToEdit.detalles.map((d) => ({
            metodoPagoId: d.metodoPagoId,
            monedaId: d.monedaId,
            montoEsperado: Number(d.montoEsperado),
            montoContado: Number(d.montoContado),
          })),
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

  // Total summary calculations
  const totalEsperadoCalc = (detallesWatch || []).reduce((acc, item) => acc + (Number(item.montoEsperado) || 0), 0);
  const totalContadoCalc = (detallesWatch || []).reduce((acc, item) => acc + (Number(item.montoContado) || 0), 0);
  const diferenciaCalc = totalContadoCalc - totalEsperadoCalc;

  const onSubmit = async (values: ArqueoCajaFormValues) => {
    try {
      const fechaHoraIso = new Date(values.fechaHora).toISOString();
      const payload = {
        turnoCajaId: Number(values.turnoCajaId),
        fechaHora: fechaHoraIso,
        observacion: values.observacion?.trim() || null,
        detalles: values.detalles.map((d) => ({
          metodoPagoId: Number(d.metodoPagoId),
          monedaId: Number(d.monedaId),
          montoEsperado: Number(d.montoEsperado),
          montoContado: Number(d.montoContado),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Arqueo de Caja" : "Nuevo Arqueo de Caja"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifique los conteos físicos por método de pago."
              : "Desglose los montos contados vs esperados por método de pago para conciliar la caja."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            {/* Turno de Caja */}
            <div className="space-y-1.5">
              <Label htmlFor="turnoCajaId" className="required font-medium text-xs">
                Turno de Caja
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
                <p className="text-xs text-destructive">{errors.turnoCajaId.message}</p>
              )}
            </div>

            {/* Fecha y Hora */}
            <div className="space-y-1.5">
              <Label htmlFor="fechaHora" className="required font-medium text-xs">
                Fecha y Hora de Conteo
              </Label>
              <Input
                id="fechaHora"
                type="datetime-local"
                value={fechaHoraVal}
                onChange={(e) =>
                  setValue("fechaHora", e.target.value, { shouldValidate: true })
                }
                className="h-9 text-xs font-mono"
                disabled={isSubmitting}
              />
              {errors.fechaHora && (
                <p className="text-xs text-destructive">{errors.fechaHora.message}</p>
              )}
            </div>
          </div>

          {/* Detalles por Método de Pago */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-xs text-foreground">
                Conteo Físico por Método de Pago
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
                className="h-7 text-[11px] gap-1 px-2"
                disabled={isSubmitting}
              >
                <Plus className="h-3 w-3" />
                <span>Agregar Fila</span>
              </Button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-2 items-center p-2 rounded-md border border-border/60 bg-muted/20"
                >
                  <div className="col-span-4">
                    <Select
                      value={String(detallesWatch?.[index]?.metodoPagoId || 0)}
                      onValueChange={(val) =>
                        setValue(`detalles.${index}.metodoPagoId`, Number(val))
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-8 text-xs">
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
                      className="h-8 text-xs font-mono"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="col-span-3">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Contado"
                      {...register(`detalles.${index}.montoContado`, { valueAsNumber: true })}
                      className="h-8 text-xs font-mono"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="col-span-2 text-right">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors.detalles && (
              <p className="text-xs text-destructive">{errors.detalles.message}</p>
            )}
          </div>

          {/* Resumen de totales */}
          <div className="p-3 rounded-lg bg-card border border-border/80 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-muted-foreground">Esperado: </span>
              <strong>S/ {totalEsperadoCalc.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Contado: </span>
              <strong>S/ {totalContadoCalc.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Diferencia: </span>
              <strong className={Math.abs(diferenciaCalc) < 0.01 ? "text-emerald-600" : diferenciaCalc > 0 ? "text-blue-600" : "text-rose-600"}>
                S/ {diferenciaCalc.toFixed(2)}
              </strong>
            </div>
          </div>

          {/* Observación */}
          <div className="space-y-1.5">
            <Label htmlFor="observacion" className="font-medium text-xs">
              Observaciones <span className="text-[11px] text-muted-foreground">(Opcional)</span>
            </Label>
            <Textarea
              id="observacion"
              placeholder="Ej: Sobrante en efectivo justificado por propina..."
              {...register("observacion")}
              className="min-h-[50px] text-xs resize-none"
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-9 text-xs"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-9 gap-2 text-xs">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isEditing ? "Guardar Cambios" : "Confirmar Arqueo"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
