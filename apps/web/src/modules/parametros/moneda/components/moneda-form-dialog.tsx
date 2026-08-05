"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Coins, Loader2 } from "lucide-react";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="size-5 text-primary" />
            {isEditing ? "Editar Moneda" : "Agregar Nueva Moneda"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifique los parámetros de la divisa seleccionada."
              : "Complete el formulario para registrar una nueva divisa operativa."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Código ISO & Símbolo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="codigo">Código ISO</Label>
              <Input
                id="codigo"
                placeholder="ej: USD, EUR, PEN"
                className="uppercase font-mono"
                {...register("codigo")}
              />
              {errors.codigo && (
                <p className="text-xs text-destructive">{errors.codigo.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="simbolo">Símbolo</Label>
              <Input
                id="simbolo"
                placeholder="ej: $, €, S/."
                {...register("simbolo")}
              />
              {errors.simbolo && (
                <p className="text-xs text-destructive">{errors.simbolo.message}</p>
              )}
            </div>
          </div>

          {/* Nombre de la Moneda */}
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre de la Moneda</Label>
            <Input
              id="nombre"
              placeholder="ej: Dólar Estadounidense"
              {...register("nombre")}
            />
            {errors.nombre && (
              <p className="text-xs text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          {/* Decimales & Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="decimales">Decimales</Label>
              <Select
                value={String(decimalesValue)}
                onValueChange={(val) => setValue("decimales", Number(val))}
              >
                <SelectTrigger id="decimales">
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 decimales (ej. COP, CLP)</SelectItem>
                  <SelectItem value="2">2 decimales (ej. USD, EUR)</SelectItem>
                  <SelectItem value="3">3 decimales</SelectItem>
                  <SelectItem value="4">4 decimales</SelectItem>
                </SelectContent>
              </Select>
              {errors.decimales && (
                <p className="text-xs text-destructive">{errors.decimales.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={estadoValue}
                onValueChange={(val) =>
                  setValue("estado", val as "Activo" | "Inactivo")
                }
              >
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
              {errors.estado && (
                <p className="text-xs text-destructive">{errors.estado.message}</p>
              )}
            </div>
          </div>

          {/* Opción Moneda Base */}
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox
              id="esMonedaBase"
              checked={esMonedaBaseValue}
              onCheckedChange={(checked) =>
                setValue("esMonedaBase", Boolean(checked))
              }
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="esMonedaBase"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Establecer como Moneda Base
              </label>
              <p className="text-xs text-muted-foreground">
                Moneda principal utilizada para los reportes y contabilidad.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-4">
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
