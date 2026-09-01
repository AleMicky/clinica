"use client";

import * as React from "react";
import { toast } from "sonner";
import { Calculator, Loader2 } from "lucide-react";
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
  useInventarioFisico,
  useRegistrarConteoInventarioFisico,
} from "../hooks/use-inventario-fisico";
import type { InventarioFisicoResponse } from "../types/inventario-fisico.types";

interface InventarioFisicoRegistrarConteoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventarioToConteo?: InventarioFisicoResponse | null;
  onSuccessCallback?: () => void;
}

export function InventarioFisicoRegistrarConteoDialog({
  open,
  onOpenChange,
  inventarioToConteo,
  onSuccessCallback,
}: InventarioFisicoRegistrarConteoDialogProps) {
  const { data: fullInventario } = useInventarioFisico(
    inventarioToConteo?.id ?? 0,
    open && Boolean(inventarioToConteo?.id)
  );

  const [conteos, setConteos] = React.useState<Record<number, number>>({});
  const registrarMutation = useRegistrarConteoInventarioFisico();

  const target = fullInventario || inventarioToConteo;

  React.useEffect(() => {
    if (target?.detalles) {
      const initial: Record<number, number> = {};
      target.detalles.forEach((d) => {
        initial[d.id] =
          d.cantidadContada !== null && d.cantidadContada !== undefined
            ? Number(d.cantidadContada)
            : Number(d.cantidadSistema);
      });
      setConteos(initial);
    }
  }, [target]);

  const handleCantidadChange = (detalleId: number, val: number) => {
    setConteos((prev) => ({
      ...prev,
      [detalleId]: val,
    }));
  };

  const handleRegistrar = async () => {
    if (!target) return;

    const payload = {
      conteo: Object.entries(conteos).map(([id, qty]) => ({
        detalleId: Number(id),
        cantidadContada: Number(qty),
      })),
    };

    try {
      await registrarMutation.mutateAsync({
        id: target.id,
        data: payload,
      });
      toast.success(
        `Conteos físicos registrados para el inventario "${target.numero}".`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al registrar los conteos físicos.";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-5 max-h-[85vh] flex flex-col">
        <DialogHeader className="pb-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Calculator className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                Registrar Conteo Físico
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                Ingresa las cantidades reales contadas en anaquel
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1">
          <div className="rounded-md border border-border/50 overflow-hidden bg-card text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/40 border-b border-border/50 text-[10px] text-muted-foreground font-semibold">
                  <th className="px-2.5 py-1.5">Producto</th>
                  <th className="px-2.5 py-1.5 w-24 text-right">Sistema</th>
                  <th className="px-2.5 py-1.5 w-28 text-right">Contado Real</th>
                  <th className="px-2.5 py-1.5 w-24 text-right">Diferencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {(target?.detalles || []).map((d) => {
                  const contadoVal = conteos[d.id] ?? Number(d.cantidadSistema);
                  const diff = contadoVal - Number(d.cantidadSistema);

                  return (
                    <tr key={d.id}>
                      <td className="px-2.5 py-1.5 font-medium">
                        {d.productoNombre || `ID: ${d.productoId}`}
                      </td>
                      <td className="px-2.5 py-1.5 text-right font-mono text-muted-foreground">
                        {Number(d.cantidadSistema)}
                      </td>
                      <td className="px-2.5 py-1.5 text-right">
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          value={conteos[d.id] ?? ""}
                          onChange={(e) =>
                            handleCantidadChange(d.id, Number(e.target.value))
                          }
                          className="h-7 text-xs font-mono text-right"
                        />
                      </td>
                      <td
                        className={`px-2.5 py-1.5 text-right font-mono font-semibold ${
                          diff > 0
                            ? "text-emerald-600"
                            : diff < 0
                            ? "text-rose-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        {diff > 0 ? `+${diff}` : diff}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border/40 shrink-0 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={registrarMutation.isPending}
            className="h-7 text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleRegistrar}
            disabled={registrarMutation.isPending}
            className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1 font-medium"
          >
            {registrarMutation.isPending ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Guardando conteos...</span>
              </>
            ) : (
              <span>Guardar Conteos</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
