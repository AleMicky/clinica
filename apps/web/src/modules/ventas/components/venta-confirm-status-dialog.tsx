"use client";

import * as React from "react";
import { Loader2, CheckCircle2, DollarSign, XCircle, Clock, Send } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  EstadoVenta,
  EstadoVentaLabels,
  type VentaResponse,
} from "../types/ventas.types";

export interface VentaConfirmStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venta: VentaResponse | null;
  targetEstado: EstadoVenta | null;
  motivo?: string;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

export function VentaConfirmStatusDialog({
  open,
  onOpenChange,
  venta,
  targetEstado,
  onConfirm,
  isLoading = false,
}: VentaConfirmStatusDialogProps) {
  if (!venta || targetEstado === null) return null;

  const targetLabel = EstadoVentaLabels[targetEstado];

  let icon = <CheckCircle2 className="size-5 text-emerald-600" />;
  let mediaClass = "bg-emerald-500/10 text-emerald-600";
  let buttonClass = "bg-emerald-600 hover:bg-emerald-700 text-white";
  let confirmText = `Sí, Marcar Pagada`;

  if (targetEstado === EstadoVenta.PendienteCobro) {
    icon = <Send className="size-5 text-indigo-600" />;
    mediaClass = "bg-indigo-500/10 text-indigo-600";
    buttonClass = "bg-indigo-600 hover:bg-indigo-700 text-white";
    confirmText = `Sí, Enviar a Cobro`;
  } else if (targetEstado === EstadoVenta.ParcialmentePagada) {
    icon = <DollarSign className="size-5 text-blue-600" />;
    mediaClass = "bg-blue-500/10 text-blue-600";
    buttonClass = "bg-blue-600 hover:bg-blue-700 text-white";
    confirmText = `Sí, Pago Parcial`;
  } else if (targetEstado === EstadoVenta.Anulada) {
    icon = <XCircle className="size-5 text-rose-600" />;
    mediaClass = "bg-rose-500/10 text-rose-600";
    buttonClass = "bg-rose-600 hover:bg-rose-700 text-white";
    confirmText = `Sí, Anular Venta`;
  } else if (targetEstado === EstadoVenta.Pendiente) {
    icon = <Clock className="size-5 text-amber-600" />;
    mediaClass = "bg-amber-500/10 text-amber-600";
    buttonClass = "bg-amber-600 hover:bg-amber-700 text-white";
    confirmText = `Sí, Marcar Pendiente`;
  }

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogMedia className={mediaClass}>
            {icon}
          </AlertDialogMedia>
          <AlertDialogTitle className="text-base font-bold">
            {targetEstado === EstadoVenta.Pagada
              ? "¿Confirmar Pago de la Venta?"
              : targetEstado === EstadoVenta.Anulada
              ? "¿Anular Comprobante de Venta?"
              : "¿Cambiar Estado de la Venta?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground space-y-1.5">
            <span className="block">
              ¿Está seguro de cambiar el estado de la venta{" "}
              <strong className="font-mono font-bold text-foreground">#{venta.numero}</strong> a{" "}
              <strong className="font-bold text-foreground">"{targetLabel}"</strong>?
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Total: <span className="font-mono font-bold text-foreground">Bs. {venta.total.toFixed(2)}</span>
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Volver
          </AlertDialogCancel>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`text-xs font-semibold gap-2 ${buttonClass}`}
          >
            {isLoading && <Loader2 className="size-3.5 animate-spin" />}
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
