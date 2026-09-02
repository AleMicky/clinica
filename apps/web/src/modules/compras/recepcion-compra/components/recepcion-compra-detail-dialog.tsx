"use client";

import * as React from "react";
import {
  PackageCheck,
  Building2,
  Warehouse,
  Calendar,
  Printer,
  CheckCircle2,
  Ban,
  FileText,
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
  EstadoRecepcionCompra,
  type RecepcionCompraResponse,
} from "../types/recepcion-compra.types";
import { useRecepcionCompra } from "../hooks/use-recepcion-compra";
import { getEstadoBadge } from "./recepcion-compra-list";

interface RecepcionCompraDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recepcionId?: number | null;
  onConfirm?: (recepcion: RecepcionCompraResponse) => void;
  onAnular?: (recepcion: RecepcionCompraResponse) => void;
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

export function RecepcionCompraDetailDialog({
  open,
  onOpenChange,
  recepcionId,
  onConfirm,
  onAnular,
}: RecepcionCompraDetailDialogProps) {
  const { data: recepcion, isLoading } = useRecepcionCompra(
    recepcionId ?? 0,
    open && Boolean(recepcionId)
  );

  const handlePrint = () => {
    window.print();
  };

  const isBorrador = recepcion?.estado === EstadoRecepcionCompra.Borrador;
  const isConfirmada =
    recepcion?.estado === EstadoRecepcionCompra.Confirmada;

  const totalUnidades = (recepcion?.detalles || []).reduce(
    (acc, d) => acc + (Number(d.cantidadRecibida) || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[94vh] flex flex-col p-4.5 overflow-hidden">
        {/* Header */}
        <DialogHeader className="pb-2.5 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                <PackageCheck className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
                    Comprobante de Ingreso / Recepción
                  </DialogTitle>
                  {recepcion && getEstadoBadge(recepcion.estado)}
                </div>
                <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                  Número:{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {recepcion?.numero || "..."}
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
        ) : !recepcion ? (
          <div className="flex-1 py-8 text-center text-xs text-muted-foreground">
            No se encontró la información de la recepción.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-4 text-xs">
            {/* Meta Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg border border-border/50 bg-card">
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <FileText className="size-3 text-emerald-500" />
                  Orden de Compra
                </span>
                <p className="mt-0.5 font-mono font-semibold text-foreground truncate">
                  {recepcion.ordenCompraNumero || `#${recepcion.ordenCompraId}`}
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-border/50 bg-card">
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <Building2 className="size-3 text-emerald-500" />
                  Proveedor
                </span>
                <p className="mt-0.5 font-semibold text-foreground truncate">
                  {recepcion.proveedorRazonSocial || "-"}
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-border/50 bg-card">
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <Warehouse className="size-3 text-emerald-500" />
                  Almacén Destino
                </span>
                <p className="mt-0.5 font-semibold text-foreground truncate">
                  {recepcion.almacenNombre || "-"}
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-border/50 bg-card">
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <Calendar className="size-3 text-emerald-500" />
                  Fecha de Recepción
                </span>
                <p className="mt-0.5 font-semibold text-foreground">
                  {formatDate(recepcion.fechaRecepcion)}
                </p>
              </div>
            </div>

            {/* Documentos de respaldo y observaciones */}
            {(recepcion.numeroFactura ||
              recepcion.numeroRemision ||
              recepcion.observacion ||
              recepcion.movimientoInventarioId) && (
              <div className="p-3 rounded-lg border border-border/40 bg-muted/20 space-y-1">
                {recepcion.numeroFactura && (
                  <p>
                    <strong className="text-foreground">Factura:</strong>{" "}
                    <span className="text-muted-foreground">
                      {recepcion.numeroFactura}
                    </span>
                  </p>
                )}
                {recepcion.numeroRemision && (
                  <p>
                    <strong className="text-foreground">Guía de Remisión:</strong>{" "}
                    <span className="text-muted-foreground">
                      {recepcion.numeroRemision}
                    </span>
                  </p>
                )}
                {recepcion.movimientoInventarioId && (
                  <p>
                    <strong className="text-foreground">
                      Movimiento de Inventario:
                    </strong>{" "}
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      #{recepcion.movimientoInventarioId} (Stock actualizado)
                    </span>
                  </p>
                )}
                {recepcion.observacion && (
                  <p>
                    <strong className="text-foreground">Observaciones:</strong>{" "}
                    <span className="text-muted-foreground">
                      {recepcion.observacion}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Products Table */}
            <div className="border border-border/60 rounded-lg overflow-hidden bg-card shadow-2xs">
              <div className="bg-muted/40 px-3 py-2 border-b border-border/60 flex items-center justify-between">
                <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                  <Package className="size-3.5 text-emerald-500" />
                  Productos Ingresados al Inventario
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {recepcion.detalles?.length || 0} items
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
                        Cantidad Ingresada
                      </th>
                      <th className="px-3 py-1.5 font-medium text-right">
                        Precio Unit.
                      </th>
                      <th className="px-3 py-1.5 font-medium">Observación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {(recepcion.detalles || []).map((det, idx) => (
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
                        <td className="px-3 py-2 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {Number(det.cantidadRecibida).toLocaleString("es-ES")}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {Number(det.precioUnitario).toLocaleString("es-ES", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
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
                        Total Unidades Ingresadas:
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
            {isBorrador && onConfirm && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  if (recepcion) onConfirm(recepcion);
                }}
                className="h-7.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-medium"
              >
                <CheckCircle2 className="size-3" />
                <span>Confirmar e Ingresar a Stock</span>
              </Button>
            )}

            {isConfirmada && onAnular && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  if (recepcion) onAnular(recepcion);
                }}
                className="h-7.5 text-xs text-rose-600 border-rose-500/30 hover:bg-rose-500/10 gap-1"
              >
                <Ban className="size-3" />
                <span>Anular Recepción</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
