"use client";

import * as React from "react";
import {
  Receipt,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  Clock,
  RotateCcw,
  CreditCard,
  Building2,
  User,
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
import { EstadoCobro, type CobroResponse } from "../../types/cobro.types";
import { CobroStatusBadge } from "../cobro-status-badge";

interface CobroReporteTableProps {
  items: CobroResponse[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onSelectCobro: (cobro: CobroResponse) => void;
}

export function CobroReporteTable({
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
  onSelectCobro,
}: Readonly<CobroReporteTableProps>) {
  const fromRecord = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const toRecord = Math.min(totalItems, page * pageSize);

  const pageTotals = React.useMemo(() => {
    return items.reduce(
      (acc, c) => {
        if (c.estado === EstadoCobro.Confirmado) {
          acc.totalConfirmado += Number(c.total) || 0;
          acc.validCount += 1;
        } else if (c.estado === EstadoCobro.Registrado) {
          acc.totalPendiente += Number(c.total) || 0;
        }
        return acc;
      },
      { totalConfirmado: 0, totalPendiente: 0, validCount: 0 }
    );
  }, [items]);

  return (
    <div className="bg-card rounded-2xl border border-border/40 shadow-xs overflow-hidden transition-all">
      {/* 1. Report Table Toolbar */}
      <div className="p-3.5 px-4.5 border-b border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Receipt className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Libro Diario de Cobranzas y Recaudación
              </h2>
              <span className="text-[11px] font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/20">
                {totalItems} {totalItems === 1 ? "registro" : "registros"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Desglose detallado de comprobantes de ingreso, formas de pago y arqueo por caja.
            </p>
          </div>
        </div>

        {/* Page size selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Mostrar:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger className="h-8 w-20 text-xs rounded-lg bg-background border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10" className="text-xs">10</SelectItem>
              <SelectItem value="15" className="text-xs">15</SelectItem>
              <SelectItem value="25" className="text-xs">25</SelectItem>
              <SelectItem value="50" className="text-xs">50</SelectItem>
              <SelectItem value="100" className="text-xs">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. Responsive Table Container */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/40 bg-muted/40">
              <TableHead className="w-28 text-xs font-bold text-foreground pl-4.5">
                N° Cobro
              </TableHead>
              <TableHead className="w-36 text-xs font-bold text-foreground">
                Fecha y Hora
              </TableHead>
              <TableHead className="w-28 text-xs font-bold text-foreground">
                Venta Ref.
              </TableHead>
              <TableHead className="min-w-[180px] text-xs font-bold text-foreground">
                Paciente / Pagador
              </TableHead>
              <TableHead className="min-w-[150px] text-xs font-bold text-foreground">
                Caja / Cajero
              </TableHead>
              <TableHead className="min-w-[180px] text-xs font-bold text-foreground">
                Formas de Pago
              </TableHead>
              <TableHead className="w-28 text-right text-xs font-bold text-foreground">
                Total (Bs.)
              </TableHead>
              <TableHead className="w-28 text-center text-xs font-bold text-foreground">
                Estado
              </TableHead>
              <TableHead className="w-20 text-right text-xs font-bold text-foreground pr-4.5">
                Consulta
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={`skeleton-row-${index}`} className="border-b border-border/30">
                  <TableCell className="pl-4.5">
                    <Skeleton className="h-5 w-20 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-28 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-36 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-28 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32 rounded" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-20 ml-auto rounded" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                  </TableCell>
                  <TableCell className="pr-4.5 text-right">
                    <Skeleton className="h-7 w-8 ml-auto rounded-lg" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                      <Receipt className="size-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        No se encontraron cobros registrados
                      </p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        No hay registros que coincidan con los filtros aplicados en este período.
                      </p>
                    </div>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearFilters}
                        className="text-xs rounded-xl gap-1.5 cursor-pointer mt-2"
                      >
                        <RotateCcw className="size-3.5" />
                        <span>Restablecer filtros</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((cobro) => {
                const fechaDate = new Date(cobro.fechaHora);
                const fechaFormatted = isNaN(fechaDate.getTime())
                  ? cobro.fechaHora
                  : fechaDate.toLocaleDateString("es-BO", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    });
                const horaFormatted = isNaN(fechaDate.getTime())
                  ? ""
                  : fechaDate.toLocaleTimeString("es-BO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                const pacienteNombre = cobro.ventaPagador?.pacienteNombreCompleto ||
                  (cobro.ventaPagador?.convenioNombre ? `Convenio: ${cobro.ventaPagador.convenioNombre}` : "Particular");
                const pacienteDoc = cobro.ventaPagador?.pacienteDocumento;
                const cajaNombre = cobro.turnoCaja?.caja?.nombre || "Caja";
                const cajeroNombre = cobro.turnoCaja?.empleado?.nombreCompleto || "";

                return (
                  <TableRow
                    key={cobro.id}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors group"
                  >
                    {/* N° Cobro */}
                    <TableCell className="pl-4.5 font-mono text-xs font-bold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Receipt className="size-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                        <span>{cobro.numero}</span>
                      </div>
                    </TableCell>

                    {/* Fecha y Hora */}
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground flex items-center gap-1">
                          <Calendar className="size-3 text-muted-foreground" />
                          {fechaFormatted}
                        </span>
                        {horaFormatted && (
                          <span className="text-[11px] text-muted-foreground/80 flex items-center gap-1 font-mono">
                            <Clock className="size-2.5" />
                            {horaFormatted}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Venta Asociada */}
                    <TableCell className="text-xs">
                      {cobro.ventaPagador?.ventaNumero ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/60">
                          #{cobro.ventaPagador.ventaNumero}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>

                    {/* Paciente / Pagador */}
                    <TableCell className="text-xs">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground block truncate max-w-[220px]" title={pacienteNombre}>
                          {pacienteNombre}
                        </span>
                        {pacienteDoc && (
                          <span className="text-[11px] text-muted-foreground font-mono block">
                            Doc: {pacienteDoc}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Caja / Cajero */}
                    <TableCell className="text-xs">
                      <div className="space-y-0.5">
                        <span className="font-medium text-foreground flex items-center gap-1 truncate max-w-[160px]" title={cajaNombre}>
                          <Building2 className="size-3 text-primary shrink-0" />
                          {cajaNombre}
                        </span>
                        {cajeroNombre && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate max-w-[160px]" title={cajeroNombre}>
                            <User className="size-2.5 shrink-0" />
                            {cajeroNombre}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Formas de Pago */}
                    <TableCell className="text-xs">
                      {cobro.detalles && cobro.detalles.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[240px]">
                          {cobro.detalles.map((det, i) => (
                            <span
                              key={`${det.id || i}`}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20"
                            >
                              <CreditCard className="size-2.5" />
                              <span>{det.metodoPago?.nombre || "Pago"}:</span>
                              <span className="font-mono">
                                Bs. {Number(det.monto).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          Sin formas registradas
                        </span>
                      )}
                    </TableCell>

                    {/* Monto Total */}
                    <TableCell className="text-right text-xs font-mono font-bold text-foreground">
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[13px]">
                        Bs. {Number(cobro.total).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </TableCell>

                    {/* Estado */}
                    <TableCell className="text-center">
                      <CobroStatusBadge cobro={cobro} />
                    </TableCell>

                    {/* Consulta */}
                    <TableCell className="text-right pr-4.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectCobro(cobro)}
                        className="size-8 p-0 rounded-lg hover:bg-sky-500/10 hover:text-sky-600 transition-colors cursor-pointer"
                        title="Consultar comprobante de cobro"
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>

          {/* Table Footer with Page Totals */}
          {items.length > 0 && (
            <TableFooter className="bg-muted/30 font-bold border-t border-border/40">
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="pl-4.5 text-xs text-foreground font-semibold">
                  Subtotales de esta página ({pageTotals.validCount} cobros confirmados):
                </TableCell>
                <TableCell className="text-right text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                  Bs. {pageTotals.totalConfirmado.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      {/* 3. Modern Pagination Controls */}
      {totalItems > 0 && (
        <div className="p-3.5 px-4.5 border-t border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/15">
          <div className="text-xs text-muted-foreground">
            Mostrando <span className="font-semibold text-foreground">{fromRecord}</span> a{" "}
            <span className="font-semibold text-foreground">{toRecord}</span> de{" "}
            <span className="font-semibold text-foreground">{totalItems}</span> cobros
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={page <= 1 || isLoading}
              className="size-8 p-0 rounded-lg border-border/60 cursor-pointer disabled:opacity-40"
              title="Primera página"
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isLoading}
              className="size-8 p-0 rounded-lg border-border/60 cursor-pointer disabled:opacity-40"
              title="Página anterior"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <span className="text-xs font-medium px-2.5 text-muted-foreground">
              Página <span className="font-bold text-foreground">{page}</span> de{" "}
              <span className="font-bold text-foreground">{totalPages}</span>
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || isLoading}
              className="size-8 p-0 rounded-lg border-border/60 cursor-pointer disabled:opacity-40"
              title="Página siguiente"
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages || isLoading}
              className="size-8 p-0 rounded-lg border-border/60 cursor-pointer disabled:opacity-40"
              title="Última página"
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
