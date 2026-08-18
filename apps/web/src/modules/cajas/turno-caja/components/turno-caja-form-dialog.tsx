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
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";

import { useCajas } from "../../caja/hooks/use-cajas";
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

  // Fetch real Cajas
  const { data: cajasData, isLoading: isLoadingCajas } = useCajas(
    STATIC_QUERY_PARAMS,
    open
  );

  // Fetch real Empleados
  const { data: empleadosData, isLoading: isLoadingEmpleados } = useEmpleados(
    STATIC_QUERY_PARAMS
  );

  const createMutation = useCreateTurnoCaja();
  const updateMutation = useUpdateTurnoCaja();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TurnoCajaFormValues>({
    resolver: zodResolver(turnoCajaSchema),
    defaultValues: {
      cajaId: 0,
      empleadoId: 0,
      fechaHoraApertura: toLocalDatetimeString(),
      fechaHoraCierre: "",
      estado: EstadoTurnoCaja.Abierto,
    },
  });

  const selectedCajaId = watch("cajaId");
  const selectedEmpleadoId = watch("empleadoId");
  const fechaAperturaVal = watch("fechaHoraApertura");
  const fechaCierreVal = watch("fechaHoraCierre");

  const cajasList = Array.isArray(cajasData?.items)
    ? cajasData.items
    : Array.isArray(cajasData)
    ? cajasData
    : [];
  const empleadosList = Array.isArray(empleadosData?.items)
    ? empleadosData.items
    : Array.isArray(empleadosData)
    ? empleadosData
    : [];

  // Mapeo de opciones Autocomplete para Cajas
  const cajaOptions: AutocompleteOption[] = React.useMemo(() => {
    return cajasList.map((caja) => ({
      value: String(caja.id),
      label: `${caja.codigo} - ${caja.nombre}`,
      description: caja.descripcion || undefined,
    }));
  }, [cajasList]);

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
        const cId = turnoToEdit.caja?.id || 0;
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

  const handleCajaChange = React.useCallback(
    (val: string) => {
      setValue("cajaId", Number(val), { shouldValidate: true });
    },
    [setValue]
  );

  const handleEmpleadoChange = React.useCallback(
    (val: string) => {
      setValue("empleadoId", Number(val), { shouldValidate: true });
    },
    [setValue]
  );

  const onSubmit = async (values: TurnoCajaFormValues) => {
    try {
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
        cajaId: Number(values.cajaId),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isClosing
              ? "Cerrar Turno de Caja"
              : isEditing
              ? "Editar Turno de Caja"
              : "Apertura de Turno de Caja"}
          </DialogTitle>
          <DialogDescription>
            {isClosing
              ? "Confirme la fecha y hora de cierre para registrar el término de este turno."
              : isEditing
              ? "Modifique la información del turno de caja."
              : "Busque y seleccione la caja y el cajero asignado para iniciar el turno."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Punto de Caja Autocomplete */}
          <div className="space-y-2">
            <Label htmlFor="cajaId" className="required font-medium">
              Punto de Caja
            </Label>
            <Autocomplete
              id="cajaId"
              value={selectedCajaId ? String(selectedCajaId) : ""}
              onValueChange={handleCajaChange}
              options={cajaOptions}
              placeholder="Buscar o seleccionar punto de caja..."
              emptyText="No se encontraron puntos de caja registrados"
              allowCustomValue={false}
              isLoading={isLoadingCajas}
              disabled={isSubmitting || isClosing}
              error={Boolean(errors.cajaId)}
            />
            {errors.cajaId && (
              <p className="text-xs text-destructive">{errors.cajaId.message}</p>
            )}
          </div>

          {/* Cajero / Empleado Responsable Autocomplete */}
          <div className="space-y-2">
            <Label htmlFor="empleadoId" className="required font-medium">
              Cajero / Empleado Responsable
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
              disabled={isSubmitting || isClosing}
              error={Boolean(errors.empleadoId)}
            />
            {errors.empleadoId && (
              <p className="text-xs text-destructive">
                {errors.empleadoId.message}
              </p>
            )}
          </div>

          {/* Fecha y Hora de Apertura */}
          <div className="space-y-2">
            <Label htmlFor="fechaHoraApertura" className="required font-medium">
              Fecha y Hora de Apertura
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
              className="h-9 text-sm font-mono"
              disabled={isSubmitting || isClosing}
            />
            {errors.fechaHoraApertura && (
              <p className="text-xs text-destructive">
                {errors.fechaHoraApertura.message}
              </p>
            )}
          </div>

          {/* Fecha y Hora de Cierre (Si es Cierre o Edición) */}
          {(isClosing || isEditing || fechaCierreVal) && (
            <div className="space-y-2">
              <Label htmlFor="fechaHoraCierre" className="font-medium">
                Fecha y Hora de Cierre
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
                className="h-9 text-sm font-mono"
                disabled={isSubmitting}
              />
              {errors.fechaHoraCierre && (
                <p className="text-xs text-destructive">
                  {errors.fechaHoraCierre.message}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="pt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-9 text-xs sm:text-sm"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`h-9 gap-2 text-xs sm:text-sm ${
                isClosing ? "bg-amber-600 hover:bg-amber-700 text-white" : ""
              }`}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>
                {isClosing
                  ? "Confirmar Cierre de Turno"
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
