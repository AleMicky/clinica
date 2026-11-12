"use client";

import * as React from "react";
import {
  FileSpreadsheet,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  Clock,
  RotateCcw,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EstadoVenta, type VentaResponse } from "../../types/ventas.types";
import { VentaStatusBadge } from "../venta-status-badge";

interface VentaReporteTableProps {
  items: VentaResponse[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onSelectVenta: (venta: VentaResponse) => void;
}

export function VentaReporteTable({
  items,
  totalItems,
  page,
  pageSize,
  totalPages,
  isLoading,
  hasActiveFilters,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
  onSelectVenta,
}: Readonly<VentaReporteTableProps>) {
  const fromRecord = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const toRecord = Math.min(totalItems, page * pageSize);

  const pageTotals = React.useMemo(() => {
    return items.reduce(
      (acc, v) => {
        if (v.estado !== EstadoVenta.Anulada) {
          acc.subtotal += Number(v.subtotal) || 0;
          acc.descuento += Number(v.descuento) || 0;
          acc.total += Number(v.total) || 0;
          acc.validCount += 1;
        }
        return acc;
      },
      { subtotal: 0, descuento: 0, total: 0, validCount: 0 }
    );
  }, [items]);

  return (
    <div className="bg-card rounded-2xl border border-border/40 shadow-xs overflow-hidden transition-all">
      {/* 1. Report Table Toolbar */}
      <div className="p-3.5 px-4.5 border-b border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Libro Diario de Ventas
              </h2>
              <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {totalItems} {totalItems === 1 ? "registro" : "registros"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Desglose detallado de subtotales, descuentos y facturación neta por comprobante.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs self-end sm:self-auto shrink-0">
          <span className="text-muted-foreground text-[11px]">Filas:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger className="h-7 w-16 text-xs rounded-lg bg-background border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10" className="text-xs">
                10
              </SelectItem>
              <SelectItem value="15" className="text-xs">
                15
              </SelectItem>
              <SelectItem value="25" className="text-xs">
                25
              </SelectItem>
              <SelectItem value="50" className="text-xs">
                50
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. Interactive Data Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/30 bg-muted/10 text-[11px]">
              <TableHead className="w-28 font-bold uppercase tracking-wider text-muted-foreground pl-4">
                N° Venta
              </TableHead>
              <TableHead className="w-36 font-bold uppercase tracking-wider text-muted-foreground">
                Fecha / Hora
              </TableHead>
              <TableHead className="font-bold uppercase tracking-wider text-muted-foreground">
                Paciente
              </TableHead>
              <TableHead className="w-36 font-bold uppercase tracking-wider text-muted-foreground">
                Vendedor
              </TableHead>
              <TableHead className="w-24 text-right font-bold uppercase tracking-wider text-muted-foreground">
                Subtotal
              </TableHead>
              <TableHead className="w-24 text-right font-bold uppercase tracking-wider text-muted-foreground">
                Descuento
              </TableHead>
              <TableHead className="w-28 text-right font-bold uppercase tracking-wider text-foreground">
                Total Neto
              </TableHead>
              <TableHead className="w-28 text-center font-bold uppercase tracking-wider text-muted-foreground">
                Estado
              </TableHead>
              <TableHead className="w-20 text-right pr-4 font-bold uppercase tracking-wider text-muted-foreground">
                Acción
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="text-xs">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={`skeleton-row-${idx}`} className="border-border/20">
                  <TableCell className="pl-4">
                    <Skeleton className="h-4 w-20 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-36 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24 rounded" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-14 ml-auto rounded" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-12 ml-auto rounded" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-16 ml-auto rounded" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-5 w-20 mx-auto rounded-full" />
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <Skeleton className="h-7 w-14 ml-auto rounded-lg" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-muted-foreground">
                    <div className="size-10 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground/60 mb-1">
                      <FileSpreadsheet className="size-5" />
                    </div>
                    <span className="font-semibold text-sm text-foreground">
                      No se encontraron registros de ventas
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {hasActiveFilters
                        ? "Ninguna venta coincide con los criterios de búsqueda y filtros seleccionados."
                        : "Aún no hay comprobantes de venta registrados en el sistema."}
                    </p>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearFilters}
                        className="mt-2 h-7.5 px-3 text-xs gap-1.5 rounded-lg cursor-pointer"
                      >
                        <RotateCcw className="size-3" />
                        <span>Restablecer Filtros</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((venta) => {
                const dateObj = venta.fecha ? new Date(venta.fecha) : null;
                const formattedDate = dateObj && !Number.isNaN(dateObj.getTime())
                  ? dateObj.toLocaleDateString("es-BO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : venta.fecha;
                const formattedTime = dateObj && !Number.isNaN(dateObj.getTime())
                  ? dateObj.toLocaleTimeString("es-BO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";

                return (
                  <TableRow
                    key={venta.id}
                    className="border-border/25 hover:bg-muted/30 transition-colors group"
                  >
                    {/* N° Venta */}
                    <TableCell className="pl-4 font-mono font-bold text-foreground">
                      <span className="bg-muted/50 px-2 py-0.5 rounded text-[11px] border border-border/40">
                        {venta.numero}
                      </span>
                    </TableCell>

                    {/* Fecha / Hora */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                          <Calendar className="size-3 text-muted-foreground" />
                          <span>{formattedDate}</span>
                        </div>
                        {formattedTime && (
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Clock className="size-3 text-muted-foreground/70" />
                            <span>{formattedTime}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Paciente */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground block">
                          {venta.paciente?.nombreCompleto || "Paciente sin registrar"}
                        </span>
                        {venta.paciente?.numeroHistoriaClinica && (
                          <span className="text-[11px] text-muted-foreground font-mono">
                            HC: {venta.paciente.numeroHistoriaClinica}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Vendedor */}
                    <TableCell className="text-muted-foreground">
                      <span className="truncate block max-w-[140px]" title={venta.vendedor?.nombreCompleto}>
                        {venta.vendedor?.nombreCompleto || "-"}
                      </span>
                    </TableCell>

                    {/* Subtotal */}
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {Number(venta.subtotal || venta.total).toLocaleString("es-BO", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>

                    {/* Descuento */}
                    <TableCell className="text-right font-mono text-amber-600 dark:text-amber-400">
                      {Number(venta.descuento || 0) > 0 ? (
                        <span>
                          -{Number(venta.descuento).toLocaleString("es-BO", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </TableCell>

                    {/* Total Neto */}
                    <TableCell className="text-right font-mono font-bold text-foreground">
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 mr-1 font-sans">Bs.</span>
                      {Number(venta.total).toLocaleString("es-BO", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>

                    {/* Estado */}
                    <TableCell className="text-center">
                      <VentaStatusBadge estado={venta.estado} />
                    </TableCell>

                    {/* Acción: Ver Ficha */}
                    <TableCell className="text-right pr-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectVenta(venta)}
                        className="h-7.5 px-2.5 text-xs gap-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-all cursor-pointer font-medium"
                        title="Ver detalle del comprobante de venta"
                      >
                        <Eye className="size-3.5" />
                        <span className="hidden sm:inline">Detalle</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>

          {/* 3. Totales de la Página (Commercial Summary Footer) */}
          {!isLoading && items.length > 0 && (
            <TableFooter className="bg-muted/40 font-semibold text-xs border-t-2 border-border/60">
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="pl-4 py-3 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Coins className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Subtotales de esta página ({pageTotals.validCount} ventas no anuladas):</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  Bs. {pageTotals.subtotal.toLocaleString("es-BO", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right font-mono text-amber-600 dark:text-amber-400">
                  {pageTotals.descuento > 0 ? (
                    `-Bs. ${pageTotals.descuento.toLocaleString("es-BO", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  ) : (
                    "Bs. 0.00"
                  )}
                </TableCell>
                <TableCell className="text-right font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  Bs. {pageTotals.total.toLocaleString("es-BO", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      {/* 4. Table Pagination */}
      <div className="p-3 px-4.5 border-t border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/10 text-xs">
        <div className="text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{fromRecord}</span> a{" "}
          <span className="font-semibold text-foreground">{toRecord}</span> de{" "}
          <span className="font-semibold text-foreground">{totalItems}</span> comprobantes
        </div>

        <div className="flex items-center gap-1.5 self-center sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={page <= 1 || isLoading}
            className="size-7 p-0 rounded-lg cursor-pointer"
            title="Primera página"
          >
            <ChevronsLeft className="size-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            className="size-7 p-0 rounded-lg cursor-pointer"
            title="Página anterior"
          >
            <ChevronLeft className="size-3.5" />
          </Button>

          <span className="px-2.5 text-xs font-medium text-foreground">
            Página <strong className="font-mono">{page}</strong> de{" "}
            <strong className="font-mono">{totalPages}</strong>
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            className="size-7 p-0 rounded-lg cursor-pointer"
            title="Página siguiente"
          >
            <ChevronRight className="size-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages || isLoading}
            className="size-7 p-0 rounded-lg cursor-pointer"
            title="Última página"
          >
            <ChevronsRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
