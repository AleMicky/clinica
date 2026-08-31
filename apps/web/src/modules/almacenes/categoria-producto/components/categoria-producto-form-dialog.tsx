"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FolderTree, Loader2, Tag } from "lucide-react";

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
  categoriaProductoSchema,
  type CategoriaProductoFormValues,
} from "../schemas/categoria-producto.schema";
import {
  useCreateCategoriaProducto,
  useUpdateCategoriaProducto,
  useCategoriasProducto,
} from "../hooks/use-categoria-producto";
import type { CategoriaProductoResponse } from "../types/categoria-producto.types";

interface CategoriaProductoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoriaToEdit?: CategoriaProductoResponse | null;
  defaultParentId?: number | null;
  onSuccessCallback?: () => void;
}

export function CategoriaProductoFormDialog({
  open,
  onOpenChange,
  categoriaToEdit,
  defaultParentId = null,
  onSuccessCallback,
}: CategoriaProductoFormDialogProps) {
  const isEditing = Boolean(categoriaToEdit);

  const createMutation = useCreateCategoriaProducto();
  const updateMutation = useUpdateCategoriaProducto();

  // Fetch categories to resolve parent category name for visual feedback
  const { data: categoriasData } = useCategoriasProducto({ pageSize: 500 });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoriaProductoFormValues>({
    resolver: zodResolver(categoriaProductoSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
      categoriaPadreId: defaultParentId,
    },
  });

  const selectedPadreId = watch("categoriaPadreId");

  const parentCategoryName = React.useMemo(() => {
    if (!selectedPadreId) return null;
    const found = categoriasData?.items?.find((c) => c.id === selectedPadreId);
    return found ? `${found.codigo} — ${found.nombre}` : null;
  }, [selectedPadreId, categoriasData]);

  React.useEffect(() => {
    if (open) {
      if (categoriaToEdit) {
        reset({
          codigo: categoriaToEdit.codigo,
          nombre: categoriaToEdit.nombre,
          descripcion: categoriaToEdit.descripcion || "",
          categoriaPadreId: categoriaToEdit.categoriaPadreId ?? null,
        });
      } else {
        reset({
          codigo: "",
          nombre: "",
          descripcion: "",
          categoriaPadreId: defaultParentId ?? null,
        });
      }
    }
  }, [open, categoriaToEdit, defaultParentId, reset]);

  const onSubmit = async (values: CategoriaProductoFormValues) => {
    try {
      const payload = {
        codigo: values.codigo,
        nombre: values.nombre,
        descripcion: values.descripcion || null,
        categoriaPadreId: values.categoriaPadreId || null,
      };

      if (isEditing && categoriaToEdit) {
        await updateMutation.mutateAsync({
          id: categoriaToEdit.id,
          data: payload,
        });
        toast.success(`Categoría ${values.codigo} actualizada correctamente.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Categoría ${values.codigo} creada correctamente.`);
      }
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al guardar la categoría.";
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
              <FolderTree className="size-5" />
            </div>
            <span>{isEditing ? "Editar Categoría de Producto" : "Agregar Categoría de Producto"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique los detalles de la categoría seleccionada."
              : "Ingrese la información para clasificar productos en una nueva categoría."}
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
              <span>Datos de la Categoría</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Contexto visual si tiene categoría padre asignada */}
              {parentCategoryName && (
                <div className="sm:col-span-2 flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs">
                  <span className="text-muted-foreground">Categoría Padre:</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <FolderTree className="size-3.5 text-primary" />
                    {parentCategoryName}
                  </span>
                </div>
              )}

              {/* Código */}
              <div className="space-y-1.5">
                <Label htmlFor="codigo" className="text-xs flex items-center gap-1">
                  Código <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="codigo"
                  placeholder="ej: MED, INS, EQP"
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
                  placeholder="ej: Medicamentos, Insumos"
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
                  placeholder="Breve descripción de esta categoría de producto..."
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
              {isEditing ? "Guardar Cambios" : "Crear Categoría"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
