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
  conceptoMovimientoCajaSchema,
  type ConceptoMovimientoCajaFormValues,
} from "../schemas/tipo-movimiento.schema";
import {
  useCreateConceptoMovimientoCaja,
  useUpdateConceptoMovimientoCaja,
} from "../hooks/use-tipo-movimiento";
import type {
  ConceptoMovimientoCajaInfo,
  TipoMovimientoCajaInfo,
} from "../types/tipo-movimiento.types";

interface ConceptoMovimientoCajaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoPadre: TipoMovimientoCajaInfo | null;
  conceptoToEdit?: ConceptoMovimientoCajaInfo | null;
  onSuccessCallback?: (concepto?: ConceptoMovimientoCajaInfo) => void;
}

export function ConceptoMovimientoCajaFormDialog({
  open,
  onOpenChange,
  tipoPadre,
  conceptoToEdit,
  onSuccessCallback,
}: Readonly<ConceptoMovimientoCajaFormDialogProps>) {
  const isEditing = Boolean(conceptoToEdit);

  const createMutation = useCreateConceptoMovimientoCaja();
  const updateMutation = useUpdateConceptoMovimientoCaja();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConceptoMovimientoCajaFormValues>({
    resolver: zodResolver(conceptoMovimientoCajaSchema),
    defaultValues: {
      tipoMovimientoCajaId: tipoPadre?.id || 0,
      codigo: "",
      nombre: "",
      descripcion: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      if (conceptoToEdit) {
        reset({
          tipoMovimientoCajaId:
            conceptoToEdit.tipoMovimientoCajaId || tipoPadre?.id || 0,
          codigo: conceptoToEdit.codigo,
          nombre: conceptoToEdit.nombre,
          descripcion: conceptoToEdit.descripcion || "",
        });
      } else {
        reset({
          tipoMovimientoCajaId: tipoPadre?.id || 0,
          codigo: "",
          nombre: "",
          descripcion: "",
        });
      }
    }
  }, [open, conceptoToEdit, tipoPadre, reset]);

  const onSubmit = async (values: ConceptoMovimientoCajaFormValues) => {
    try {
      const payload = {
        tipoMovimientoCajaId: values.tipoMovimientoCajaId,
        codigo: values.codigo.trim().toUpperCase(),
        nombre: values.nombre.trim(),
        descripcion: values.descripcion?.trim() || null,
      };

      let result: ConceptoMovimientoCajaInfo | undefined;
      if (isEditing && conceptoToEdit) {
        result = await updateMutation.mutateAsync({
          id: conceptoToEdit.id,
          data: payload,
        });
        toast.success(`Concepto "${payload.nombre}" actualizado correctamente.`);
      } else {
        result = await createMutation.mutateAsync(payload);
        toast.success(`Concepto "${payload.nombre}" creado correctamente.`);
      }

      onSuccessCallback?.(result);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { detail?: string; message?: string } };
        message?: string;
      };
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Ocurrió un error al guardar el concepto.";
      toast.error(message);
    }
  };

  const isPending =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {isEditing ? "Editar Concepto" : "Nuevo Concepto de Movimiento"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Asociado a:{" "}
                <span className="font-semibold text-foreground">
                  {tipoPadre?.nombre || "Tipo seleccionado"}
                </span>{" "}
                ({tipoPadre?.codigo})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Código */}
          <div className="space-y-1.5">
            <Label htmlFor="concepto-codigo" className="text-xs font-medium">
              Código <span className="text-destructive">*</span>
            </Label>
            <Input
              id="concepto-codigo"
              placeholder="Ej. SERV-LIM, PAG-LUZ..."
              className={cn(
                "h-8 text-xs uppercase font-mono",
                errors.codigo && "border-destructive focus-visible:ring-destructive"
              )}
              {...register("codigo")}
            />
            {errors.codigo && (
              <p className="text-[11px] text-destructive">
                {errors.codigo.message}
              </p>
            )}
          </div>

          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="concepto-nombre" className="text-xs font-medium">
              Nombre del Concepto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="concepto-nombre"
              placeholder="Ej. Servicio de Limpieza, Pago de Luz..."
              className={cn(
                "h-8 text-xs",
                errors.nombre && "border-destructive focus-visible:ring-destructive"
              )}
              {...register("nombre")}
            />
            {errors.nombre && (
              <p className="text-[11px] text-destructive">
                {errors.nombre.message}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="concepto-descripcion" className="text-xs font-medium">
              Descripción <span className="text-muted-foreground text-[10px]">(Opcional)</span>
            </Label>
            <Textarea
              id="concepto-descripcion"
              rows={3}
              placeholder="Detalle de cuándo o cómo se usa este concepto..."
              className={cn(
                "text-xs resize-none",
                errors.descripcion && "border-destructive focus-visible:ring-destructive"
              )}
              {...register("descripcion")}
            />
            {errors.descripcion && (
              <p className="text-[11px] text-destructive">
                {errors.descripcion.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-xs h-8"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="text-xs h-8 gap-1.5"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isEditing ? "Guardar Cambios" : "Crear Concepto"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
