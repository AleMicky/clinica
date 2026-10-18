"use client";

import * as React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Store,
  Calendar,
  FileText,
  User,
  Copy,
  Check,
  Coins,
  Trash2,
  Tag,
  ShieldCheck,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { MovimientoCajaResponse } from "../types/movimiento-caja.types";

interface MovimientoCajaDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimiento: MovimientoCajaResponse | null;
  onDelete?: (movimiento: MovimientoCajaResponse) => void;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-BO", {
    dateStyle: "full",
    timeStyle: "medium",
  });
}

function formatBs(val: number): string {
  return Number(val || 0).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function MovimientoCajaDetailSheet({
  open,
  onOpenChange,
  movimiento,
  onDelete,
}: Readonly<MovimientoCajaDetailSheetProps>) {
  const [copied, setCopied] = React.useState(false);

  if (!movimiento) return null;

  const isEntrada =
    movimiento.naturalezaAplicada?.toUpperCase() === "ENTRADA" ||
    movimiento.tipoMovimientoCaja?.naturaleza?.toUpperCase() === "ENTRADA";

  const simbolo = movimiento.moneda?.simbolo || "Bs.";
  const montoFormateado = formatBs(movimiento.monto);
  const baseFormateado = formatBs(movimiento.montoMonedaBase ?? movimiento.monto);

  const handleCopyRef = () => {
    if (!movimiento.referencia) return;
    void navigator.clipboard.writeText(movimiento.referencia);
    setCopied(true);
    toast.success("Referencia copiada al portapapeles.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col gap-0 overflow-y-auto"
      >
        {/* Cabecera Destacada */}
        <SheetHeader className="p-5 pb-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                isEntrada
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
              }`}
            >
              {isEntrada ? (
                <ArrowDownLeft className="size-3.5" />
              ) : (
                <ArrowUpRight className="size-3.5" />
              )}
              <span>{isEntrada ? "Ingreso de Efectivo (+)" : "Egreso de Efectivo (-)"}</span>
            </span>

            <span className="text-[11px] font-mono text-muted-foreground">
              ID #{movimiento.id}
            </span>
          </div>

          <div className="mt-3">
            <SheetTitle className="text-2xl font-black font-mono tracking-tight flex items-baseline gap-1.5">
              <span
                className={`text-sm font-bold ${
                  isEntrada
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {isEntrada ? "+" : "-"}
              </span>
              <span
                className={
                  isEntrada
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }
              >
                {simbolo} {montoFormateado}
              </span>
            </SheetTitle>

            {movimiento.tipoCambio && movimiento.tipoCambio !== 1 && (
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Equivalente base: <strong>Bs. {baseFormateado}</strong> (TC:{" "}
                {Number(movimiento.tipoCambio).toFixed(4)})
              </p>
            )}

            <SheetDescription className="text-xs text-muted-foreground mt-1">
              {movimiento.conceptoMovimientoCaja?.nombre || "Movimiento registrado"}
            </SheetDescription>
          </div>
        </SheetHeader>

        {/* Cuerpo del Detalle */}
        <div className="flex-1 p-5 space-y-4">
          {/* Clasificación */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="size-3" />
              <span>Clasificación del Movimiento</span>
            </h4>
            <div className="rounded-lg border border-border/70 p-3 bg-card space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tipo de Movimiento:</span>
                <span className="font-semibold text-foreground">
                  {movimiento.tipoMovimientoCaja?.nombre || "-"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Concepto / Motivo:</span>
                <span className="font-semibold text-foreground text-right max-w-[220px]">
                  {movimiento.conceptoMovimientoCaja?.nombre || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Caja y Turno */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Store className="size-3" />
              <span>Caja y Turno</span>
            </h4>
            <div className="rounded-lg border border-border/70 p-3 bg-card space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Caja:</span>
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <span>{movimiento.turnoCaja?.caja?.nombre || "Caja General"}</span>
                  {movimiento.turnoCaja?.caja?.codigo && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                      {movimiento.turnoCaja.caja.codigo}
                    </Badge>
                  )}
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cajero Asignado:</span>
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <User className="size-3 text-muted-foreground" />
                  <span>
                    {movimiento.turnoCaja?.empleado?.nombreCompleto ||
                      movimiento.creadoPor ||
                      "Personal de Turno"}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Fecha y Hora:</span>
                <div className="flex items-center gap-1.5 text-foreground font-mono text-[11px]">
                  <Calendar className="size-3 text-muted-foreground" />
                  <span>{formatDate(movimiento.fechaHora)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información Monetaria */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="size-3" />
              <span>Información Monetaria</span>
            </h4>
            <div className="rounded-lg border border-border/70 p-3 bg-card space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center font-sans">
                <span className="text-muted-foreground">Moneda:</span>
                <span className="font-semibold text-foreground">
                  {movimiento.moneda?.nombre || "Bolivianos"} ({simbolo})
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-sans">Monto Transacción:</span>
                <span className="font-bold text-foreground">
                  {simbolo} {montoFormateado}
                </span>
              </div>
              {movimiento.tipoCambio && movimiento.tipoCambio !== 1 && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-sans">Tipo de Cambio:</span>
                    <span className="text-foreground">
                      {Number(movimiento.tipoCambio).toFixed(4)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-sans">Total en Moneda Base:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      Bs. {baseFormateado}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Comprobante / Referencia */}
          {movimiento.referencia && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="size-3" />
                <span>N° Comprobante / Referencia</span>
              </h4>
              <div className="rounded-lg border border-border/70 p-3 bg-muted/30 flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-foreground">
                  {movimiento.referencia}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={handleCopyRef}
                >
                  {copied ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5 text-muted-foreground" />
                  )}
                  <span className="sr-only">Copiar</span>
                </Button>
              </div>
            </div>
          )}

          {/* Observaciones */}
          {movimiento.observacion && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Observaciones
              </h4>
              <p className="rounded-lg border border-border/70 p-3 bg-card text-xs text-foreground leading-relaxed italic">
                &ldquo;{movimiento.observacion}&rdquo;
              </p>
            </div>
          )}

          {/* Auditoría */}
          <div className="pt-2 text-[10px] text-muted-foreground space-y-1 font-mono">
            <div className="flex items-center gap-1 text-muted-foreground/80">
              <ShieldCheck className="size-3" />
              <span>Asiento financiero verificado</span>
            </div>
            {movimiento.fechaCreacion && (
              <p>Registrado en sistema: {formatDate(movimiento.fechaCreacion)}</p>
            )}
          </div>
        </div>

        {/* Footer con Acciones */}
        <SheetFooter className="p-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-between gap-2">
          {onDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onDelete(movimiento);
              }}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5 text-xs"
            >
              <Trash2 className="size-3.5" />
              <span>Eliminar</span>
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs font-semibold px-4"
          >
            Cerrar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
