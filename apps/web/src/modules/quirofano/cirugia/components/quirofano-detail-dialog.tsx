"use client";

import * as React from "react";
import {
  Activity,
  Printer,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Scissors,
  DoorOpen,
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
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { CirugiaResponse } from "../types/quirofano.types";

interface QuirofanoDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cirugia: CirugiaResponse | null;
}

export function QuirofanoDetailDialog({
  open,
  onOpenChange,
  cirugia,
}: QuirofanoDetailDialogProps) {
  if (!cirugia) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl lg:max-w-4xl max-h-[92vh] flex flex-col p-4 overflow-hidden gap-0">
        <DialogHeader className="pb-2.5 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg flex items-center justify-center shrink-0 border shadow-2xs bg-cyan-500/10 border-cyan-500/25 text-cyan-600 dark:text-cyan-400">
                <Scissors className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Protocolo Quirúrgico & Hoja de Gasto
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                  Comprobante clínico-quirúrgico integrado con el Almacén de Quirófano ({cirugia.almacenNombre}).
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-7 text-xs gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="size-3" />
                <span>Imprimir Protocolo</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Printable Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-0.5 text-xs">
          {/* Header Box */}
          <div className="p-3 rounded-lg border border-border/70 bg-card space-y-2.5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  N° DE INTERVENCIÓN
                </span>
                <div className="text-lg font-bold font-mono text-cyan-600 dark:text-cyan-400">
                  {cirugia.numero}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono">
                  {cirugia.salaOperaciones}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-semibold"
                >
                  {cirugia.estadoTexto}
                </Badge>
              </div>
            </div>

            {/* Grid Patient & Procedure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">
                  Paciente
                </span>
                <strong className="text-foreground">{cirugia.pacienteNombreCompleto}</strong>
                <span className="text-[10px] text-muted-foreground block font-mono">
                  Doc: {cirugia.pacienteDocumento || "—"} • HC: {cirugia.pacienteHistoriaClinica}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">
                  Admisión Hospitalaria
                </span>
                <strong className="text-foreground">
                  {cirugia.admisionNumero ? `Admisión ${cirugia.admisionNumero}` : "Cirugía Ambulatoria"}
                </strong>
                <span className="text-[10px] text-muted-foreground block">
                  Tipo: {cirugia.tipoTexto}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">
                  Cirujano Principal
                </span>
                <strong className="text-foreground">{cirugia.cirujanoNombreCompleto}</strong>
                <span className="text-[10px] text-muted-foreground block">
                  {cirugia.cirujanoEspecialidad}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">
                  Equipo Anestésico
                </span>
                <strong className="text-foreground">
                  {cirugia.anestesiologoNombreCompleto || "Sin anestesiólogo reg."}
                </strong>
                <span className="text-[10px] text-muted-foreground block">
                  Técnica: {cirugia.tipoAnestesiaTexto}
                </span>
              </div>
            </div>

            {/* Timings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border/40 text-[11px] font-mono">
              <div>
                <span className="text-muted-foreground">Programada:</span>{" "}
                <strong>{formatDate(cirugia.fechaProgramada)}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Inicio Real:</span>{" "}
                <strong>
                  {cirugia.fechaInicio
                    ? new Date(cirugia.fechaInicio).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground">Fin / Cierre:</span>{" "}
                <strong>
                  {cirugia.fechaFin
                    ? new Date(cirugia.fechaFin).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </strong>
              </div>
            </div>
          </div>

          {/* Procedure & Diagnostics */}
          <div className="p-3 rounded-lg border border-border/70 bg-card space-y-2 shadow-2xs">
            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
              <Scissors className="size-3 text-cyan-600" />
              Detalle del Procedimiento Quirúrgico
            </span>

            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-muted-foreground font-semibold">Operación Realizada:</span>{" "}
                <span className="text-foreground font-bold">{cirugia.procedimientoQuirurgico}</span>
              </div>

              {cirugia.diagnosticoPreOperatorio && (
                <div>
                  <span className="text-muted-foreground font-semibold">Diagnóstico Pre-Operatorio:</span>{" "}
                  <span>{cirugia.diagnosticoPreOperatorio}</span>
                </div>
              )}

              {cirugia.diagnosticoPostOperatorio && (
                <div>
                  <span className="text-muted-foreground font-semibold">Diagnóstico Post-Operatorio:</span>{" "}
                  <span className="font-semibold text-foreground">{cirugia.diagnosticoPostOperatorio}</span>
                </div>
              )}

              {cirugia.observaciones && (
                <div>
                  <span className="text-muted-foreground font-semibold">Observaciones / Hallazgos:</span>{" "}
                  <span className="italic">{cirugia.observaciones}</span>
                </div>
              )}
            </div>
          </div>

          {/* Surgical Materials Sheet */}
          <div className="p-3 rounded-lg border border-border/70 bg-card space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                <Package className="size-3 text-cyan-600" />
                Hoja de Gasto de Materiales, Suturas e Instrumental ({cirugia.gastosMateriales.length})
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                Almacén: <strong>{cirugia.almacenNombre}</strong>
              </span>
            </div>

            <div className="rounded-md border border-border/60 overflow-hidden bg-background text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/40 text-[10px] text-muted-foreground uppercase font-semibold border-b border-border/50">
                  <tr>
                    <th className="px-2.5 py-1.5 w-8 text-center">#</th>
                    <th className="px-2.5 py-1.5 min-w-44">Insumo Quirúrgico</th>
                    <th className="px-2.5 py-1.5 min-w-28">Lote / Vcto.</th>
                    <th className="px-2.5 py-1.5 min-w-24">Momento</th>
                    <th className="px-2.5 py-1.5 w-16 text-center">Cant.</th>
                    <th className="px-2.5 py-1.5 w-24 text-right">Precio (Bs.)</th>
                    <th className="px-2.5 py-1.5 w-24 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 font-mono">
                  {cirugia.gastosMateriales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-center text-muted-foreground font-sans">
                        No se registraron materiales en esta cirugía.
                      </td>
                    </tr>
                  ) : (
                    cirugia.gastosMateriales.map((g, idx) => (
                      <tr key={g.id}>
                        <td className="px-2.5 py-1 text-center text-muted-foreground font-sans text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="px-2.5 py-1 font-sans font-medium text-foreground">
                          {g.productoNombre}{" "}
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ({g.productoCodigo})
                          </span>
                        </td>
                        <td className="px-2.5 py-1 text-[10px] text-muted-foreground">
                          {g.lote || "LOTE-S/N"} {g.fechaVencimiento ? `(${formatDate(g.fechaVencimiento)})` : ""}
                        </td>
                        <td className="px-2.5 py-1 text-[10px] text-muted-foreground font-sans">
                          {g.momentoQuirurgico || "—"}
                        </td>
                        <td className="px-2.5 py-1 text-center font-bold text-foreground">
                          {g.cantidad}
                        </td>
                        <td className="px-2.5 py-1 text-right text-muted-foreground">
                          {g.precioUnitario.toFixed(2)}
                        </td>
                        <td className="px-2.5 py-1 text-right font-bold text-foreground">
                          Bs. {g.subtotal.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="border-t border-border/50 bg-muted/20 font-mono">
                  <tr>
                    <td colSpan={6} className="px-3 py-2 text-right font-sans font-bold text-foreground">
                      Total Material Quirúrgico:
                    </td>
                    <td className="px-2.5 py-2 text-right font-bold text-cyan-600 dark:text-cyan-400 text-sm">
                      Bs. {cirugia.totalPrecioMateriales.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Signatures for Print */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
            <div className="border-t border-dashed border-border/80 pt-2">
              <span className="font-bold text-foreground block">{cirugia.cirujanoNombreCompleto}</span>
              <span className="text-muted-foreground text-[10px]">Cirujano Principal</span>
            </div>

            <div className="border-t border-dashed border-border/80 pt-2">
              <span className="font-bold text-foreground block">
                {cirugia.instrumentista || "Enfermería de Quirófano"}
              </span>
              <span className="text-muted-foreground text-[10px]">
                Instrumentista / Control de Material
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-border/40 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-7.5 px-3 text-xs cursor-pointer"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
