"use client";

import * as React from "react";
import {
  Warehouse,
  Calendar,
  CheckCircle2,
  Clock,
  Ban,
  FileText,
  AlertTriangle,
  Printer,
  User,
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
  EstadoMovimientoInventario,
  type MovimientoInventarioResponse,
} from "../types/movimiento-inventario.types";
import { useMovimientoInventario } from "../hooks/use-movimiento-inventario";

interface MovimientoInventarioDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimientoId?: number | null;
  onConfirm?: (movimiento: MovimientoInventarioResponse) => void;
  onAnular?: (movimiento: MovimientoInventarioResponse) => void;
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

export function MovimientoInventarioDetailDialog({
  open,
  onOpenChange,
  movimientoId,
  onConfirm,
  onAnular,
}: MovimientoInventarioDetailDialogProps) {
  const { data: movimiento, isLoading } = useMovimientoInventario(
    movimientoId ?? 0,
    open && Boolean(movimientoId)
  );

  const handlePrint = () => {
    window.print();
  };

  const isBorrador = movimiento?.estado === EstadoMovimientoInventario.Borrador;
  const isConfirmado =
    movimiento?.estado === EstadoMovimientoInventario.Confirmado;
  const isAnulado = movimiento?.estado === EstadoMovimientoInventario.Anulado;

  const totalCostoGeneral = (movimiento?.detalles || []).reduce(
    (acc, d) => acc + (Number(d.costoTotal) || 0),
    0
  );

  const totalUnidades = (movimiento?.detalles || []).reduce(
    (acc, d) => acc + (Number(d.cantidad) || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-4.5 overflow-hidden">
        {/* Dialog Header */}
        <DialogHeader className="pb-2.5 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                <FileText className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
                    Comprobante de Movimiento
                  </DialogTitle>
                  {movimiento && (
                    <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-muted text-foreground">
                      {movimiento.numero}
                    </span>
                  )}
                </div>
                <DialogDescription className="text-[11px] text-muted-foreground">
                  Líneas de detalle e información registrada en almacén
                </DialogDescription>
              </div>
            </div>

            {movimiento && (
              <div>
                {isBorrador && (
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 font-semibold text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 gap-1"
                  >
                    <Clock className="size-2.5" />
                    Borrador
                  </Badge>
                )}
                {isConfirmado && (
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1"
                  >
                    <CheckCircle2 className="size-2.5" />
                    Confirmado
                  </Badge>
                )}
                {isAnulado && (
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 font-semibold text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10 gap-1"
                  >
                    <Ban className="size-2.5" />
                    Anulado
                  </Badge>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Content Body */}
        {isLoading || !movimiento ? (
          <div className="flex flex-col gap-3 py-4">
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
            <Skeleton className="h-40 rounded-lg" />
          </div>
        ) : (
          <div className="flex flex-col gap-3 overflow-y-auto pr-1 py-1.5 flex-1 text-xs">
            {/* Anulation Warning Alert if Anulado */}
            {isAnulado && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertTriangle className="size-3.5 shrink-0 text-rose-500 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-xs">
                    Movimiento Anulado el {formatDate(movimiento.fechaAnulacion)}
                  </span>
                  <p className="text-[11px] opacity-90">
                    <strong>Motivo:</strong> {movimiento.motivoAnulacion || "No especificado"}
                  </p>
                </div>
              </div>
            )}

            {/* Confirmation Info if Confirmado */}
            {isConfirmado && movimiento.fechaConfirmacion && (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                <span className="text-[11px]">
                  Confirmado y aplicado al inventario el{" "}
                  <strong>{formatDate(movimiento.fechaConfirmacion)}</strong>
                </span>
              </div>
            )}

            {/* Header Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-muted/30 border border-border/50 rounded-lg p-2.5">
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground font-semibold uppercase">
                  Tipo de Movimiento
                </span>
                <span className="font-semibold text-foreground text-xs">
                  {movimiento.tipoMovimientoNombre || "-"}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground font-semibold uppercase">
                  Almacén
                </span>
                <div className="flex items-center gap-1 font-semibold text-foreground text-xs">
                  <Warehouse className="size-3 text-muted-foreground" />
                  <span>{movimiento.almacenNombre || "-"}</span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground font-semibold uppercase">
                  Fecha del Movimiento
                </span>
                <div className="flex items-center gap-1 text-foreground text-xs font-mono">
                  <Calendar className="size-3 text-muted-foreground" />
                  <span>{formatDate(movimiento.fechaMovimiento)}</span>
                </div>
              </div>

              {movimiento.referenciaTipo && (
                <div className="flex flex-col">
                  <span className="text-[9px] text-muted-foreground font-semibold uppercase">
                    Referencia
                  </span>
                  <span className="text-foreground text-xs font-medium">
                    {movimiento.referenciaTipo}{" "}
                    {movimiento.referenciaId ? `#${movimiento.referenciaId}` : ""}
                  </span>
                </div>
              )}

              {movimiento.observacion && (
                <div className="flex flex-col sm:col-span-2">
                  <span className="text-[9px] text-muted-foreground font-semibold uppercase">
                    Observación
                  </span>
                  <span className="text-foreground text-xs">
                    {movimiento.observacion}
                  </span>
                </div>
              )}
            </div>

            {/* Product Details Table */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                  Detalle de Artículos ({movimiento.detalles?.length || 0})
                </span>
              </div>

              <div className="rounded-lg border border-border/60 overflow-x-auto bg-card shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold text-[11px]">
                      <th className="px-2.5 py-1.5 w-8 text-center">#</th>
                      <th className="px-2.5 py-1.5">Producto</th>
                      <th className="px-2.5 py-1.5 w-24">Lote</th>
                      <th className="px-2.5 py-1.5 w-20 text-right">Cantidad</th>
                      <th className="px-2.5 py-1.5 w-24 text-right">Costo Unit.</th>
                      <th className="px-2.5 py-1.5 w-24 text-right">Costo Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {(movimiento.detalles || []).map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-muted/20">
                        <td className="px-2.5 py-1.5 text-center text-muted-foreground font-mono text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="px-2.5 py-1.5 font-medium text-foreground">
                          {item.productoNombre || `Producto #${item.productoId}`}
                        </td>
                        <td className="px-2.5 py-1.5 text-muted-foreground font-mono text-[10px]">
                          {item.loteNumero || (item.loteId ? `#${item.loteId}` : "-")}
                        </td>
                        <td className="px-2.5 py-1.5 text-right font-mono font-semibold text-foreground">
                          {Number(item.cantidad).toLocaleString("es-ES")}
                        </td>
                        <td className="px-2.5 py-1.5 text-right font-mono text-muted-foreground text-[11px]">
                          {item.costoUnitario !== null && item.costoUnitario !== undefined
                            ? `Bs. ${Number(item.costoUnitario).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : "-"}
                        </td>
                        <td className="px-2.5 py-1.5 text-right font-mono font-bold text-foreground">
                          Bs. {Number(item.costoTotal).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation Footer */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/40 text-xs">
                <span className="text-muted-foreground text-[11px]">
                  Unidades Totales:{" "}
                  <strong className="text-foreground font-mono">
                    {totalUnidades.toLocaleString("es-ES")}
                  </strong>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-muted-foreground text-[11px]">
                    Costo Total:
                  </span>
                  <span className="text-xs font-bold font-mono text-primary">
                    Bs. {totalCostoGeneral.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Audit / Creator Footer */}
            {(movimiento.creadoPor || movimiento.fechaCreacion) && (
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                <div className="flex items-center gap-1">
                  <User className="size-2.5" />
                  <span>Creado por: {movimiento.creadoPor || "Sistema"}</span>
                </div>
                <span>{formatDate(movimiento.fechaCreacion)}</span>
              </div>
            )}
          </div>
        )}

        {/* Dialog Actions */}
        <DialogFooter className="pt-2.5 border-t border-border/40 shrink-0 flex items-center justify-between sm:justify-between w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Printer className="size-3" />
            <span>Imprimir</span>
          </Button>

          <div className="flex items-center gap-1.5">
            {isBorrador && onConfirm && movimiento && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onConfirm(movimiento);
                }}
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 cursor-pointer shadow-xs font-medium"
              >
                <CheckCircle2 className="size-3" />
                <span>Confirmar Movimiento</span>
              </Button>
            )}

            {isConfirmado && onAnular && movimiento && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => {
                  onOpenChange(false);
                  onAnular(movimiento);
                }}
                className="h-7 text-xs gap-1 cursor-pointer shadow-xs font-medium"
              >
                <Ban className="size-3" />
                <span>Anular</span>
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
