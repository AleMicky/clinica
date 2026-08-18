"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Clock, LogOut, Loader2 } from "lucide-react";
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
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { cn } from "@/lib/utils";

import { useEmpleados } from "@/modules/recursos-humanos/empleado/hooks/use-empleados";
import {
  turnoCajaSchema,
  type TurnoCajaFormValues,
} from "../schemas/turno-caja.schema";
import {
  useCreateTurnoCaja,
  useUpdateTurnoCaja,
} from "../hooks/use-turnos-caja";
import {
  EstadoTurnoCaja,
  type TurnoCajaResponse,
} from "../types/turno-caja.types";

interface TurnoCajaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turnoToEdit?: TurnoCajaResponse | null;
  defaultCajaId?: number | null;
  mode?: "create" | "edit" | "close";
  onSuccessCallback?: () => void;
}

const STATIC_QUERY_PARAMS = { page: 1, pageSize: 100 };

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

export function TurnoCajaFormDialog({
  open,
  onOpenChange,
  turnoToEdit,
  defaultCajaId,
  mode = "create",
  onSuccessCallback,
}: TurnoCajaFormDialogProps) {
  const isClosing = mode === "close";
  const isEditing = mode === "edit";

  // Fetch real Empleados
  const { data: empleadosData, isLoading: isLoadingEmpleados } = useEmpleados(
    STATIC_QUERY_PARAMS
  );

  const createMutation = useCreateTurnoCaja();
  const updateMutation = useUpdateTurnoCaja();

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TurnoCajaFormValues>({
    resolver: zodResolver(turnoCajaSchema),
    defaultValues: {
      cajaId: defaultCajaId || 0,
      empleadoId: 0,
      fechaHoraApertura: toLocalDatetimeString(),
      fechaHoraCierre: "",
      estado: EstadoTurnoCaja.Abierto,
    },
  });

  const selectedEmpleadoId = watch("empleadoId");
  const fechaAperturaVal = watch("fechaHoraApertura");
  const fechaCierreVal = watch("fechaHoraCierre");

  const empleadosList = Array.isArray(empleadosData?.items)
    ? empleadosData.items
    : Array.isArray(empleadosData)
    ? empleadosData
    : [];

  // Mapeo de opciones Autocomplete para Empleados / Cajeros
  const empleadoOptions: AutocompleteOption[] = React.useMemo(() => {
    return empleadosList.map((emp) => {
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

  React.useEffect(() => {
    if (open) {
      const nowStr = toLocalDatetimeString();
      if (turnoToEdit) {
        const cId = turnoToEdit.caja?.id || defaultCajaId || 0;
        const eId = turnoToEdit.empleado?.id || 0;
        reset({
          cajaId: cId,
          empleadoId: eId,
          fechaHoraApertura: toLocalDatetimeString(turnoToEdit.fechaHoraApertura),
          fechaHoraCierre: isClosing
            ? nowStr
            : turnoToEdit.fechaHoraCierre
            ? toLocalDatetimeString(turnoToEdit.fechaHoraCierre)
            : "",
          estado: isClosing ? EstadoTurnoCaja.Cerrado : turnoToEdit.estado,
        });
      } else {
        reset({
          cajaId: defaultCajaId || 0,
          empleadoId: 0,
          fechaHoraApertura: nowStr,
          fechaHoraCierre: "",
          estado: EstadoTurnoCaja.Abierto,
        });
      }
    }
  }, [open, turnoToEdit, defaultCajaId, mode, isClosing, reset]);

  const handleEmpleadoChange = React.useCallback(
    (val: string) => {
      setValue("empleadoId", Number(val), { shouldValidate: true });
    },
    [setValue]
  );

  const onSubmit = async (values: TurnoCajaFormValues) => {
    try {
      const targetCajaId = Number(defaultCajaId || turnoToEdit?.caja?.id || values.cajaId);
      if (!targetCajaId) {
        toast.error("No se pudo identificar la caja asociada.");
        return;
      }

      const aperturaIso = new Date(values.fechaHoraApertura).toISOString();
      const cierreIso = values.fechaHoraCierre
        ? new Date(values.fechaHoraCierre).toISOString()
        : null;

      // Determinación automática del estado según si hay cierre o es acción de cierre
      const finalEstado =
        isClosing || Boolean(values.fechaHoraCierre)
          ? EstadoTurnoCaja.Cerrado
          : turnoToEdit?.estado ?? EstadoTurnoCaja.Abierto;

      const payload = {
        cajaId: targetCajaId,
        empleadoId: Number(values.empleadoId),
        fechaHoraApertura: aperturaIso,
        fechaHoraCierre: cierreIso,
        estado: finalEstado,
      };

      if ((isEditing || isClosing) && turnoToEdit) {
        await updateMutation.mutateAsync({
          id: turnoToEdit.id,
          data: payload,
        });
        toast.success(
          isClosing
            ? `Turno de caja cerrado correctamente.`
            : `Turno de caja actualizado correctamente.`
        );
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Turno de caja abierto correctamente.`);
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string; title?: string } }; message?: string };
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        err?.message ||
        "Ocurrió un error al guardar el turno de caja.";
      toast.error(message);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-lg",
                isClosing
                  ? "bg-amber-500/10 text-amber-600"
                  : "bg-primary/10 text-primary"
              )}
            >
              {isClosing ? <LogOut className="size-5" /> : <Clock className="size-5" />}
            </div>
            <span>
              {isClosing
                ? "Cerrar Turno de Caja"
                : isEditing
                ? "Editar Turno de Caja"
                : "Apertura de Turno"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isClosing
              ? "Confirme la fecha y hora de cierre para registrar el término de este turno."
              : isEditing
              ? "Modifique la información del turno de caja."
              : "Seleccione el cajero responsable y confirme el horario de apertura."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Indicador de campos obligatorios */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md border border-border/40">
            <span>Configuración del Turno</span>
            <span className="text-destructive font-medium">* Requeridos</span>
          </div>

          {/* Cajero / Empleado Responsable Autocomplete */}
          <div className="space-y-1.5">
            <Label htmlFor="empleadoId" className="text-xs flex items-center gap-1">
              Cajero / Empleado Responsable <span className="text-destructive">*</span>
            </Label>
            <Autocomplete
              id="empleadoId"
              value={selectedEmpleadoId ? String(selectedEmpleadoId) : ""}
              onValueChange={handleEmpleadoChange}
              options={empleadoOptions}
              placeholder="Buscar por código, nombre o DNI de cajero..."
              emptyText="No se encontraron cajeros/empleados registrados"
              allowCustomValue={false}
              isLoading={isLoadingEmpleados}
              disabled={isLoading || isClosing}
              error={Boolean(errors.empleadoId)}
            />
            {errors.empleadoId && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.empleadoId.message}
              </p>
            )}
          </div>

          {/* Fecha y Hora de Apertura */}
          <div className="space-y-1.5">
            <Label htmlFor="fechaHoraApertura" className="text-xs flex items-center gap-1">
              Fecha y Hora de Apertura <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fechaHoraApertura"
              type="datetime-local"
              value={fechaAperturaVal}
              onChange={(e) =>
                setValue("fechaHoraApertura", e.target.value, {
                  shouldValidate: true,
                })
              }
              className={cn(
                "h-9 text-sm font-mono",
                errors.fechaHoraApertura && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={Boolean(errors.fechaHoraApertura)}
              disabled={isLoading || isClosing}
            />
            {errors.fechaHoraApertura && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.fechaHoraApertura.message}
              </p>
            )}
          </div>

          {/* Fecha y Hora de Cierre (Si es Cierre o Edición) */}
          {(isClosing || isEditing || fechaCierreVal) && (
            <div className="space-y-1.5 pt-2 border-t border-border/40">
              <Label htmlFor="fechaHoraCierre" className="text-xs flex items-center gap-1">
                Fecha y Hora de Cierre {isClosing && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="fechaHoraCierre"
                type="datetime-local"
                value={fechaCierreVal || ""}
                onChange={(e) => {
                  setValue("fechaHoraCierre", e.target.value);
                  if (e.target.value) {
                    setValue("estado", EstadoTurnoCaja.Cerrado);
                  }
                }}
                className={cn(
                  "h-9 text-sm font-mono",
                  errors.fechaHoraCierre && "border-destructive focus-visible:ring-destructive"
                )}
                aria-invalid={Boolean(errors.fechaHoraCierre)}
                disabled={isLoading}
              />
              {errors.fechaHoraCierre && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.fechaHoraCierre.message}
                </p>
              )}
            </div>
          )}

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
              className={cn(
                "h-9 gap-2 text-xs sm:text-sm cursor-pointer",
                isClosing && "bg-amber-600 hover:bg-amber-700 text-white"
              )}
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              <span>
                {isClosing
                  ? "Confirmar Cierre"
                  : isEditing
                  ? "Guardar Cambios"
                  : "Abrir Turno"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
