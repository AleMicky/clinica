"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeftRight,
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
  tipoMovimientoInventarioSchema,
  type TipoMovimientoInventarioFormValues,
} from "../schemas/tipo-movimiento-inventario.schema";
import {
  useCreateTipoMovimientoInventario,
  useUpdateTipoMovimientoInventario,
} from "../hooks/use-tipo-movimiento-inventario";
import {
  NaturalezaMovimiento,
  type TipoMovimientoInventarioResponse,
} from "../types/tipo-movimiento-inventario.types";

interface TipoMovimientoInventarioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoToEdit?: TipoMovimientoInventarioResponse | null;
  onSuccessCallback?: () => void;
}

export function TipoMovimientoInventarioFormDialog({
  open,
  onOpenChange,
  tipoToEdit,
  onSuccessCallback,
}: TipoMovimientoInventarioFormDialogProps) {
  const isEditing = Boolean(tipoToEdit);

  const createMutation = useCreateTipoMovimientoInventario();
  const updateMutation = useUpdateTipoMovimientoInventario();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TipoMovimientoInventarioFormValues>({
    resolver: zodResolver(tipoMovimientoInventarioSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
      naturaleza: NaturalezaMovimiento.Entrada,
    },
  });

  const [keepOpen, setKeepOpen] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setKeepOpen(false);
      if (tipoToEdit) {
        reset({
          codigo: tipoToEdit.codigo,
          nombre: tipoToEdit.nombre,
          descripcion: tipoToEdit.descripcion || "",
          naturaleza: tipoToEdit.naturaleza,
        });
      } else {
        reset({
          codigo: "",
          nombre: "",
          descripcion: "",
          naturaleza: NaturalezaMovimiento.Entrada,
        });
      }
    }
  }, [open, tipoToEdit, reset]);

  const onSubmit = async (values: TipoMovimientoInventarioFormValues) => {
    try {
      if (isEditing && tipoToEdit) {
        await updateMutation.mutateAsync({
          id: tipoToEdit.id,
          data: {
            codigo: values.codigo.toUpperCase(),
            nombre: values.nombre,
            descripcion: values.descripcion || null,
            naturaleza: Number(values.naturaleza) as NaturalezaMovimiento,
          },
        });
        toast.success(
          `Tipo de movimiento "${values.codigo}" actualizado correctamente.`
        );
        onSuccessCallback?.();
        onOpenChange(false);
      } else {
        await createMutation.mutateAsync({
          codigo: values.codigo.toUpperCase(),
          nombre: values.nombre,
          descripcion: values.descripcion || null,
          naturaleza: Number(values.naturaleza) as NaturalezaMovimiento,
        });
        toast.success(
          `Tipo de movimiento "${values.codigo}" creado correctamente.`
        );
        onSuccessCallback?.();

        if (keepOpen) {
          // Mantener la naturaleza seleccionada para agilizar el ingreso consecutivo
          reset({
            codigo: "",
            nombre: "",
            descripcion: "",
            naturaleza: values.naturaleza,
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
        "Ocurrió un error al procesar el tipo de movimiento.";
      toast.error(errorMsg);
    }
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ArrowLeftRight className="size-5" />
            </div>
            <span>
              {isEditing
                ? "Editar Tipo de Movimiento"
                : "Nuevo Tipo de Movimiento"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique los atributos del tipo de movimiento de inventario."
              : "Complete el formulario para crear un nuevo tipo de movimiento."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Nature selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <span>Naturaleza del Movimiento</span>
              <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="naturaleza"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => field.onChange(NaturalezaMovimiento.Entrada)}
                    className={cn(
                      "flex flex-col items-start gap-1 p-3 rounded-lg border-2 text-left transition-all cursor-pointer",
                      field.value === NaturalezaMovimiento.Entrada
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200 shadow-2xs"
                        : "border-border/60 bg-muted/20 hover:bg-muted/40 text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-1.5 font-medium text-xs text-emerald-700 dark:text-emerald-400">
                      <ArrowDownLeft className="size-4" />
                      <span>Entrada de Stock</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Incrementa las existencias físicas (Compras, donaciones, ajustes +)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => field.onChange(NaturalezaMovimiento.Salida)}
                    className={cn(
                      "flex flex-col items-start gap-1 p-3 rounded-lg border-2 text-left transition-all cursor-pointer",
                      field.value === NaturalezaMovimiento.Salida
                        ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-950 dark:text-amber-200 shadow-2xs"
                        : "border-border/60 bg-muted/20 hover:bg-muted/40 text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-1.5 font-medium text-xs text-amber-700 dark:text-amber-400">
                      <ArrowUpRight className="size-4" />
                      <span>Salida de Stock</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Disminuye las existencias físicas (Ventas, mermas, consumos -)
                    </span>
                  </button>
                </div>
              )}
            />
            {errors.naturaleza && (
              <p className="text-destructive text-[11px]">
                {errors.naturaleza.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Code */}
            <div className="space-y-1 sm:col-span-1">
              <Label
                htmlFor="codigo"
                className="text-xs font-medium text-foreground flex items-center justify-between"
              >
                <span>Código</span>
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="codigo"
                placeholder="Ej. ING-01"
                {...register("codigo")}
                disabled={isLoading}
                className={cn(
                  "font-mono uppercase text-xs h-8 bg-muted/30 border-border/60 focus:bg-background",
                  errors.codigo && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.codigo && (
                <p className="text-destructive text-[11px]">
                  {errors.codigo.message}
                </p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-1 sm:col-span-2">
              <Label
                htmlFor="nombre"
                className="text-xs font-medium text-foreground flex items-center justify-between"
              >
                <span>Nombre descriptivo</span>
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre"
                placeholder="Ej. Ingreso por Compra"
                {...register("nombre")}
                disabled={isLoading}
                className={cn(
                  "text-xs h-8 bg-muted/30 border-border/60 focus:bg-background",
                  errors.nombre && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.nombre && (
                <p className="text-destructive text-[11px]">
                  {errors.nombre.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label
              htmlFor="descripcion"
              className="text-xs font-medium text-foreground"
            >
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              rows={3}
              placeholder="Detalle o propósito de este tipo de movimiento..."
              {...register("descripcion")}
              disabled={isLoading}
              className={cn(
                "resize-none text-xs bg-muted/30 border-border/60 focus:bg-background",
                errors.descripcion && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.descripcion && (
              <p className="text-destructive text-[11px]">
                {errors.descripcion.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-border/40 flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-8 text-xs cursor-pointer w-full sm:w-auto"
            >
              Cancelar
            </Button>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              {!isEditing && (
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => setKeepOpen(true)}
                  className="h-8 text-xs cursor-pointer w-full sm:w-auto"
                >
                  {isLoading && keepOpen && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
                  Guardar y agregar otro
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={isLoading}
                onClick={() => setKeepOpen(false)}
                className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs w-full sm:w-auto"
              >
                {isLoading && !keepOpen && <Loader2 className="size-3.5 animate-spin" />}
                <span>{isEditing ? "Guardar Cambios" : "Guardar y Cerrar"}</span>
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
