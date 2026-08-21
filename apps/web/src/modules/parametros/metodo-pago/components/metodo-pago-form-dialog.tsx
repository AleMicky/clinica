"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { CreditCard, Loader2, Save } from "lucide-react";
import {
  metodoPagoSchema,
  type MetodoPagoFormValues,
} from "../schemas/metodo-pago.schema";
import {
  useCreateMetodoPago,
  useUpdateMetodoPago,
} from "../hooks/use-metodos-pago";
import type { MetodoPagoResponse } from "../types/metodo-pago.types";

interface MetodoPagoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metodoToEdit?: MetodoPagoResponse | null;
  onSuccess?: () => void;
}

export function MetodoPagoFormDialog({
  open,
  onOpenChange,
  metodoToEdit,
  onSuccess,
}: MetodoPagoFormDialogProps) {
  const isEditing = Boolean(metodoToEdit?.id);

  const createMutation = useCreateMetodoPago();
  const updateMutation = useUpdateMetodoPago();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<MetodoPagoFormValues>({
    resolver: zodResolver(metodoPagoSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      requiereReferencia: false,
    },
  });

  React.useEffect(() => {
    if (open) {
      if (metodoToEdit) {
        reset({
          codigo: metodoToEdit.codigo,
          nombre: metodoToEdit.nombre,
          requiereReferencia: metodoToEdit.requiereReferencia,
        });
      } else {
        reset({
          codigo: "",
          nombre: "",
          requiereReferencia: false,
        });
      }
    }
  }, [open, metodoToEdit, reset]);

  const onSubmit = async (values: MetodoPagoFormValues) => {
    try {
      if (isEditing && metodoToEdit) {
        await updateMutation.mutateAsync({
          id: metodoToEdit.id,
          data: values,
        });
        toast.success(`Método de pago "${values.nombre}" actualizado.`);
      } else {
        await createMutation.mutateAsync(values);
        toast.success(`Método de pago "${values.nombre}" registrado.`);
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      const msg =
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al guardar el método de pago.";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full border-border/80 shadow-xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
              <CreditCard className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {isEditing ? "Editar Método de Pago" : "Nuevo Método de Pago"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isEditing
                  ? "Modifique los datos del método de cobro registrado."
                  : "Defina una nueva forma de cobro para las cajas."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Código */}
          <div className="space-y-1.5">
            <Label htmlFor="codigo" className="text-xs font-semibold">
              Código <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="codigo"
              {...register("codigo")}
              placeholder="Ej: EFEC, QR, TRANSF, TARJ"
              className="h-8.5 text-xs font-mono uppercase bg-background"
              maxLength={20}
            />
            {errors.codigo && (
              <p className="text-[11px] text-rose-500 font-medium">
                {errors.codigo.message}
              </p>
            )}
          </div>

          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="nombre" className="text-xs font-semibold">
              Nombre descriptivo <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="nombre"
              {...register("nombre")}
              placeholder="Ej: Efectivo, Transferencia Bancaria, QR Simple"
              className="h-8.5 text-xs bg-background"
              maxLength={100}
            />
            {errors.nombre && (
              <p className="text-[11px] text-rose-500 font-medium">
                {errors.nombre.message}
              </p>
            )}
          </div>

          {/* Requiere Referencia Checkbox / Toggle */}
          <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-1">
            <Controller
              control={control}
              name="requiereReferencia"
              render={({ field }) => (
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="mt-0.5 size-4 rounded border-input text-primary focus:ring-primary/40 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Exigir N° de Referencia / Voucher
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      Al cobrar, el cajero deberá ingresar obligatoriamente el número de transacción o comprobante.
                    </span>
                  </div>
                </label>
              )}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-8 text-xs cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="h-8 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              {isEditing ? "Guardar Cambios" : "Crear Método"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
