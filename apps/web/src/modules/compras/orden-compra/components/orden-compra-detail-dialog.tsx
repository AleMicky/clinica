"use client";

import * as React from "react";
import {
  ShoppingBag,
  Building2,
  Warehouse,
  Calendar,
  Printer,
  CheckCircle2,
  Send,
  Ban,
  PackageCheck,
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
  EstadoOrdenCompra,
  type OrdenCompraResponse,
} from "../types/orden-compra.types";
import { useOrdenCompra } from "../hooks/use-orden-compra";
import { getEstadoBadge } from "./orden-compra-list";

interface OrdenCompraDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ordenId?: number | null;
  onSendApproval?: (orden: OrdenCompraResponse) => void;
  onApprove?: (orden: OrdenCompraResponse) => void;
  onSendProveedor?: (orden: OrdenCompraResponse) => void;
  onCancel?: (orden: OrdenCompraResponse) => void;
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

function formatDateOnly(dateStr?: string | null) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  } catch {
    return dateStr;
  }
}

export function OrdenCompraDetailDialog({
  open,
  onOpenChange,
  ordenId,
  onSendApproval,
  onApprove,
  onSendProveedor,
  onCancel,
}: OrdenCompraDetailDialogProps) {
  const { data: orden, isLoading } = useOrdenCompra(
    ordenId ?? 0,
    open && Boolean(ordenId)
  );

  const handlePrint = () => {
    window.print();
  };

  const isBorrador = orden?.estado === EstadoOrdenCompra.Borrador;
  const isPendiente = orden?.estado === EstadoOrdenCompra.PendienteAprobacion;
  const isAprobada = orden?.estado === EstadoOrdenCompra.Aprobada;
  const isCancelable =
    isBorrador ||
    isPendiente ||
    isAprobada ||
    orden?.estado === EstadoOrdenCompra.EnviadaProveedor;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[94vh] flex flex-col p-4.5 overflow-hidden">
        {/* Header */}
        <DialogHeader className="pb-2.5 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                <ShoppingBag className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
                    Orden de Compra Oficial
                  </DialogTitle>
                  {orden && getEstadoBadge(orden.estado)}
                </div>
                <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                  Número:{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {orden?.numero || "..."}
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
        ) : !orden ? (
          <div className="flex-1 py-8 text-center text-xs text-muted-foreground">
            No se encontró la información de la orden de compra.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-4 text-xs">
            {/* Meta Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg border border-border/50 bg-card">
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <Building2 className="size-3 text-blue-500" />
                  Proveedor
                </span>
                <p className="mt-0.5 font-semibold text-foreground truncate">
                  {orden.proveedorRazonSocial || "-"}
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-border/50 bg-card">
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <Warehouse className="size-3 text-blue-500" />
                  Almacén Destino
                </span>
                <p className="mt-0.5 font-semibold text-foreground truncate">
                  {orden.almacenNombre || "-"}
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-border/50 bg-card">
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <Calendar className="size-3 text-blue-500" />
                  Fecha Emisión
                </span>
                <p className="mt-0.5 font-semibold text-foreground">
                  {formatDate(orden.fecha)}
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-border/50 bg-card">
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <Calendar className="size-3 text-blue-500" />
                  Entrega Esperada
                </span>
                <p className="mt-0.5 font-semibold text-foreground">
                  {orden.fechaEntregaEsperada
                    ? formatDateOnly(orden.fechaEntregaEsperada)
                    : "No especificada"}
                </p>
              </div>
            </div>

            {/* Condicion de pago y observaciones */}
            {(orden.condicionPago ||
              orden.observacion ||
              orden.solicitudCompraNumero ||
              orden.cotizacionCompraNumero) && (
              <div className="p-3 rounded-lg border border-border/40 bg-muted/20 space-y-1">
                {orden.solicitudCompraNumero && (
                  <p>
                    <strong className="text-foreground">Solicitud Origen:</strong>{" "}
                    <span className="font-mono text-muted-foreground">
                      {orden.solicitudCompraNumero}
                    </span>
                  </p>
                )}
                {orden.cotizacionCompraNumero && (
                  <p>
                    <strong className="text-foreground">Cotización Base:</strong>{" "}
                    <span className="font-mono text-muted-foreground">
                      {orden.cotizacionCompraNumero}
                    </span>
                  </p>
                )}
                {orden.condicionPago && (
                  <p>
                    <strong className="text-foreground">Condición de Pago:</strong>{" "}
                    <span className="text-muted-foreground">
                      {orden.condicionPago}
                    </span>
                  </p>
                )}
                {orden.observacion && (
                  <p>
                    <strong className="text-foreground">Observaciones:</strong>{" "}
                    <span className="text-muted-foreground">
                      {orden.observacion}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Products Table */}
            <div className="border border-border/60 rounded-lg overflow-hidden bg-card shadow-2xs">
              <div className="bg-muted/40 px-3 py-2 border-b border-border/60 flex items-center justify-between">
                <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                  <Package className="size-3.5 text-blue-500" />
                  Artículos de la Orden
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {orden.detalles?.length || 0} items
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] text-muted-foreground uppercase bg-muted/20 border-b border-border/40">
                    <tr>
                      <th className="px-3 py-1.5 font-medium">#</th>
                      <th className="px-3 py-1.5 font-medium">Código</th>
                      <th className="px-3 py-1.5 font-medium">Producto</th>
                      <th className="px-3 py-1.5 font-medium text-center">
                        Cant. Pedida
                      </th>
                      <th className="px-3 py-1.5 font-medium text-center">
                        Cant. Recibida
                      </th>
                      <th className="px-3 py-1.5 font-medium text-right">
                        Precio Unit.
                      </th>
                      <th className="px-3 py-1.5 font-medium text-right">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {(orden.detalles || []).map((det, idx) => (
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
                        <td className="px-3 py-2 text-center font-mono">
                          {Number(det.cantidad).toLocaleString("es-ES")}
                        </td>
                        <td className="px-3 py-2 text-center font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          {Number(det.cantidadRecibida || 0).toLocaleString(
                            "es-ES"
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {Number(det.precioUnitario).toLocaleString("es-ES", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-foreground">
                          {Number(det.subtotal || 0).toLocaleString("es-ES", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/30 border-t border-border/40 font-semibold">
                    <tr>
                      <td colSpan={6} className="px-3 py-2 text-right text-muted-foreground">
                        Total Final:
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-foreground text-sm">
                        {Number(orden.total || 0).toLocaleString("es-ES", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
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
                  if (orden) onSendApproval(orden);
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
                  if (orden) onApprove(orden);
                }}
                className="h-7.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-medium"
              >
                <CheckCircle2 className="size-3" />
                <span>Aprobar Orden</span>
              </Button>
            )}

            {isAprobada && onSendProveedor && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  if (orden) onSendProveedor(orden);
                }}
                className="h-7.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1 font-medium"
              >
                <Send className="size-3" />
                <span>Enviar al Proveedor</span>
              </Button>
            )}

            {isCancelable && onCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  if (orden) onCancel(orden);
                }}
                className="h-7.5 text-xs text-zinc-600 border-zinc-500/30 hover:bg-zinc-500/10 gap-1"
              >
                <Ban className="size-3" />
                <span>Cancelar</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
