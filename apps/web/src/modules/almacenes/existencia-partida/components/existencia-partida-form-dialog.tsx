"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Layers,
  Loader2,
  Warehouse,
  Package,
  Calculator,
  Calendar,
  DollarSign,
  AlertCircle,
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  existenciaPartidaSchema,
  type ExistenciaPartidaFormValues,
} from "../schemas/existencia-partida.schema";
import {
  useCreateExistenciaPartida,
  useUpdateExistenciaPartida,
} from "../hooks/use-existencia-partida";
import type { ExistenciaPartidaResponse } from "../types/existencia-partida.types";
import { useExistencias } from "../../existencia/hooks/use-existencia";
import { usePartidasInventario } from "../../partida-inventario/hooks/use-partida-inventario";
import type { ExistenciaResponse } from "../../existencia/types/existencia.types";

interface ExistenciaPartidaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existenciaPartidaToEdit?: ExistenciaPartidaResponse | null;
  preselectedExistencia?: ExistenciaResponse | null;
  onSuccessCallback?: () => void;
}

export function ExistenciaPartidaFormDialog({
  open,
  onOpenChange,
  existenciaPartidaToEdit,
  preselectedExistencia,
  onSuccessCallback,
}: ExistenciaPartidaFormDialogProps) {
  const isEditing = Boolean(existenciaPartidaToEdit);

  const createMutation = useCreateExistenciaPartida();
  const updateMutation = useUpdateExistenciaPartida();

  // Load all active existencias for dropdown selection
  const { data: existenciasData, isLoading: isLoadingExistencias } = useExistencias({
    pageSize: 1000,
  });
  const existenciasList = existenciasData?.items ?? [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExistenciaPartidaFormValues>({
    resolver: zodResolver(existenciaPartidaSchema),
    defaultValues: {
      existenciaId: 0,
      partidaInventarioId: 0,
      cantidad: 0,
      cantidadReservada: 0,
    },
  });

  const watchedExistenciaId = watch("existenciaId");
  const watchedPartidaId = watch("partidaInventarioId");
  const watchedCantidad = watch("cantidad") || 0;
  const watchedReservada = watch("cantidadReservada") || 0;
  const calculatedDisponible = Math.max(0, watchedCantidad - watchedReservada);

  // Determine current selected existencia object
  const currentExistencia = React.useMemo(() => {
    if (preselectedExistencia) return preselectedExistencia;
    if (existenciaPartidaToEdit) {
      return {
        id: existenciaPartidaToEdit.existenciaId,
        almacenId: existenciaPartidaToEdit.almacenId,
        almacenNombre: existenciaPartidaToEdit.almacenNombre,
        productoId: existenciaPartidaToEdit.productoId,
        productoNombre: existenciaPartidaToEdit.productoNombre,
        productoCodigo: existenciaPartidaToEdit.productoCodigo,
        cantidad: 0,
        cantidadReservada: 0,
        cantidadDisponible: 0,
      } as ExistenciaResponse;
    }
    return (
      existenciasList.find((e) => e.id === Number(watchedExistenciaId)) || null
    );
  }, [preselectedExistencia, existenciaPartidaToEdit, existenciasList, watchedExistenciaId]);

  // Load partidas for the product in the selected existencia
  const currentProductoId = currentExistencia?.productoId ?? null;
  const { data: partidasData, isLoading: isLoadingPartidas } = usePartidasInventario(
    currentProductoId ? { productoId: currentProductoId, pageSize: 100 } : undefined,
    { enabled: Boolean(currentProductoId) }
  );
  const partidasList = partidasData?.items ?? [];

  // Selected partida details for information card
  const selectedPartida = React.useMemo(() => {
    return partidasList.find((p) => p.id === Number(watchedPartidaId)) || null;
  }, [partidasList, watchedPartidaId]);

  React.useEffect(() => {
    if (open) {
      if (existenciaPartidaToEdit) {
        reset({
          existenciaId: existenciaPartidaToEdit.existenciaId,
          partidaInventarioId: existenciaPartidaToEdit.partidaInventarioId,
          cantidad: existenciaPartidaToEdit.cantidad,
          cantidadReservada: existenciaPartidaToEdit.cantidadReservada,
        });
      } else if (preselectedExistencia) {
        reset({
          existenciaId: preselectedExistencia.id,
          partidaInventarioId: 0,
          cantidad: 0,
          cantidadReservada: 0,
        });
      } else {
        reset({
          existenciaId: 0,
          partidaInventarioId: 0,
          cantidad: 0,
          cantidadReservada: 0,
        });
      }
    }
  }, [open, existenciaPartidaToEdit, preselectedExistencia, reset]);

  const onSubmit = async (values: ExistenciaPartidaFormValues) => {
    try {
      if (isEditing && existenciaPartidaToEdit) {
        await updateMutation.mutateAsync({
          id: existenciaPartidaToEdit.id,
          data: {
            existenciaId: Number(values.existenciaId),
            partidaInventarioId: Number(values.partidaInventarioId),
            cantidad: Number(values.cantidad),
            cantidadReservada: Number(values.cantidadReservada),
          },
        });
        toast.success("Stock de partida actualizado correctamente.");
      } else {
        await createMutation.mutateAsync({
          existenciaId: Number(values.existenciaId),
          partidaInventarioId: Number(values.partidaInventarioId),
          cantidad: Number(values.cantidad),
          cantidadReservada: Number(values.cantidadReservada),
        });
        toast.success("Partida asignada a la existencia exitosamente.");
      }
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al guardar el registro.";
      toast.error(errorMsg);
    }
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="size-5" />
            </div>
            <span>
              {isEditing ? "Modificar Stock de Partida" : "Asignar Partida a Existencia"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Actualice las cantidades de stock físico y reservado para esta partida."
              : "Vincule un lote o partida de inventario a una existencia de almacén con sus cantidades correspondientes."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Existencia Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Warehouse className="size-3.5 text-primary" />
              <span>Existencia (Almacén y Producto)</span>
              <span className="text-destructive">*</span>
            </Label>

            {isEditing || preselectedExistencia ? (
              <div className="p-2.5 rounded-lg border border-border/70 bg-muted/40 flex items-center justify-between text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-foreground">
                    {currentExistencia?.productoNombre || `Producto #${currentExistencia?.productoId}`}
                  </span>
                  <span className="text-muted-foreground text-[11px] flex items-center gap-1.5">
                    <span>{currentExistencia?.almacenNombre || `Almacén #${currentExistencia?.almacenId}`}</span>
                    {currentExistencia?.productoCodigo && (
                      <span className="font-mono bg-muted px-1 rounded border border-border/40">
                        {currentExistencia.productoCodigo}
                      </span>
                    )}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Fijado
                </Badge>
              </div>
            ) : (
              <Controller
                name="existenciaId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(val) => {
                      field.onChange(Number(val));
                      setValue("partidaInventarioId", 0);
                    }}
                    disabled={isLoading || isLoadingExistencias}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-9 text-xs bg-background border-border/60",
                        errors.existenciaId && "border-destructive focus:ring-destructive"
                      )}
                    >
                      <SelectValue placeholder="Seleccione almacén y producto..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {existenciasList.map((ex) => (
                        <SelectItem key={ex.id} value={String(ex.id)} className="text-xs">
                          {ex.productoNombre || `Producto #${ex.productoId}`} —{" "}
                          <span className="text-muted-foreground">({ex.almacenNombre || `Almacén #${ex.almacenId}`})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            {errors.existenciaId && (
              <p className="text-destructive text-[11px]">{errors.existenciaId.message}</p>
            )}
          </div>

          {/* Partida Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Layers className="size-3.5 text-primary" />
              <span>Partida / Lote</span>
              <span className="text-destructive">*</span>
            </Label>

            {isEditing ? (
              <div className="p-2.5 rounded-lg border border-border/70 bg-muted/40 flex items-center justify-between text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono font-semibold text-foreground">
                    {existenciaPartidaToEdit?.numeroPartida || `Partida #${existenciaPartidaToEdit?.partidaInventarioId}`}
                  </span>
                  {existenciaPartidaToEdit?.fechaVencimiento && (
                    <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                      <Calendar className="size-3 text-muted-foreground" />
                      Vence: {existenciaPartidaToEdit.fechaVencimiento}
                    </span>
                  )}
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  ${existenciaPartidaToEdit?.costoUnitario.toFixed(2)}
                </Badge>
              </div>
            ) : (
              <Controller
                name="partidaInventarioId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(val) => field.onChange(Number(val))}
                    disabled={isLoading || !currentProductoId || isLoadingPartidas}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-9 text-xs bg-background border-border/60",
                        errors.partidaInventarioId && "border-destructive focus:ring-destructive"
                      )}
                    >
                      <SelectValue
                        placeholder={
                          !currentProductoId
                            ? "Seleccione primero una existencia..."
                            : isLoadingPartidas
                            ? "Cargando partidas del producto..."
                            : partidasList.length === 0
                            ? "No hay partidas registradas para este producto"
                            : "Seleccionar número de partida / lote..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {partidasList.map((partida) => (
                        <SelectItem key={partida.id} value={String(partida.id)} className="text-xs">
                          <span className="font-mono font-medium">
                            {partida.numeroPartida || `Partida #${partida.id}`}
                          </span>
                          {partida.fechaVencimiento && (
                            <span className="text-muted-foreground text-[11px] ml-2">
                              (Vence: {partida.fechaVencimiento})
                            </span>
                          )}
                          <span className="text-primary font-mono text-[11px] ml-2">
                            ${partida.costoUnitario.toFixed(2)}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            {errors.partidaInventarioId && (
              <p className="text-destructive text-[11px]">{errors.partidaInventarioId.message}</p>
            )}

            {/* Selected Partida Details Card */}
            {selectedPartida && !isEditing && (
              <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      Partida: {selectedPartida.numeroPartida || `#${selectedPartida.id}`}
                    </span>
                  </div>
                  {selectedPartida.fechaVencimiento && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-3 text-muted-foreground" />
                      Fecha Vencimiento:{" "}
                      <strong className="text-foreground">{selectedPartida.fechaVencimiento}</strong>
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block">Costo Unitario</span>
                  <span className="font-mono font-bold text-xs text-primary">
                    ${selectedPartida.costoUnitario.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quantities Section */}
          <div className="p-3.5 bg-muted/30 rounded-xl border border-border/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calculator className="size-3.5 text-primary" />
                <span>Cantidades por Partida</span>
              </span>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-muted-foreground">Disponible:</span>
                <Badge
                  variant="outline"
                  className="font-mono text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 px-1.5 py-0"
                >
                  {calculatedDisponible.toLocaleString()}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Cantidad Total */}
              <div className="space-y-1">
                <Label
                  htmlFor="cantidad"
                  className="text-xs font-medium text-foreground flex items-center justify-between"
                >
                  <span>Cantidad Físico</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cantidad"
                  type="number"
                  step="any"
                  min={0}
                  placeholder="0.00"
                  {...register("cantidad", { valueAsNumber: true })}
                  disabled={isLoading}
                  className={cn(
                    "font-mono text-xs h-8 bg-background border-border/60",
                    errors.cantidad && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.cantidad && (
                  <p className="text-destructive text-[10px]">{errors.cantidad.message}</p>
                )}
              </div>

              {/* Cantidad Reservada */}
              <div className="space-y-1">
                <Label
                  htmlFor="cantidadReservada"
                  className="text-xs font-medium text-foreground flex items-center justify-between"
                >
                  <span>Cantidad Reservada</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cantidadReservada"
                  type="number"
                  step="any"
                  min={0}
                  placeholder="0.00"
                  {...register("cantidadReservada", { valueAsNumber: true })}
                  disabled={isLoading}
                  className={cn(
                    "font-mono text-xs h-8 bg-background border-border/60",
                    errors.cantidadReservada && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.cantidadReservada && (
                  <p className="text-destructive text-[10px]">
                    {errors.cantidadReservada.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2">
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

            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs font-medium w-full sm:w-auto"
            >
              {isLoading && <Loader2 className="size-3.5 animate-spin" />}
              <span>{isEditing ? "Guardar Cambios" : "Asignar Partida"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
