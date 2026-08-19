"use client";

import * as React from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Store } from "lucide-react";
import { EstadoVenta, type VentaResponse } from "../types/ventas.types";
import { VentaStatusBadge } from "./venta-status-badge";
import { useCajas } from "@/modules/cajas/caja/hooks/use-cajas";

interface VentaStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venta: VentaResponse | null;
  onConfirm: (
    targetEstado: EstadoVenta,
    motivo?: string,
    cajaId?: number
  ) => Promise<void>;
  isLoading?: boolean;
}

const ESTADO_TRANSITIONS: Record<EstadoVenta, EstadoVenta[]> = {
  [EstadoVenta.Pendiente]: [
    EstadoVenta.PendienteCobro,
    EstadoVenta.Anulada,
  ],
  [EstadoVenta.PendienteCobro]: [
    EstadoVenta.Anulada,
  ],
  [EstadoVenta.ParcialmentePagada]: [
    EstadoVenta.Anulada,
  ],
  [EstadoVenta.Pagada]: [
    EstadoVenta.Anulada,
  ],
  [EstadoVenta.Anulada]: [],
};

const ESTADO_LABELS: Record<EstadoVenta, string> = {
  [EstadoVenta.Pendiente]: "Pendiente",
  [EstadoVenta.PendienteCobro]: "Pendiente de Cobro (Enviar a Caja)",
  [EstadoVenta.ParcialmentePagada]: "Parcialmente Pagada",
  [EstadoVenta.Pagada]: "Pagada",
  [EstadoVenta.Anulada]: "Anulada",
};

export function VentaStatusDialog({
  open,
  onOpenChange,
  venta,
  onConfirm,
  isLoading = false,
}: VentaStatusDialogProps) {
  const [targetEstado, setTargetEstado] = React.useState<EstadoVenta | null>(null);
  const [selectedCajaId, setSelectedCajaId] = React.useState<number | null>(null);
  const [motivo, setMotivo] = React.useState("");

  const isSendingToCaja = targetEstado === EstadoVenta.PendienteCobro;
  const { data: cajasData, isLoading: isLoadingCajas } = useCajas(
    { pageSize: 50 },
    open && isSendingToCaja
  );

  const cajas = cajasData?.items?.filter((c) => c.activo) ?? [];

  const allowedTransitions = venta ? ESTADO_TRANSITIONS[venta.estado] || [] : [];

  React.useEffect(() => {
    if (open && allowedTransitions.length > 0) {
      setTargetEstado(allowedTransitions[0]);
      setMotivo("");
    }
  }, [open, venta]);

  React.useEffect(() => {
    if (open && isSendingToCaja && cajas.length > 0 && !selectedCajaId) {
      setSelectedCajaId(cajas[0].id);
    }
  }, [open, isSendingToCaja, cajas, selectedCajaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEstado) return;
    if (isSendingToCaja && !selectedCajaId) return;

    await onConfirm(
      targetEstado,
      motivo.trim() || undefined,
      isSendingToCaja && selectedCajaId ? selectedCajaId : undefined
    );
    onOpenChange(false);
  };

  if (!venta) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full border-border/80 shadow-xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <RefreshCw className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Cambiar Estado de Venta #{venta.numero}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Actualizar la condición de pago o estado comercial del comprobante.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="p-3 bg-muted/40 rounded-lg border border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Estado Actual:</span>
            <VentaStatusBadge estado={venta.estado} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Nuevo Estado Destino <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={targetEstado ? targetEstado.toString() : ""}
              onValueChange={(val) => setTargetEstado(Number(val) as EstadoVenta)}
            >
              <SelectTrigger className="h-9 text-xs bg-background">
                <SelectValue placeholder="Seleccionar nuevo estado..." />
              </SelectTrigger>
              <SelectContent>
                {allowedTransitions.map((est) => (
                  <SelectItem key={est} value={est.toString()} className="text-xs">
                    {ESTADO_LABELS[est]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isSendingToCaja && (
            <div className="space-y-1.5 p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/5">
              <Label className="text-xs font-semibold flex items-center gap-1.5 text-indigo-950 dark:text-indigo-200">
                <Store className="size-3.5 text-indigo-600" />
                Caja Receptora <span className="text-rose-500">*</span>
              </Label>
              {isLoadingCajas ? (
                <div className="h-9 rounded-md border border-input bg-muted/30 px-3 flex items-center text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin mr-2" />
                  Cargando cajas...
                </div>
              ) : cajas.length === 0 ? (
                <div className="p-2 rounded border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-1.5">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>No hay cajas activas registradas.</span>
                </div>
              ) : (
                <Select
                  value={selectedCajaId ? selectedCajaId.toString() : ""}
                  onValueChange={(val) => setSelectedCajaId(Number(val))}
                >
                  <SelectTrigger className="w-full h-9 text-xs bg-background">
                    <SelectValue placeholder="Seleccionar caja de destino...">
                      {selectedCajaId
                        ? (() => {
                            const c = cajas.find((x) => x.id === selectedCajaId);
                            return c ? `${c.nombre}${c.codigo ? ` (${c.codigo})` : ""}` : undefined;
                          })()
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {cajas.map((caja) => (
                      <SelectItem
                        key={caja.id}
                        value={caja.id.toString()}
                        className="text-xs cursor-pointer"
                      >
                        {caja.nombre}{caja.codigo ? ` (${caja.codigo})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Motivo / Observación</Label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Indique la justificación del cambio de estado o datos del cobro..."
              rows={3}
              className="text-xs bg-background resize-none"
            />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-8 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !targetEstado}
              className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground"
            >
              {isLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="size-3.5" />
              )}
              Confirmar Cambio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
