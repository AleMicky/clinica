"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Printer,
  Pencil,
  CreditCard,
  PackageCheck,
  Receipt,
  ArrowUpRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  type DispensacionResponse,
  isEstadoPendientePago,
  isEstadoPagado,
  isEstadoEntregado,
  isEstadoAnulado,
} from "../types/dispensacion.types";

interface DispensacionDetailDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly dispensacion: DispensacionResponse | null;
  readonly onCobrar?: (item: DispensacionResponse) => void;
  readonly onEntregar?: (item: DispensacionResponse) => void;
}

export function DispensacionDetailDialog({
  open,
  onOpenChange,
  dispensacion,
  onCobrar,
  onEntregar,
}: Readonly<DispensacionDetailDialogProps>) {
  const router = useRouter();

  if (!dispensacion) return null;

  const handlePrint = () => {
    window.print();
  };

  const pacienteNombre =
    dispensacion.pacienteNombre ||
    dispensacion.clienteNombre ||
    "Cliente Particular";
  const documento =
    dispensacion.pacienteDocumento || dispensacion.clienteDocumento || "S/D";

  const getEstadoCajaTexto = () => {
    if (dispensacion.fechaCobro) {
      return `Cobrado (${dispensacion.metodoPago || "Caja"})`;
    }
    if (dispensacion.admisionNumero && dispensacion.estado === "Pagado") {
      return `Adm #${dispensacion.admisionNumero}`;
    }
    return "Pendiente";
  };

  const getEstadoAlmacenTexto = () => {
    if (dispensacion.fechaEntrega) {
      return "Entregado";
    }
    if (dispensacion.estado === "Anulado") {
      return "Anulado";
    }
    return "Reservado";
  };

  const renderAlmacenBadge = () => {
    if (dispensacion.movimientoInventarioId) {
      return (
        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 ml-1">
          [{dispensacion.movimientoInventarioNumero || `#${dispensacion.movimientoInventarioId}`}]
        </span>
      );
    }
    if (dispensacion.estado !== "Anulado") {
      return (
        <span className="text-[10px] text-amber-700 dark:text-amber-400 ml-1">
          ({dispensacion.almacenNombre})
        </span>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-3.5 sm:p-4 max-h-[88vh] flex flex-col gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="pb-2.5 border-b border-border/60 pr-8 sm:pr-9">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-7.5 rounded-md bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
                <Receipt className="size-4" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                  <span>Ticket {dispensacion.numero}</span>
                  {isEstadoPendientePago(dispensacion.estado) && (
                    <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10 text-[10px] h-4 px-1.5 font-medium">
                      Pendiente en Caja
                    </Badge>
                  )}
                  {isEstadoPagado(dispensacion.estado) && (
                    <Badge variant="outline" className="text-blue-600 border-blue-500/30 bg-blue-500/10 text-[10px] h-4 px-1.5 font-medium">
                      Pagado (Listo para Entrega)
                    </Badge>
                  )}
                  {isEstadoEntregado(dispensacion.estado) && (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[10px] h-4 px-1.5 font-medium">
                      Entregado
                    </Badge>
                  )}
                  {isEstadoAnulado(dispensacion.estado) && (
                    <Badge variant="outline" className="text-rose-600 border-rose-500/30 bg-rose-500/10 text-[10px] h-4 px-1.5 font-medium">
                      Anulado
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-[11px] text-muted-foreground leading-tight">
                  {formatDate(dispensacion.fecha)} • {dispensacion.almacenNombre}
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-7 text-xs px-2 gap-1 cursor-pointer shrink-0"
            >
              <Printer className="size-3" />
              <span>Imprimir</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-2.5 space-y-2.5 text-xs">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-2 p-2.5 bg-muted/20 border border-border/60 rounded-md">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                Paciente / Titular
              </div>
              <div className="font-semibold text-foreground text-xs mt-0.5 truncate">
                {pacienteNombre}
              </div>
              <div className="text-muted-foreground text-[10px]">
                Doc: {documento}{" "}
                {dispensacion.pacienteHistoriaClinica &&
                  `• HC: ${dispensacion.pacienteHistoriaClinica}`}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                Prescripción / Médico
              </div>
              <div className="font-semibold text-foreground text-xs mt-0.5 truncate">
                {dispensacion.medicoNombre || "Venta Directa sin Receta"}
              </div>
              {dispensacion.admisionNumero && (
                <div className="text-muted-foreground text-[10px]">
                  Admisión: {dispensacion.admisionNumero}
                </div>
              )}
            </div>
          </div>

          {/* Payment & Delivery Status Track */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-card border border-border/60 rounded-md">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <CreditCard className="size-3.5 text-primary shrink-0" />
                <div className="min-w-0 text-[11px] truncate">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase mr-1">Caja:</span>
                  <span className="font-medium text-foreground">
                    {getEstadoCajaTexto()}
                  </span>
                  {dispensacion.comprobanteCobro && (
                    <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 ml-1">
                      [{dispensacion.comprobanteCobro}]
                    </span>
                  )}
                </div>
              </div>
              <Link
                href="/caja/cobros"
                className="text-[10px] font-medium text-primary hover:underline inline-flex items-center gap-0.5 shrink-0"
              >
                <span>Caja</span>
                <ArrowUpRight className="size-2.5" />
              </Link>
            </div>

            <div className="flex items-center justify-between gap-2 sm:border-l sm:border-border/50 sm:pl-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <PackageCheck className="size-3.5 text-emerald-600 shrink-0" />
                <div className="min-w-0 text-[11px] truncate">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase mr-1">Almacén:</span>
                  <span className="font-medium text-foreground">
                    {getEstadoAlmacenTexto()}
                  </span>
                  {renderAlmacenBadge()}
                </div>
              </div>
              <Link
                href={
                  dispensacion.movimientoInventarioId
                    ? "/almacenes/movimientos"
                    : "/almacenes/existencias"
                }
                className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5 shrink-0"
              >
                <span>{dispensacion.movimientoInventarioId ? "Kárdex" : "Stock"}</span>
                <ArrowUpRight className="size-2.5" />
              </Link>
            </div>
          </div>

          {/* Medicines Table */}
          <div className="border border-border/60 rounded-md overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border/60 text-[10px] uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="py-1.5 px-2.5">Medicamento</th>
                  <th className="py-1.5 px-2">Lote / Venc.</th>
                  <th className="py-1.5 px-2 text-right">Cant.</th>
                  <th className="py-1.5 px-2 text-right">P. Unit.</th>
                  <th className="py-1.5 px-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {dispensacion.detalles.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/20">
                    <td className="py-1.5 px-2.5">
                      <div className="font-semibold text-foreground leading-tight">
                        {d.productoNombre}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        Cód: {d.productoCodigo}
                      </div>
                      {d.indicaciones && (
                        <div className="text-[10px] text-teal-700 dark:text-teal-400 italic">
                          Posología: {d.indicaciones}
                        </div>
                      )}
                    </td>

                    <td className="py-1.5 px-2 font-mono text-[10px] text-muted-foreground">
                      {d.lote ? (
                        <>
                          <span>{d.lote}</span>
                          {d.fechaVencimiento && (
                            <span className="block text-[9px]">
                              V: {formatDate(d.fechaVencimiento)}
                            </span>
                          )}
                        </>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="py-1.5 px-2 text-right font-mono font-medium">
                      {d.cantidad}
                    </td>

                    <td className="py-1.5 px-2 text-right font-mono text-muted-foreground text-[11px]">
                      Bs. {d.precioUnitario.toFixed(2)}
                    </td>

                    <td className="py-1.5 px-2.5 text-right font-mono font-bold text-foreground">
                      Bs. {d.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="py-1.5 px-2.5 bg-muted/30 rounded-md border border-border/60 flex flex-col items-end gap-0.5 text-xs">
            <div className="flex justify-between w-40 text-muted-foreground text-[11px]">
              <span>Subtotal:</span>
              <span className="font-mono">Bs. {dispensacion.subtotal.toFixed(2)}</span>
            </div>
            {dispensacion.descuento > 0 && (
              <div className="flex justify-between w-40 text-muted-foreground text-[11px]">
                <span>Descuento:</span>
                <span className="font-mono">-Bs. {dispensacion.descuento.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between w-40 font-bold text-xs text-foreground pt-0.5 border-t border-border/50">
              <span>Total a Pagar:</span>
              <span className="font-mono text-teal-600 dark:text-teal-400">
                Bs. {dispensacion.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-2.5 border-t border-border/60 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-7.5 px-3 cursor-pointer"
          >
            Cerrar
          </Button>

          <div className="flex items-center gap-1.5">
            {isEstadoPendientePago(dispensacion.estado) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  router.push(`/farmacia/dispensaciones/${dispensacion.id}/editar`);
                }}
                className="h-7.5 text-xs px-2.5 gap-1.5 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/10 cursor-pointer"
              >
                <Pencil className="size-3" />
                <span>Editar Orden</span>
              </Button>
            )}

            {isEstadoPendientePago(dispensacion.estado) && onCobrar && (
              <Button
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onCobrar(dispensacion);
                }}
                className="h-7.5 text-xs px-2.5 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
              >
                <CreditCard className="size-3" />
                <span>Cobrar en Caja</span>
              </Button>
            )}

            {isEstadoPagado(dispensacion.estado) && onEntregar && (
              <Button
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEntregar(dispensacion);
                }}
                className="h-7.5 text-xs px-2.5 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                <PackageCheck className="size-3" />
                <span>Entregar Fármacos</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
