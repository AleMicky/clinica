"use client";

import * as React from "react";
import Link from "next/link";
import {
  Printer,
  CreditCard,
  PackageCheck,
  Receipt,
  ArrowUpRight,
  Boxes,
  Lock,
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
import type { DispensacionResponse } from "../types/dispensacion.types";

interface DispensacionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispensacion: DispensacionResponse | null;
  onCobrar?: (item: DispensacionResponse) => void;
  onEntregar?: (item: DispensacionResponse) => void;
}

export function DispensacionDetailDialog({
  open,
  onOpenChange,
  dispensacion,
  onCobrar,
  onEntregar,
}: DispensacionDetailDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-5 max-h-[90vh] flex flex-col gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="pb-3 border-b border-border/60">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
                <Receipt className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Ticket de Farmacia: {dispensacion.numero}</span>
                  {dispensacion.estado === "PendientePago" && (
                    <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10 text-xs">
                      Pendiente en Caja
                    </Badge>
                  )}
                  {dispensacion.estado === "Pagado" && (
                    <Badge variant="outline" className="text-blue-600 border-blue-500/30 bg-blue-500/10 text-xs">
                      Pagado (Listo para Entrega)
                    </Badge>
                  )}
                  {dispensacion.estado === "Entregado" && (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-xs">
                      Fármacos Entregados
                    </Badge>
                  )}
                  {dispensacion.estado === "Anulado" && (
                    <Badge variant="outline" className="text-rose-600 border-rose-500/30 bg-rose-500/10 text-xs">
                      Anulado
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Emitido el {formatDate(dispensacion.fecha)} • Almacén: {dispensacion.almacenNombre}
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs gap-1.5 cursor-pointer shrink-0"
            >
              <Printer className="size-3.5" />
              <span>Imprimir</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-muted/20 border border-border/60 rounded-lg">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                Paciente / Titular
              </div>
              <div className="font-semibold text-foreground mt-0.5">
                {pacienteNombre}
              </div>
              <div className="text-muted-foreground text-[11px]">
                Doc: {documento}{" "}
                {dispensacion.pacienteHistoriaClinica &&
                  `• HC: ${dispensacion.pacienteHistoriaClinica}`}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                Prescripción / Médico
              </div>
              <div className="font-semibold text-foreground mt-0.5">
                {dispensacion.medicoNombre || "Venta Directa sin Receta"}
              </div>
              {dispensacion.admisionNumero && (
                <div className="text-muted-foreground text-[11px]">
                  Admisión: {dispensacion.admisionNumero}
                </div>
              )}
            </div>
          </div>

          {/* Payment & Delivery Status Track */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-card border border-border/60 rounded-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <CreditCard className="size-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    Cobranza / Cajas
                  </span>
                  <span className="font-semibold block">
                    {dispensacion.fechaCobro
                      ? `Cobrado el ${formatDate(dispensacion.fechaCobro)} (${dispensacion.metodoPago || "Caja"})`
                      : dispensacion.admisionNumero && dispensacion.estado === "Pagado"
                        ? `Cargado a Admisión ${dispensacion.admisionNumero}`
                        : "Pendiente de cobro en Caja"}
                  </span>
                  {dispensacion.comprobanteCobro && (
                    <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400 block mt-0.5">
                      Comprobante: {dispensacion.comprobanteCobro}
                    </span>
                  )}
                </div>
              </div>
              <Link
                href="/caja/cobros"
                className="text-[10px] font-semibold text-primary hover:underline inline-flex items-center gap-0.5 shrink-0"
              >
                <span>Ir a Caja</span>
                <ArrowUpRight className="size-3" />
              </Link>
            </div>

            <div className="flex items-start justify-between gap-2 sm:border-l sm:border-border/50 sm:pl-3">
              <div className="flex items-start gap-2">
                <PackageCheck className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    Existencia y Movimiento Almacén
                  </span>
                  <span className="font-semibold block">
                    {dispensacion.fechaEntrega
                      ? `Entregado el ${formatDate(dispensacion.fechaEntrega)}`
                      : dispensacion.estado === "Anulado"
                        ? "Reserva / Salida revertida por anulación"
                        : "Unidades reservadas en almacén"}
                  </span>
                  {dispensacion.movimientoInventarioId ? (
                    <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                      <Boxes className="size-3" />
                      Salida Kárdex:{" "}
                      {dispensacion.movimientoInventarioNumero ||
                        `#${dispensacion.movimientoInventarioId}`}
                    </span>
                  ) : dispensacion.estado !== "Anulado" ? (
                    <span className="text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                      <Lock className="size-2.5" />
                      Stock reservado en {dispensacion.almacenNombre}
                    </span>
                  ) : null}
                </div>
              </div>
              <Link
                href={
                  dispensacion.movimientoInventarioId
                    ? "/almacenes/movimientos"
                    : "/almacenes/existencias"
                }
                className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5 shrink-0"
              >
                <span>
                  {dispensacion.movimientoInventarioId ? "Ver Mov." : "Existencias"}
                </span>
                <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </div>

          {/* Medicines Table */}
          <div className="border border-border/60 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border/60 text-[10px] uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="py-2 px-2.5">Medicamento</th>
                  <th className="py-2 px-2">Lote / Venc.</th>
                  <th className="py-2 px-2 text-right">Cant.</th>
                  <th className="py-2 px-2 text-right">Precio</th>
                  <th className="py-2 px-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {dispensacion.detalles.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/20">
                    <td className="py-2 px-2.5">
                      <div className="font-semibold text-foreground">
                        {d.productoNombre}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        Cód: {d.productoCodigo}
                      </div>
                      {d.indicaciones && (
                        <div className="text-[11px] text-teal-700 dark:text-teal-400 mt-0.5 italic">
                          Posología: {d.indicaciones}
                        </div>
                      )}
                    </td>

                    <td className="py-2 px-2 font-mono text-[11px] text-muted-foreground">
                      {d.lote ? (
                        <>
                          <span>{d.lote}</span>
                          {d.fechaVencimiento && (
                            <span className="block text-[10px]">
                              V: {formatDate(d.fechaVencimiento)}
                            </span>
                          )}
                        </>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="py-2 px-2 text-right font-mono font-semibold">
                      {d.cantidad}
                    </td>

                    <td className="py-2 px-2 text-right font-mono text-muted-foreground">
                      Bs. {d.precioUnitario.toFixed(2)}
                    </td>

                    <td className="py-2 px-2.5 text-right font-mono font-bold text-foreground">
                      Bs. {d.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="p-3 bg-muted/30 rounded-lg border border-border/60 flex flex-col items-end gap-1">
            <div className="flex justify-between w-48 text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-mono">Bs. {dispensacion.subtotal.toFixed(2)}</span>
            </div>
            {dispensacion.descuento > 0 && (
              <div className="flex justify-between w-48 text-muted-foreground">
                <span>Descuento:</span>
                <span className="font-mono">-Bs. {dispensacion.descuento.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between w-48 font-bold text-sm text-foreground pt-1 border-t border-border/60">
              <span>Total a Pagar:</span>
              <span className="font-mono text-teal-600 dark:text-teal-400">
                Bs. {dispensacion.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8 cursor-pointer"
          >
            Cerrar
          </Button>

          <div className="flex items-center gap-2">
            {dispensacion.estado === "PendientePago" && onCobrar && (
              <Button
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onCobrar(dispensacion);
                }}
                className="h-8 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
              >
                <CreditCard className="size-3.5" />
                <span>Registrar Pago en Caja</span>
              </Button>
            )}

            {dispensacion.estado === "Pagado" && onEntregar && (
              <Button
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEntregar(dispensacion);
                }}
                className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                <PackageCheck className="size-3.5" />
                <span>Entregar Fármacos (Descontar Stock)</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
