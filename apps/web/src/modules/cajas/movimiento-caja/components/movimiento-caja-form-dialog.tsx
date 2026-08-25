"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import {
  movimientoCajaSchema,
  type MovimientoCajaFormValues,
} from "../schemas/movimiento-caja.schema";
import {
  useCreateMovimientoCaja,
  useUpdateMovimientoCaja,
} from "../hooks/use-movimientos-caja";
import {
  TipoMovimientoCaja,
  type MovimientoCajaResponse,
} from "../types/movimiento-caja.types";

interface MovimientoCajaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimientoToEdit?: MovimientoCajaResponse | null;
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

export function MovimientoCajaFormDialog({
  open,
  onOpenChange,
  movimientoToEdit,
  onSuccessCallback,
}: MovimientoCajaFormDialogProps) {
  const isEditing = !!movimientoToEdit;

  // Fetch real Turnos de Caja
  const { data: turnosData, isLoading: isLoadingTurnos } = useTurnosCaja(
    { page: 1, pageSize: 100 },
    open
  );

  const createMutation = useCreateMovimientoCaja();
  const updateMutation = useUpdateMovimientoCaja();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MovimientoCajaFormValues>({
    resolver: zodResolver(movimientoCajaSchema),
    defaultValues: {
      turnoCajaId: 0,
      tipo: TipoMovimientoCaja.Ingreso,
      fechaHora: toLocalDatetimeString(),
      monto: 0,
      concepto: "",
      referencia: "",
      observacion: "",
    },
  });

  const selectedTurnoId = watch("turnoCajaId");
  const tipoVal = watch("tipo");
  const fechaHoraVal = watch("fechaHora");

  const turnosList = React.useMemo(() => {
    return Array.isArray(turnosData?.items)
      ? turnosData.items
      : Array.isArray(turnosData)
      ? turnosData
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

  React.useEffect(() => {
    if (open) {
      if (movimientoToEdit) {
        reset({
          turnoCajaId: movimientoToEdit.turnoCaja?.id || 0,
          tipo: movimientoToEdit.tipo,
          fechaHora: toLocalDatetimeString(movimientoToEdit.fechaHora),
          monto: Number(movimientoToEdit.monto),
          concepto: movimientoToEdit.concepto,
          referencia: movimientoToEdit.referencia || "",
          observacion: movimientoToEdit.observacion || "",
        });
      } else {
        reset({
          turnoCajaId: 0,
          tipo: TipoMovimientoCaja.Ingreso,
          fechaHora: toLocalDatetimeString(),
          monto: 0,
          concepto: "",
          referencia: "",
          observacion: "",
        });
      }
    }
  }, [open, movimientoToEdit, reset]);

  const onSubmit = async (values: MovimientoCajaFormValues) => {
    try {
      const fechaHoraIso = new Date(values.fechaHora).toISOString();
      const payload = {
        turnoCajaId: Number(values.turnoCajaId),
        tipo: Number(values.tipo) as TipoMovimientoCaja,
        fechaHora: fechaHoraIso,
        monto: Number(values.monto),
        concepto: values.concepto.trim(),
        referencia: values.referencia?.trim() || null,
        observacion: values.observacion?.trim() || null,
      };

      if (isEditing && movimientoToEdit) {
        await updateMutation.mutateAsync({
          id: movimientoToEdit.id,
          data: payload,
        });
        toast.success("Movimiento de caja actualizado correctamente.");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Movimiento de caja registrado correctamente.");
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string; title?: string } }; message?: string };
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        err?.message ||
        "Ocurrió un error al guardar el movimiento de caja.";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Movimiento de Caja" : "Nuevo Movimiento de Caja"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifique los datos del movimiento de caja."
              : "Ingrese la información para registrar un ingreso, egreso o ajuste en el turno."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 py-2">
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
              placeholder="Seleccionar turno de caja..."
              emptyText="No se encontraron turnos registrados"
              allowCustomValue={false}
              isLoading={isLoadingTurnos}
              disabled={isSubmitting}
              error={Boolean(errors.turnoCajaId)}
            />
            {errors.turnoCajaId && (
              <p className="text-xs text-destructive">{errors.turnoCajaId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Tipo de Movimiento */}
            <div className="space-y-1.5">
              <Label htmlFor="tipo" className="required font-medium text-xs">
                Tipo Movimiento
              </Label>
              <Select
                value={String(tipoVal)}
                onValueChange={(val) =>
                  setValue("tipo", Number(val), { shouldValidate: true })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="tipo" className="h-9 text-xs">
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(TipoMovimientoCaja.Ingreso)}>Ingreso (+)</SelectItem>
                  <SelectItem value={String(TipoMovimientoCaja.Egreso)}>Egreso (-)</SelectItem>
                  <SelectItem value={String(TipoMovimientoCaja.Retiro)}>Retiro (-)</SelectItem>
                  <SelectItem value={String(TipoMovimientoCaja.Reposicion)}>Reposición (+)</SelectItem>
                  <SelectItem value={String(TipoMovimientoCaja.Devolucion)}>Devolución (-)</SelectItem>
                  <SelectItem value={String(TipoMovimientoCaja.AjustePositivo)}>Ajuste Positivo (+)</SelectItem>
                  <SelectItem value={String(TipoMovimientoCaja.AjusteNegativo)}>Ajuste Negativo (-)</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo && (
                <p className="text-xs text-destructive">{errors.tipo.message}</p>
              )}
            </div>

            {/* Monto */}
            <div className="space-y-1.5">
              <Label htmlFor="monto" className="required font-medium text-xs">
                Monto (S/)
              </Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("monto", { valueAsNumber: true })}
                className="h-9 text-xs font-mono"
                disabled={isSubmitting}
              />
              {errors.monto && (
                <p className="text-xs text-destructive">{errors.monto.message}</p>
              )}
            </div>
          </div>

          {/* Fecha y Hora */}
          <div className="space-y-1.5">
            <Label htmlFor="fechaHora" className="required font-medium text-xs">
              Fecha y Hora
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

          {/* Concepto */}
          <div className="space-y-1.5">
            <Label htmlFor="concepto" className="required font-medium text-xs">
              Concepto / Motivo
            </Label>
            <Input
              id="concepto"
              placeholder="Ej: Pago de transporte de mensajería"
              {...register("concepto")}
              className="h-9 text-xs"
              disabled={isSubmitting}
            />
            {errors.concepto && (
              <p className="text-xs text-destructive">{errors.concepto.message}</p>
            )}
          </div>

          {/* Referencia */}
          <div className="space-y-1.5">
            <Label htmlFor="referencia" className="font-medium text-xs">
              Referencia / Comprobante <span className="text-[11px] text-muted-foreground">(Opcional)</span>
            </Label>
            <Input
              id="referencia"
              placeholder="Ej: REC-00123 / F001-44"
              {...register("referencia")}
              className="h-9 text-xs font-mono"
              disabled={isSubmitting}
            />
          </div>

          {/* Observación */}
          <div className="space-y-1.5">
            <Label htmlFor="observacion" className="font-medium text-xs">
              Observaciones <span className="text-[11px] text-muted-foreground">(Opcional)</span>
            </Label>
            <Textarea
              id="observacion"
              placeholder="Ej: Autorizado por la jefatura de administración..."
              {...register("observacion")}
              className="min-h-[60px] text-xs resize-none"
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="pt-3 gap-2 sm:gap-0">
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
              <span>{isEditing ? "Guardar Cambios" : "Registrar Movimiento"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
