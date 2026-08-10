"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HeartPulse, Loader2, UserCheck, FileBadge } from "lucide-react";

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
import { useEmpleados } from "@/modules/recursos-humanos/empleado/hooks/use-empleados";
import { useCreateMedico, useUpdateMedico } from "../hooks/use-medicos";
import { medicoSchema, type MedicoFormValues } from "../schemas/medico.schema";
import type { MedicoResponse } from "../types/medico.types";

interface MedicoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicoToEdit?: MedicoResponse | null;
}

export function MedicoFormDialog({
  open,
  onOpenChange,
  medicoToEdit,
}: MedicoFormDialogProps) {
  const isEditing = Boolean(medicoToEdit);
  const createMutation = useCreateMedico();
  const updateMutation = useUpdateMedico();

  const { data: empleadosData, isLoading: isLoadingEmpleados } = useEmpleados({
    pageSize: 200,
  });

  const empleados = React.useMemo(
    () => empleadosData?.items ?? [],
    [empleadosData]
  );

  const empleadoOptions: AutocompleteOption[] = React.useMemo(() => {
    return empleados.map((emp) => {
      const nombre =
        [emp.persona?.nombres, emp.persona?.apellidoPaterno, emp.persona?.apellidoMaterno]
          .filter(Boolean)
          .join(" ") || `Empleado #${emp.id}`;
      return {
        value: String(emp.id),
        label: nombre,
        description: emp.codigoEmpleado ? `Cód: ${emp.codigoEmpleado}` : undefined,
      };
    });
  }, [empleados]);

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

  const selectedEmpleadoId = watch("empleadoId");

  React.useEffect(() => {
    if (open) {
      if (medicoToEdit) {
        reset({
          empleadoId: medicoToEdit.empleadoId,
          matriculaProfesional: medicoToEdit.matriculaProfesional,
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
      if (isEditing && medicoToEdit) {
        await updateMutation.mutateAsync({
          id: medicoToEdit.id,
          request: {
            empleadoId: values.empleadoId,
            matriculaProfesional: values.matriculaProfesional.trim(),
            registroMinisterioSalud: values.registroMinisterioSalud?.trim() || null,
          },
        });
      } else {
        await createMutation.mutateAsync({
          empleadoId: values.empleadoId,
          matriculaProfesional: values.matriculaProfesional.trim(),
          registroMinisterioSalud: values.registroMinisterioSalud?.trim() || null,
        });
      }
      onOpenChange(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HeartPulse className="size-5" />
            </div>
            <span>{isEditing ? "Editar Expediente Médico" : "Registrar Nuevo Médico"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique la matrícula o registro del médico seleccionado."
              : "Seleccione un empleado e ingrese sus acreditaciones profesionales."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          {/* Banner de requeridos */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md border border-border/40">
            <span>Campos obligatorios</span>
            <span className="text-destructive font-medium">* Requeridos</span>
          </div>

          {/* Sección 1: Empleado Acreditado */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
              <UserCheck className="size-3.5 text-primary" />
              <span>Acreditación del Empleado</span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="empleadoId" className="text-xs flex items-center gap-1">
                Empleado Acreditado <span className="text-destructive">*</span>
              </Label>
              <Autocomplete
                id="empleadoId"
                value={selectedEmpleadoId ? String(selectedEmpleadoId) : ""}
                onValueChange={(val) =>
                  setValue("empleadoId", Number(val), { shouldValidate: true })
                }
                options={empleadoOptions}
                placeholder="Buscar por nombre de empleado..."
                emptyText="No se encontraron empleados registrados"
                allowCustomValue={false}
                isLoading={isLoadingEmpleados}
                disabled={isEditing || isPending}
                error={Boolean(errors.empleadoId)}
              />
              {isEditing && (
                <p className="text-[11px] text-muted-foreground italic">
                  El empleado asociado no se puede modificar al editar la ficha médica.
                </p>
              )}
              {errors.empleadoId && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.empleadoId.message}
                </p>
              )}
            </div>
          </div>

          {/* Sección 2: Colegiatura / Matrícula */}
          <div className="space-y-3.5 pt-2 border-t border-border/40">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
              <FileBadge className="size-3.5 text-primary" />
              <span>Acreditación y Registros</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Matrícula Profesional */}
              <div className="space-y-1.5">
                <Label htmlFor="matriculaProfesional" className="text-xs flex items-center gap-1">
                  Matrícula Profesional <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="matriculaProfesional"
                  placeholder="Ej: MP-84920"
                  className="font-mono text-sm h-9 uppercase"
                  {...register("matriculaProfesional")}
                />
                {errors.matriculaProfesional && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.matriculaProfesional.message}
                  </p>
                )}
              </div>

              {/* Registro Ministerio de Salud */}
              <div className="space-y-1.5">
                <Label htmlFor="registroMinisterioSalud" className="text-xs">
                  Reg. Min. Salud (Opcional)
                </Label>
                <Input
                  id="registroMinisterioSalud"
                  placeholder="Ej: MS-10492"
                  className="font-mono text-sm h-9"
                  {...register("registroMinisterioSalud")}
                />
                {errors.registroMinisterioSalud && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.registroMinisterioSalud.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="text-xs gap-1.5">
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              {isEditing ? "Guardar Cambios" : "Registrar Médico"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
