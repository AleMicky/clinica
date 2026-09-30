"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Tag, Loader2 } from "lucide-react";

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
  marcaSchema,
  type MarcaFormValues,
} from "../schemas/marca.schema";
import {
  useCreateMarca,
  useUpdateMarca,
} from "../hooks/use-marca";
import type { MarcaResponse } from "../types/marca.types";

interface MarcaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marcaToEdit?: MarcaResponse | null;
  onSuccessCallback?: () => void;
}

export function MarcaFormDialog({
  open,
  onOpenChange,
  marcaToEdit,
  onSuccessCallback,
}: MarcaFormDialogProps) {
  const isEditing = Boolean(marcaToEdit);

  const createMutation = useCreateMarca();
  const updateMutation = useUpdateMarca();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MarcaFormValues>({
    resolver: zodResolver(marcaSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
    },
  });

  const [keepOpen, setKeepOpen] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setKeepOpen(false);
      if (marcaToEdit) {
        reset({
          codigo: marcaToEdit.codigo,
          nombre: marcaToEdit.nombre,
          descripcion: marcaToEdit.descripcion || "",
        });
      } else {
        reset({
          codigo: "",
          nombre: "",
          descripcion: "",
        });
      }
    }
  }, [open, marcaToEdit, reset]);

  const onSubmit = async (values: MarcaFormValues) => {
    try {
      if (isEditing && marcaToEdit) {
        await updateMutation.mutateAsync({
          id: marcaToEdit.id,
          data: {
            codigo: values.codigo,
            nombre: values.nombre,
            descripcion: values.descripcion || null,
          },
        });
        toast.success(`Marca ${values.codigo} actualizada correctamente.`);
        onSuccessCallback?.();
        onOpenChange(false);
      } else {
        await createMutation.mutateAsync({
          codigo: values.codigo,
          nombre: values.nombre,
          descripcion: values.descripcion || null,
        });
        toast.success(`Marca ${values.codigo} creada correctamente.`);
        onSuccessCallback?.();

        if (keepOpen) {
          reset({
            codigo: "",
            nombre: "",
            descripcion: "",
          });
        } else {
          onOpenChange(false);
        }
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al guardar la marca.";
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
              <Tag className="size-5" />
            </div>
            <span>{isEditing ? "Editar Marca" : "Agregar Nueva Marca"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique los detalles de la marca seleccionada."
              : "Ingrese la información para registrar una nueva marca de producto."}
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
              <span>Datos de la Marca</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Código */}
              <div className="space-y-1.5">
                <Label htmlFor="codigo" className="text-xs flex items-center gap-1">
                  Código <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="codigo"
                  placeholder="ej: BAYER, PFIZER, GEN-01"
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
                  placeholder="ej: Laboratorios Bayer"
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

              {/* Descripción */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="descripcion" className="text-xs">
                  Descripción
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Breve descripción o notas sobre el fabricante/marca..."
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

          <DialogFooter className="pt-4 border-t flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="text-xs w-full sm:w-auto"
            >
              Cancelar
            </Button>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              {!isEditing && (
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isLoading}
                  onClick={() => setKeepOpen(true)}
                  className="text-xs w-full sm:w-auto"
                >
                  {isLoading && keepOpen && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
                  Guardar y agregar otro
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                onClick={() => setKeepOpen(false)}
                className="text-xs gap-1.5 w-full sm:w-auto"
              >
                {isLoading && !keepOpen && <Loader2 className="size-3.5 animate-spin" />}
                {isEditing ? "Guardar Cambios" : "Guardar y Cerrar"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
