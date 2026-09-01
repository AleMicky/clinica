"use client";

import * as React from "react";
import {
  SlidersHorizontal,
  Warehouse,
  Calendar,
  FileText,
  Printer,
  CheckCircle2,
  Ban,
  Tag,
  Boxes,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  EstadoAjusteInventario,
  TipoAjusteInventario,
  type AjusteInventarioResponse,
} from "../types/ajuste-inventario.types";
import { useAjusteInventario } from "../hooks/use-ajuste-inventario";
import {
  getEstadoAjusteBadge,
  getTipoAjusteBadge,
} from "./ajuste-inventario-list";

interface AjusteInventarioDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ajusteId?: number | null;
  onConfirm?: (ajuste: AjusteInventarioResponse) => void;
  onAnular?: (ajuste: AjusteInventarioResponse) => void;
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

export function AjusteInventarioDetailDialog({
  open,
  onOpenChange,
  ajusteId,
  onConfirm,
  onAnular,
}: AjusteInventarioDetailDialogProps) {
  const { data: ajuste, isLoading } = useAjusteInventario(
    ajusteId ?? 0,
    open && Boolean(ajusteId)
  );

  const handlePrint = () => {
    window.print();
  };

  const isBorrador = ajuste?.estado === EstadoAjusteInventario.Borrador;
  const isConfirmado = ajuste?.estado === EstadoAjusteInventario.Confirmado;
  const isAnulado = ajuste?.estado === EstadoAjusteInventario.Anulado;

  const totalCantidad = (ajuste?.detalles || []).reduce(
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
              <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                <FileText className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
                    Comprobante de Ajuste
                  </DialogTitle>
                  {ajuste && (
                    <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-muted text-foreground">
                      {ajuste.numero}
                    </span>
                  )}
                </div>
                <DialogDescription className="text-[11px] text-muted-foreground">
                  Información y productos regularizados en stock
                </DialogDescription>
              </div>
            </div>

            {ajuste && (
              <div className="flex items-center gap-1.5">
                {getTipoAjusteBadge(ajuste.tipo)}
                {getEstadoAjusteBadge(ajuste.estado)}
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1 text-xs">
          {isLoading || !ajuste ? (
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
                      {ajuste.almacenNombre || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-md bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0">
                    <Calendar className="size-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Fecha del Ajuste
                    </span>
                    <p className="text-xs font-mono font-medium text-foreground">
                      {formatDate(ajuste.fecha)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-md bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0">
                    <Tag className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Motivo
                    </span>
                    <p className="text-xs font-medium text-foreground truncate">
                      {ajuste.motivo}
                    </p>
                  </div>
                </div>
              </div>

              {ajuste.observacion && (
                <div className="p-2.5 rounded-lg bg-card border border-border/40 text-xs">
                  <span className="font-semibold text-muted-foreground text-[10px] uppercase block mb-0.5">
                    Observaciones
                  </span>
                  <p className="text-foreground">{ajuste.observacion}</p>
                </div>
              )}

              {/* Items Table */}
              <div className="rounded-lg border border-border/60 overflow-hidden bg-card shadow-2xs">
                <div className="px-3 py-2 bg-muted/40 border-b border-border/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Artículos ({ajuste.detalles?.length || 0})
                  </span>
                </div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground font-semibold text-[10px]">
                      <th className="px-3 py-1.5 w-8">#</th>
                      <th className="px-3 py-1.5">Producto</th>
                      <th className="px-3 py-1.5 w-32 text-right">
                        Cantidad {ajuste.tipo === TipoAjusteInventario.Positivo ? "Ingresada (+)" : "Descontada (-)"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {(ajuste.detalles || []).map((item, idx) => (
                      <tr key={item.id} className="hover:bg-muted/10">
                        <td className="px-3 py-1.5 text-muted-foreground font-mono text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-1.5">
                          <span className="font-medium text-foreground">
                            {item.productoNombre || `ID: ${item.productoId}`}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono font-semibold">
                          <span
                            className={
                              ajuste.tipo === TipoAjusteInventario.Positivo
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-amber-600 dark:text-amber-400"
                            }
                          >
                            {ajuste.tipo === TipoAjusteInventario.Positivo ? "+" : "-"}
                            {Number(item.cantidad).toLocaleString("es-ES")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border/60 bg-muted/30 font-bold text-xs font-mono">
                      <td colSpan={2} className="px-3 py-2 text-right">
                        Total Ajustado:
                      </td>
                      <td className="px-3 py-2 text-right">
                        {totalCantidad.toLocaleString("es-ES")} u.
                      </td>
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
            <span>Imprimir</span>
          </Button>

          <div className="flex items-center gap-2">
            {ajuste && isConfirmado && onAnular && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAnular(ajuste)}
                className="h-7 text-xs text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer"
              >
                <Ban className="size-3" />
                <span>Anular</span>
              </Button>
            )}

            {ajuste && isBorrador && onConfirm && (
              <Button
                type="button"
                size="sm"
                onClick={() => onConfirm(ajuste)}
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 cursor-pointer font-medium"
              >
                <CheckCircle2 className="size-3" />
                <span>Confirmar Ajuste</span>
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
