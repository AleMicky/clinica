"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Stethoscope } from "lucide-react";

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
import { cn } from "@/lib/utils";

import {
  especialidadSchema,
  type EspecialidadFormValues,
} from "../schemas/especialidad.schema";
import {
  useCreateEspecialidad,
  useUpdateEspecialidad,
} from "../hooks/use-especialidades";
import type { EspecialidadItem } from "./especialidad-table";
import type { EspecialidadResponse } from "../types/especialidad.types";

interface EspecialidadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  especialidadToEdit?: EspecialidadResponse | EspecialidadItem | null;
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

  // Reset form when dialog opens/closes or edit item changes
  React.useEffect(() => {
    if (open) {
      if (especialidadToEdit) {
        reset({
          codigo: especialidadToEdit.codigo || "",
          nombre: especialidadToEdit.nombre || "",
          descripcion: especialidadToEdit.descripcion || "",
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

  const isLoading =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  const onSubmit = async (values: EspecialidadFormValues) => {
    try {
      if (isEditing && especialidadToEdit) {
        await updateMutation.mutateAsync({
          id: Number(especialidadToEdit.id),
          data: {
            codigo: values.codigo,
            nombre: values.nombre,
            descripcion: values.descripcion || undefined,
          },
        });
        toast.success(`Especialidad "${values.nombre}" actualizada exitosamente.`);
      } else {
        await createMutation.mutateAsync({
          codigo: values.codigo,
          nombre: values.nombre,
          descripcion: values.descripcion || undefined,
        });
        toast.success(`Especialidad "${values.nombre}" creada exitosamente.`);
      }

      onOpenChange(false);
      onSuccessCallback?.();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al procesar la solicitud.";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Stethoscope className="size-4" />
            </div>
            <span>{isEditing ? "Editar Especialidad" : "Crear Especialidad Médica"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique la información de la especialidad registrada."
              : "Complete los campos para agregar una nueva especialidad médica al catálogo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Código */}
          <div className="space-y-1.5">
            <Label htmlFor="codigo" className="text-xs flex items-center gap-1">
              Código <span className="text-destructive">*</span>
            </Label>
            <Input
              id="codigo"
              placeholder="Ej. CARD"
              className={cn(
                "h-8 text-xs font-mono uppercase",
                errors.codigo && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={Boolean(errors.codigo)}
              {...register("codigo")}
            />
            {errors.codigo && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.codigo.message}
              </p>
            )}
          </div>

          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="nombre" className="text-xs flex items-center gap-1">
              Nombre de Especialidad <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="Ej. Cardiología"
              className={cn(
                "h-8 text-xs",
                errors.nombre && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={Boolean(errors.nombre)}
              {...register("nombre")}
            />
            {errors.nombre && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.nombre.message}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="descripcion" className="text-xs">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Breve descripción o detalle del área de especialización..."
              className={cn(
                "text-xs min-h-[70px] resize-none",
                errors.descripcion && "border-destructive focus-visible:ring-destructive"
              )}
              {...register("descripcion")}
            />
            {errors.descripcion && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.descripcion.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-3 border-t gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-8 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="h-8 text-xs gap-1.5"
            >
              {isLoading && <Loader2 className="size-3.5 animate-spin" />}
              {isEditing ? "Guardar Cambios" : "Crear Especialidad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
