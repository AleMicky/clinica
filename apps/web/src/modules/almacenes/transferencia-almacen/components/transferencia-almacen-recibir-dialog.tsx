"use client";

import * as React from "react";
import { toast } from "sonner";
import { PackageCheck, Loader2 } from "lucide-react";
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
import {
  useRecibirTransferenciaAlmacen,
  useTransferenciaAlmacen,
} from "../hooks/use-transferencia-almacen";
import type { TransferenciaAlmacenResponse } from "../types/transferencia-almacen.types";

interface TransferenciaAlmacenRecibirDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transferenciaToRecibir?: TransferenciaAlmacenResponse | null;
  onSuccessCallback?: () => void;
}

export function TransferenciaAlmacenRecibirDialog({
  open,
  onOpenChange,
  transferenciaToRecibir,
  onSuccessCallback,
}: TransferenciaAlmacenRecibirDialogProps) {
  const { data: fullTransferencia } = useTransferenciaAlmacen(
    transferenciaToRecibir?.id ?? 0,
    open && Boolean(transferenciaToRecibir?.id)
  );

  const [cantidades, setCantidades] = React.useState<Record<number, number>>({});
  const recibirMutation = useRecibirTransferenciaAlmacen();

  const target = fullTransferencia || transferenciaToRecibir;

  React.useEffect(() => {
    if (target?.detalles) {
      const initial: Record<number, number> = {};
      target.detalles.forEach((d) => {
        initial[d.id] = Number(d.cantidadDespachada);
      });
      setCantidades(initial);
    }
  }, [target]);

  const handleCantidadChange = (detalleId: number, val: number) => {
    setCantidades((prev) => ({
      ...prev,
      [detalleId]: val,
    }));
  };

  const handleRecibir = async () => {
    if (!target) return;

    const payload = {
      cantidades: Object.entries(cantidades).map(([id, qty]) => ({
        detalleId: Number(id),
        cantidad: Number(qty),
      })),
    };

    try {
      await recibirMutation.mutateAsync({
        id: target.id,
        data: payload,
      });
      toast.success(
        `Transferencia "${target.numero}" recibida. Stock ingresado en destino.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al recibir la transferencia.";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-5">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <PackageCheck className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                Recibir Transferencia (Entrada)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                Confirma la recepción e ingreso físico al almacén{" "}
                <span className="font-semibold text-foreground">
                  {target?.almacenDestinoNombre}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 space-y-3">
          <div className="rounded-md border border-border/50 overflow-hidden bg-card text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/40 border-b border-border/50 text-[10px] text-muted-foreground font-semibold">
                  <th className="px-2.5 py-1.5">Producto</th>
                  <th className="px-2.5 py-1.5 w-24 text-right">Despachado</th>
                  <th className="px-2.5 py-1.5 w-28 text-right">Recibido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {(target?.detalles || []).map((d) => (
                  <tr key={d.id}>
                    <td className="px-2.5 py-1.5 font-medium">
                      {d.productoNombre || `ID: ${d.productoId}`}
                    </td>
                    <td className="px-2.5 py-1.5 text-right font-mono text-muted-foreground">
                      {Number(d.cantidadDespachada)}
                    </td>
                    <td className="px-2.5 py-1.5 text-right">
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={cantidades[d.id] ?? d.cantidadDespachada}
                        onChange={(e) =>
                          handleCantidadChange(d.id, Number(e.target.value))
                        }
                        className="h-7 text-xs font-mono text-right"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border/40 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={recibirMutation.isPending}
            className="h-7 text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleRecibir}
            disabled={recibirMutation.isPending}
            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-medium"
          >
            {recibirMutation.isPending ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Recibiendo...</span>
              </>
            ) : (
              <span>Confirmar Recepción</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
