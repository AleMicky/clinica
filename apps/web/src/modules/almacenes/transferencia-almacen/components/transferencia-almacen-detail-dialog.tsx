"use client";

import * as React from "react";
import {
  GitCompareArrows,
  Calendar,
  Warehouse,
  FileText,
  Printer,
  Send,
  CheckCircle2,
  Truck,
  PackageCheck,
  Ban,
  ArrowRight,
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
  EstadoTransferenciaAlmacen,
  type TransferenciaAlmacenResponse,
} from "../types/transferencia-almacen.types";
import { useTransferenciaAlmacen } from "../hooks/use-transferencia-almacen";
import { getEstadoTransferenciaBadge } from "./transferencia-almacen-list";

interface TransferenciaAlmacenDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transferenciaId?: number | null;
  onSolicitar?: (transferencia: TransferenciaAlmacenResponse) => void;
  onAprobar?: (transferencia: TransferenciaAlmacenResponse) => void;
  onDespachar?: (transferencia: TransferenciaAlmacenResponse) => void;
  onRecibir?: (transferencia: TransferenciaAlmacenResponse) => void;
  onCancelar?: (transferencia: TransferenciaAlmacenResponse) => void;
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

export function TransferenciaAlmacenDetailDialog({
  open,
  onOpenChange,
  transferenciaId,
  onSolicitar,
  onAprobar,
  onDespachar,
  onRecibir,
  onCancelar,
}: TransferenciaAlmacenDetailDialogProps) {
  const { data: transferencia, isLoading } = useTransferenciaAlmacen(
    transferenciaId ?? 0,
    open && Boolean(transferenciaId)
  );

  const handlePrint = () => {
    window.print();
  };

  const isBorrador =
    transferencia?.estado === EstadoTransferenciaAlmacen.Borrador;
  const isSolicitado =
    transferencia?.estado === EstadoTransferenciaAlmacen.Solicitado;
  const isAprobado =
    transferencia?.estado === EstadoTransferenciaAlmacen.Aprobado;
  const isDespachado =
    transferencia?.estado === EstadoTransferenciaAlmacen.Despachado;
  const isRecibido =
    transferencia?.estado === EstadoTransferenciaAlmacen.Recibido;
  const isFinalizado = isRecibido || transferencia?.estado === EstadoTransferenciaAlmacen.Cancelado;

  const totalSolicitado = (transferencia?.detalles || []).reduce(
    (acc, d) => acc + (Number(d.cantidadSolicitada) || 0),
    0
  );
  const totalAprobado = (transferencia?.detalles || []).reduce(
    (acc, d) => acc + (Number(d.cantidadAprobada) || 0),
    0
  );
  const totalDespachado = (transferencia?.detalles || []).reduce(
    (acc, d) => acc + (Number(d.cantidadDespachada) || 0),
    0
  );
  const totalRecibido = (transferencia?.detalles || []).reduce(
    (acc, d) => acc + (Number(d.cantidadRecibida) || 0),
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
                    Guía de Transferencia
                  </DialogTitle>
                  {transferencia && (
                    <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-muted text-foreground">
                      {transferencia.numero}
                    </span>
                  )}
                </div>
                <DialogDescription className="text-[11px] text-muted-foreground">
                  Información y seguimiento de la transferencia entre almacenes
                </DialogDescription>
              </div>
            </div>

            {transferencia && (
              <div>{getEstadoTransferenciaBadge(transferencia.estado)}</div>
            )}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1 text-xs">
          {isLoading || !transferencia ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
          ) : (
            <>
              {/* Route Card: Origen -> Destino */}
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5 w-full sm:w-1/2">
                  <div className="size-7 rounded-md bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0">
                    <Warehouse className="size-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Origen (Emisor)
                    </span>
                    <p className="text-xs font-semibold text-foreground">
                      {transferencia.almacenOrigenNombre || "-"}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex size-6 rounded-full bg-primary/10 text-primary items-center justify-center shrink-0">
                  <ArrowRight className="size-3.5" />
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-1/2 justify-start sm:justify-end sm:text-right">
                  <div>
                    <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                      Destino (Receptor)
                    </span>
                    <p className="text-xs font-semibold text-foreground">
                      {transferencia.almacenDestinoNombre || "-"}
                    </p>
                  </div>
                  <div className="size-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 order-first sm:order-last">
                    <Warehouse className="size-3.5" />
                  </div>
                </div>
              </div>

              {/* Timeline Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded border border-border/40 bg-card">
                  <span className="text-[10px] text-muted-foreground block">
                    Solicitud
                  </span>
                  <span className="font-mono text-foreground font-medium">
                    {formatDate(transferencia.fechaSolicitud)}
                  </span>
                </div>
                <div className="p-2 rounded border border-border/40 bg-card">
                  <span className="text-[10px] text-muted-foreground block">
                    Aprobación
                  </span>
                  <span className="font-mono text-foreground font-medium">
                    {formatDate(transferencia.fechaAprobacion)}
                  </span>
                </div>
                <div className="p-2 rounded border border-border/40 bg-card">
                  <span className="text-[10px] text-muted-foreground block">
                    Despacho
                  </span>
                  <span className="font-mono text-foreground font-medium">
                    {formatDate(transferencia.fechaDespacho)}
                  </span>
                </div>
                <div className="p-2 rounded border border-border/40 bg-card">
                  <span className="text-[10px] text-muted-foreground block">
                    Recepción
                  </span>
                  <span className="font-mono text-foreground font-medium">
                    {formatDate(transferencia.fechaRecepcion)}
                  </span>
                </div>
              </div>

              {transferencia.observacion && (
                <div className="p-2.5 rounded-lg bg-card border border-border/40 text-xs">
                  <span className="font-semibold text-muted-foreground text-[10px] uppercase block mb-0.5">
                    Observaciones
                  </span>
                  <p className="text-foreground">{transferencia.observacion}</p>
                </div>
              )}

              {/* Items Table */}
              <div className="rounded-lg border border-border/60 overflow-hidden bg-card shadow-2xs">
                <div className="px-3 py-2 bg-muted/40 border-b border-border/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Artículos ({transferencia.detalles?.length || 0})
                  </span>
                </div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground font-semibold text-[10px]">
                      <th className="px-3 py-1.5 w-8">#</th>
                      <th className="px-3 py-1.5">Producto</th>
                      <th className="px-3 py-1.5 w-24 text-right">Solicitado</th>
                      <th className="px-3 py-1.5 w-24 text-right">Aprobado</th>
                      <th className="px-3 py-1.5 w-24 text-right">Despachado</th>
                      <th className="px-3 py-1.5 w-24 text-right">Recibido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {(transferencia.detalles || []).map((item, idx) => (
                      <tr key={item.id} className="hover:bg-muted/10">
                        <td className="px-3 py-1.5 text-muted-foreground font-mono text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-1.5">
                          <span className="font-medium text-foreground">
                            {item.productoNombre || `ID: ${item.productoId}`}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono">
                          {Number(item.cantidadSolicitada).toLocaleString("es-ES")}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono text-indigo-600 dark:text-indigo-400">
                          {Number(item.cantidadAprobada).toLocaleString("es-ES")}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono text-purple-600 dark:text-purple-400">
                          {Number(item.cantidadDespachada).toLocaleString("es-ES")}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          {Number(item.cantidadRecibida).toLocaleString("es-ES")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border/60 bg-muted/30 font-bold text-xs font-mono">
                      <td colSpan={2} className="px-3 py-2 text-right">
                        Totales:
                      </td>
                      <td className="px-3 py-2 text-right">
                        {totalSolicitado.toLocaleString("es-ES")}
                      </td>
                      <td className="px-3 py-2 text-right text-indigo-600">
                        {totalAprobado.toLocaleString("es-ES")}
                      </td>
                      <td className="px-3 py-2 text-right text-purple-600">
                        {totalDespachado.toLocaleString("es-ES")}
                      </td>
                      <td className="px-3 py-2 text-right text-emerald-600">
                        {totalRecibido.toLocaleString("es-ES")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
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
            {transferencia && !isFinalizado && onCancelar && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onCancelar(transferencia)}
                className="h-7 text-xs text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer"
              >
                <Ban className="size-3" />
                <span>Cancelar</span>
              </Button>
            )}

            {transferencia && isBorrador && onSolicitar && (
              <Button
                type="button"
                size="sm"
                onClick={() => onSolicitar(transferencia)}
                className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1 cursor-pointer font-medium"
              >
                <Send className="size-3" />
                <span>Solicitar Envío</span>
              </Button>
            )}

            {transferencia && isSolicitado && onAprobar && (
              <Button
                type="button"
                size="sm"
                onClick={() => onAprobar(transferencia)}
                className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1 cursor-pointer font-medium"
              >
                <CheckCircle2 className="size-3" />
                <span>Aprobar</span>
              </Button>
            )}

            {transferencia && isAprobado && onDespachar && (
              <Button
                type="button"
                size="sm"
                onClick={() => onDespachar(transferencia)}
                className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1 cursor-pointer font-medium"
              >
                <Truck className="size-3" />
                <span>Despachar Stock</span>
              </Button>
            )}

            {transferencia && isDespachado && onRecibir && (
              <Button
                type="button"
                size="sm"
                onClick={() => onRecibir(transferencia)}
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 cursor-pointer font-medium"
              >
                <PackageCheck className="size-3" />
                <span>Recibir Mercancía</span>
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
