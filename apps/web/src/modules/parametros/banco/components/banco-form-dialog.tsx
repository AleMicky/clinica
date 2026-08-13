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
import { bancoSchema, type BancoFormValues } from "../schemas/banco.schema";
import { useCreateBanco, useUpdateBanco } from "../hooks/use-bancos";
import type { BancoResponse } from "../types/banco.types";

interface BancoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bancoToEdit?: BancoResponse | null;
  onSuccessCallback?: () => void;
}

export function BancoFormDialog({
  open,
  onOpenChange,
  bancoToEdit,
  onSuccessCallback,
}: BancoFormDialogProps) {
  const isEditing = !!bancoToEdit;

  const createMutation = useCreateBanco();
  const updateMutation = useUpdateBanco();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BancoFormValues>({
    resolver: zodResolver(bancoSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      nombreCorto: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      if (bancoToEdit) {
        reset({
          codigo: bancoToEdit.codigo,
          nombre: bancoToEdit.nombre,
          nombreCorto: bancoToEdit.nombreCorto || "",
        });
      } else {
        reset({
          codigo: "",
          nombre: "",
          nombreCorto: "",
        });
      }
    }
  }, [open, bancoToEdit, reset]);

  const onSubmit = async (values: BancoFormValues) => {
    try {
      const payload = {
        codigo: values.codigo.trim().toUpperCase(),
        nombre: values.nombre.trim(),
        nombreCorto: values.nombreCorto?.trim() || null,
      };

      if (isEditing && bancoToEdit) {
        await updateMutation.mutateAsync({
          id: bancoToEdit.id,
          data: payload,
        });
        toast.success(`Banco ${payload.codigo} actualizado correctamente.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Banco ${payload.codigo} creado correctamente.`);
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string; title?: string } }; message?: string };
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        err?.message ||
        "Ocurrió un error al guardar la entidad bancaria.";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Banco" : "Nuevo Banco"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifique la información general de la entidad bancaria."
              : "Ingrese los datos requeridos para registrar una nueva entidad bancaria."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Código */}
          <div className="space-y-2">
            <Label htmlFor="codigo" className="required font-medium">
              Código de Banco
            </Label>
            <Input
              id="codigo"
              placeholder="Ej: BCP, BBVA, INTERBANK"
              {...register("codigo")}
              onChange={(e) => {
                setValue("codigo", e.target.value.toUpperCase());
              }}
              className="font-mono uppercase"
              disabled={isSubmitting}
            />
            {errors.codigo && (
              <p className="text-xs text-destructive">{errors.codigo.message}</p>
            )}
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="required font-medium">
              Nombre de Entidad Bancaria
            </Label>
            <Input
              id="nombre"
              placeholder="Ej: Banco de Crédito del Perú"
              {...register("nombre")}
              disabled={isSubmitting}
            />
            {errors.nombre && (
              <p className="text-xs text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          {/* Nombre Corto / Sigla */}
          <div className="space-y-2">
            <Label htmlFor="nombreCorto" className="font-medium">
              Nombre Corto / Sigla <span className="text-xs text-muted-foreground">(Opcional)</span>
            </Label>
            <Input
              id="nombreCorto"
              placeholder="Ej: BCP"
              {...register("nombreCorto")}
              disabled={isSubmitting}
            />
            {errors.nombreCorto && (
              <p className="text-xs text-destructive">
                {errors.nombreCorto.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isEditing ? "Guardar Cambios" : "Crear Banco"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
