"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Tag, Loader2, Coins, Star } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  tarifarioSchema,
  type TarifarioFormValues,
} from "../schemas/tarifario.schema";
import { useCreateTarifario, useUpdateTarifario } from "../hooks/use-tarifario";
import { useMonedas } from "@/modules/parametros/moneda";
import type { TarifarioResponse } from "../types/tarifario.types";

interface TarifarioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tarifarioToEdit?: TarifarioResponse | null;
  onSuccessCallback?: () => void;
}

export function TarifarioFormDialog({
  open,
  onOpenChange,
  tarifarioToEdit,
  onSuccessCallback,
}: TarifarioFormDialogProps) {
  const isEditing = Boolean(tarifarioToEdit);

  const createMutation = useCreateTarifario();
  const updateMutation = useUpdateTarifario();
  const { data: monedasData } = useMonedas({ pageSize: 100 });
  const monedas = React.useMemo(() => monedasData?.items ?? [], [monedasData]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TarifarioFormValues>({
    resolver: zodResolver(tarifarioSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
      fechaInicio: new Date().toISOString().split("T")[0],
      fechaFin: "",
      monedaId: 1,
      esPrincipal: false,
    },
  });

  const selectedMonedaId = watch("monedaId");
  const esPrincipal = watch("esPrincipal");

  React.useEffect(() => {
    if (open) {
      if (tarifarioToEdit) {
        reset({
          codigo: tarifarioToEdit.codigo,
          nombre: tarifarioToEdit.nombre,
          descripcion: tarifarioToEdit.descripcion || "",
          fechaInicio: tarifarioToEdit.fechaInicio ? tarifarioToEdit.fechaInicio.split("T")[0] : "",
          fechaFin: tarifarioToEdit.fechaFin ? tarifarioToEdit.fechaFin.split("T")[0] : "",
          monedaId: tarifarioToEdit.monedaId,
          esPrincipal: Boolean(tarifarioToEdit.esPrincipal),
        });
      } else {
        reset({
          codigo: "",
          nombre: "",
          descripcion: "",
          fechaInicio: new Date().toISOString().split("T")[0],
          fechaFin: "",
          monedaId: monedas[0]?.id ?? 1,
          esPrincipal: false,
        });
      }
    }
  }, [open, tarifarioToEdit, monedas, reset]);

  const onSubmit = async (values: TarifarioFormValues) => {
    try {
      const payload = {
        codigo: values.codigo,
        nombre: values.nombre,
        descripcion: values.descripcion || null,
        fechaInicio: values.fechaInicio,
        fechaFin: values.fechaFin || null,
        monedaId: values.monedaId,
        esPrincipal: Boolean(values.esPrincipal),
      };

      if (isEditing && tarifarioToEdit) {
        await updateMutation.mutateAsync({
          id: tarifarioToEdit.id,
          data: payload,
        });
        toast.success(`Tarifario ${values.codigo} actualizado correctamente.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Tarifario ${values.codigo} creado correctamente.`);
      }
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al guardar el tarifario.";
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
              <Tag className="size-5" />
            </div>
            <span>{isEditing ? "Editar Tarifario" : "Nuevo Tarifario"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique los parámetros y vigencia de la lista de precios seleccionada."
              : "Defina un nuevo tarifario con vigencia y asignación de moneda."}
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
              <span>Configuración del Tarifario</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Código */}
              <div className="space-y-1.5">
                <Label htmlFor="codigo" className="text-xs flex items-center gap-1">
                  Código <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="codigo"
                  placeholder="ej: TAR-2026, TAR-INST"
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

              {/* Moneda */}
              <div className="space-y-1.5">
                <Label htmlFor="monedaId" className="text-xs flex items-center gap-1">
                  Moneda <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedMonedaId ? String(selectedMonedaId) : ""}
                  onValueChange={(val) => setValue("monedaId", Number(val), { shouldValidate: true })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Seleccionar moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    {monedas.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        <div className="flex items-center gap-2">
                          <Coins className="size-3.5 text-muted-foreground" />
                          <span>{m.nombre} ({m.simbolo})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.monedaId && (
                  <p className="text-[11px] text-destructive font-medium">{errors.monedaId.message}</p>
                )}
              </div>

              {/* Nombre */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="nombre" className="text-xs flex items-center gap-1">
                  Nombre del Tarifario <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nombre"
                  placeholder="ej: Tarifario General de Prestaciones 2026"
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
                  Fecha de Inicio <span className="text-destructive">*</span>
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
                  Fecha de Fin (Opcional)
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
                  Descripción
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Observaciones o notas sobre este tarifario..."
                  rows={2}
                  className="text-sm resize-none"
                  {...register("descripcion")}
                />
              </div>

              {/* Checkbox Principal */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 sm:col-span-2 cursor-pointer" onClick={() => setValue("esPrincipal", !esPrincipal)}>
                <div className="space-y-0.5">
                  <Label htmlFor="esPrincipal" className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                    <Star className="size-3.5 text-amber-500 fill-amber-500" />
                    <span>Tarifario Principal</span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Marcar como la lista de precios por defecto para particulares.
                  </p>
                </div>
                <Checkbox
                  id="esPrincipal"
                  checked={esPrincipal}
                  onCheckedChange={(checked: boolean) => setValue("esPrincipal", Boolean(checked))}
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
              {isEditing ? "Guardar Cambios" : "Crear Tarifario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
