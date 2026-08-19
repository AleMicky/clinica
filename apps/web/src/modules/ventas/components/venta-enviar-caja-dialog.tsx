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
import { CreditCard, Loader2, Send, Store, AlertCircle } from "lucide-react";
import { type VentaResponse } from "../types/ventas.types";
import { useCajas } from "@/modules/cajas/caja/hooks/use-cajas";

interface VentaEnviarCajaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venta: VentaResponse | null;
  onConfirm: (cajaId: number, motivo?: string) => Promise<void>;
  isLoading?: boolean;
}

export function VentaEnviarCajaDialog({
  open,
  onOpenChange,
  venta,
  onConfirm,
  isLoading = false,
}: VentaEnviarCajaDialogProps) {
  const [selectedCajaId, setSelectedCajaId] = React.useState<number | null>(null);
  const [motivo, setMotivo] = React.useState("");

  const { data: cajasData, isLoading: isLoadingCajas } = useCajas(
    { pageSize: 50 },
    open
  );

  const cajas = cajasData?.items?.filter((c) => c.activo) ?? [];

  React.useEffect(() => {
    if (open) {
      setMotivo("");
      if (cajas.length > 0) {
        setSelectedCajaId(cajas[0].id);
      } else {
        setSelectedCajaId(null);
      }
    }
  }, [open, cajasData]);

  // Si no hay caja seleccionada por defecto pero cargaron cajas
  React.useEffect(() => {
    if (open && !selectedCajaId && cajas.length > 0) {
      setSelectedCajaId(cajas[0].id);
    }
  }, [open, selectedCajaId, cajas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCajaId) return;
    await onConfirm(selectedCajaId, motivo.trim() || undefined);
    onOpenChange(false);
  };

  if (!venta) return null;

  const pacienteNombre = venta.paciente?.nombreCompleto || "Paciente";
  const monedaSimbolo =
    venta.moneda?.simbolo || (venta.moneda?.codigo === "USD" ? "$" : "Bs.");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full border-border/80 shadow-xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-xs">
              <Send className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Enviar Venta #{venta.numero} a Caja
              </DialogTitle>
              <DialogDescription className="text-xs">
                Asignar la venta a una caja para que el cajero proceda con el cobro.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1.5">
          {/* Tarjeta de Resumen de la Venta */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border/60 space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Paciente:</span>
              <strong className="text-foreground">{pacienteNombre}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Admisión:</span>
              <span className="font-mono text-muted-foreground font-medium">
                #{venta.admisionId}
              </span>
            </div>
            <div className="pt-1.5 border-t border-border/40 flex justify-between items-center">
              <span className="font-bold text-foreground">Total a Cobrar:</span>
              <span className="text-sm font-extrabold text-primary font-mono">
                {monedaSimbolo} {venta.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Selector de Caja */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Store className="size-3.5 text-indigo-600" />
              Seleccionar Caja de Destino <span className="text-rose-500">*</span>
            </Label>

            {isLoadingCajas ? (
              <div className="h-9 rounded-md border border-input bg-muted/30 px-3 flex items-center text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin mr-2" />
                Cargando cajas disponibles...
              </div>
            ) : cajas.length === 0 ? (
              <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>No se encontraron cajas activas registradas en el sistema.</span>
              </div>
            ) : (
              <Select
                value={selectedCajaId ? selectedCajaId.toString() : ""}
                onValueChange={(val) => setSelectedCajaId(Number(val))}
              >
                <SelectTrigger className="w-full h-9 text-xs bg-background">
                  <SelectValue placeholder="Seleccionar una caja...">
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

          {/* Motivo u observación opcional */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Nota u Observación <span className="text-muted-foreground font-normal">(Opcional)</span>
            </Label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Instrucciones para el cajero o notas de la venta..."
              rows={2}
              className="text-xs bg-background resize-none"
            />
          </div>

          {/* Nota informativa */}
          <div className="p-2.5 bg-indigo-500/5 dark:bg-indigo-950/20 rounded-lg border border-indigo-500/20 text-[11px] text-muted-foreground flex items-start gap-2">
            <CreditCard className="size-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Al enviar la venta a caja, el estado cambiará a <strong>"Pendiente de Cobro"</strong> y se generará la orden de cobro en el turno abierto de la caja seleccionada.
            </span>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-8 text-xs cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !selectedCajaId || cajas.length === 0}
              className="h-8 text-xs font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
            >
              {isLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Enviar a Caja
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
