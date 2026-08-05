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

import {
  catalogoItemSchema,
  type CatalogoItemFormValues,
} from "../schemas/catalogo.schema";
import {
  useCreateCatalogoItem,
  useUpdateCatalogoItem,
} from "../hooks/use-catalogos";
import type {
  CatalogoGrupoResponse,
  CatalogoItemResponse,
} from "../types/catalogo.types";

interface CatalogoItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grupo: CatalogoGrupoResponse | null;
  itemToEdit: CatalogoItemResponse | null;
  nextOrden?: number;
  onSuccessCallback?: () => void;
}

export function CatalogoItemFormDialog({
  open,
  onOpenChange,
  grupo,
  itemToEdit,
  nextOrden = 1,
  onSuccessCallback,
}: CatalogoItemFormDialogProps) {
  const isEditing = Boolean(itemToEdit);
  const createItemMutation = useCreateCatalogoItem();
  const updateItemMutation = useUpdateCatalogoItem();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CatalogoItemFormValues>({
    resolver: zodResolver(catalogoItemSchema),
    defaultValues: {
      valor: "",
      nombre: "",
      orden: nextOrden,
    },
  });

  React.useEffect(() => {
    if (open) {
      if (itemToEdit) {
        reset({
          valor: itemToEdit.valor,
          nombre: itemToEdit.nombre,
          orden: itemToEdit.orden,
        });
      } else {
        reset({
          valor: "",
          nombre: "",
          orden: nextOrden,
        });
      }
    }
  }, [open, itemToEdit, nextOrden, reset]);

  const onSubmit = async (values: CatalogoItemFormValues) => {
    if (!grupo) return;

    try {
      if (isEditing && itemToEdit) {
        await updateItemMutation.mutateAsync({
          grupoId: grupo.id,
          itemId: itemToEdit.id,
          data: {
            valor: values.valor.toUpperCase(),
            nombre: values.nombre,
            orden: values.orden,
          },
        });
        toast.success(`Ítem ${values.nombre} actualizado correctamente.`);
      } else {
        await createItemMutation.mutateAsync({
          grupoId: grupo.id,
          data: {
            valor: values.valor.toUpperCase(),
            nombre: values.nombre,
            orden: values.orden,
          },
        });
        toast.success(`Ítem ${values.nombre} creado correctamente.`);
      }
      onOpenChange(false);
      onSuccessCallback?.();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Error al guardar el elemento en el catálogo."
      );
    }
  };

  const isLoading =
    isSubmitting ||
    createItemMutation.isPending ||
    updateItemMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Elemento del Catálogo" : "Nuevo Elemento"}
            </DialogTitle>
            <DialogDescription>
              {grupo ? (
                <>
                  Catálogo: <span className="font-semibold text-foreground">{grupo.nombre}</span> (
                  <span className="font-mono">{grupo.codigo}</span>)
                </>
              ) : (
                "Ingrese la información del elemento."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="valor" className="text-xs font-medium">
                Valor / Código del Ítem <span className="text-destructive">*</span>
              </Label>
              <Input
                id="valor"
                placeholder="Ej: CAR, PED, DOC_DNI"
                {...register("valor")}
                disabled={isLoading}
                className="font-mono text-xs uppercase"
              />
              {errors.valor && (
                <p className="text-[11px] text-destructive">{errors.valor.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nombre" className="text-xs font-medium">
                Nombre / Descripción <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre"
                placeholder="Ej: Cardiología"
                {...register("nombre")}
                disabled={isLoading}
                className="text-xs"
              />
              {errors.nombre && (
                <p className="text-[11px] text-destructive">{errors.nombre.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="orden" className="text-xs font-medium">
                  Orden de Despliegue
                </Label>
                {!isEditing && (
                  <span className="text-[10px] text-muted-foreground bg-primary/10 text-primary font-mono px-1.5 py-0.5 rounded font-medium">
                    Auto-incremental (#)
                  </span>
                )}
              </div>
              <Input
                id="orden"
                type="number"
                min={1}
                {...register("orden", { valueAsNumber: true })}
                readOnly={!isEditing}
                disabled={isLoading}
                tabIndex={!isEditing ? -1 : 0}
                className={`font-mono text-xs w-full sm:w-36 ${
                  !isEditing ? "bg-muted/50 cursor-not-allowed select-none text-muted-foreground" : ""
                }`}
              />
              <p className="text-[11px] text-muted-foreground">
                {isEditing
                  ? "Modifique la posición secuencial del elemento."
                  : "Se asigna automáticamente. Puede ser editado después de crearse."}
              </p>
              {errors.orden && (
                <p className="text-[11px] text-destructive">{errors.orden.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Guardar Cambios" : "Agregar Ítem"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
