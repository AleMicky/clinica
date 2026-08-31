"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Warehouse, Loader2, Tag } from "lucide-react";

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
  almacenSchema,
  type AlmacenFormValues,
} from "../schemas/almacen.schema";
import {
  useCreateAlmacen,
  useUpdateAlmacen,
} from "../hooks/use-almacen";
import type { AlmacenResponse } from "../types/almacen.types";

interface AlmacenFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  almacenToEdit?: AlmacenResponse | null;
  onSuccessCallback?: () => void;
}

export function AlmacenFormDialog({
  open,
  onOpenChange,
  almacenToEdit,
  onSuccessCallback,
}: AlmacenFormDialogProps) {
  const isEditing = Boolean(almacenToEdit);

  const createMutation = useCreateAlmacen();
  const updateMutation = useUpdateAlmacen();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AlmacenFormValues>({
    resolver: zodResolver(almacenSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
      ubicacion: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      if (almacenToEdit) {
        reset({
          codigo: almacenToEdit.codigo,
          nombre: almacenToEdit.nombre,
          descripcion: almacenToEdit.descripcion || "",
          ubicacion: almacenToEdit.ubicacion || "",
        });
      } else {
        reset({
          codigo: "",
          nombre: "",
          descripcion: "",
          ubicacion: "",
        });
      }
    }
  }, [open, almacenToEdit, reset]);

  const onSubmit = async (values: AlmacenFormValues) => {
    try {
      if (isEditing && almacenToEdit) {
        await updateMutation.mutateAsync({
          id: almacenToEdit.id,
          data: {
            codigo: values.codigo,
            nombre: values.nombre,
            descripcion: values.descripcion || null,
            ubicacion: values.ubicacion || null,
          },
        });
        toast.success(`Almacén ${values.codigo} actualizado correctamente.`);
      } else {
        await createMutation.mutateAsync({
          codigo: values.codigo,
          nombre: values.nombre,
          descripcion: values.descripcion || null,
          ubicacion: values.ubicacion || null,
        });
        toast.success(`Almacén ${values.codigo} creado correctamente.`);
      }
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al guardar el almacén.";
      toast.error(errorMsg);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Warehouse className="size-5" />
            </div>
            <span>{isEditing ? "Editar Almacén" : "Agregar Nuevo Almacén"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique los detalles del almacén seleccionado."
              : "Ingrese la información para registrar un nuevo almacén o depósito."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md border border-border/40">
            <span>Campos obligatorios</span>
            <span className="text-destructive font-medium">* Requeridos</span>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
              <Tag className="size-3.5 text-primary" />
              <span>Datos del Almacén</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Código */}
              <div className="space-y-1.5">
                <Label htmlFor="codigo" className="text-xs flex items-center gap-1">
                  Código <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="codigo"
                  placeholder="ej: ALM-01, DEP-002"
                  className={cn(
                    "uppercase font-mono text-sm h-9",
                    errors.codigo && "border-destructive focus-visible:ring-destructive"
                  )}
                  aria-invalid={Boolean(errors.codigo)}
                  {...register("codigo")}
                />
                {errors.codigo && (
                  <p className="text-[11px] text-destructive font-medium">{errors.codigo.message}</p>
                )}
              </div>

              {/* Nombre */}
              <div className="space-y-1.5">
                <Label htmlFor="nombre" className="text-xs flex items-center gap-1">
                  Nombre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nombre"
                  placeholder="ej: Almacén Principal"
                  className={cn(
                    "text-sm h-9",
                    errors.nombre && "border-destructive focus-visible:ring-destructive"
                  )}
                  aria-invalid={Boolean(errors.nombre)}
                  {...register("nombre")}
                />
                {errors.nombre && (
                  <p className="text-[11px] text-destructive font-medium">{errors.nombre.message}</p>
                )}
              </div>

              {/* Ubicación */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="ubicacion" className="text-xs">
                  Ubicación
                </Label>
                <Input
                  id="ubicacion"
                  placeholder="ej: Planta Baja, Ala Norte"
                  className="text-sm h-9"
                  {...register("ubicacion")}
                />
                {errors.ubicacion && (
                  <p className="text-[11px] text-destructive font-medium">{errors.ubicacion.message}</p>
                )}
              </div>

              {/* Descripción */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="descripcion" className="text-xs">
                  Descripción
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Breve descripción del almacén o depósito..."
                  rows={3}
                  className="text-sm resize-none"
                  {...register("descripcion")}
                />
                {errors.descripcion && (
                  <p className="text-[11px] text-destructive font-medium">{errors.descripcion.message}</p>
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
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="text-xs gap-1.5">
              {isLoading && <Loader2 className="size-3.5 animate-spin" />}
              {isEditing ? "Guardar Cambios" : "Crear Almacén"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
