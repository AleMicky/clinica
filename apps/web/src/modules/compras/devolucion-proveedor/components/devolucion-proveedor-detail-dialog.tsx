"use client";

import * as React from "react";
import {
  Undo2,
  Building2,
  Warehouse,
  Calendar,
  Printer,
  CheckCircle2,
  XCircle,
  Ban,
  Send,
  Package,
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
  EstadoDevolucionProveedor,
  type DevolucionProveedorResponse,
} from "../types/devolucion-proveedor.types";
import { useDevolucionProveedor } from "../hooks/use-devolucion-proveedor";
import { getEstadoBadge } from "./devolucion-proveedor-list";

interface DevolucionProveedorDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devolucionId?: number | null;
  onSendApproval?: (devolucion: DevolucionProveedorResponse) => void;
  onApprove?: (devolucion: DevolucionProveedorResponse) => void;
  onReject?: (devolucion: DevolucionProveedorResponse) => void;
  onConfirm?: (devolucion: DevolucionProveedorResponse) => void;
  onAnular?: (devolucion: DevolucionProveedorResponse) => void;
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

export function DevolucionProveedorDetailDialog({
  open,
  onOpenChange,
  devolucionId,
  onSendApproval,
  onApprove,
  onReject,
  onConfirm,
  onAnular,
}: DevolucionProveedorDetailDialogProps) {
  const { data: devolucion, isLoading } = useDevolucionProveedor(
    devolucionId ?? 0,
    open && Boolean(devolucionId)
  );

  const handlePrint = () => {
    window.print();
  };

  const isBorrador =
    devolucion?.estado === EstadoDevolucionProveedor.Borrador;
  const isPendiente =
    devolucion?.estado === EstadoDevolucionProveedor.PendienteAprobacion;
  const isAprobada =
    devolucion?.estado === EstadoDevolucionProveedor.Aprobada;
  const isConfirmada =
    devolucion?.estado === EstadoDevolucionProveedor.Confirmada;

  const totalUnidades = (devolucion?.detalles || []).reduce(
    (acc, d) => acc + (Number(d.cantidad) || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[94vh] flex flex-col p-4.5 overflow-hidden">
        {/* Header */}
        <DialogHeader className="pb-2.5 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 shadow-2xs">
                <Undo2 className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
                    Comprobante de Devolución
                  </DialogTitle>
                  {devolucion && getEstadoBadge(devolucion.estado)}
                </div>
                <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                  Número:{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {devolucion?.numero || "..."}
                  </span>
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Printer className="size-3.5" />
              <span>Imprimir</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Content Body */}
        {isLoading ? (
          <div className="flex-1 py-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg border border-border/40 bg-muted/20 space-y-1.5"
                >
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ) : !devolucion ? (
          <div className="flex-1 py-8 text-center text-xs text-muted-foreground">
            No se encontró la información de la devolución.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-4 text-xs">
            {/* Meta Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg border border-border/50 bg-card">
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <Building2 className="size-3 text-orange-500" />
                  Proveedor Destino
                </span>
                <p className="mt-0.5 font-semibold text-foreground truncate">
                  {devolucion.proveedorRazonSocial || "-"}
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-border/50 bg-card">
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <Warehouse className="size-3 text-orange-500" />
                  Almacén Origen
                </span>
                <p className="mt-0.5 font-semibold text-foreground truncate">
                  {devolucion.almacenNombre || "-"}
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-border/50 bg-card">
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <Calendar className="size-3 text-orange-500" />
                  Fecha Emisión
                </span>
                <p className="mt-0.5 font-semibold text-foreground">
                  {formatDate(devolucion.fecha)}
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-border/50 bg-card">
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <Package className="size-3 text-orange-500" />
                  Total Unidades
                </span>
                <p className="mt-0.5 font-mono font-bold text-foreground">
                  {totalUnidades.toLocaleString("es-ES")}
                </p>
              </div>
            </div>

            {/* Motivo y Observaciones */}
            <div className="p-3 rounded-lg border border-border/40 bg-muted/20 space-y-1.5">
              <p>
                <strong className="text-foreground">Motivo General:</strong>{" "}
                <span className="text-foreground font-medium">
                  {devolucion.motivo}
                </span>
              </p>
              {devolucion.recepcionCompraNumero && (
                <p>
                  <strong className="text-foreground">
                    Recepción Vinculada:
                  </strong>{" "}
                  <span className="font-mono text-muted-foreground">
                    {devolucion.recepcionCompraNumero}
                  </span>
                </p>
              )}
              {devolucion.movimientoInventarioId && (
                <p>
                  <strong className="text-foreground">
                    Movimiento de Salida:
                  </strong>{" "}
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    #{devolucion.movimientoInventarioId} (Stock descontado)
                  </span>
                </p>
              )}
              {devolucion.observacion && (
                <p>
                  <strong className="text-foreground">Observaciones:</strong>{" "}
                  <span className="text-muted-foreground">
                    {devolucion.observacion}
                  </span>
                </p>
              )}
            </div>

            {/* Products Table */}
            <div className="border border-border/60 rounded-lg overflow-hidden bg-card shadow-2xs">
              <div className="bg-muted/40 px-3 py-2 border-b border-border/60 flex items-center justify-between">
                <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                  <Package className="size-3.5 text-orange-500" />
                  Detalle de Artículos a Devolver
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {devolucion.detalles?.length || 0} items
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] text-muted-foreground uppercase bg-muted/20 border-b border-border/40">
                    <tr>
                      <th className="px-3 py-1.5 font-medium">#</th>
                      <th className="px-3 py-1.5 font-medium">Código</th>
                      <th className="px-3 py-1.5 font-medium">Producto</th>
                      <th className="px-3 py-1.5 font-medium">Lote</th>
                      <th className="px-3 py-1.5 font-medium text-center">
                        Cantidad
                      </th>
                      <th className="px-3 py-1.5 font-medium">Causa Específica</th>
                      <th className="px-3 py-1.5 font-medium">Observación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {(devolucion.detalles || []).map((det, idx) => (
                      <tr key={det.id || idx} className="hover:bg-muted/20">
                        <td className="px-3 py-2 text-muted-foreground font-mono text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                          {det.productoCodigo || "-"}
                        </td>
                        <td className="px-3 py-2 font-medium text-foreground">
                          {det.productoNombre || `Producto #${det.productoId}`}
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px]">
                          {det.loteNumero || "-"}
                        </td>
                        <td className="px-3 py-2 text-center font-mono font-bold text-orange-600 dark:text-orange-400">
                          {Number(det.cantidad).toLocaleString("es-ES")}
                        </td>
                        <td className="px-3 py-2 text-foreground text-[11px]">
                          {det.motivo || "-"}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground text-[11px]">
                          {det.observacion || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/30 border-t border-border/40 font-semibold">
                    <tr>
                      <td colSpan={4} className="px-3 py-2 text-right text-muted-foreground">
                        Total Unidades Devolución:
                      </td>
                      <td className="px-3 py-2 text-center font-mono font-bold text-foreground text-sm">
                        {totalUnidades.toLocaleString("es-ES")}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <DialogFooter className="pt-3 border-t border-border/40 shrink-0 flex justify-between items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-7.5 text-xs"
          >
            Cerrar
          </Button>

          <div className="flex items-center gap-1.5">
            {isBorrador && onSendApproval && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  if (devolucion) onSendApproval(devolucion);
                }}
                className="h-7.5 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1 font-medium"
              >
                <Send className="size-3" />
                <span>Enviar a Aprobación</span>
              </Button>
            )}

            {isPendiente && onApprove && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  if (devolucion) onApprove(devolucion);
                }}
                className="h-7.5 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1 font-medium"
              >
                <CheckCircle2 className="size-3" />
                <span>Aprobar Devolución</span>
              </Button>
            )}

            {isPendiente && onReject && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  if (devolucion) onReject(devolucion);
                }}
                className="h-7.5 text-xs text-rose-600 border-rose-500/30 hover:bg-rose-500/10 gap-1"
              >
                <XCircle className="size-3" />
                <span>Rechazar</span>
              </Button>
            )}

            {isAprobada && onConfirm && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  if (devolucion) onConfirm(devolucion);
                }}
                className="h-7.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-medium"
              >
                <CheckCircle2 className="size-3" />
                <span>Confirmar Salida de Stock</span>
              </Button>
            )}

            {isConfirmada && onAnular && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  if (devolucion) onAnular(devolucion);
                }}
                className="h-7.5 text-xs text-zinc-600 border-zinc-500/30 hover:bg-zinc-500/10 gap-1"
              >
                <Ban className="size-3" />
                <span>Anular Devolución</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
