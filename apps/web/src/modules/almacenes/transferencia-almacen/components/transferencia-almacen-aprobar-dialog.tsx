"use client";

import * as React from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
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
  useAprobarTransferenciaAlmacen,
  useTransferenciaAlmacen,
} from "../hooks/use-transferencia-almacen";
import type { TransferenciaAlmacenResponse } from "../types/transferencia-almacen.types";

interface TransferenciaAlmacenAprobarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transferenciaToAprobar?: TransferenciaAlmacenResponse | null;
  onSuccessCallback?: () => void;
}

export function TransferenciaAlmacenAprobarDialog({
  open,
  onOpenChange,
  transferenciaToAprobar,
  onSuccessCallback,
}: TransferenciaAlmacenAprobarDialogProps) {
  const { data: fullTransferencia } = useTransferenciaAlmacen(
    transferenciaToAprobar?.id ?? 0,
    open && Boolean(transferenciaToAprobar?.id)
  );

  const [cantidades, setCantidades] = React.useState<Record<number, number>>({});
  const aprobarMutation = useAprobarTransferenciaAlmacen();

  const target = fullTransferencia || transferenciaToAprobar;

  React.useEffect(() => {
    if (target?.detalles) {
      const initial: Record<number, number> = {};
      target.detalles.forEach((d) => {
        initial[d.id] = Number(d.cantidadSolicitada);
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

  const handleAprobar = async () => {
    if (!target) return;

    const payload = {
      cantidades: Object.entries(cantidades).map(([id, qty]) => ({
        detalleId: Number(id),
        cantidad: Number(qty),
      })),
    };

    try {
      await aprobarMutation.mutateAsync({
        id: target.id,
        data: payload,
      });
      toast.success(`Transferencia "${target.numero}" aprobada exitosamente.`);
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al aprobar la transferencia.";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-5">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                Aprobar Transferencia
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                Valida las cantidades aprobadas para traspaso
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
                  <th className="px-2.5 py-1.5 w-24 text-right">Solicitado</th>
                  <th className="px-2.5 py-1.5 w-28 text-right">Aprobar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {(target?.detalles || []).map((d) => (
                  <tr key={d.id}>
                    <td className="px-2.5 py-1.5 font-medium">
                      {d.productoNombre || `ID: ${d.productoId}`}
                    </td>
                    <td className="px-2.5 py-1.5 text-right font-mono text-muted-foreground">
                      {Number(d.cantidadSolicitada)}
                    </td>
                    <td className="px-2.5 py-1.5 text-right">
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={cantidades[d.id] ?? d.cantidadSolicitada}
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
            disabled={aprobarMutation.isPending}
            className="h-7 text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleAprobar}
            disabled={aprobarMutation.isPending}
            className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1 font-medium"
          >
            {aprobarMutation.isPending ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Aprobando...</span>
              </>
            ) : (
              <span>Confirmar Aprobación</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
