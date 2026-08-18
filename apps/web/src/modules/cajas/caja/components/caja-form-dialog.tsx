"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Vault, Loader2 } from "lucide-react";
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
  const isEditing = Boolean(cajaToEdit);

  const createMutation = useCreateCaja();
  const updateMutation = useUpdateCaja();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
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
        toast.success(`Caja "${payload.nombre}" actualizada correctamente.`);
      } else {
        result = await createMutation.mutateAsync(payload);
        toast.success(`Caja "${payload.nombre}" creada correctamente.`);
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

  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Vault className="size-5" />
            </div>
            <span>{isEditing ? "Editar Caja" : "Nueva Caja"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique la información de la terminal de cobro."
              : "Ingrese los datos oficiales para registrar un nuevo punto de caja."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Indicador de campos obligatorios */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md border border-border/40">
            <span>Configuración de Punto de Caja</span>
            <span className="text-destructive font-medium">* Requeridos</span>
          </div>

          {/* Código */}
          <div className="space-y-1.5">
            <Label htmlFor="codigo" className="text-xs flex items-center gap-1">
              Código de Caja <span className="text-destructive">*</span>
            </Label>
            <Input
              id="codigo"
              placeholder="Ej: CAJA-01"
              className={cn(
                "h-9 text-sm font-mono",
                errors.codigo && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={Boolean(errors.codigo)}
              disabled={isLoading}
              {...register("codigo")}
            />
            {errors.codigo && (
              <p className="text-[11px] text-destructive font-medium">{errors.codigo.message}</p>
            )}
          </div>

          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="nombre" className="text-xs flex items-center gap-1">
              Nombre de la Caja <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="Ej: Caja Principal Recepción"
              className={cn(
                "h-9 text-sm",
                errors.nombre && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={Boolean(errors.nombre)}
              disabled={isLoading}
              {...register("nombre")}
            />
            {errors.nombre && (
              <p className="text-[11px] text-destructive font-medium">{errors.nombre.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="descripcion" className="text-xs flex items-center gap-1">
              Descripción <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Ej: Ubicada en el módulo de recepción central para cobro de consultas y servicios."
              className="min-h-[75px] text-sm resize-none"
              disabled={isLoading}
              {...register("descripcion")}
            />
            {errors.descripcion && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.descripcion.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-9 text-xs sm:text-sm cursor-pointer"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="h-9 gap-2 text-xs sm:text-sm cursor-pointer">
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              <span>{isEditing ? "Guardar Cambios" : "Crear Caja"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
