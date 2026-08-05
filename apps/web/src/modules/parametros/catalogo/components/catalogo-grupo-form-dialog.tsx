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
  catalogoGrupoSchema,
  type CatalogoGrupoFormValues,
} from "../schemas/catalogo.schema";
import {
  useCreateCatalogoGrupo,
  useUpdateCatalogoGrupo,
} from "../hooks/use-catalogos";
import type { CatalogoGrupoResponse } from "../types/catalogo.types";
import { Textarea } from "@/components/ui/textarea";

interface CatalogoGrupoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grupoToEdit: CatalogoGrupoResponse | null;
  onSuccessCallback?: (createdOrUpdated?: CatalogoGrupoResponse) => void;
}

export function CatalogoGrupoFormDialog({
  open,
  onOpenChange,
  grupoToEdit,
  onSuccessCallback,
}: CatalogoGrupoFormDialogProps) {
  const isEditing = Boolean(grupoToEdit);
  const createGrupoMutation = useCreateCatalogoGrupo();
  const updateGrupoMutation = useUpdateCatalogoGrupo();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CatalogoGrupoFormValues>({
    resolver: zodResolver(catalogoGrupoSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      if (grupoToEdit) {
        reset({
          codigo: grupoToEdit.codigo,
          nombre: grupoToEdit.nombre,
          descripcion: grupoToEdit.descripcion || "",
        });
      } else {
        reset({
          codigo: "",
          nombre: "",
          descripcion: "",
        });
      }
    }
  }, [open, grupoToEdit, reset]);

  const onSubmit = async (values: CatalogoGrupoFormValues) => {
    try {
      if (isEditing && grupoToEdit) {
        const updated = await updateGrupoMutation.mutateAsync({
          id: grupoToEdit.id,
          data: {
            codigo: values.codigo.toUpperCase(),
            nombre: values.nombre,
            descripcion: values.descripcion || undefined,
          },
        });
        toast.success(`Catálogo ${values.nombre} actualizado correctamente.`);
        onOpenChange(false);
        onSuccessCallback?.(updated);
      } else {
        const created = await createGrupoMutation.mutateAsync({
          codigo: values.codigo.toUpperCase(),
          nombre: values.nombre,
          descripcion: values.descripcion || undefined,
        });
        toast.success(`Catálogo ${values.nombre} creado correctamente.`);
        onOpenChange(false);
        onSuccessCallback?.(created);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Error al guardar el catálogo. Por favor intente nuevamente."
      );
    }
  };

  const isLoading =
    isSubmitting ||
    createGrupoMutation.isPending ||
    updateGrupoMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Catálogo / Tabla Maestra" : "Nuevo Catálogo"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifique la información del catálogo seleccionado."
                : "Ingrese los datos requeridos para registrar un nuevo catálogo en el sistema."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="codigo" className="text-xs font-medium">
                Código del Catálogo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="codigo"
                placeholder="Ej: ESP_MED, TIPO_DOC"
                {...register("codigo")}
                disabled={isLoading || isEditing}
                className="font-mono text-xs uppercase"
              />
              {errors.codigo && (
                <p className="text-[11px] text-destructive">{errors.codigo.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nombre" className="text-xs font-medium">
                Nombre del Catálogo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre"
                placeholder="Ej: Especialidades Médicas"
                {...register("nombre")}
                disabled={isLoading}
                className="text-xs"
              />
              {errors.nombre && (
                <p className="text-[11px] text-destructive">{errors.nombre.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descripcion" className="text-xs font-medium">
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                placeholder="Detalle o propósito de este catálogo..."
                {...register("descripcion")}
                disabled={isLoading}
                className="text-xs min-h-[80px]"
              />
              {errors.descripcion && (
                <p className="text-[11px] text-destructive">{errors.descripcion.message}</p>
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
              {isEditing ? "Guardar Cambios" : "Crear Catálogo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
