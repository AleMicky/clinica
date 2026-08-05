"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Coins, Loader2, Star, CheckCircle2, XCircle, Hash, Tag } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { monedaSchema, type MonedaFormValues } from "../schemas/moneda.schema";
import { useCreateMoneda, useUpdateMoneda } from "../hooks/use-monedas";
import type { MonedaItem } from "./moneda-table";
import type { Moneda, MonedaResponse } from "../types/moneda.types";

interface MonedaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monedaToEdit?: MonedaResponse | Moneda | MonedaItem | null;
  onSuccessCallback?: () => void;
}

export function MonedaFormDialog({
  open,
  onOpenChange,
  monedaToEdit,
  onSuccessCallback,
}: MonedaFormDialogProps) {
  const isEditing = Boolean(monedaToEdit);

  const createMonedaMutation = useCreateMoneda();
  const updateMonedaMutation = useUpdateMoneda();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MonedaFormValues>({
    resolver: zodResolver(monedaSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      simbolo: "",
      decimales: 2,
      esMonedaBase: false,
      estado: "Activo",
    },
  });

  const decimalesValue = watch("decimales");
  const estadoValue = watch("estado");
  const esMonedaBaseValue = watch("esMonedaBase");

  // Reset form when dialog opens or editing item changes
  React.useEffect(() => {
    if (open) {
      if (monedaToEdit) {
        const isActivo =
          "activo" in monedaToEdit
            ? monedaToEdit.activo
            : monedaToEdit.estado === "Activo";

        const esBase =
          "esBase" in monedaToEdit
            ? monedaToEdit.esBase
            : monedaToEdit.esMonedaBase;

        reset({
          codigo: monedaToEdit.codigo,
          nombre: monedaToEdit.nombre,
          simbolo: monedaToEdit.simbolo,
          decimales: monedaToEdit.decimales ?? 2,
          esMonedaBase: Boolean(esBase),
          estado: isActivo ? "Activo" : "Inactivo",
        });
      } else {
        reset({
          codigo: "",
          nombre: "",
          simbolo: "",
          decimales: 2,
          esMonedaBase: false,
          estado: "Activo",
        });
      }
    }
  }, [open, monedaToEdit, reset]);

  const onSubmit = async (values: MonedaFormValues) => {
    try {
      if (isEditing && monedaToEdit) {
        const numericId = Number(monedaToEdit.id);
        await updateMonedaMutation.mutateAsync({
          id: isNaN(numericId) ? 0 : numericId,
          data: {
            codigo: values.codigo,
            nombre: values.nombre,
            simbolo: values.simbolo,
            decimales: values.decimales,
            esBase: values.esMonedaBase,
          },
        });
        toast.success(`Moneda ${values.codigo} actualizada correctamente.`);
      } else {
        await createMonedaMutation.mutateAsync({
          codigo: values.codigo,
          nombre: values.nombre,
          simbolo: values.simbolo,
          decimales: values.decimales,
          esBase: values.esMonedaBase,
        });
        toast.success(`Moneda ${values.codigo} creada correctamente.`);
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
    createMonedaMutation.isPending || updateMonedaMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Coins className="size-5" />
            </div>
            <span>{isEditing ? "Editar Moneda" : "Agregar Nueva Moneda"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique los parámetros operativos y contables de la divisa."
              : "Ingrese la información para registrar una nueva divisa en el sistema."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          {/* Indicador de campos requeridos */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md border border-border/40">
            <span>Campos obligatorios</span>
            <span className="text-destructive font-medium">* Requeridos</span>
          </div>

          {/* Bloque 1: Datos de Identificación */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
              <Tag className="size-3.5 text-primary" />
              <span>Identificación de Divisa</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Código ISO */}
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor="codigo" className="text-xs flex items-center gap-1">
                  Código ISO <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="codigo"
                  placeholder="ej: USD"
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
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor="simbolo" className="text-xs flex items-center gap-1">
                  Símbolo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="simbolo"
                  placeholder="ej: $"
                  className={cn(
                    "text-sm h-9",
                    errors.simbolo && "border-destructive focus-visible:ring-destructive"
                  )}
                  aria-invalid={Boolean(errors.simbolo)}
                  {...register("simbolo")}
                />
                {errors.simbolo && (
                  <p className="text-[11px] text-destructive font-medium">{errors.simbolo.message}</p>
                )}
              </div>

              {/* Nombre de la Moneda */}
              <div className="space-y-1.5 sm:col-span-3">
                <Label htmlFor="nombre" className="text-xs flex items-center gap-1">
                  Nombre de la Moneda <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nombre"
                  placeholder="ej: Dólar Estadounidense"
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

          {/* Bloque 2: Formato y Estado */}
          <div className="space-y-3.5 pt-2 border-t border-border/40">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
              <Hash className="size-3.5 text-primary" />
              <span>Formato y Estado Operativo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Selector de Decimales amplio */}
              <div className="space-y-1.5">
                <Label htmlFor="decimales" className="text-xs flex items-center gap-1">
                  Precisión de Decimales <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={String(decimalesValue)}
                  onValueChange={(val) => setValue("decimales", Number(val))}
                >
                  <SelectTrigger id="decimales" className={cn("w-full h-9 text-sm", errors.decimales && "border-destructive")}>
                    <SelectValue placeholder="Seleccione precisión" />
                  </SelectTrigger>
                  <SelectContent className="w-[280px]">
                    <SelectItem value="0">
                      <div className="flex flex-col text-left py-0.5">
                        <span className="font-medium text-xs">0 decimales</span>
                        <span className="text-[11px] text-muted-foreground">Sin centavos (ej. COP, CLP, JPY)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="2">
                      <div className="flex flex-col text-left py-0.5">
                        <span className="font-medium text-xs">2 decimales (Estándar)</span>
                        <span className="text-[11px] text-muted-foreground">Uso comercial (ej. USD, EUR, PEN)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="3">
                      <div className="flex flex-col text-left py-0.5">
                        <span className="font-medium text-xs">3 decimales</span>
                        <span className="text-[11px] text-muted-foreground">Alta precisión de precios</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="4">
                      <div className="flex flex-col text-left py-0.5">
                        <span className="font-medium text-xs">4 decimales</span>
                        <span className="text-[11px] text-muted-foreground">Cálculo de costos y divisas</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.decimales && (
                  <p className="text-[11px] text-destructive font-medium">{errors.decimales.message}</p>
                )}
              </div>

              {/* Selector de Estado */}
              <div className="space-y-1.5">
                <Label htmlFor="estado" className="text-xs flex items-center gap-1">
                  Estado de la Divisa <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={estadoValue}
                  onValueChange={(val) =>
                    setValue("estado", val as "Activo" | "Inactivo")
                  }
                >
                  <SelectTrigger id="estado" className={cn("w-full h-9 text-sm", errors.estado && "border-destructive")}>
                    <SelectValue placeholder="Seleccione estado" />
                  </SelectTrigger>
                  <SelectContent className="w-[200px]">
                    <SelectItem value="Activo">
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <CheckCircle2 className="size-3.5 text-green-600" />
                        <span>Activo (Operativo)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Inactivo">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <XCircle className="size-3.5 text-destructive" />
                        <span>Inactivo (Deshabilitado)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.estado && (
                  <p className="text-[11px] text-destructive font-medium">{errors.estado.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bloque 3: Opción Moneda Base (Card destacada UX) */}
          <div className="pt-2 border-t border-border/40">
            <div
              className={cn(
                "flex items-start space-x-3 p-3.5 rounded-lg border transition-colors cursor-pointer",
                esMonedaBaseValue
                  ? "bg-amber-500/10 border-amber-500/40"
                  : "bg-muted/30 border-border/60 hover:bg-muted/50"
              )}
              onClick={() => setValue("esMonedaBase", !esMonedaBaseValue)}
            >
              <Checkbox
                id="esMonedaBase"
                checked={esMonedaBaseValue}
                onCheckedChange={(checked) =>
                  setValue("esMonedaBase", Boolean(checked))
                }
                className="mt-0.5"
              />
              <div className="space-y-1 leading-none select-none">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="esMonedaBase"
                    className="text-xs font-semibold leading-none cursor-pointer flex items-center gap-1.5"
                  >
                    <Star className={cn("size-3.5", esMonedaBaseValue ? "fill-amber-500 text-amber-500" : "text-muted-foreground")} />
                    Establecer como Moneda Base del Sistema
                  </label>
                  {esMonedaBaseValue && (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-amber-500 text-amber-950 font-bold">
                      Moneda Principal
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Al marcar esta casilla, se utilizará como divisa principal en reportes de facturación, precios y contabilidad.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
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
              {isEditing ? "Guardar Cambios" : "Crear Moneda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
