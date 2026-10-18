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
import { useMonedas } from "@/modules/parametros/moneda/hooks/use-monedas";
import {
  movimientoCajaSchema,
  type MovimientoCajaFormValues,
} from "../schemas/movimiento-caja.schema";
import {
  useCreateMovimientoCaja,
  useUpdateMovimientoCaja,
  useTiposMovimientoCaja,
  useConceptosMovimientoCaja,
} from "../hooks/use-movimientos-caja";
import type { MovimientoCajaResponse } from "../types/movimiento-caja.types";

interface MovimientoCajaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimientoToEdit?: MovimientoCajaResponse | null;
  onSuccessCallback?: () => void;
}

export function MovimientoCajaFormDialog({
  open,
  onOpenChange,
  movimientoToEdit,
  onSuccessCallback,
}: MovimientoCajaFormDialogProps) {
  const isEditing = !!movimientoToEdit;

  // Turnos de Caja
  const { data: turnosData, isLoading: isLoadingTurnos } = useTurnosCaja(
    { page: 1, pageSize: 100 },
    open
  );

  // Monedas
  const { data: monedasData, isLoading: isLoadingMonedas } = useMonedas(
    { page: 1, pageSize: 50 }
  );

  // Tipos de Movimiento de Caja
  const { data: tiposData, isLoading: isLoadingTipos } = useTiposMovimientoCaja(
    undefined,
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
      tipoMovimientoCajaId: 0,
      conceptoMovimientoCajaId: 0,
      monedaId: 0,
      monto: 0,
      tipoCambio: 1,
      referencia: "",
      observacion: "",
    },
  });

  const selectedTurnoId = watch("turnoCajaId");
  const selectedTipoId = watch("tipoMovimientoCajaId");
  const selectedConceptoId = watch("conceptoMovimientoCajaId");
  const selectedMonedaId = watch("monedaId");

  // Conceptos filtrados por Tipo
  const { data: conceptosData, isLoading: isLoadingConceptos } =
    useConceptosMovimientoCaja(selectedTipoId ? Number(selectedTipoId) : undefined, open && !!selectedTipoId);

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
      const empName =
        t.empleado?.nombreCompleto || `Cajero #${t.empleado?.id || t.id}`;
      return {
        value: String(t.id),
        label: empName,
        description: `${cCode} · ${cName} • Turno #${t.id}`,
      };
    });
  }, [turnosList]);

  const monedasList = React.useMemo(() => {
    return Array.isArray(monedasData?.items)
      ? monedasData.items
      : Array.isArray(monedasData)
      ? monedasData
      : [];
  }, [monedasData]);

  const monedaBase = React.useMemo(() => {
    return monedasList.find((m) => m.esBase) || monedasList[0];
  }, [monedasList]);

  const selectedMoneda = React.useMemo(() => {
    return monedasList.find((m) => m.id === Number(selectedMonedaId));
  }, [monedasList, selectedMonedaId]);

  const isMonedaBase = !selectedMoneda || selectedMoneda.esBase;

  // Selected Tipo info
  const selectedTipo = React.useMemo(() => {
    return tiposData?.find((t) => t.id === Number(selectedTipoId));
  }, [tiposData, selectedTipoId]);

  // Set default moneda when loaded and creating
  React.useEffect(() => {
    if (open && !isEditing && monedaBase && !selectedMonedaId) {
      setValue("monedaId", monedaBase.id, { shouldValidate: true });
    }
  }, [open, isEditing, monedaBase, selectedMonedaId, setValue]);

  React.useEffect(() => {
    if (open) {
      if (movimientoToEdit) {
        reset({
          turnoCajaId: movimientoToEdit.turnoCaja?.id || 0,
          tipoMovimientoCajaId: movimientoToEdit.tipoMovimientoCajaId,
          conceptoMovimientoCajaId: movimientoToEdit.conceptoMovimientoCajaId,
          monedaId: movimientoToEdit.monedaId,
          monto: Number(movimientoToEdit.monto),
          tipoCambio: Number(movimientoToEdit.tipoCambio || 1),
          referencia: movimientoToEdit.referencia || "",
          observacion: movimientoToEdit.observacion || "",
        });
      } else {
        reset({
          turnoCajaId: 0,
          tipoMovimientoCajaId: 0,
          conceptoMovimientoCajaId: 0,
          monedaId: monedaBase?.id || 0,
          monto: 0,
          tipoCambio: 1,
          referencia: "",
          observacion: "",
        });
      }
    }
  }, [open, movimientoToEdit, monedaBase, reset]);

  const onSubmit = async (values: MovimientoCajaFormValues) => {
    try {
      const payload = {
        turnoCajaId: Number(values.turnoCajaId),
        tipoMovimientoCajaId: Number(values.tipoMovimientoCajaId),
        conceptoMovimientoCajaId: Number(values.conceptoMovimientoCajaId),
        monedaId: Number(values.monedaId),
        monto: Number(values.monto),
        tipoCambio: Number(values.tipoCambio || 1),
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
      const err = error as {
        response?: { data?: { detail?: string; title?: string } };
        message?: string;
      };
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
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Editar Movimiento de Caja"
              : "Nuevo Movimiento de Caja"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifique los datos del movimiento de caja."
              : "Seleccione el tipo y concepto para registrar un movimiento en el turno."}
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
              <p className="text-xs text-destructive">
                {errors.turnoCajaId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Tipo de Movimiento */}
            <div className="space-y-1.5">
              <Label htmlFor="tipoMovimientoCajaId" className="required font-medium text-xs">
                Tipo de Movimiento
              </Label>
              <Select
                value={selectedTipoId ? String(selectedTipoId) : ""}
                onValueChange={(val) => {
                  setValue("tipoMovimientoCajaId", Number(val), {
                    shouldValidate: true,
                  });
                  // Reset concepto when type changes
                  setValue("conceptoMovimientoCajaId", 0, {
                    shouldValidate: true,
                  });
                }}
                disabled={isSubmitting || isLoadingTipos}
              >
                <SelectTrigger id="tipoMovimientoCajaId" className="h-9 text-xs">
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {tiposData?.map((tipo) => (
                    <SelectItem key={tipo.id} value={String(tipo.id)}>
                      <span className="font-medium">{tipo.nombre}</span>{" "}
                      <span className="text-[10px] text-muted-foreground">
                        ({tipo.naturaleza})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipoMovimientoCajaId && (
                <p className="text-xs text-destructive">
                  {errors.tipoMovimientoCajaId.message}
                </p>
              )}
            </div>

            {/* Concepto de Movimiento */}
            <div className="space-y-1.5">
              <Label
                htmlFor="conceptoMovimientoCajaId"
                className="required font-medium text-xs"
              >
                Concepto / Motivo
              </Label>
              <Select
                value={selectedConceptoId ? String(selectedConceptoId) : ""}
                onValueChange={(val) =>
                  setValue("conceptoMovimientoCajaId", Number(val), {
                    shouldValidate: true,
                  })
                }
                disabled={isSubmitting || !selectedTipoId || isLoadingConceptos}
              >
                <SelectTrigger id="conceptoMovimientoCajaId" className="h-9 text-xs">
                  <SelectValue
                    placeholder={
                      !selectedTipoId
                        ? "Primero elija tipo..."
                        : isLoadingConceptos
                        ? "Cargando conceptos..."
                        : "Seleccionar concepto..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {conceptosData?.map((conc) => (
                    <SelectItem key={conc.id} value={String(conc.id)}>
                      {conc.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.conceptoMovimientoCajaId && (
                <p className="text-xs text-destructive">
                  {errors.conceptoMovimientoCajaId.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Moneda */}
            <div className="space-y-1.5">
              <Label htmlFor="monedaId" className="required font-medium text-xs">
                Moneda
              </Label>
              <Select
                value={selectedMonedaId ? String(selectedMonedaId) : ""}
                onValueChange={(val) => {
                  const mId = Number(val);
                  setValue("monedaId", mId, { shouldValidate: true });
                  const m = monedasList.find((x) => x.id === mId);
                  if (m?.esBase) {
                    setValue("tipoCambio", 1, { shouldValidate: true });
                  }
                }}
                disabled={isSubmitting || isLoadingMonedas}
              >
                <SelectTrigger id="monedaId" className="h-9 text-xs">
                  <SelectValue placeholder="Seleccionar moneda..." />
                </SelectTrigger>
                <SelectContent>
                  {monedasList.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.codigo} - {m.nombre} ({m.simbolo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.monedaId && (
                <p className="text-xs text-destructive">{errors.monedaId.message}</p>
              )}
            </div>

            {/* Monto */}
            <div className="space-y-1.5">
              <Label htmlFor="monto" className="required font-medium text-xs">
                Monto {selectedMoneda ? `(${selectedMoneda.simbolo})` : ""}
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

          {/* Tipo de cambio si moneda no es base */}
          {!isMonedaBase && (
            <div className="space-y-1.5">
              <Label htmlFor="tipoCambio" className="required font-medium text-xs">
                Tipo de Cambio
              </Label>
              <Input
                id="tipoCambio"
                type="number"
                step="0.0001"
                min="0.0001"
                placeholder="1.0000"
                {...register("tipoCambio", { valueAsNumber: true })}
                className="h-9 text-xs font-mono"
                disabled={isSubmitting}
              />
              {errors.tipoCambio && (
                <p className="text-xs text-destructive">
                  {errors.tipoCambio.message}
                </p>
              )}
            </div>
          )}

          {/* Referencia */}
          <div className="space-y-1.5">
            <Label htmlFor="referencia" className="font-medium text-xs">
              Referencia / Comprobante{" "}
              <span className="text-[11px] text-muted-foreground">(Opcional)</span>
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
              Observaciones{" "}
              <span className="text-[11px] text-muted-foreground">(Opcional)</span>
            </Label>
            <Textarea
              id="observacion"
              placeholder="Ej: Autorizado por la administración..."
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 gap-2 text-xs"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>
                {isEditing ? "Guardar Cambios" : "Registrar Movimiento"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
