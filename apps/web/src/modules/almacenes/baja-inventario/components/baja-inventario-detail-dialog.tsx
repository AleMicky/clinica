"use client";

import * as React from "react";
import {
  Trash2,
  Warehouse,
  Calendar,
  FileText,
  Printer,
  CheckCircle2,
  Ban,
  Tag,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  EstadoBajaInventario,
  type BajaInventarioResponse,
} from "../types/baja-inventario.types";
import { useBajaInventario } from "../hooks/use-baja-inventario";
import {
  getEstadoBajaBadge,
  getTipoBajaBadge,
} from "./baja-inventario-list";

interface BajaInventarioDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bajaId?: number | null;
  onConfirm?: (baja: BajaInventarioResponse) => void;
  onAnular?: (baja: BajaInventarioResponse) => void;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  } catch {
    return dateStr;
  }
}

export function BajaInventarioDetailDialog({
  open,
  onOpenChange,
  bajaId,
  onConfirm,
  onAnular,
}: BajaInventarioDetailDialogProps) {
  const { data: baja, isLoading } = useBajaInventario(
    bajaId ?? 0,
    open && Boolean(bajaId)
  );

  const handlePrint = () => {
    window.print();
  };

  const isBorrador = baja?.estado === EstadoBajaInventario.Borrador;
  const isConfirmado = baja?.estado === EstadoBajaInventario.Confirmado;

  const totalCantidad = (baja?.detalles || []).reduce(
    (acc, d) => acc + (Number(d.cantidad) || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-4.5 overflow-hidden">
        {/* Header */}
        <DialogHeader className="pb-2.5 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-2xs">
                <FileText className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
                    Comprobante de Baja de Inventario
                  </DialogTitle>
                  {baja && (
                    <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-muted text-foreground">
                      {baja.numero}
                    </span>
                  )}
                </div>
                <DialogDescription className="text-[11px] text-muted-foreground">
                  Detalle y justificación de existencias descartadas
                </DialogDescription>
              </div>
            </div>

            {baja && (
              <div className="flex items-center gap-1.5">
                {getTipoBajaBadge(baja.tipo)}
                {getEstadoBajaBadge(baja.estado)}
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1 text-xs">
          {isLoading || !baja ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-md bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0">
                    <Warehouse className="size-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Almacén
                    </span>
                    <p className="text-xs font-semibold text-foreground">
                      {baja.almacenNombre || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-md bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0">
                    <Calendar className="size-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Fecha de Baja
                    </span>
                    <p className="text-xs font-mono font-medium text-foreground">
                      {formatDate(baja.fecha)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-md bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0">
                    <Tag className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Motivo / Causa
                    </span>
                    <p className="text-xs font-medium text-foreground truncate">
                      {baja.motivo}
                    </p>
                  </div>
                </div>
              </div>

              {baja.observacion && (
                <div className="p-2.5 rounded-lg bg-card border border-border/40 text-xs">
                  <span className="font-semibold text-muted-foreground text-[10px] uppercase block mb-0.5">
                    Observaciones
                  </span>
                  <p className="text-foreground">{baja.observacion}</p>
                </div>
              )}

              {/* Items Table */}
              <div className="rounded-lg border border-border/60 overflow-hidden bg-card shadow-2xs">
                <div className="px-3 py-2 bg-muted/40 border-b border-border/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Artículos Descartados ({baja.detalles?.length || 0})
                  </span>
                </div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground font-semibold text-[10px]">
                      <th className="px-3 py-1.5 w-8">#</th>
                      <th className="px-3 py-1.5">Producto</th>
                      <th className="px-3 py-1.5 w-32 text-right">Cantidad</th>
                      <th className="px-3 py-1.5 min-w-36">Observación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {(baja.detalles || []).map((item, idx) => (
                      <tr key={item.id} className="hover:bg-muted/10">
                        <td className="px-3 py-1.5 text-muted-foreground font-mono text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-1.5">
                          <span className="font-medium text-foreground">
                            {item.productoNombre || `ID: ${item.productoId}`}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono font-semibold text-rose-600 dark:text-rose-400">
                          -{Number(item.cantidad).toLocaleString("es-ES")}
                        </td>
                        <td className="px-3 py-1.5 text-muted-foreground text-[11px]">
                          {item.observacion || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border/60 bg-muted/30 font-bold text-xs font-mono">
                      <td colSpan={2} className="px-3 py-2 text-right">
                        Total Descartado:
                      </td>
                      <td className="px-3 py-2 text-right text-rose-600 dark:text-rose-400">
                        {totalCantidad.toLocaleString("es-ES")} u.
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="pt-2.5 border-t border-border/40 shrink-0 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-7 text-xs gap-1.5 cursor-pointer"
          >
            <Printer className="size-3" />
            <span>Imprimir Acta</span>
          </Button>

          <div className="flex items-center gap-2">
            {baja && isConfirmado && onAnular && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAnular(baja)}
                className="h-7 text-xs text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer"
              >
                <Ban className="size-3" />
                <span>Anular</span>
              </Button>
            )}

            {baja && isBorrador && onConfirm && (
              <Button
                type="button"
                size="sm"
                onClick={() => onConfirm(baja)}
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 cursor-pointer font-medium"
              >
                <CheckCircle2 className="size-3" />
                <span>Confirmar Baja</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-7 text-xs cursor-pointer"
            >
              Cerrar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
