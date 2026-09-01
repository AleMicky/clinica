"use client";

import * as React from "react";
import { toast } from "sonner";
import { Truck, Loader2 } from "lucide-react";
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
  useDespacharTransferenciaAlmacen,
  useTransferenciaAlmacen,
} from "../hooks/use-transferencia-almacen";
import type { TransferenciaAlmacenResponse } from "../types/transferencia-almacen.types";

interface TransferenciaAlmacenDespacharDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transferenciaToDespachar?: TransferenciaAlmacenResponse | null;
  onSuccessCallback?: () => void;
}

export function TransferenciaAlmacenDespacharDialog({
  open,
  onOpenChange,
  transferenciaToDespachar,
  onSuccessCallback,
}: TransferenciaAlmacenDespacharDialogProps) {
  const { data: fullTransferencia } = useTransferenciaAlmacen(
    transferenciaToDespachar?.id ?? 0,
    open && Boolean(transferenciaToDespachar?.id)
  );

  const [cantidades, setCantidades] = React.useState<Record<number, number>>({});
  const despacharMutation = useDespacharTransferenciaAlmacen();

  const target = fullTransferencia || transferenciaToDespachar;

  React.useEffect(() => {
    if (target?.detalles) {
      const initial: Record<number, number> = {};
      target.detalles.forEach((d) => {
        initial[d.id] = Number(d.cantidadAprobada || d.cantidadSolicitada);
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

  const handleDespachar = async () => {
    if (!target) return;

    const payload = {
      cantidades: Object.entries(cantidades).map(([id, qty]) => ({
        detalleId: Number(id),
        cantidad: Number(qty),
      })),
    };

    try {
      await despacharMutation.mutateAsync({
        id: target.id,
        data: payload,
      });
      toast.success(
        `Transferencia "${target.numero}" despachada. Stock descontado en origen.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al despachar la transferencia.";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-5">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Truck className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                Despachar Transferencia (Salida)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                Confirma la salida física de mercadería de{" "}
                <span className="font-semibold text-foreground">
                  {target?.almacenOrigenNombre}
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
                  <th className="px-2.5 py-1.5 w-24 text-right">Aprobado</th>
                  <th className="px-2.5 py-1.5 w-28 text-right">A Despachar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {(target?.detalles || []).map((d) => (
                  <tr key={d.id}>
                    <td className="px-2.5 py-1.5 font-medium">
                      {d.productoNombre || `ID: ${d.productoId}`}
                    </td>
                    <td className="px-2.5 py-1.5 text-right font-mono text-muted-foreground">
                      {Number(d.cantidadAprobada)}
                    </td>
                    <td className="px-2.5 py-1.5 text-right">
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={cantidades[d.id] ?? d.cantidadAprobada}
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
            disabled={despacharMutation.isPending}
            className="h-7 text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleDespachar}
            disabled={despacharMutation.isPending}
            className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1 font-medium"
          >
            {despacharMutation.isPending ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Despachando...</span>
              </>
            ) : (
              <span>Confirmar Despacho</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
