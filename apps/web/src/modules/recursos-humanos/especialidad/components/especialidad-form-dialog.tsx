"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Stethoscope, Loader2, Save } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  especialidadSchema,
  type EspecialidadFormValues,
} from "../schemas/especialidad.schema";
import {
  useCreateEspecialidad,
  useUpdateEspecialidad,
} from "../hooks/use-especialidades";
import type { EspecialidadResponse } from "../types/especialidad.types";

interface EspecialidadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  especialidadToEdit?: EspecialidadResponse | null;
  onSuccessCallback?: () => void;
}

export function EspecialidadFormDialog({
  open,
  onOpenChange,
  especialidadToEdit,
  onSuccessCallback,
}: EspecialidadFormDialogProps) {
  const isEditing = Boolean(especialidadToEdit);

  const createMutation = useCreateEspecialidad();
  const updateMutation = useUpdateEspecialidad();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EspecialidadFormValues>({
    resolver: zodResolver(especialidadSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
    },
  });

  // Reset form on open/edit change
  React.useEffect(() => {
    if (open) {
      if (especialidadToEdit) {
        reset({
          codigo: especialidadToEdit.codigo ?? "",
          nombre: especialidadToEdit.nombre ?? "",
          descripcion: especialidadToEdit.descripcion ?? "",
        });
      } else {
        reset({
          codigo: "",
          nombre: "",
          descripcion: "",
        });
      }
    }
  }, [open, especialidadToEdit, reset]);

  const onSubmit = async (values: EspecialidadFormValues) => {
    try {
      const payload = {
        codigo: values.codigo.trim().toUpperCase(),
        nombre: values.nombre.trim(),
        descripcion: values.descripcion?.trim() || undefined,
      };

      if (isEditing && especialidadToEdit) {
        await updateMutation.mutateAsync({
          id: especialidadToEdit.id,
          data: payload,
        });
        toast.success(`Especialidad "${values.nombre}" actualizada correctamente.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Especialidad "${values.nombre}" registrada exitosamente.`);
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; detail?: string } };
        message?: string;
      };
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Ocurrió un error al procesar la solicitud.";
      toast.error(errorMsg);
    }
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5 sm:p-6">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="flex items-center gap-2.5 text-base sm:text-lg font-bold">
            <div className="flex size-8.5 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 shadow-2xs">
              <Stethoscope className="size-4.5" />
            </div>
            <span>{isEditing ? "Editar Especialidad" : "Nueva Especialidad"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique los datos de la especialidad médica seleccionada."
              : "Defina una nueva especialidad médica o subespecialidad clínica."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Código */}
          <div className="space-y-1.5">
            <Label htmlFor="codigo" className="text-xs font-semibold text-foreground">
              Código <span className="text-destructive">*</span>
            </Label>
            <Input
              id="codigo"
              placeholder="Ej: PEDIATRIA, CARDIO, GIN-OBS"
              {...register("codigo")}
              disabled={isLoading}
              className="uppercase text-xs font-mono h-9"
              autoFocus={!isEditing}
            />
            {errors.codigo && (
              <p className="text-[11px] font-medium text-destructive">
                {errors.codigo.message}
              </p>
            )}
            <p className="text-[10.5px] text-muted-foreground">
              Identificador alfanumérico único para la especialidad médica.
            </p>
          </div>

          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="nombre" className="text-xs font-semibold text-foreground">
              Nombre de la Especialidad <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="Ej: Pediatría y Neonatología"
              {...register("nombre")}
              disabled={isLoading}
              className="text-xs h-9"
            />
            {errors.nombre && (
              <p className="text-[11px] font-medium text-destructive">
                {errors.nombre.message}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="descripcion" className="text-xs font-semibold text-foreground">
              Descripción / Alcance Clínico{" "}
              <span className="text-[10px] text-muted-foreground font-normal">
                (Opcional)
              </span>
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Breve detalle sobre los procedimientos, enfoque o subespecialidad..."
              {...register("descripcion")}
              disabled={isLoading}
              rows={3}
              className="text-xs resize-none"
            />
            {errors.descripcion && (
              <p className="text-[11px] font-medium text-destructive">
                {errors.descripcion.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-8 text-xs cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="h-8 px-4 text-xs font-semibold gap-1.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-xs shadow-primary/20 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  {isEditing ? "Guardar Cambios" : "Crear Especialidad"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
