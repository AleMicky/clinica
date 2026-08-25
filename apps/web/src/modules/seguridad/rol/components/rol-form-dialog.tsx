"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Key, Loader2 } from "lucide-react";

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

import { rolSchema, type RolFormValues } from "../schemas/rol.schema";
import { useCreateRol, useUpdateRol } from "../hooks/use-roles";
import type { RolResponse } from "../types/rol.types";

interface RolFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rolToEdit?: RolResponse | null;
  onSuccessCallback?: () => void;
}

export function RolFormDialog({
  open,
  onOpenChange,
  rolToEdit,
  onSuccessCallback,
}: RolFormDialogProps) {
  const isEditing = Boolean(rolToEdit);

  const createMutation = useCreateRol();
  const updateMutation = useUpdateRol();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RolFormValues>({
    resolver: zodResolver(rolSchema),
    defaultValues: {
      name: "",
      descripcion: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      if (rolToEdit) {
        reset({
          name: rolToEdit.name,
          descripcion: rolToEdit.descripcion ?? "",
        });
      } else {
        reset({
          name: "",
          descripcion: "",
        });
      }
    }
  }, [open, rolToEdit, reset]);

  const onSubmit = async (values: RolFormValues) => {
    try {
      if (isEditing && rolToEdit) {
        await updateMutation.mutateAsync({
          id: rolToEdit.id,
          data: {
            name: values.name,
            descripcion: values.descripcion || undefined,
          },
        });
        toast.success("Rol actualizado exitosamente");
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          descripcion: values.descripcion || undefined,
        });
        toast.success("Rol creado exitosamente");
      }

      onOpenChange(false);
      onSuccessCallback?.();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { detail?: string; message?: string } };
      };
      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Ocurrió un error al procesar la solicitud.";
      toast.error(errorMessage);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="size-5 text-primary" />
            {isEditing ? "Editar Rol" : "Crear Nuevo Rol"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifique los campos del rol de usuario."
              : "Ingrese la información necesaria para registrar un nuevo rol."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Nombre del Rol */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre del Rol <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ej: FARMACEUTICO, AUDITOR, etc."
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="Describa el alcance o responsabilidad del rol..."
              rows={3}
              {...register("descripcion")}
            />
            {errors.descripcion && (
              <p className="text-xs text-destructive">{errors.descripcion.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? "Guardar Cambios" : "Crear Rol"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
