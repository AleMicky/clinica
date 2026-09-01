"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  UserPlus,
  Pencil,
  Loader2,
  User,
  IdCard,
  Briefcase,
  AlertCircle,
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
import { Badge } from "@/components/ui/badge";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { cn } from "@/lib/utils";

import {
  empleadoSchema,
  type EmpleadoFormValues,
} from "../schemas/empleado.schema";
import {
  useCreateEmpleado,
  useUpdateEmpleado,
  useEmpleados as useEmpleadosLista,
} from "../hooks/use-empleados";
import { usePersonas } from "@/modules/seguridad/persona";
import {
  nombreCompleto,
  documentoCompleto,
  type EmpleadoResponse,
} from "../types/empleado.types";

interface EmpleadoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empleadoToEdit?: EmpleadoResponse | null;
  onSuccessCallback?: () => void;
}

function toISODate(value?: string | Date | null): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return typeof value === "string" ? value : "";
  const tz = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - tz);
  return local.toISOString().slice(0, 10);
}

function getTodayISO(): string {
  const now = new Date();
  const tz = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tz).toISOString().slice(0, 10);
}

export function EmpleadoFormDialog({
  open,
  onOpenChange,
  empleadoToEdit,
  onSuccessCallback,
}: EmpleadoFormDialogProps) {
  const isEditing = Boolean(empleadoToEdit && empleadoToEdit.id > 0);

  const createMutation = useCreateEmpleado();
  const updateMutation = useUpdateEmpleado();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EmpleadoFormValues>({
    resolver: zodResolver(empleadoSchema),
    defaultValues: {
      personaId: 0,
      codigoEmpleado: "",
      fechaIngreso: getTodayISO(),
      fechaRetiro: "",
    },
  });

  // Query Personas
  const { data: personasData, isLoading: isLoadingPersonas } = usePersonas({
    page: 1,
    pageSize: 200,
  });

  const personasList = React.useMemo(
    () => personasData?.items ?? [],
    [personasData]
  );

  // List existing empleados to check occupied personas
  const { data: empleadosExistentesData } = useEmpleadosLista({
    page: 1,
    pageSize: 500,
  });

  const personasOcupadas = React.useMemo(() => {
    const ids = new Set<number>();
    const editingId = empleadoToEdit?.id;
    empleadosExistentesData?.items?.forEach((emp) => {
      if (emp.id !== editingId) ids.add(emp.personaId);
    });
    return ids;
  }, [empleadosExistentesData, empleadoToEdit]);

  const selectedPersonaId = watch("personaId");
  const fechaIngresoVal = watch("fechaIngreso");
  const fechaRetiroVal = watch("fechaRetiro");

  // Autocomplete options for personas
  const personaOptions: AutocompleteOption[] = React.useMemo(() => {
    return personasList
      .filter((p) => !personasOcupadas.has(p.id))
      .map((p) => {
        const fullDoc = documentoCompleto(p);
        const fullName = nombreCompleto(p);
        return {
          value: String(p.id),
          label: `${fullName} (${fullDoc})`,
          description: `Doc: ${fullDoc} • Tel: ${p.telefono || "N/D"}`,
        };
      });
  }, [personasList, personasOcupadas]);

  const selectedPersonaObj = React.useMemo(() => {
    if (!selectedPersonaId) return null;
    return personasList.find((p) => p.id === selectedPersonaId) || empleadoToEdit?.persona || null;
  }, [personasList, selectedPersonaId, empleadoToEdit]);

  // Load initial values on modal open
  React.useEffect(() => {
    if (open) {
      if (empleadoToEdit) {
        reset({
          personaId: empleadoToEdit.personaId,
          codigoEmpleado: empleadoToEdit.codigoEmpleado || "",
          fechaIngreso: toISODate(empleadoToEdit.fechaIngreso),
          fechaRetiro: toISODate(empleadoToEdit.fechaRetiro),
        });
      } else {
        reset({
          personaId: 0,
          codigoEmpleado: "",
          fechaIngreso: getTodayISO(),
          fechaRetiro: "",
        });
      }
    }
  }, [open, empleadoToEdit, reset]);

  const handlePersonaChange = React.useCallback(
    (val: string) => {
      setValue("personaId", Number(val), { shouldValidate: true });
    },
    [setValue]
  );

  const onSubmit = async (values: EmpleadoFormValues) => {
    try {
      const payload = {
        personaId: values.personaId,
        codigoEmpleado: values.codigoEmpleado?.trim() || null,
        fechaIngreso: values.fechaIngreso.trim(),
        fechaRetiro: values.fechaRetiro?.trim() || null,
      };

      if (isEditing && empleadoToEdit) {
        await updateMutation.mutateAsync({
          id: empleadoToEdit.id,
          data: payload,
        });
        toast.success("Empleado actualizado correctamente.");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Empleado registrado exitosamente.");
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Ocurrió un error al procesar el registro del empleado.";
      toast.error(errorMsg);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-border/60 shadow-2xl">
        {/* Modal Header */}
        <div
          className={cn(
            "p-6 pb-5 border-b",
            isEditing
              ? "bg-gradient-to-r from-blue-500/15 via-blue-500/5 to-transparent border-blue-500/20"
              : "bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-primary/20"
          )}
        >
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-2xl border shadow-xs shrink-0",
                  isEditing
                    ? "bg-blue-600 text-white border-blue-700 shadow-blue-500/20"
                    : "bg-primary text-primary-foreground border-primary/80 shadow-primary/20"
                )}
              >
                {isEditing ? <Pencil className="size-5.5" /> : <UserPlus className="size-5.5" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                    {isEditing ? "Modificar Ficha de Empleado" : "Registrar Nuevo Empleado"}
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                      isEditing
                        ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30"
                        : "bg-primary/10 text-primary border-primary/30"
                    )}
                  >
                    {isEditing ? "Modo Edición" : "Nuevo Ingreso"}
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {isEditing
                    ? "Actualice los parámetros laborales del empleado registrado."
                    : "Vincule una persona titular y configure sus fechas de contratación."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-4 space-y-5">
          {/* SECCIÓN 1: VINCULACIÓN DE PERSONA TITULAR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-border/40">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <IdCard className="size-3.5 text-primary" />
                1. Persona Titular
              </span>
              <span className="text-[10px] font-medium text-destructive">* Campo requerido</span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="personaId" className="text-xs font-semibold flex items-center gap-1">
                Persona <span className="text-destructive">*</span>
              </Label>
              <Autocomplete
                id="personaId"
                value={selectedPersonaId ? String(selectedPersonaId) : ""}
                onValueChange={handlePersonaChange}
                options={personaOptions}
                placeholder="Buscar por nombre, apellido o número de documento..."
                emptyText="No se encontraron personas disponibles sin asignar"
                allowCustomValue={false}
                isLoading={isLoadingPersonas}
                disabled={isLoading || isEditing}
                error={Boolean(errors.personaId)}
              />
              {errors.personaId && (
                <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.personaId.message}
                </p>
              )}
            </div>

            {/* Vista previa de la Persona Seleccionada */}
            {selectedPersonaObj && (
              <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-3 flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                  <User className="size-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground truncate">
                      {nombreCompleto(selectedPersonaObj)}
                    </span>
                    <span className="text-[10px] font-mono bg-background px-1.5 py-0.2 rounded border border-border/60 text-muted-foreground">
                      {documentoCompleto(selectedPersonaObj)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Teléfono: {selectedPersonaObj.telefono || "No registrado"} • Dirección: {selectedPersonaObj.direccion || "No registrada"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SECCIÓN 2: INFORMACIÓN LABORAL */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between pb-1 border-b border-border/40">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="size-3.5 text-primary" />
                2. Parámetros Laborales
              </span>
            </div>

            {/* Código de Empleado */}
            <div className="space-y-1.5">
              <Label htmlFor="codigoEmpleado" className="text-xs font-semibold flex items-center gap-1">
                Código de Empleado <span className="text-muted-foreground text-[10px] font-normal">(Opcional)</span>
              </Label>
              <Input
                id="codigoEmpleado"
                {...register("codigoEmpleado")}
                placeholder="Ej. EMP-00123 (Se auto-generará si se deja vacío)"
                className="h-9.5 text-xs font-mono uppercase bg-background"
                disabled={isLoading}
              />
              {errors.codigoEmpleado && (
                <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.codigoEmpleado.message}
                </p>
              )}
            </div>

            {/* Fechas de Ingreso y Retiro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Fecha de Ingreso */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fechaIngreso" className="text-xs font-semibold flex items-center gap-1">
                    Fecha de Ingreso <span className="text-destructive">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={() => setValue("fechaIngreso", getTodayISO(), { shouldValidate: true })}
                    className="text-[10px] font-semibold text-primary hover:underline cursor-pointer bg-primary/10 px-1.5 py-0.2 rounded"
                  >
                    Hoy
                  </button>
                </div>
                <Input
                  id="fechaIngreso"
                  type="date"
                  value={fechaIngresoVal}
                  onChange={(e) => setValue("fechaIngreso", e.target.value, { shouldValidate: true })}
                  className={cn(
                    "h-9.5 text-xs font-mono bg-background",
                    errors.fechaIngreso && "border-destructive focus-visible:ring-destructive"
                  )}
                  disabled={isLoading}
                />
                {errors.fechaIngreso && (
                  <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.fechaIngreso.message}
                  </p>
                )}
              </div>

              {/* Fecha de Retiro */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fechaRetiro" className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
                    Fecha de Retiro <span className="text-[10px] font-normal">(Si aplica)</span>
                  </Label>
                  {fechaRetiroVal && (
                    <button
                      type="button"
                      onClick={() => setValue("fechaRetiro", "", { shouldValidate: true })}
                      className="text-[10px] font-semibold text-destructive hover:underline cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                <Input
                  id="fechaRetiro"
                  type="date"
                  value={fechaRetiroVal || ""}
                  onChange={(e) => setValue("fechaRetiro", e.target.value, { shouldValidate: true })}
                  className={cn(
                    "h-9.5 text-xs font-mono bg-background",
                    errors.fechaRetiro && "border-destructive focus-visible:ring-destructive"
                  )}
                  disabled={isLoading}
                />
                {errors.fechaRetiro && (
                  <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.fechaRetiro.message}
                  </p>
                )}
              </div>
            </div>
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
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
              )}
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              <span>{isEditing ? "Guardar Modificaciones" : "Registrar Empleado"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
