"use client";

import * as React from "react";
import {
  Calculator,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Vault,
  Coins,
  FileText,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ArqueoCajaResponse } from "../types/arqueo-caja.types";

interface ArqueoCajaDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  arqueo: ArqueoCajaResponse | null;
}

function formatDatetime(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatCurrency(val?: number | null): string {
  return `Bs. ${Number(val || 0).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function ArqueoCajaDetailDialog({
  open,
  onOpenChange,
  arqueo,
}: ArqueoCajaDetailDialogProps) {
  if (!arqueo) return null;

  const turno = arqueo.turnoCaja;
  const cajero = turno?.empleado?.nombreCompleto || `Cajero #${turno?.empleado?.id || "-"}`;
  const caja = turno?.caja?.nombre || turno?.caja?.codigo || "Caja Principal";
  const diferenciaNum = Number(arqueo.diferencia || 0);
  const isExacto = Math.abs(diferenciaNum) < 0.001;
  const isFaltante = diferenciaNum < -0.001;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-border/60 shadow-2xl">
        <div className="p-5 pb-4 border-b bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/20">
          <DialogHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <Calculator className="size-4.5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground">
                    Arqueo de Caja #{arqueo.id}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Comprobante de conciliación física de caja
                  </DialogDescription>
                </div>
              </div>

              {isExacto ? (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs py-0.5 px-2.5 font-semibold flex items-center gap-1"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Cuadre Exacto</span>
                </Badge>
              ) : isFaltante ? (
                <Badge
                  variant="outline"
                  className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 text-xs py-0.5 px-2.5 font-semibold flex items-center gap-1"
                >
                  <AlertTriangle className="size-3.5" />
                  <span>Faltante</span>
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs py-0.5 px-2.5 font-semibold flex items-center gap-1"
                >
                  <AlertTriangle className="size-3.5" />
                  <span>Sobrante</span>
                </Badge>
              )}
            </div>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Metadatos del Turno */}
          <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl border border-border/60 bg-muted/20">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="size-3.5 text-primary shrink-0" />
              <span>
                Cajero: <strong className="text-foreground">{cajero}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Vault className="size-3.5 text-primary shrink-0" />
              <span>
                Caja: <strong className="text-foreground">{caja}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground pt-1 border-t border-border/30">
              <Calendar className="size-3.5 text-amber-600 shrink-0" />
              <span>
                Fecha: <strong className="text-foreground">{formatDatetime(arqueo.fechaHora)}</strong>
              </span>
            </div>
            {turno?.montoInicial !== undefined && (
              <div className="flex items-center gap-2 text-muted-foreground pt-1 border-t border-border/30">
                <Coins className="size-3.5 text-emerald-600 shrink-0" />
                <span>
                  Fondo Inicial: <strong className="text-foreground">{formatCurrency(turno.montoInicial)}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Desglose por método de pago */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Desglose de Formas de Pago ({arqueo.detalles?.length || 0})
            </span>

            <div className="border border-border/70 rounded-xl overflow-hidden divide-y divide-border/40 text-xs">
              <div className="grid grid-cols-12 gap-2 p-2.5 bg-muted/50 font-semibold text-muted-foreground text-[11px]">
                <div className="col-span-4">Método</div>
                <div className="col-span-3 text-right">Esperado</div>
                <div className="col-span-3 text-right">Contado</div>
                <div className="col-span-2 text-right">Diferencia</div>
              </div>

              {arqueo.detalles && arqueo.detalles.length > 0 ? (
                arqueo.detalles.map((det) => {
                  const diff = Number(det.diferencia || 0);
                  const isDiffZero = Math.abs(diff) < 0.001;

                  return (
                    <div key={det.id} className="grid grid-cols-12 gap-2 p-2.5 items-center">
                      <div className="col-span-4 font-medium text-foreground">
                        {det.metodoPago?.nombre || `Método #${det.metodoPagoId}`}
                      </div>
                      <div className="col-span-3 text-right font-mono text-muted-foreground">
                        {formatCurrency(det.montoEsperado)}
                      </div>
                      <div className="col-span-3 text-right font-mono font-bold text-foreground">
                        {formatCurrency(det.montoContado)}
                      </div>
                      <div
                        className={cn(
                          "col-span-2 text-right font-mono font-bold text-[11px]",
                          isDiffZero
                            ? "text-emerald-600 dark:text-emerald-400"
                            : diff < 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-amber-600 dark:text-amber-400"
                        )}
                      >
                        {diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-center text-muted-foreground text-xs">
                  Sin detalles registrados
                </div>
              )}
            </div>
          </div>

          {/* Totales Generales */}
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs p-3 rounded-xl border border-border/70 bg-card">
            <div className="p-2 bg-muted/30 rounded-lg">
              <span className="text-[10px] text-muted-foreground font-bold uppercase block">
                Total Esperado
              </span>
              <span className="font-mono font-bold text-foreground text-xs sm:text-sm">
                {formatCurrency(arqueo.totalEsperado)}
              </span>
            </div>
            <div className="p-2 bg-muted/30 rounded-lg">
              <span className="text-[10px] text-muted-foreground font-bold uppercase block">
                Total Contado
              </span>
              <span className="font-mono font-extrabold text-foreground text-xs sm:text-sm">
                {formatCurrency(arqueo.totalContado)}
              </span>
            </div>
            <div
              className={cn(
                "p-2 rounded-lg border",
                isExacto
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                  : isFaltante
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
              )}
            >
              <span className="text-[10px] font-bold uppercase block">
                Diferencia
              </span>
              <span className="font-mono font-black text-xs sm:text-sm">
                {diferenciaNum > 0 ? `+${formatCurrency(diferenciaNum)}` : formatCurrency(diferenciaNum)}
              </span>
            </div>
          </div>

          {/* Observaciones si las hay */}
          {arqueo.observacion && (
            <div className="p-3 rounded-xl border border-border/60 bg-muted/20 text-xs space-y-1">
              <span className="font-semibold text-muted-foreground flex items-center gap-1 text-[11px]">
                <FileText className="size-3" />
                Observación de Conciliación:
              </span>
              <p className="text-foreground">{arqueo.observacion}</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-muted/20 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs cursor-pointer"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
