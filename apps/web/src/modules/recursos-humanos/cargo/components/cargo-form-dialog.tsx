"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Award, Loader2 } from "lucide-react";

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

import { cargoSchema, type CargoFormValues } from "../schemas/cargo.schema";
import { useCreateCargo, useUpdateCargo } from "../hooks/use-cargos";
import type { CargoResponse } from "../types/cargo.types";

interface CargoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cargoToEdit?: CargoResponse | null;
  onSuccessCallback?: () => void;
}

export function CargoFormDialog({
  open,
  onOpenChange,
  cargoToEdit,
  onSuccessCallback,
}: CargoFormDialogProps) {
  const isEditing = Boolean(cargoToEdit && cargoToEdit.id > 0);

  const createMutation = useCreateCargo();
  const updateMutation = useUpdateCargo();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CargoFormValues>({
    resolver: zodResolver(cargoSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
    },
  });

  // Reset form whenever modal opens or editing target changes
  React.useEffect(() => {
    if (open) {
      if (cargoToEdit) {
        reset({
          codigo: cargoToEdit.codigo || "",
          nombre: cargoToEdit.nombre || "",
          descripcion: cargoToEdit.descripcion || "",
        });
      } else {
        reset({
          codigo: "",
          nombre: "",
          descripcion: "",
        });
      }
    }
  }, [open, cargoToEdit, reset]);

  const onSubmit = async (values: CargoFormValues) => {
    try {
      const payload = {
        codigo: values.codigo.trim().toUpperCase(),
        nombre: values.nombre.trim(),
        descripcion: values.descripcion?.trim() || undefined,
      };

      if (isEditing && cargoToEdit) {
        await updateMutation.mutateAsync({
          id: cargoToEdit.id,
          data: payload,
        });
        toast.success(`Cargo "${values.nombre}" actualizado correctamente.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Cargo "${values.nombre}" registrado exitosamente.`);
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
              <Award className="size-4.5" />
            </div>
            <span>{isEditing ? "Editar Cargo" : "Nuevo Cargo"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique los datos y parámetros del cargo seleccionado."
              : "Defina un nuevo cargo o posición laboral para el personal clínico."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Código */}
          <div className="space-y-1.5">
            <Label htmlFor="codigo" className="text-xs font-medium flex items-center gap-1">
              Código <span className="text-destructive">*</span>
            </Label>
            <Input
              id="codigo"
              placeholder="ej. ENF-01"
              disabled={isLoading}
              className={cn(
                "h-8.5 text-xs font-mono uppercase",
                errors.codigo && "border-destructive focus-visible:ring-destructive"
              )}
              {...register("codigo")}
            />
            {errors.codigo && (
              <p className="text-[10px] text-destructive font-medium">{errors.codigo.message}</p>
            )}
          </div>

          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="nombre" className="text-xs font-medium flex items-center gap-1">
              Nombre del Cargo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="ej. Enfermero(a) de Guardia"
              disabled={isLoading}
              className={cn(
                "h-8.5 text-xs",
                errors.nombre && "border-destructive focus-visible:ring-destructive"
              )}
              {...register("nombre")}
            />
            {errors.nombre && (
              <p className="text-[10px] text-destructive font-medium">{errors.nombre.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="descripcion" className="text-xs font-medium">
              Descripción <span className="text-muted-foreground text-[10px] font-normal">(Opcional)</span>
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Detalle de funciones y responsabilidades del puesto..."
              disabled={isLoading}
              className="text-xs min-h-[85px] resize-y"
              {...register("descripcion")}
            />
            {errors.descripcion && (
              <p className="text-[10px] text-destructive font-medium">{errors.descripcion.message}</p>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-border/60 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-8 px-3 text-xs cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="h-8 px-3.5 text-xs gap-1.5 cursor-pointer font-semibold"
            >
              {isLoading && <Loader2 className="size-3.5 animate-spin" />}
              <span>{isEditing ? "Guardar Cambios" : "Crear Cargo"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
