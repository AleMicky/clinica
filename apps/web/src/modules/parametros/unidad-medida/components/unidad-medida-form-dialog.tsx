"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Scale, Loader2, Tag, FileText } from "lucide-react";

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
import { Autocomplete } from "@/components/ui/autocomplete";
import { cn } from "@/lib/utils";

import {
  unidadMedidaSchema,
  type UnidadMedidaFormValues,
} from "../schemas/unidad-medida.schema";
import { useCreateUnidadMedida, useUpdateUnidadMedida } from "../hooks/use-unidades-medida";
import { useCatalogoItemsByCodigo, type CatalogoItemResponse } from "@/modules/parametros/catalogo";
import type { UnidadMedidaItem, UnidadMedidaResponse } from "../types/unidad-medida.types";

interface UnidadMedidaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unidadToEdit?: UnidadMedidaResponse | UnidadMedidaItem | null;
  onSuccessCallback?: () => void;
}

export function UnidadMedidaFormDialog({
  open,
  onOpenChange,
  unidadToEdit,
  onSuccessCallback,
}: UnidadMedidaFormDialogProps) {
  const isEditing = Boolean(unidadToEdit);

  const createUnidadMutation = useCreateUnidadMedida();
  const updateUnidadMutation = useUpdateUnidadMedida();
  const { data: catalogosData, isLoading: isLoadingCategorias } =
    useCatalogoItemsByCodigo("UNIDAD_MEDIDA_CATEGORIA");

  const categoriaOptions = React.useMemo(() => {
    const apiItems = (catalogosData?.items || [])
      .filter((item: CatalogoItemResponse) => item.activo !== false)
      .map((item: CatalogoItemResponse) => item.nombre || item.valor);

    const combined = Array.from(
      new Set([...apiItems])
    );

    return combined.map((cat) => ({
      value: cat,
      label: cat,
    }));
  }, [catalogosData]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UnidadMedidaFormValues>({
    resolver: zodResolver(unidadMedidaSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      simbolo: "",
      categoria: "",
    },
  });

  const categoriaValue = watch("categoria");

  React.useEffect(() => {
    if (open) {
      if (unidadToEdit) {
        reset({
          codigo: unidadToEdit.codigo,
          nombre: unidadToEdit.nombre,
          simbolo: unidadToEdit.simbolo,
          categoria: unidadToEdit.categoria || "",
        });
      } else {
        reset({
          codigo: "",
          nombre: "",
          simbolo: "",
          categoria: "",
        });
      }
    }
  }, [open, unidadToEdit, reset]);

  const onSubmit = async (values: UnidadMedidaFormValues) => {
    try {
      if (isEditing && unidadToEdit) {
        const numericId = Number(unidadToEdit.id);
        await updateUnidadMutation.mutateAsync({
          id: isNaN(numericId) ? 0 : numericId,
          data: {
            codigo: values.codigo,
            nombre: values.nombre,
            simbolo: values.simbolo,
            categoria: values.categoria,
          },
        });
        toast.success(`Unidad ${values.codigo} actualizada correctamente.`);
      } else {
        await createUnidadMutation.mutateAsync({
          codigo: values.codigo,
          nombre: values.nombre,
          simbolo: values.simbolo,
          categoria: values.categoria,
        });
        toast.success(`Unidad ${values.codigo} creada correctamente.`);
      }
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al procesar la solicitud.";
      toast.error(errorMsg);
    }
  };

  const isLoading =
    createUnidadMutation.isPending || updateUnidadMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Scale className="size-5" />
            </div>
            <span>{isEditing ? "Editar Unidad de Medida" : "Agregar Unidad de Medida"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique los parámetros de la unidad de medida registrada."
              : "Ingrese la información para registrar una nueva unidad de medida."}
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
              <span>Información de la Unidad</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Categoría */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="categoria" className="text-xs flex items-center gap-1">
                  Categoría <span className="text-destructive">*</span>
                </Label>
                <Autocomplete
                  id="categoria"
                  value={categoriaValue ?? ""}
                  onValueChange={(val) => {
                    setValue("categoria", val, { shouldValidate: true });
                  }}
                  options={categoriaOptions}
                  isLoading={isLoadingCategorias}
                  placeholder="Seleccione o busque una categoría"
                  emptyText="No se encontraron categorías"
                  error={Boolean(errors.categoria)}
                  className="h-9 text-sm"
                />
                {errors.categoria && (
                  <p className="text-[11px] text-destructive font-medium">{errors.categoria.message}</p>
                )}
              </div>

              {/* Código */}
              <div className="space-y-1.5">
                <Label htmlFor="codigo" className="text-xs flex items-center gap-1">
                  Código / Abreviatura <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="codigo"
                  placeholder="ej: MG, ML, G"
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

              {/* Símbolo */}
              <div className="space-y-1.5">
                <Label htmlFor="simbolo" className="text-xs flex items-center gap-1">
                  Símbolo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="simbolo"
                  placeholder="ej: mg, ml, g"
                  className={cn(
                    "font-mono text-sm h-9",
                    errors.simbolo && "border-destructive focus-visible:ring-destructive"
                  )}
                  aria-invalid={Boolean(errors.simbolo)}
                  {...register("simbolo")}
                />
                {errors.simbolo && (
                  <p className="text-[11px] text-destructive font-medium">{errors.simbolo.message}</p>
                )}
              </div>

              {/* Nombre Completo */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="nombre" className="text-xs flex items-center gap-1">
                  Nombre Completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nombre"
                  placeholder="ej: Miligramo, Mililitro"
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
              {isEditing ? "Guardar Cambios" : "Crear Unidad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
