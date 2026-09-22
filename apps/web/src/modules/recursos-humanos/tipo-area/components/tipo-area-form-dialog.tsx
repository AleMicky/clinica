"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Layers, Loader2, Save } from "lucide-react";

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
import { cn } from "@/lib/utils";

import {
  tipoAreaSchema,
  type TipoAreaFormValues,
} from "../schemas/tipo-area.schema";
import {
  useCreateTipoArea,
  useUpdateTipoArea,
} from "../hooks/use-tipos-area";
import type { TipoAreaResponse } from "../types/tipo-area.types";

interface TipoAreaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoAreaToEdit?: TipoAreaResponse | null;
  onSuccessCallback?: () => void;
}

export function TipoAreaFormDialog({
  open,
  onOpenChange,
  tipoAreaToEdit,
  onSuccessCallback,
}: TipoAreaFormDialogProps) {
  const isEditing = Boolean(tipoAreaToEdit && tipoAreaToEdit.id > 0);

  const createMutation = useCreateTipoArea();
  const updateMutation = useUpdateTipoArea();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TipoAreaFormValues>({
    resolver: zodResolver(tipoAreaSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
      orden: 0,
    },
  });

  // Reset form on open/edit change
  React.useEffect(() => {
    if (open) {
      if (tipoAreaToEdit) {
        reset({
          codigo: tipoAreaToEdit.codigo ?? "",
          nombre: tipoAreaToEdit.nombre ?? "",
          descripcion: tipoAreaToEdit.descripcion ?? "",
          orden: tipoAreaToEdit.orden ?? 0,
        });
      } else {
        reset({
          codigo: "",
          nombre: "",
          descripcion: "",
          orden: 0,
        });
      }
    }
  }, [open, tipoAreaToEdit, reset]);

  const onSubmit = async (values: TipoAreaFormValues) => {
    try {
      const payload = {
        codigo: values.codigo.trim().toUpperCase(),
        nombre: values.nombre.trim(),
        descripcion: values.descripcion?.trim() || undefined,
        orden: Number(values.orden) || 0,
      };

      if (isEditing && tipoAreaToEdit) {
        await updateMutation.mutateAsync({
          id: tipoAreaToEdit.id,
          data: payload,
        });
        toast.success(`Tipo de área "${values.nombre}" actualizado correctamente.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Tipo de área "${values.nombre}" registrado exitosamente.`);
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
              <Layers className="size-4.5" />
            </div>
            <span>{isEditing ? "Editar Tipo de Área" : "Nuevo Tipo de Área"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique los parámetros del tipo de área seleccionado."
              : "Defina una nueva categoría o tipo de área organizacional."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-1">
          {/* Fila: Código y Orden */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Código */}
            <div className="space-y-1.5">
              <Label htmlFor="codigo" className="text-xs font-semibold text-foreground">
                Código <span className="text-destructive">*</span>
              </Label>
              <Input
                id="codigo"
                placeholder="Ej: ADM, MED, OPE"
                {...register("codigo")}
                disabled={isLoading}
                className={cn(
                  "uppercase text-xs font-mono h-9",
                  errors.codigo && "border-destructive focus-visible:ring-destructive"
                )}
                autoFocus={!isEditing}
              />
              {errors.codigo && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.codigo.message}
                </p>
              )}
            </div>

            {/* Orden */}
            <div className="space-y-1.5">
              <Label htmlFor="orden" className="text-xs font-semibold text-foreground">
                Orden Jerárquico <span className="text-destructive">*</span>
              </Label>
              <Input
                id="orden"
                type="number"
                min="0"
                placeholder="0"
                {...register("orden", { valueAsNumber: true })}
                disabled={isLoading}
                className={cn(
                  "text-xs font-mono h-9",
                  errors.orden && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.orden && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.orden.message}
                </p>
              )}
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="nombre" className="text-xs font-semibold text-foreground">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="Ej: Administrativa, Médica Asistencial"
              {...register("nombre")}
              disabled={isLoading}
              className={cn(
                "text-xs h-9",
                errors.nombre && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.nombre && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.nombre.message}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="descripcion" className="text-xs font-semibold text-foreground">
              Descripción <span className="text-muted-foreground font-normal">(Opcional)</span>
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Detalle o propósito de este tipo de área..."
              {...register("descripcion")}
              disabled={isLoading}
              rows={3}
              className={cn(
                "text-xs resize-none",
                errors.descripcion && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.descripcion && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.descripcion.message}
              </p>
            )}
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
                  <span>{isEditing ? "Guardar Cambios" : "Crear Tipo de Área"}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
