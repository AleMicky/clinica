"use client";

import * as React from "react";
import {
  FileText,
  Warehouse,
  Package,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  Coins,
  Scale,
  Receipt,
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
import { Input } from "@/components/ui/input";
import { cn, formatDate } from "@/lib/utils";
import { useKardex } from "../hooks/use-kardex";

interface KardexModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  almacenId?: number | null;
  productoId?: number | null;
  productoNombre?: string | null;
  productoCodigo?: string | null;
  almacenNombre?: string | null;
}

export function KardexModal({
  open,
  onOpenChange,
  almacenId,
  productoId,
  productoNombre,
  productoCodigo,
  almacenNombre,
}: KardexModalProps) {
  const [fechaInicio, setFechaInicio] = React.useState<string>("");
  const [fechaFin, setFechaFin] = React.useState<string>("");

  const isEnabled = Boolean(open && almacenId && productoId);

  const {
    data: kardex,
    isLoading,
    refetch,
    isFetching,
  } = useKardex(
    isEnabled
      ? {
          almacenId: almacenId!,
          productoId: productoId!,
          fechaInicio: fechaInicio || undefined,
          fechaFin: fechaFin || undefined,
        }
      : undefined,
    { enabled: isEnabled }
  );

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return "$0.00";
    return `$${Number(val).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-5 max-h-[90vh] flex flex-col gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="pb-3 border-b border-border/60">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Receipt className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Kárdex Físico - Valorado (PMP)</span>
                  {productoCodigo && (
                    <Badge variant="outline" className="font-mono text-xs">
                      {productoCodigo}
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Package className="size-3 text-primary" />
                    {productoNombre || kardex?.productoNombre || "Producto"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Warehouse className="size-3 text-muted-foreground" />
                    {almacenNombre || kardex?.almacenNombre || "Almacén"}
                  </span>
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              className="size-8 shrink-0 border-border/60"
              title="Refrescar Kárdex"
            >
              <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
            </Button>
          </div>

          {/* Date Range Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              <span>Desde:</span>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="h-7 text-xs w-36 px-2"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Hasta:</span>
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="h-7 text-xs w-36 px-2"
              />
            </div>
            {(fechaInicio || fechaFin) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFechaInicio("");
                  setFechaFin("");
                }}
                className="h-7 text-xs px-2 text-muted-foreground"
              >
                Limpiar fechas
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-xs">Calculando movimientos y saldo PMP...</p>
            </div>
          ) : !kardex ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No se pudo cargar la información del Kárdex.
            </div>
          ) : (
            <>
              {/* Summary Metrics (Inicial vs Final) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex flex-col justify-between">
                  <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Scale className="size-3.5 text-blue-500" />
                    <span>Saldo Inicial</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <div>
                      <span className="font-mono text-base font-bold text-foreground">
                        {kardex.saldoInicialCantidad.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-1">unidades</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-foreground">
                        {formatCurrency(kardex.saldoInicialValorTotal)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        PMP: {formatCurrency(kardex.saldoInicialCostoUnitario)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border/60 bg-primary/5 flex flex-col justify-between">
                  <div className="text-[11px] font-semibold text-primary flex items-center gap-1.5">
                    <Coins className="size-3.5 text-primary" />
                    <span>Saldo Final en Almacén</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <div>
                      <span className="font-mono text-base font-bold text-primary">
                        {kardex.saldoFinalCantidad.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-1">unidades</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-primary">
                        {formatCurrency(kardex.saldoFinalValorTotal)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        PMP: {formatCurrency(kardex.saldoFinalCostoUnitario)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="border border-border/60 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 border-b border-border/60 text-[10px] uppercase font-semibold text-muted-foreground">
                      <tr>
                        <th className="py-2 px-2.5">Fecha</th>
                        <th className="py-2 px-2.5">Comprobante</th>
                        <th className="py-2 px-2.5">Tipo Movimiento</th>
                        <th className="py-2 px-2 text-right">Cant. Mov.</th>
                        <th className="py-2 px-2 text-right">Costo Mov.</th>
                        <th className="py-2 px-2 text-right">Total Mov.</th>
                        <th className="py-2 px-2 text-right bg-muted/40 font-bold text-foreground">
                          Saldo Stock
                        </th>
                        <th className="py-2 px-2 text-right bg-muted/40 font-bold text-foreground">
                          PMP Actual
                        </th>
                        <th className="py-2 px-2.5 text-right bg-muted/40 font-bold text-foreground">
                          Valor Stock
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {kardex.movimientos.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-6 text-center text-xs text-muted-foreground">
                            No se registraron movimientos en el rango seleccionado.
                          </td>
                        </tr>
                      ) : (
                        kardex.movimientos.map((mov) => {
                          const isEntrada = mov.naturaleza === "ENTRADA";
                          const cant = isEntrada ? mov.cantidadEntrada : mov.cantidadSalida;
                          const costo = isEntrada
                            ? mov.costoUnitarioEntrada
                            : mov.costoUnitarioSalida;
                          const total = isEntrada
                            ? mov.valorTotalEntrada
                            : mov.valorTotalSalida;

                          return (
                            <tr key={mov.movimientoId} className="hover:bg-muted/30 transition-colors">
                              <td className="py-2 px-2.5 whitespace-nowrap text-muted-foreground">
                                {formatDate(mov.fecha)}
                              </td>
                              <td className="py-2 px-2.5 font-mono font-medium text-foreground whitespace-nowrap">
                                {mov.numero}
                                {mov.referenciaOrigen && (
                                  <span className="block text-[10px] text-muted-foreground font-sans">
                                    Ref: {mov.referenciaOrigen}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-2.5">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[9px] h-4.5 px-1.5 font-semibold gap-1",
                                    isEntrada
                                      ? "text-emerald-700 dark:text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
                                      : "text-amber-700 dark:text-amber-300 border-amber-500/30 bg-amber-500/10"
                                  )}
                                >
                                  {isEntrada ? (
                                    <ArrowDownLeft className="size-2.5" />
                                  ) : (
                                    <ArrowUpRight className="size-2.5" />
                                  )}
                                  {mov.tipoMovimientoNombre}
                                </Badge>
                              </td>
                              <td className="py-2 px-2 text-right font-mono font-semibold">
                                <span className={isEntrada ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                                  {isEntrada ? "+" : "-"}
                                  {cant.toLocaleString()}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-right font-mono text-muted-foreground">
                                {formatCurrency(costo)}
                              </td>
                              <td className="py-2 px-2 text-right font-mono text-foreground font-medium">
                                {formatCurrency(total)}
                              </td>
                              <td className="py-2 px-2 text-right font-mono font-bold bg-muted/20 text-foreground">
                                {mov.saldoCantidad.toLocaleString()}
                              </td>
                              <td className="py-2 px-2 text-right font-mono bg-muted/20 text-muted-foreground">
                                {formatCurrency(mov.saldoCostoUnitario)}
                              </td>
                              <td className="py-2 px-2.5 text-right font-mono font-bold bg-muted/20 text-primary">
                                {formatCurrency(mov.saldoValorTotal)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
