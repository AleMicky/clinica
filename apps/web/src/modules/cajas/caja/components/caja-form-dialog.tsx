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
import { cajaSchema, type CajaFormValues } from "../schemas/caja.schema";
import { useCreateCaja, useUpdateCaja } from "../hooks/use-cajas";
import type { CajaResponse } from "../types/caja.types";

interface CajaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cajaToEdit?: CajaResponse | null;
  onSuccessCallback?: (caja?: CajaResponse) => void;
}

export function CajaFormDialog({
  open,
  onOpenChange,
  cajaToEdit,
  onSuccessCallback,
}: CajaFormDialogProps) {
  const isEditing = !!cajaToEdit;

  const createMutation = useCreateCaja();
  const updateMutation = useUpdateCaja();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CajaFormValues>({
    resolver: zodResolver(cajaSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      if (cajaToEdit) {
        reset({
          codigo: cajaToEdit.codigo,
          nombre: cajaToEdit.nombre,
          descripcion: cajaToEdit.descripcion || "",
        });
      } else {
        reset({
          codigo: "",
          nombre: "",
          descripcion: "",
        });
      }
    }
  }, [open, cajaToEdit, reset]);

  const onSubmit = async (values: CajaFormValues) => {
    try {
      const payload = {
        codigo: values.codigo.trim(),
        nombre: values.nombre.trim(),
        descripcion: values.descripcion?.trim() || null,
      };

      let result: CajaResponse | undefined;
      if (isEditing && cajaToEdit) {
        result = await updateMutation.mutateAsync({
          id: cajaToEdit.id,
          data: payload,
        });
        toast.success(`Caja ${payload.nombre} actualizada correctamente.`);
      } else {
        result = await createMutation.mutateAsync(payload);
        toast.success(`Caja ${payload.nombre} creada correctamente.`);
      }

      onSuccessCallback?.(result);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string; title?: string } }; message?: string };
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        err?.message ||
        "Ocurrió un error al guardar la caja.";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Caja" : "Nueva Caja"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifique la información de la caja de cobro."
              : "Ingrese los datos para habilitar una nueva caja de cobro."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Código */}
          <div className="space-y-2">
            <Label htmlFor="codigo" className="required font-medium">
              Código de Caja
            </Label>
            <Input
              id="codigo"
              placeholder="Ej: CAJA-01"
              {...register("codigo")}
              className="h-9 text-sm font-mono"
              disabled={isSubmitting}
            />
            {errors.codigo && (
              <p className="text-xs text-destructive">{errors.codigo.message}</p>
            )}
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="required font-medium">
              Nombre / Denominación
            </Label>
            <Input
              id="nombre"
              placeholder="Ej: Caja Principal Recepción"
              {...register("nombre")}
              className="h-9 text-sm"
              disabled={isSubmitting}
            />
            {errors.nombre && (
              <p className="text-xs text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="font-medium">
              Descripción <span className="text-xs text-muted-foreground">(Opcional)</span>
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Ej: Ubicada en la ventanilla 1 de admisión principal."
              {...register("descripcion")}
              className="min-h-[80px] text-sm resize-none"
              disabled={isSubmitting}
            />
            {errors.descripcion && (
              <p className="text-xs text-destructive">
                {errors.descripcion.message}
              </p>
            )}
          </div>

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
            <Button type="submit" disabled={isSubmitting} className="h-9 gap-2 text-xs sm:text-sm">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isEditing ? "Guardar Cambios" : "Crear Caja"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
