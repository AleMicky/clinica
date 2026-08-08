"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Handshake, Loader2, Tag } from "lucide-react";

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
  convenioSchema,
  type ConvenioFormValues,
} from "../schemas/convenio.schema";
import { useCreateConvenio, useUpdateConvenio } from "../hooks/use-convenio";
import type { ConvenioResponse } from "../types/convenio.types";

interface ConvenioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  convenioToEdit?: ConvenioResponse | null;
  onSuccessCallback?: () => void;
}

export function ConvenioFormDialog({
  open,
  onOpenChange,
  convenioToEdit,
  onSuccessCallback,
}: ConvenioFormDialogProps) {
  const isEditing = Boolean(convenioToEdit);

  const createMutation = useCreateConvenio();
  const updateMutation = useUpdateConvenio();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConvenioFormValues>({
    resolver: zodResolver(convenioSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
      fechaInicio: new Date().toISOString().split("T")[0],
      fechaFin: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      if (convenioToEdit) {
        reset({
          codigo: convenioToEdit.codigo,
          nombre: convenioToEdit.nombre,
          descripcion: convenioToEdit.descripcion || "",
          fechaInicio: convenioToEdit.fechaInicio ? convenioToEdit.fechaInicio.split("T")[0] : "",
          fechaFin: convenioToEdit.fechaFin ? convenioToEdit.fechaFin.split("T")[0] : "",
        });
      } else {
        reset({
          codigo: "",
          nombre: "",
          descripcion: "",
          fechaInicio: new Date().toISOString().split("T")[0],
          fechaFin: "",
        });
      }
    }
  }, [open, convenioToEdit, reset]);

  const onSubmit = async (values: ConvenioFormValues) => {
    try {
      const payload = {
        codigo: values.codigo,
        nombre: values.nombre,
        descripcion: values.descripcion || null,
        fechaInicio: values.fechaInicio,
        fechaFin: values.fechaFin || null,
      };

      if (isEditing && convenioToEdit) {
        await updateMutation.mutateAsync({
          id: convenioToEdit.id,
          data: payload,
        });
        toast.success(`Convenio ${values.codigo} actualizado correctamente.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Convenio ${values.codigo} creado correctamente.`);
      }
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al guardar el convenio.";
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
              <Handshake className="size-5" />
            </div>
            <span>{isEditing ? "Editar Convenio Institucional" : "Nuevo Convenio Institucional"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique las condiciones y vigencia del convenio institucional."
              : "Ingrese la información del convenio con aseguradora o empresa aliada."}
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
              <span>Datos del Convenio</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Código */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="codigo" className="text-xs flex items-center gap-1">
                  Código del Convenio <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="codigo"
                  placeholder="ej: CONV-SANITAS, CONV-MAPFRE"
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
                  Nombre Institucional / Aseguradora <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nombre"
                  placeholder="ej: Seguro Médico Sanitas Salud"
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

              {/* Fecha Inicio */}
              <div className="space-y-1.5">
                <Label htmlFor="fechaInicio" className="text-xs flex items-center gap-1">
                  Fecha Inicio Vigencia <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  className={cn(
                    "text-sm h-9 font-mono",
                    errors.fechaInicio && "border-destructive focus-visible:ring-destructive"
                  )}
                  {...register("fechaInicio")}
                />
                {errors.fechaInicio && (
                  <p className="text-[11px] text-destructive font-medium">{errors.fechaInicio.message}</p>
                )}
              </div>

              {/* Fecha Fin */}
              <div className="space-y-1.5">
                <Label htmlFor="fechaFin" className="text-xs">
                  Fecha Fin Vigencia (Opcional)
                </Label>
                <Input
                  id="fechaFin"
                  type="date"
                  className="text-sm h-9 font-mono"
                  {...register("fechaFin")}
                />
              </div>

              {/* Descripción */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="descripcion" className="text-xs">
                  Notas / Observaciones del Acuerdo
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Alcance del convenio, descuentos acordados o condiciones especiales..."
                  rows={3}
                  className="text-sm resize-none"
                  {...register("descripcion")}
                />
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
              {isEditing ? "Guardar Cambios" : "Crear Convenio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
