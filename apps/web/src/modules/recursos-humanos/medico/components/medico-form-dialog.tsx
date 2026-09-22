"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stethoscope, Loader2, Save, User, Award } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  medicoSchema,
  type MedicoFormValues,
} from "../schemas/medico.schema";
import {
  useCreateMedico,
  useUpdateMedico,
  useMedicos,
} from "../hooks/use-medicos";
import { useEmpleados } from "@/modules/recursos-humanos/empleado";
import { getMedicoFullName } from "./medico-list";
import type { MedicoResponse } from "../types/medico.types";

interface MedicoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicoToEdit?: MedicoResponse | null;
  onSuccessCallback?: () => void;
}

export function MedicoFormDialog({
  open,
  onOpenChange,
  medicoToEdit,
  onSuccessCallback,
}: MedicoFormDialogProps) {
  const isEditing = Boolean(medicoToEdit && medicoToEdit.id > 0);

  const createMutation = useCreateMedico();
  const updateMutation = useUpdateMedico();

  const empleadosQuery = useEmpleados({ pageSize: 100 });
  const empleados = React.useMemo(
    () => empleadosQuery.data?.items ?? [],
    [empleadosQuery.data]
  );

  const medicosExistentesQuery = useMedicos({ pageSize: 500 });
  const empleadosOcupados = React.useMemo(() => {
    const ids = new Set<number>();
    const editingId = medicoToEdit?.id;
    medicosExistentesQuery.data?.items?.forEach((m) => {
      if (m.id !== editingId) ids.add(m.empleadoId);
    });
    return ids;
  }, [medicosExistentesQuery.data, medicoToEdit?.id]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MedicoFormValues>({
    resolver: zodResolver(medicoSchema),
    defaultValues: {
      empleadoId: 0,
      matriculaProfesional: "",
      registroMinisterioSalud: "",
    },
  });

  const empleadoIdWatch = watch("empleadoId");

  // Reset form when modal opens or editing target changes
  React.useEffect(() => {
    if (open) {
      if (medicoToEdit) {
        reset({
          empleadoId: medicoToEdit.empleadoId,
          matriculaProfesional: medicoToEdit.matriculaProfesional ?? "",
          registroMinisterioSalud: medicoToEdit.registroMinisterioSalud ?? "",
        });
      } else {
        reset({
          empleadoId: 0,
          matriculaProfesional: "",
          registroMinisterioSalud: "",
        });
      }
    }
  }, [open, medicoToEdit, reset]);

  const onSubmit = async (values: MedicoFormValues) => {
    try {
      const payload = {
        empleadoId: values.empleadoId,
        matriculaProfesional: values.matriculaProfesional.trim().toUpperCase(),
        registroMinisterioSalud: values.registroMinisterioSalud?.trim() || null,
      };

      if (isEditing && medicoToEdit) {
        await updateMutation.mutateAsync({
          id: medicoToEdit.id,
          request: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  const doctorNombre = medicoToEdit ? getMedicoFullName(medicoToEdit) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-5 sm:p-6">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="flex items-center gap-2.5 text-base sm:text-lg font-bold">
            <div className="flex size-8.5 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 shadow-2xs">
              <Stethoscope className="size-4.5" />
            </div>
            <span>{isEditing ? "Editar Médico" : "Nuevo Médico"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique los registros profesionales y colegiatura del médico seleccionado."
              : "Vincule un empleado registrado para habilitarlo como médico asistencial."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* SECCIÓN 1: EMPLEADO */}
          <div className="space-y-1.5">
            <Label htmlFor="empleadoId" className="text-xs font-semibold text-foreground flex items-center gap-1">
              <User className="size-3.5 text-primary/70" />
              <span>Empleado de la Clínica</span>
              <span className="text-destructive">*</span>
            </Label>

            {isEditing ? (
              <div className="p-2.5 rounded-lg border border-border/70 bg-muted/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-7.5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {medicoToEdit?.empleado?.persona?.nombres?.[0] || "DR"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      Dr(a). {doctorNombre}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono truncate">
                      Código: {medicoToEdit?.empleado?.codigoEmpleado || "—"}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-muted/60 shrink-0">
                  No modificable
                </Badge>
              </div>
            ) : (
              <div className="space-y-1">
                <Select
                  value={empleadoIdWatch ? String(empleadoIdWatch) : ""}
                  onValueChange={(val) =>
                    setValue("empleadoId", Number(val), { shouldValidate: true })
                  }
                  disabled={isLoading || empleadosQuery.isLoading}
                >
                  <SelectTrigger
                    id="empleadoId"
                    className={cn(
                      "w-full h-9 text-xs",
                      errors.empleadoId && "border-destructive focus-visible:ring-destructive"
                    )}
                  >
                    <SelectValue
                      placeholder={
                        empleadosQuery.isLoading
                          ? "Cargando empleados..."
                          : "Seleccione un empleado..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {empleados.length === 0 ? (
                      <div className="p-2 text-xs text-muted-foreground text-center">
                        No hay empleados disponibles.
                      </div>
                    ) : (
                      empleados.map((emp) => {
                        const isOcupado = empleadosOcupados.has(emp.id);
                        const nom = emp.persona
                          ? `${emp.persona.nombres} ${emp.persona.apellidoPaterno} ${
                              emp.persona.apellidoMaterno || ""
                            }`
                          : `Empleado #${emp.id}`;
                        return (
                          <SelectItem
                            key={emp.id}
                            value={String(emp.id)}
                            disabled={isOcupado}
                            className="text-xs cursor-pointer"
                          >
                            {nom} (#{emp.codigoEmpleado})
                            {isOcupado ? " [Ya es médico]" : ""}
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>

                {errors.empleadoId && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.empleadoId.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* SECCIÓN 2: REGISTROS PROFESIONALES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Matrícula Profesional */}
            <div className="space-y-1.5">
              <Label htmlFor="matriculaProfesional" className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Award className="size-3.5 text-primary/70" />
                <span>Matrícula Profesional</span>
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="matriculaProfesional"
                placeholder="Ej: MP-12345"
                {...register("matriculaProfesional")}
                disabled={isLoading}
                className={cn(
                  "font-mono uppercase h-9 text-xs",
                  errors.matriculaProfesional && "border-destructive focus-visible:ring-destructive"
                )}
                autoFocus={isEditing}
              />
              {errors.matriculaProfesional && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.matriculaProfesional.message}
                </p>
              )}
            </div>

            {/* Registro Ministerio de Salud */}
            <div className="space-y-1.5">
              <Label htmlFor="registroMinisterioSalud" className="text-xs font-semibold text-foreground">
                Reg. Ministerio Salud <span className="text-muted-foreground font-normal">(Opcional)</span>
              </Label>
              <Input
                id="registroMinisterioSalud"
                placeholder="Ej: RMS-8899"
                {...register("registroMinisterioSalud")}
                disabled={isLoading}
                className={cn(
                  "font-mono uppercase h-9 text-xs",
                  errors.registroMinisterioSalud && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.registroMinisterioSalud && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.registroMinisterioSalud.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="text-xs h-8.5 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="text-xs h-8.5 font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>{isEditing ? "Guardar Cambios" : "Crear Médico"}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
