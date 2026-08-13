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
import { CatalogoAutocomplete } from "@/components/ui/catalogo-autocomplete";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMonedas } from "@/modules/parametros/moneda/hooks/use-monedas";
import {
  cuentaBancariaSchema,
  type CuentaBancariaFormValues,
} from "../schemas/banco.schema";
import {
  useCreateCuentaBancaria,
  useUpdateCuentaBancaria,
} from "../hooks/use-bancos";
import type { CuentaBancariaResponse } from "../types/banco.types";

interface CuentaBancariaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bancoId: number;
  cuentaToEdit?: CuentaBancariaResponse | null;
  onSuccessCallback?: () => void;
}

export function CuentaBancariaFormDialog({
  open,
  onOpenChange,
  bancoId,
  cuentaToEdit,
  onSuccessCallback,
}: CuentaBancariaFormDialogProps) {
  const isEditing = !!cuentaToEdit;

  // Fetch real list of monedas for dropdown
  const { data: monedasData, isLoading: isLoadingMonedas } = useMonedas({
    page: 1,
    pageSize: 100,
  });

  const createMutation = useCreateCuentaBancaria();
  const updateMutation = useUpdateCuentaBancaria();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CuentaBancariaFormValues>({
    resolver: zodResolver(cuentaBancariaSchema),
    defaultValues: {
      monedaId: 0,
      numeroCuenta: "",
      nombreCuenta: "",
      tipoCuenta: "",
    },
  });

  const selectedMonedaId = watch("monedaId");

  const selectedMoneda = React.useMemo(() => {
    if (!selectedMonedaId || !monedasData?.items) return null;
    return monedasData.items.find((m) => m.id === Number(selectedMonedaId)) || null;
  }, [selectedMonedaId, monedasData]);

  React.useEffect(() => {
    if (open) {
      if (cuentaToEdit) {
        reset({
          monedaId: cuentaToEdit.monedaId,
          numeroCuenta: cuentaToEdit.numeroCuenta,
          nombreCuenta: cuentaToEdit.nombreCuenta || "",
          tipoCuenta: cuentaToEdit.tipoCuenta || "",
        });
      } else {
        reset({
          monedaId: 0,
          numeroCuenta: "",
          nombreCuenta: "",
          tipoCuenta: "",
        });
      }
    }
  }, [open, cuentaToEdit, reset]);

  const onSubmit = async (values: CuentaBancariaFormValues) => {
    try {
      const payload = {
        monedaId: Number(values.monedaId),
        numeroCuenta: values.numeroCuenta.trim(),
        nombreCuenta: values.nombreCuenta?.trim() || null,
        tipoCuenta: values.tipoCuenta?.trim() || null,
      };

      if (isEditing && cuentaToEdit) {
        await updateMutation.mutateAsync({
          bancoId,
          cuentaId: cuentaToEdit.id,
          data: payload,
        });
        toast.success(`Cuenta bancaria ${payload.numeroCuenta} actualizada correctamente.`);
      } else {
        await createMutation.mutateAsync({
          bancoId,
          data: payload,
        });
        toast.success(`Cuenta bancaria ${payload.numeroCuenta} agregada correctamente.`);
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string; title?: string } }; message?: string };
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        err?.message ||
        "Ocurrió un error al guardar la cuenta bancaria.";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Cuenta Bancaria" : "Nueva Cuenta Bancaria"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifique los detalles de la cuenta bancaria."
              : "Ingrese la moneda y número de cuenta para esta entidad."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Moneda */}
          <div className="space-y-2">
            <Label htmlFor="monedaId" className="required font-medium">
              Moneda
            </Label>
            <Select
              value={selectedMonedaId ? String(selectedMonedaId) : ""}
              onValueChange={(val) => setValue("monedaId", Number(val), { shouldValidate: true })}
              disabled={isSubmitting || isLoadingMonedas}
            >
              <SelectTrigger id="monedaId" className="w-full h-9 text-sm">
                <SelectValue placeholder="Seleccione una moneda...">
                  {selectedMoneda ? (
                    <span className="font-medium text-sm">
                      {selectedMoneda.nombre} ({selectedMoneda.simbolo})
                    </span>
                  ) : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {monedasData?.items?.map((moneda) => (
                  <SelectItem key={moneda.id} value={String(moneda.id)}>
                    <span className="font-medium text-sm">
                      {moneda.nombre} ({moneda.simbolo})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.monedaId && (
              <p className="text-xs text-destructive">{errors.monedaId.message}</p>
            )}
          </div>

          {/* Número de Cuenta */}
          <div className="space-y-2">
            <Label htmlFor="numeroCuenta" className="required font-medium">
              Número de Cuenta
            </Label>
            <Input
              id="numeroCuenta"
              placeholder="Ej: 191-12345678-0-12"
              {...register("numeroCuenta")}
              className="h-9 text-sm font-mono"
              disabled={isSubmitting}
            />
            {errors.numeroCuenta && (
              <p className="text-xs text-destructive">
                {errors.numeroCuenta.message}
              </p>
            )}
          </div>

          {/* Tipo de Cuenta */}
          <div className="space-y-2">
            <Label htmlFor="tipoCuenta" className="font-medium">
              Tipo de Cuenta <span className="text-xs text-muted-foreground">(Opcional)</span>
            </Label>
            <CatalogoAutocomplete
              id="tipoCuenta"
              codigo="TIPO_CUENTA_BANCARIA"
              value={watch("tipoCuenta") || ""}
              onValueChange={(val) => setValue("tipoCuenta", val)}
              placeholder="Seleccione o busque tipo de cuenta..."
              fallbackOptions={["Corriente", "Ahorros", "Recaudadora", "CCI / Interbancaria"]}
              disabled={isSubmitting}
              error={Boolean(errors.tipoCuenta)}
              className="h-9 text-sm"
            />
            {errors.tipoCuenta && (
              <p className="text-xs text-destructive">
                {errors.tipoCuenta.message}
              </p>
            )}
          </div>

          {/* Nombre de la Cuenta */}
          <div className="space-y-2">
            <Label htmlFor="nombreCuenta" className="font-medium">
              Titular / Nombre de Cuenta <span className="text-xs text-muted-foreground">(Opcional)</span>
            </Label>
            <Input
              id="nombreCuenta"
              placeholder="Ej: Clínica Central S.A.C."
              {...register("nombreCuenta")}
              className="h-9 text-sm"
              disabled={isSubmitting}
            />
            {errors.nombreCuenta && (
              <p className="text-xs text-destructive">
                {errors.nombreCuenta.message}
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
              <span>{isEditing ? "Guardar Cambios" : "Agregar Cuenta"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
