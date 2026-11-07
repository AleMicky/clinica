"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { CreditCard, Loader2, Coins, PackageCheck, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  useRegistrarCobroDispensacion,
  useEntregarMedicamentosDispensacion,
} from "../hooks/use-dispensacion";
import { useMetodosPago } from "@/modules/parametros/metodo-pago/hooks/use-metodos-pago";
import type { DispensacionResponse } from "../types/dispensacion.types";
import { getApiErrorMessage } from "@/lib/api/api-error";

interface DispensacionCobrarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispensacion: DispensacionResponse | null;
  onSuccessCallback?: () => void;
}

interface FormValues {
  metodoPago: string;
  comprobanteCobro?: string;
  entregarInmediatamente: boolean;
}

export function DispensacionCobrarDialog({
  open,
  onOpenChange,
  dispensacion,
  onSuccessCallback,
}: Readonly<DispensacionCobrarDialogProps>) {
  const cobrarMutation = useRegistrarCobroDispensacion();
  const entregarMutation = useEntregarMedicamentosDispensacion();
  const { data: metodosData, isLoading: isLoadingMetodos } = useMetodosPago(
    { page: 1, pageSize: 100 },
    open
  );

  const metodosPago = React.useMemo(
    () => metodosData?.items?.filter((m) => m.activo) ?? [],
    [metodosData?.items]
  );

  const defaultMetodoPago = React.useMemo(() => {
    if (metodosPago.length === 0) return "Efectivo";
    const efectivo = metodosPago.find(
      (m) =>
        m.codigo.toLowerCase().includes("efectivo") ||
        m.nombre.toLowerCase().includes("efectivo")
    );
    return (efectivo ?? metodosPago[0]).nombre;
  }, [metodosPago]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      metodoPago: "Efectivo",
      comprobanteCobro: "",
      entregarInmediatamente: true,
    },
  });

  const metodoPagoSeleccionado = useWatch({
    control,
    name: "metodoPago",
  });

  const entregarInmediatamente = useWatch({
    control,
    name: "entregarInmediatamente",
  });

  const metodoSeleccionadoObj = React.useMemo(
    () =>
      metodosPago.find(
        (m) =>
          m.nombre === metodoPagoSeleccionado ||
          m.codigo === metodoPagoSeleccionado
      ),
    [metodosPago, metodoPagoSeleccionado]
  );

  const requiereReferencia = Boolean(metodoSeleccionadoObj?.requiereReferencia);

  React.useEffect(() => {
    if (!requiereReferencia) {
      setValue("comprobanteCobro", "");
    }
  }, [requiereReferencia, setValue]);

  React.useEffect(() => {
    if (open) {
      reset({
        metodoPago: defaultMetodoPago,
        comprobanteCobro: "",
        entregarInmediatamente: true,
      });
    }
  }, [open, reset, defaultMetodoPago]);

  React.useEffect(() => {
    if (
      open &&
      metodosPago.length > 0 &&
      !metodosPago.some((m) => m.nombre === metodoPagoSeleccionado)
    ) {
      setValue("metodoPago", defaultMetodoPago);
    }
  }, [open, metodosPago, metodoPagoSeleccionado, defaultMetodoPago, setValue]);

  if (!dispensacion) return null;

  const onSubmit = async (values: FormValues) => {
    try {
      const cobrada = await cobrarMutation.mutateAsync({
        id: dispensacion.id,
        data: {
          metodoPago: values.metodoPago,
          comprobanteCobro: requiereReferencia
            ? values.comprobanteCobro?.trim() || undefined
            : undefined,
          montoCobrado: dispensacion.total,
        },
      });

      if (values.entregarInmediatamente) {
        const entregada = await entregarMutation.mutateAsync(dispensacion.id);
        toast.success(
          `Cobro (${cobrada.comprobanteCobro || "Caja"}) y entrega de "${dispensacion.numero}" completados. Movimiento ${entregada.movimientoInventarioNumero || `#${entregada.movimientoInventarioId}`} generado en ${dispensacion.almacenNombre}.`
        );
      } else {
        toast.success(
          `Cobro de "${dispensacion.numero}" (${cobrada.comprobanteCobro || "Caja"}) registrado exitosamente en turno de caja. Orden lista para entrega física.`
        );
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-5">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <CreditCard className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Cobro en Caja • Ticket {dispensacion.numero}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Confirma el cobro en el turno de caja activo (`ING-FAR`) y autoriza el despacho de almacén.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 py-2">
          <div className="p-3 bg-muted/30 border border-border/60 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold block">
                Monto a Cobrar
              </span>
              <span className="text-[11px] text-muted-foreground">
                {dispensacion.pacienteNombre || dispensacion.clienteNombre || "Cliente Particular"}
              </span>
            </div>
            <span className="font-mono text-xl font-bold text-teal-600 dark:text-teal-400">
              Bs. {dispensacion.total.toFixed(2)}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Método de Pago</Label>
              {isLoadingMetodos && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" />
                  Cargando...
                </span>
              )}
              {!isLoadingMetodos && metodoSeleccionadoObj && (
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {metodoSeleccionadoObj.codigo}
                </span>
              )}
            </div>
            <select
              {...register("metodoPago")}
              disabled={isLoadingMetodos}
              className="mt-1 w-full h-8 px-2 text-xs rounded-md border border-border/60 bg-background text-foreground disabled:opacity-60"
            >
              {metodosPago.length > 0 ? (
                metodosPago.map((metodo) => (
                  <option key={metodo.id} value={metodo.nombre}>
                    {metodo.nombre}
                  </option>
                ))
              ) : (
                <>
                  <option value="Efectivo">Efectivo</option>
                  <option value="QR">Pago QR</option>
                  <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  <option value="Transferencia">Transferencia Bancaria</option>
                </>
              )}
            </select>
          </div>

          {requiereReferencia && (
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  N° de Referencia / Comprobante de Pago
                </Label>
                <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                  Requiere referencia
                </span>
              </div>
              <Input
                {...register("comprobanteCobro")}
                placeholder="Ingrese N° de referencia / comprobante de pago"
                className="mt-1 h-8 text-xs font-mono"
              />
            </div>
          )}

          <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-emerald-500/25 bg-emerald-500/5 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("entregarInmediatamente")}
              className="mt-0.5 size-4 rounded border-border accent-emerald-600 cursor-pointer"
            />
            <div className="space-y-0.5 text-xs">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <PackageCheck className="size-3.5 text-emerald-600" />
                <span>Despachar medicamentos y descontar existencia ahora</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Genera automáticamente el <strong>Movimiento de Inventario</strong> de salida en{" "}
                <strong>{dispensacion.almacenNombre}</strong> y actualiza el Kárdex y lotes.
              </p>
            </div>
          </label>

          <div className="p-2 rounded-md bg-muted/40 border border-border/50 text-[11px] text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-teal-600 shrink-0" />
            <span>
              Sincronizado con <strong>/caja/cobros</strong> y <strong>/caja/movimientos</strong>.
            </span>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Coins className="size-3.5" />
                  <span>
                    {entregarInmediatamente
                      ? "Cobrar y Despachar Stock"
                      : "Confirmar Pago en Caja"}
                  </span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
