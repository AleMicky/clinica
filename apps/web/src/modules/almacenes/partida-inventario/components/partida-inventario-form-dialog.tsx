"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Layers, Calendar, DollarSign, Loader2 } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api/api-error";

import {
  partidaInventarioSchema,
  type PartidaInventarioFormValues,
} from "../schemas/partida-inventario.schema";
import {
  useCreatePartidaInventario,
  useUpdatePartidaInventario,
} from "../hooks/use-partida-inventario";
import type { PartidaInventarioResponse } from "../types/partida-inventario.types";
import type { ProductoResponse } from "@/modules/almacenes/producto/types/producto.types";

interface PartidaInventarioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partidaToEdit?: PartidaInventarioResponse | null;
  producto: ProductoResponse | null;
  onSuccessCallback?: () => void;
}

export function PartidaInventarioFormDialog({
  open,
  onOpenChange,
  partidaToEdit,
  producto,
  onSuccessCallback,
}: PartidaInventarioFormDialogProps) {
  const isEditing = Boolean(partidaToEdit);

  const createMutation = useCreatePartidaInventario();
  const updateMutation = useUpdatePartidaInventario();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PartidaInventarioFormValues>({
    resolver: zodResolver(partidaInventarioSchema),
    defaultValues: {
      productoId: producto?.id ?? 0,
      numeroPartida: "",
      fechaVencimiento: "",
      costoUnitario: 0,
    },
  });

  React.useEffect(() => {
    if (open) {
      if (partidaToEdit) {
        reset({
          productoId: partidaToEdit.productoId,
          numeroPartida: partidaToEdit.numeroPartida || "",
          fechaVencimiento: partidaToEdit.fechaVencimiento || "",
          costoUnitario: Number(partidaToEdit.costoUnitario ?? 0),
        });
      } else {
        reset({
          productoId: producto?.id ?? 0,
          numeroPartida: "",
          fechaVencimiento: "",
          costoUnitario: 0,
        });
      }
    }
  }, [open, partidaToEdit, producto, reset]);

  const onSubmit = async (values: PartidaInventarioFormValues) => {
    if (!producto && !values.productoId) {
      toast.error("Debe seleccionar un producto.");
      return;
    }

    try {
      const payload = {
        productoId: values.productoId || producto!.id,
        numeroPartida: values.numeroPartida?.trim()
          ? values.numeroPartida.trim().toUpperCase()
          : null,
        fechaVencimiento: values.fechaVencimiento?.trim() || null,
        costoUnitario: Number(values.costoUnitario ?? 0),
      };

      if (isEditing && partidaToEdit) {
        await updateMutation.mutateAsync({
          id: partidaToEdit.id,
          data: payload,
        });
        toast.success(
          `Partida ${values.numeroPartida ? `"${values.numeroPartida}"` : ""} actualizada correctamente.`
        );
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(
          `Partida ${values.numeroPartida ? `"${values.numeroPartida}"` : ""} registrada correctamente.`
        );
      }
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="size-5" />
            </div>
            <span>{isEditing ? "Editar Partida de Inventario" : "Nueva Partida de Inventario"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {producto ? (
              <span>
                Asociada al producto:{" "}
                <strong className="text-foreground">
                  {producto.codigo} - {producto.nombre}
                </strong>
              </span>
            ) : (
              "Ingrese los datos de la partida."
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Número de Partida (Opcional) */}
          <div className="space-y-1.5">
            <Label htmlFor="numeroPartida" className="text-xs flex items-center gap-1">
              Número / Código de Partida <span className="text-muted-foreground">(Opcional)</span>
            </Label>
            <Input
              id="numeroPartida"
              placeholder="ej: PART-2026-001"
              className={cn(
                "uppercase font-mono text-xs h-9",
                errors.numeroPartida && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={Boolean(errors.numeroPartida)}
              {...register("numeroPartida")}
            />
            {errors.numeroPartida && (
              <p className="text-[11px] text-destructive font-medium">{errors.numeroPartida.message}</p>
            )}
          </div>

          {/* Fecha de Vencimiento */}
          <div className="space-y-1.5">
            <Label htmlFor="fechaVencimiento" className="text-xs flex items-center gap-1">
              <Calendar className="size-3 text-amber-500" /> Fecha de Vencimiento{" "}
              {producto?.controlaVencimiento ? (
                <span className="text-amber-500 font-semibold">(Recomendada)</span>
              ) : (
                <span className="text-muted-foreground">(Opcional)</span>
              )}
            </Label>
            <Input
              id="fechaVencimiento"
              type="date"
              className={cn(
                "text-xs h-9",
                errors.fechaVencimiento && "border-destructive focus-visible:ring-destructive"
              )}
              {...register("fechaVencimiento")}
            />
            {errors.fechaVencimiento && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.fechaVencimiento.message}
              </p>
            )}
          </div>

          {/* Costo Unitario */}
          <div className="space-y-1.5">
            <Label htmlFor="costoUnitario" className="text-xs flex items-center gap-1">
              <DollarSign className="size-3 text-emerald-500" /> Costo Unitario en Bs.{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="costoUnitario"
              type="number"
              step="any"
              placeholder="0.00"
              className={cn(
                "text-xs h-9 font-mono",
                errors.costoUnitario && "border-destructive focus-visible:ring-destructive"
              )}
              {...register("costoUnitario", {
                valueAsNumber: true,
              })}
            />
            {errors.costoUnitario && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.costoUnitario.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-3 border-t gap-2 sm:gap-0">
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
              {isEditing ? "Guardar Cambios" : "Registrar Partida"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
