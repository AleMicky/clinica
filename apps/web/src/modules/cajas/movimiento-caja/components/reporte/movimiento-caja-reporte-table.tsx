"use client";

import * as React from "react";
import {
  ArrowLeftRight,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  Clock,
  RotateCcw,
  Building2,
  User,
  ArrowUpRight,
  ArrowDownRight,
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
import type { MovimientoCajaResponse } from "../../types/movimiento-caja.types";

interface MovimientoCajaReporteTableProps {
  items: MovimientoCajaResponse[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onSelectMovimiento: (movimiento: MovimientoCajaResponse) => void;
}

export function MovimientoCajaReporteTable({
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
  onSelectMovimiento,
}: Readonly<MovimientoCajaReporteTableProps>) {
  const fromRecord = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const toRecord = Math.min(totalItems, page * pageSize);

  const pageTotals = React.useMemo(() => {
    return items.reduce(
      (acc, m) => {
        const monto = Number(m.montoMonedaBase ?? m.monto) || 0;
        const isEntrada =
          m.naturalezaAplicada?.toUpperCase() === "ENTRADA" ||
          m.tipoMovimientoCaja?.naturaleza?.toUpperCase() === "ENTRADA";

        if (isEntrada) {
          acc.totalIngresos += monto;
          acc.countIngresos += 1;
        } else {
          acc.totalEgresos += monto;
          acc.countEgresos += 1;
        }
        return acc;
      },
      { totalIngresos: 0, totalEgresos: 0, countIngresos: 0, countEgresos: 0 }
    );
  }, [items]);

  const pageBalance = pageTotals.totalIngresos - pageTotals.totalEgresos;

  return (
    <div className="bg-card rounded-2xl border border-border/40 shadow-xs overflow-hidden transition-all">
      {/* 1. Report Table Toolbar */}
      <div className="p-3.5 px-4.5 border-b border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ArrowLeftRight className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Libro Diario de Movimientos de Caja
              </h2>
              <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                {totalItems} {totalItems === 1 ? "operación" : "operaciones"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Desglose cronológico de transacciones registradas en caja
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            Mostrar:
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger className="h-8 text-xs w-28 bg-background border-border/60 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10" className="text-xs">10 por pág.</SelectItem>
              <SelectItem value="15" className="text-xs">15 por pág.</SelectItem>
              <SelectItem value="25" className="text-xs">25 por pág.</SelectItem>
              <SelectItem value="50" className="text-xs">50 por pág.</SelectItem>
              <SelectItem value="100" className="text-xs">100 por pág.</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. Responsive Table Body */}
      <div className="overflow-x-auto">
        <Table className="w-full min-w-[900px]">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/40 text-[11px] uppercase tracking-wider">
              <TableHead className="w-16 pl-4.5 font-bold text-foreground">ID</TableHead>
              <TableHead className="w-40 font-bold text-foreground">Fecha / Hora</TableHead>
              <TableHead className="w-44 font-bold text-foreground">Caja / Cajero</TableHead>
              <TableHead className="w-44 font-bold text-foreground">Tipo de Movimiento</TableHead>
              <TableHead className="w-48 font-bold text-foreground">Concepto</TableHead>
              <TableHead className="w-32 text-center font-bold text-foreground">Naturaleza</TableHead>
              <TableHead className="w-32 text-right font-bold text-foreground">Monto (Bs.)</TableHead>
              <TableHead className="font-bold text-foreground">Referencia / Obs.</TableHead>
              <TableHead className="w-14 text-right pr-4.5 font-bold text-foreground">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`skeleton-${i + 1}`} className="border-b border-border/30">
                  <TableCell className="pl-4.5"><Skeleton className="h-4 w-10 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 rounded" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-5 w-20 mx-auto rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36 rounded" /></TableCell>
                  <TableCell className="text-right pr-4.5"><Skeleton className="size-7 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-56 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <div className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                      <ArrowLeftRight className="size-6 opacity-40" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                      No se encontraron movimientos de caja
                    </p>
                    <p className="text-[11px] text-muted-foreground text-center">
                      {hasActiveFilters
                        ? "No hay operaciones que coincidan con los filtros aplicados. Prueba ajustando el período o la búsqueda."
                        : "Aún no se han registrado movimientos de caja en el período consultado."}
                    </p>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearFilters}
                        className="mt-2 h-7.5 text-xs gap-1.5 rounded-lg border-border/60 hover:bg-muted/60 cursor-pointer"
                      >
                        <RotateCcw className="size-3" />
                        <span>Restablecer Filtros</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((mov) => {
                const isEntrada =
                  mov.naturalezaAplicada?.toUpperCase() === "ENTRADA" ||
                  mov.tipoMovimientoCaja?.naturaleza?.toUpperCase() === "ENTRADA";
                const monto = Number(mov.montoMonedaBase ?? mov.monto);

                // Format fecha
                let fechaFormatted = mov.fechaHora;
                let horaFormatted = "";
                if (mov.fechaHora) {
                  try {
                    const d = new Date(mov.fechaHora);
                    fechaFormatted = d.toLocaleDateString("es-BO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    horaFormatted = d.toLocaleTimeString("es-BO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  } catch {
                    // keep raw
                  }
                }

                return (
                  <TableRow
                    key={mov.id}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors group"
                  >
                    {/* ID */}
                    <TableCell className="pl-4.5 font-mono text-xs font-bold text-foreground">
                      #{mov.id}
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

                    {/* Caja / Cajero */}
                    <TableCell className="text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-foreground flex items-center gap-1 truncate">
                          <Building2 className="size-3 text-muted-foreground shrink-0" />
                          {mov.turnoCaja?.caja?.nombre || `Turno #${mov.turnoCaja?.id || "-"}`}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                          <User className="size-2.5 shrink-0" />
                          {mov.turnoCaja?.empleado?.nombreCompleto || "Cajero"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Tipo de Movimiento */}
                    <TableCell className="text-xs font-medium text-foreground">
                      <div className="truncate max-w-[170px]" title={mov.tipoMovimientoCaja?.nombre}>
                        {mov.tipoMovimientoCaja?.nombre || "-"}
                      </div>
                    </TableCell>

                    {/* Concepto */}
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="truncate max-w-[190px]" title={mov.conceptoMovimientoCaja?.nombre}>
                        {mov.conceptoMovimientoCaja?.nombre || "-"}
                      </div>
                    </TableCell>

                    {/* Naturaleza Badge */}
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          isEntrada
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
                        }`}
                      >
                        {isEntrada ? (
                          <>
                            <ArrowUpRight className="size-3 text-emerald-600 dark:text-emerald-400" />
                            Entrada
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="size-3 text-rose-600 dark:text-rose-400" />
                            Salida
                          </>
                        )}
                      </span>
                    </TableCell>

                    {/* Monto (Bs.) */}
                    <TableCell className="text-right text-xs font-mono font-bold">
                      <span className={isEntrada ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                        {isEntrada ? "+" : "-"}Bs. {monto.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      {mov.moneda?.simbolo && mov.moneda.simbolo !== "Bs." && (
                        <span className="block text-[10px] text-muted-foreground font-normal">
                          ({mov.moneda.simbolo} {mov.monto.toLocaleString("es-BO", { minimumFractionDigits: 2 })})
                        </span>
                      )}
                    </TableCell>

                    {/* Referencia / Observación */}
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="truncate max-w-[200px]" title={mov.referencia || mov.observacion || ""}>
                        {mov.referencia ? (
                          <span className="font-semibold text-foreground mr-1.5">{mov.referencia}</span>
                        ) : null}
                        <span>{mov.observacion || "-"}</span>
                      </div>
                    </TableCell>

                    {/* Acción Ver Detalle */}
                    <TableCell className="text-right pr-4.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectMovimiento(mov)}
                        className="size-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                        title="Ver detalle completo del movimiento"
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>

          {/* Table Footer with Page Subtotals */}
          {items.length > 0 && (
            <TableFooter className="bg-muted/30 font-bold border-t border-border/40">
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="pl-4.5 text-xs text-foreground font-semibold">
                  Subtotales de esta página ({pageTotals.countIngresos} entradas, {pageTotals.countEgresos} salidas):
                </TableCell>
                <TableCell className="text-right text-xs font-mono font-extrabold">
                  <div className="flex flex-col">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      +Bs. {pageTotals.totalIngresos.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-rose-600 dark:text-rose-400">
                      -Bs. {pageTotals.totalEgresos.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`pt-0.5 border-t border-border/40 ${pageBalance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {pageBalance >= 0 ? "+" : ""}Bs. {pageBalance.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
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
            <span className="font-semibold text-foreground">{totalItems}</span> movimientos
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
