"use client";

import * as React from "react";
import {
  ShoppingCart,
  Warehouse,
  Calendar,
  FileText,
  Printer,
  CheckCircle2,
  XCircle,
  Ban,
  Send,
  User,
  Clock,
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
import { Badge } from "@/components/ui/badge";

import {
  EstadoSolicitudCompra,
  type SolicitudCompraResponse,
} from "../types/solicitud-compra.types";
import { useSolicitudCompra } from "../hooks/use-solicitud-compra";
import { getEstadoBadge } from "./solicitud-compra-list";

interface SolicitudCompraDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solicitudId?: number | null;
  onSendApproval?: (solicitud: SolicitudCompraResponse) => void;
  onApprove?: (solicitud: SolicitudCompraResponse) => void;
  onReject?: (solicitud: SolicitudCompraResponse) => void;
  onCancel?: (solicitud: SolicitudCompraResponse) => void;
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

export function SolicitudCompraDetailDialog({
  open,
  onOpenChange,
  solicitudId,
  onSendApproval,
  onApprove,
  onReject,
  onCancel,
}: SolicitudCompraDetailDialogProps) {
  const { data: solicitud, isLoading } = useSolicitudCompra(
    solicitudId ?? 0,
    open && Boolean(solicitudId)
  );

  const handlePrint = () => {
    window.print();
  };

  const isBorrador =
    solicitud?.estado === EstadoSolicitudCompra.Borrador;
  const isPendiente =
    solicitud?.estado === EstadoSolicitudCompra.PendienteAprobacion;
  const isAprobada =
    solicitud?.estado === EstadoSolicitudCompra.Aprobada;
  const isCancelable =
    isBorrador || isPendiente || isAprobada;

  const totalCantidad = (solicitud?.detalles || []).reduce(
    (acc, d) => acc + (Number(d.cantidadSolicitada) || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[94vh] flex flex-col p-4.5 overflow-hidden">
        {/* Header */}
        <DialogHeader className="pb-2.5 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-2xs">
                <FileText className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
                    Solicitud de Abastecimiento
                  </DialogTitle>
                  {solicitud && getEstadoBadge(solicitud.estado)}
                </div>
                <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                  Número oficial:{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {solicitud?.numero || "..."}
                  </span>
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
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
        ) : !solicitud ? (
          <div className="flex-1 py-8 text-center text-xs text-muted-foreground">
            No se encontró la información de la solicitud.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-4 text-xs">
            {/* Meta Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg border border-border/50 bg-card">
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <Warehouse className="size-3 text-indigo-500" />
                  Almacén Destino
                </span>
                <p className="mt-0.5 font-semibold text-foreground truncate">
                  {solicitud.almacenNombre || "-"}
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-border/50 bg-card">
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <Calendar className="size-3 text-indigo-500" />
                  Fecha de Emisión
                </span>
                <p className="mt-0.5 font-semibold text-foreground">
                  {formatDate(solicitud.fechaSolicitud)}
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-border/50 bg-card">
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <Clock className="size-3 text-indigo-500" />
                  Fecha Requerida
                </span>
                <p className="mt-0.5 font-semibold text-foreground">
                  {solicitud.fechaRequerida
                    ? formatDateOnly(solicitud.fechaRequerida)
                    : "No especificada"}
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-border/50 bg-card">
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <User className="size-3 text-indigo-500" />
                  Solicitado Por
                </span>
                <p className="mt-0.5 font-semibold text-foreground truncate">
                  {solicitud.creadoPor || solicitud.solicitadoPorId || "-"}
                </p>
              </div>
            </div>

            {/* General Observation if exists */}
            {solicitud.observacion && (
              <div className="p-3 rounded-lg border border-border/40 bg-muted/20 space-y-1">
                <span className="text-[11px] font-semibold text-foreground">
                  Observaciones / Justificación:
                </span>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {solicitud.observacion}
                </p>
              </div>
            )}

            {/* Approval Info / Notes if approved or rejected */}
            {(solicitud.observacionAprobacion ||
              solicitud.fechaAprobacion ||
              solicitud.aprobadoPorId) && (
              <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 space-y-1 text-emerald-900 dark:text-emerald-300">
                <span className="text-[11px] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  Resolución de Aprobación
                </span>
                <p className="text-xs">
                  {solicitud.observacionAprobacion || "Aprobada formalmente."}
                </p>
                {solicitud.fechaAprobacion && (
                  <p className="text-[10px] text-muted-foreground pt-0.5">
                    Fecha de aprobación: {formatDate(solicitud.fechaAprobacion)}
                  </p>
                )}
              </div>
            )}

            {/* Products Table */}
            <div className="border border-border/60 rounded-lg overflow-hidden bg-card shadow-2xs">
              <div className="bg-muted/40 px-3 py-2 border-b border-border/60 flex items-center justify-between">
                <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                  <Package className="size-3.5 text-indigo-500" />
                  Listado de Productos Requeridos
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {solicitud.detalles?.length || 0} items
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] text-muted-foreground uppercase bg-muted/20 border-b border-border/40">
                    <tr>
                      <th className="px-3 py-1.5 font-medium">#</th>
                      <th className="px-3 py-1.5 font-medium">Código</th>
                      <th className="px-3 py-1.5 font-medium">Producto / Insumo</th>
                      <th className="px-3 py-1.5 font-medium text-right">
                        Cantidad Solicitada
                      </th>
                      <th className="px-3 py-1.5 font-medium">Observación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {(solicitud.detalles || []).map((det, idx) => (
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
                        <td className="px-3 py-2 text-right font-mono font-bold text-foreground">
                          {Number(det.cantidadSolicitada).toLocaleString("es-ES", {
                            minimumFractionDigits: 0,
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
                      <td colSpan={3} className="px-3 py-2 text-right text-muted-foreground">
                        Total Cantidades:
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-foreground">
                        {totalCantidad.toLocaleString("es-ES", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td></td>
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
                  if (solicitud) onSendApproval(solicitud);
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
                  if (solicitud) onApprove(solicitud);
                }}
                className="h-7.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-medium"
              >
                <CheckCircle2 className="size-3" />
                <span>Aprobar</span>
              </Button>
            )}

            {isPendiente && onReject && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  if (solicitud) onReject(solicitud);
                }}
                className="h-7.5 text-xs text-rose-600 border-rose-500/30 hover:bg-rose-500/10 gap-1"
              >
                <XCircle className="size-3" />
                <span>Rechazar</span>
              </Button>
            )}

            {isCancelable && onCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  if (solicitud) onCancel(solicitud);
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
