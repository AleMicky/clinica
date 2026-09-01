"use client";

import * as React from "react";
import {
  ClipboardCheck,
  Warehouse,
  Calendar,
  FileText,
  Printer,
  PlayCircle,
  Calculator,
  Lock,
  Ban,
  TrendingUp,
  TrendingDown,
  Minus,
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
  EstadoInventarioFisico,
  type InventarioFisicoResponse,
} from "../types/inventario-fisico.types";
import { useInventarioFisico } from "../hooks/use-inventario-fisico";
import { getEstadoInventarioBadge } from "./inventario-fisico-list";

interface InventarioFisicoDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventarioId?: number | null;
  onIniciarConteo?: (inventario: InventarioFisicoResponse) => void;
  onRegistrarConteo?: (inventario: InventarioFisicoResponse) => void;
  onCerrar?: (inventario: InventarioFisicoResponse) => void;
  onAnular?: (inventario: InventarioFisicoResponse) => void;
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

export function InventarioFisicoDetailDialog({
  open,
  onOpenChange,
  inventarioId,
  onIniciarConteo,
  onRegistrarConteo,
  onCerrar,
  onAnular,
}: InventarioFisicoDetailDialogProps) {
  const { data: inventario, isLoading } = useInventarioFisico(
    inventarioId ?? 0,
    open && Boolean(inventarioId)
  );

  const handlePrint = () => {
    window.print();
  };

  const isBorrador = inventario?.estado === EstadoInventarioFisico.Borrador;
  const isEnConteo = inventario?.estado === EstadoInventarioFisico.EnConteo;
  const isCerrado = inventario?.estado === EstadoInventarioFisico.Cerrado;
  const isAnulado = inventario?.estado === EstadoInventarioFisico.Anulado;

  const totalSistema = (inventario?.detalles || []).reduce(
    (acc, d) => acc + (Number(d.cantidadSistema) || 0),
    0
  );
  const totalContado = (inventario?.detalles || []).reduce(
    (acc, d) => acc + (Number(d.cantidadContada) || 0),
    0
  );
  const totalDiferencia = (inventario?.detalles || []).reduce(
    (acc, d) => acc + (Number(d.diferencia) || 0),
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
                    Detalle de Inventario Físico
                  </DialogTitle>
                  {inventario && (
                    <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-muted text-foreground">
                      {inventario.numero}
                    </span>
                  )}
                </div>
                <DialogDescription className="text-[11px] text-muted-foreground">
                  Resultados del conteo y cálculo de discrepancias de existencias
                </DialogDescription>
              </div>
            </div>

            {inventario && (
              <div>{getEstadoInventarioBadge(inventario.estado)}</div>
            )}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1 text-xs">
          {isLoading || !inventario ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
          ) : (
            <>
              {/* Summary Header */}
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-md bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0">
                    <Warehouse className="size-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Almacén Auditado
                    </span>
                    <p className="text-xs font-semibold text-foreground">
                      {inventario.almacenNombre || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-md bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0">
                    <Calendar className="size-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Fecha Inicio
                    </span>
                    <p className="text-xs font-mono font-medium text-foreground">
                      {formatDate(inventario.fechaInicio)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-md bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0">
                    <Calendar className="size-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Fecha Cierre
                    </span>
                    <p className="text-xs font-mono font-medium text-foreground">
                      {formatDate(inventario.fechaCierre)}
                    </p>
                  </div>
                </div>
              </div>

              {inventario.observacion && (
                <div className="p-2.5 rounded-lg bg-card border border-border/40 text-xs">
                  <span className="font-semibold text-muted-foreground text-[10px] uppercase block mb-0.5">
                    Observaciones
                  </span>
                  <p className="text-foreground">{inventario.observacion}</p>
                </div>
              )}

              {/* Items Table */}
              <div className="rounded-lg border border-border/60 overflow-hidden bg-card shadow-2xs">
                <div className="px-3 py-2 bg-muted/40 border-b border-border/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Conteo de Artículos ({inventario.detalles?.length || 0})
                  </span>
                </div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground font-semibold text-[10px]">
                      <th className="px-3 py-1.5 w-8">#</th>
                      <th className="px-3 py-1.5">Producto</th>
                      <th className="px-3 py-1.5 w-24 text-right">Sistema</th>
                      <th className="px-3 py-1.5 w-24 text-right">Contado</th>
                      <th className="px-3 py-1.5 w-28 text-right">Diferencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {(inventario.detalles || []).map((item, idx) => {
                      const diff = Number(item.diferencia);
                      const isPositive = diff > 0;
                      const isNegative = diff < 0;

                      return (
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
                            {Number(item.cantidadSistema).toLocaleString("es-ES")}
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono font-semibold text-foreground">
                            {item.cantidadContada !== null &&
                            item.cantidadContada !== undefined
                              ? Number(item.cantidadContada).toLocaleString("es-ES")
                              : "-"}
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono font-semibold">
                            {item.cantidadContada === null ||
                            item.cantidadContada === undefined ? (
                              <span className="text-muted-foreground">-</span>
                            ) : isPositive ? (
                              <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-0.5">
                                <TrendingUp className="size-3" />
                                +{diff.toLocaleString("es-ES")} (Sobrante)
                              </span>
                            ) : isNegative ? (
                              <span className="text-rose-600 dark:text-rose-400 inline-flex items-center gap-0.5">
                                <TrendingDown className="size-3" />
                                {diff.toLocaleString("es-ES")} (Faltante)
                              </span>
                            ) : (
                              <span className="text-muted-foreground inline-flex items-center gap-0.5">
                                <Minus className="size-3" />
                                0.00 (Exacto)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border/60 bg-muted/30 font-bold text-xs font-mono">
                      <td colSpan={2} className="px-3 py-2 text-right">
                        Totales:
                      </td>
                      <td className="px-3 py-2 text-right">
                        {totalSistema.toLocaleString("es-ES")}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {totalContado.toLocaleString("es-ES")}
                      </td>
                      <td
                        className={`px-3 py-2 text-right ${
                          totalDiferencia > 0
                            ? "text-emerald-600"
                            : totalDiferencia < 0
                            ? "text-rose-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        {totalDiferencia > 0
                          ? `+${totalDiferencia.toLocaleString("es-ES")}`
                          : totalDiferencia.toLocaleString("es-ES")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
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
            {inventario && !isCerrado && !isAnulado && onAnular && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAnular(inventario)}
                className="h-7 text-xs text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer"
              >
                <Ban className="size-3" />
                <span>Anular</span>
              </Button>
            )}

            {inventario && isBorrador && onIniciarConteo && (
              <Button
                type="button"
                size="sm"
                onClick={() => onIniciarConteo(inventario)}
                className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1 cursor-pointer font-medium"
              >
                <PlayCircle className="size-3" />
                <span>Iniciar Conteo</span>
              </Button>
            )}

            {inventario && isEnConteo && onRegistrarConteo && (
              <Button
                type="button"
                size="sm"
                onClick={() => onRegistrarConteo(inventario)}
                className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1 cursor-pointer font-medium"
              >
                <Calculator className="size-3" />
                <span>Registrar Conteos</span>
              </Button>
            )}

            {inventario && isEnConteo && onCerrar && (
              <Button
                type="button"
                size="sm"
                onClick={() => onCerrar(inventario)}
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 cursor-pointer font-medium"
              >
                <Lock className="size-3" />
                <span>Cerrar y Ajustar</span>
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
