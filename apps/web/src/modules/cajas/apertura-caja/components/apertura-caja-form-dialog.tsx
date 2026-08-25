"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Coins,
  Loader2,
  Calendar,
  Clock,
  User,
  Vault,
  Pencil,
  Plus,
  AlertCircle,
  FileText,
  Sparkles,
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
import { Badge } from "@/components/ui/badge";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { cn } from "@/lib/utils";

import {
  aperturaCajaSchema,
  type AperturaCajaFormValues,
} from "../schemas/apertura-caja.schema";
import {
  useCreateAperturaCaja,
  useUpdateAperturaCaja,
} from "../hooks/use-aperturas-caja";
import { useTurnosCaja } from "../../turno-caja/hooks/use-turnos-caja";
import type { TurnoCajaResponse } from "../../turno-caja/types/turno-caja.types";
import type { AperturaCajaResponse } from "../types/apertura-caja.types";

interface AperturaCajaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turnoCajaId?: number;
  cajeroNombre?: string;
  cajaNombre?: string;
  aperturaToEdit?: AperturaCajaResponse | null;
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

const CASH_PRESETS = [50, 100, 200, 300, 500, 1000];

export function AperturaCajaFormDialog({
  open,
  onOpenChange,
  turnoCajaId,
  cajeroNombre,
  cajaNombre,
  aperturaToEdit,
  onSuccessCallback,
}: AperturaCajaFormDialogProps) {
  const isEditing = Boolean(aperturaToEdit);

  // Queries & Mutations
  const { data: turnosData, isLoading: isLoadingTurnos } = useTurnosCaja(
    { page: 1, pageSize: 100 },
    open
  );

  const createMutation = useCreateAperturaCaja();
  const updateMutation = useUpdateAperturaCaja();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AperturaCajaFormValues>({
    resolver: zodResolver(aperturaCajaSchema),
    defaultValues: {
      turnoCajaId: turnoCajaId || 0,
      fechaHora: toLocalDatetimeString(),
      montoInicial: 0,
      observacion: "",
    },
  });

  const selectedTurnoId = watch("turnoCajaId");
  const fechaHoraVal = watch("fechaHora");
  const montoInicialVal = watch("montoInicial");

  const turnosList: TurnoCajaResponse[] = React.useMemo(() => {
    return Array.isArray(turnosData?.items)
      ? turnosData.items
      : Array.isArray(turnosData)
      ? (turnosData as unknown as TurnoCajaResponse[])
      : [];
  }, [turnosData]);

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
    const targetId = turnoCajaId || selectedTurnoId || aperturaToEdit?.turnoCaja?.id;
    return turnosList.find((t) => t.id === targetId) || null;
  }, [turnosList, turnoCajaId, selectedTurnoId, aperturaToEdit]);

  React.useEffect(() => {
    if (open) {
      if (aperturaToEdit) {
        reset({
          turnoCajaId: aperturaToEdit.turnoCaja?.id || turnoCajaId || 0,
          fechaHora: toLocalDatetimeString(aperturaToEdit.fechaHora),
          montoInicial: Number(aperturaToEdit.montoInicial || 0),
          observacion: aperturaToEdit.observacion || "",
        });
      } else {
        reset({
          turnoCajaId: turnoCajaId || 0,
          fechaHora: toLocalDatetimeString(),
          montoInicial: 0,
          observacion: "",
        });
      }
    }
  }, [open, aperturaToEdit, turnoCajaId, reset]);

  const handleTurnoChange = React.useCallback(
    (val: string) => {
      setValue("turnoCajaId", Number(val), { shouldValidate: true });
    },
    [setValue]
  );

  const setPresetMonto = (amount: number) => {
    setValue("montoInicial", amount, { shouldValidate: true });
  };

  const setNowForFechaHora = () => {
    setValue("fechaHora", toLocalDatetimeString(), { shouldValidate: true });
  };

  const onSubmit = async (values: AperturaCajaFormValues) => {
    try {
      const payload = {
        turnoCajaId: Number(values.turnoCajaId),
        fechaHora: new Date(values.fechaHora).toISOString(),
        montoInicial: Number(values.montoInicial),
        observacion: values.observacion?.trim() || null,
      };

      if (isEditing && aperturaToEdit) {
        await updateMutation.mutateAsync({
          id: aperturaToEdit.id,
          data: payload,
        });
        toast.success("Fondo inicial actualizado correctamente.");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Fondo inicial de caja registrado exitosamente.");
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Ocurrió un error al procesar el fondo inicial.";
      toast.error(errorMsg);
    }
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-border/60 shadow-2xl">
        {/* Header con temática */}
        <div
          className={cn(
            "p-6 pb-5 border-b",
            isEditing
              ? "bg-gradient-to-r from-blue-500/15 via-blue-500/5 to-transparent border-blue-500/20"
              : "bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500/20"
          )}
        >
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-2xl border shadow-xs shrink-0",
                  isEditing
                    ? "bg-blue-600 text-white border-blue-700 shadow-blue-500/20"
                    : "bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/20"
                )}
              >
                {isEditing ? <Pencil className="size-5.5" /> : <Coins className="size-5.5" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                    {isEditing ? "Modificar Fondo Inicial" : "Registro de Fondo Inicial"}
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                      isEditing
                        ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                    )}
                  >
                    {isEditing ? "Edición" : "Apertura"}
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Declare el monto en efectivo entregado para cambio al iniciar la jornada.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-4 space-y-4">
          {/* Selector de Turno si no está fijado */}
          {!turnoCajaId && (
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
                emptyText="No se encontraron turnos de caja activos"
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
          )}

          {/* Tarjeta de Resumen del Turno */}
          {(selectedTurno || cajeroNombre || cajaNombre) && (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.04] p-3 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-500/30">
                <Vault className="size-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground truncate">
                    {cajaNombre || selectedTurno?.caja?.nombre || "Caja Principal"}
                  </span>
                  <span className="text-[10px] font-mono bg-background px-1.5 py-0.2 rounded border border-border/60 text-muted-foreground">
                    {selectedTurno?.caja?.codigo || "CAJA-01"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  Cajero: <strong className="text-foreground">{cajeroNombre || selectedTurno?.empleado?.nombreCompleto || "Asignado"}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Monto Inicial de Efectivo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="montoInicial" className="text-xs font-semibold flex items-center gap-1">
                Monto Inicial en Efectivo (BOB) <span className="text-destructive">*</span>
              </Label>
              <span className="text-[10px] text-muted-foreground font-mono">Moneda: Bolivianos (Bs.)</span>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-muted-foreground">
                Bs.
              </span>
              <Input
                id="montoInicial"
                type="number"
                step="0.01"
                min="0"
                {...register("montoInicial", { valueAsNumber: true })}
                placeholder="0.00"
                className={cn(
                  "h-10 pl-10 text-base font-mono font-bold bg-background",
                  errors.montoInicial && "border-destructive focus-visible:ring-destructive"
                )}
                disabled={isLoading}
              />
            </div>

            {/* Atajos Rápidos de Efectivo */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-muted-foreground font-medium mr-0.5">Sugerencias:</span>
              {CASH_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPresetMonto(preset)}
                  className={cn(
                    "text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer",
                    montoInicialVal === preset
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                      : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
                  )}
                >
                  Bs. {preset}
                </button>
              ))}
            </div>

            {errors.montoInicial && (
              <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                <AlertCircle className="size-3" />
                {errors.montoInicial.message}
              </p>
            )}
          </div>

          {/* Fecha y Hora de Apertura */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="fechaHora" className="text-xs font-semibold flex items-center gap-1">
                Fecha y Hora de Entrega <span className="text-destructive">*</span>
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
            {errors.fechaHora && (
              <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                <AlertCircle className="size-3" />
                {errors.fechaHora.message}
              </p>
            )}
          </div>

          {/* Observaciones */}
          <div className="space-y-1.5">
            <Label htmlFor="observacion" className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
              <FileText className="size-3.5" />
              Observaciones del Fondo
            </Label>
            <Textarea
              id="observacion"
              placeholder="Detalle de corte de billetes, monedas fraccionarias o notas de custodia..."
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
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
              )}
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              <span>{isEditing ? "Guardar Modificaciones" : "Confirmar Fondo Inicial"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
