"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Activity, Loader2, Tag, Layers } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  servicioSchema,
  type ServicioFormValues,
} from "../schemas/servicio.schema";
import { useCreateServicio, useUpdateServicio } from "../hooks/use-servicio";
import type { ServicioResponse } from "../types/servicio.types";
import type { CategoriaServicioResponse } from "../../categoria-servicio";

interface ServicioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servicioToEdit?: ServicioResponse | null;
  categorias: CategoriaServicioResponse[];
  defaultCategoriaId?: number;
  onSuccessCallback?: () => void;
}

export function ServicioFormDialog({
  open,
  onOpenChange,
  servicioToEdit,
  categorias,
  defaultCategoriaId,
  onSuccessCallback,
}: ServicioFormDialogProps) {
  const isEditing = Boolean(servicioToEdit);

  const createMutation = useCreateServicio();
  const updateMutation = useUpdateServicio();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ServicioFormValues>({
    resolver: zodResolver(servicioSchema),
    defaultValues: {
      categoriaServicioId: defaultCategoriaId || (categorias[0]?.id ?? 0),
      codigo: "",
      nombre: "",
      descripcion: "",
    },
  });

  const selectedCategoriaId = watch("categoriaServicioId");

  React.useEffect(() => {
    if (open) {
      if (servicioToEdit) {
        reset({
          categoriaServicioId: servicioToEdit.categoriaServicioId,
          codigo: servicioToEdit.codigo,
          nombre: servicioToEdit.nombre,
          descripcion: servicioToEdit.descripcion || "",
        });
      } else {
        reset({
          categoriaServicioId: defaultCategoriaId || (categorias[0]?.id ?? 0),
          codigo: "",
          nombre: "",
          descripcion: "",
        });
      }
    }
  }, [open, servicioToEdit, defaultCategoriaId, categorias, reset]);

  const onSubmit = async (values: ServicioFormValues) => {
    try {
      if (isEditing && servicioToEdit) {
        await updateMutation.mutateAsync({
          categoriaId: values.categoriaServicioId,
          servicioId: servicioToEdit.id,
          data: {
            codigo: values.codigo,
            nombre: values.nombre,
            descripcion: values.descripcion || null,
          },
        });
        toast.success(`Servicio ${values.codigo} actualizado correctamente.`);
      } else {
        await createMutation.mutateAsync({
          categoriaId: values.categoriaServicioId,
          data: {
            codigo: values.codigo,
            nombre: values.nombre,
            descripcion: values.descripcion || null,
          },
        });
        toast.success(`Servicio ${values.codigo} creado correctamente.`);
      }
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al guardar el servicio.";
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
              <Activity className="size-5" />
            </div>
            <span>{isEditing ? "Editar Servicio Médicos" : "Agregar Nuevo Servicio"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique los detalles del servicio registrado."
              : "Ingrese la información requerida para dar de alta un nuevo servicio o prestación."}
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
              <span>Datos del Servicio</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Categoría Selector */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="categoriaServicioId" className="text-xs flex items-center gap-1">
                  Categoría de Servicio <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedCategoriaId ? String(selectedCategoriaId) : ""}
                  onValueChange={(val) => setValue("categoriaServicioId", Number(val), { shouldValidate: true })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        <div className="flex items-center gap-2">
                          <Layers className="size-3.5 text-muted-foreground" />
                          <span>{cat.nombre} ({cat.codigo})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoriaServicioId && (
                  <p className="text-[11px] text-destructive font-medium">{errors.categoriaServicioId.message}</p>
                )}
              </div>

              {/* Código */}
              <div className="space-y-1.5">
                <Label htmlFor="codigo" className="text-xs flex items-center gap-1">
                  Código <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="codigo"
                  placeholder="ej: CONS-01, CIR-002"
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
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="nombre" className="text-xs flex items-center gap-1">
                  Nombre de la Prestación <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nombre"
                  placeholder="ej: Consulta Medicina General"
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
                  Descripción / Detalles Clínicos
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Detalles sobre lo que incluye esta prestación o indicación clínica..."
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
              {isEditing ? "Guardar Cambios" : "Crear Servicio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
