"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  SlidersHorizontal,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
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
  tipoMovimientoCajaSchema,
  type TipoMovimientoCajaFormValues,
} from "../schemas/tipo-movimiento.schema";
import {
  useCreateTipoMovimientoCaja,
  useUpdateTipoMovimientoCaja,
} from "../hooks/use-tipo-movimiento";
import type { TipoMovimientoCajaInfo } from "../types/tipo-movimiento.types";

interface TipoMovimientoCajaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoToEdit?: TipoMovimientoCajaInfo | null;
  onSuccessCallback?: (tipo?: TipoMovimientoCajaInfo) => void;
}

export function TipoMovimientoCajaFormDialog({
  open,
  onOpenChange,
  tipoToEdit,
  onSuccessCallback,
}: Readonly<TipoMovimientoCajaFormDialogProps>) {
  const isEditing = Boolean(tipoToEdit);

  const createMutation = useCreateTipoMovimientoCaja();
  const updateMutation = useUpdateTipoMovimientoCaja();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TipoMovimientoCajaFormValues>({
    resolver: zodResolver(tipoMovimientoCajaSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      naturaleza: "ENTRADA",
      descripcion: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      if (tipoToEdit) {
        reset({
          codigo: tipoToEdit.codigo,
          nombre: tipoToEdit.nombre,
          naturaleza: (tipoToEdit.naturaleza.toUpperCase() === "SALIDA"
            ? "SALIDA"
            : "ENTRADA") as "ENTRADA" | "SALIDA",
          descripcion: tipoToEdit.descripcion || "",
        });
      } else {
        reset({
          codigo: "",
          nombre: "",
          naturaleza: "ENTRADA",
          descripcion: "",
        });
      }
    }
  }, [open, tipoToEdit, reset]);

  const onSubmit = async (values: TipoMovimientoCajaFormValues) => {
    try {
      const payload = {
        codigo: values.codigo.trim().toUpperCase(),
        nombre: values.nombre.trim(),
        naturaleza: values.naturaleza,
        descripcion: values.descripcion?.trim() || null,
      };

      let result: TipoMovimientoCajaInfo | undefined;
      if (isEditing && tipoToEdit) {
        result = await updateMutation.mutateAsync({
          id: tipoToEdit.id,
          data: payload,
        });
        toast.success(`Tipo "${payload.nombre}" actualizado correctamente.`);
      } else {
        result = await createMutation.mutateAsync(payload);
        toast.success(`Tipo "${payload.nombre}" creado correctamente.`);
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
        "Ocurrió un error al guardar el tipo de movimiento.";
      toast.error(message);
    }
  };

  const isPending =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {isEditing
                  ? "Editar Tipo de Movimiento"
                  : "Nuevo Tipo de Movimiento"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isEditing
                  ? "Modifique los detalles del tipo de movimiento."
                  : "Complete los campos para registrar un nuevo tipo de movimiento."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Naturaleza */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Naturaleza <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="naturaleza"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => field.onChange("ENTRADA")}
                    className={cn(
                      "flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-xs font-medium transition-all cursor-pointer",
                      field.value === "ENTRADA"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 ring-1 ring-emerald-500"
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <ArrowDownLeft
                      className={cn(
                        "h-4 w-4",
                        field.value === "ENTRADA"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                      )}
                    />
                    <span>Entrada (Ingreso)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => field.onChange("SALIDA")}
                    className={cn(
                      "flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-xs font-medium transition-all cursor-pointer",
                      field.value === "SALIDA"
                        ? "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 ring-1 ring-rose-500"
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <ArrowUpRight
                      className={cn(
                        "h-4 w-4",
                        field.value === "SALIDA"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-muted-foreground"
                      )}
                    />
                    <span>Salida (Egreso)</span>
                  </button>
                </div>
              )}
            />
            {errors.naturaleza && (
              <p className="text-[11px] text-destructive">
                {errors.naturaleza.message}
              </p>
            )}
          </div>

          {/* Código */}
          <div className="space-y-1.5">
            <Label htmlFor="tipo-codigo" className="text-xs font-medium">
              Código <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tipo-codigo"
              placeholder="Ej. ING-VAR, EGR-OFI..."
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
            <Label htmlFor="tipo-nombre" className="text-xs font-medium">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tipo-nombre"
              placeholder="Ej. Ingresos Varios, Gastos de Oficina..."
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
            <Label htmlFor="tipo-descripcion" className="text-xs font-medium">
              Descripción <span className="text-muted-foreground text-[10px]">(Opcional)</span>
            </Label>
            <Textarea
              id="tipo-descripcion"
              rows={3}
              placeholder="Detalle o alcance de este tipo de movimiento..."
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
              <span>{isEditing ? "Guardar Cambios" : "Crear Tipo"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
