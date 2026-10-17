"use client";

import * as React from "react";
import {
  FileSpreadsheet,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Calendar,
  Clock,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
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
import {
  formatConvenioNombre,
  formatPacienteDocumento,
  formatPacienteNombre,
  type AdmisionResponse,
} from "../../types/admision.types";
import { AdmisionStatusBadge } from "../admision-status-badge";
import { cn } from "@/lib/utils";

interface AdmisionReporteTableProps {
  items: AdmisionResponse[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  hasActiveFilters: boolean;
  printingId: number | null;
  onClearFilters: () => void;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onSelectAdmision: (adm: AdmisionResponse) => void;
  onPrintPdf: (id: number) => void;
}

export function AdmisionReporteTable({
  items,
  totalItems,
  page,
  pageSize,
  totalPages,
  isLoading,
  hasActiveFilters,
  printingId,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
  onSelectAdmision,
  onPrintPdf,
}: AdmisionReporteTableProps) {
  const fromRecord = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const toRecord = Math.min(totalItems, page * pageSize);

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
                Libro de Registros Asistenciales
              </h2>
              <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {totalItems} {totalItems === 1 ? "registro" : "registros"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Detalle individual de admisiones, pacientes, prestaciones y montos liquidados.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs self-end sm:self-auto shrink-0">
          <span className="text-muted-foreground text-[11px]">Filas por página:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger className="h-7 text-xs w-18 rounded-lg bg-background border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. Ledger Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30 border-b border-border/30">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-28 py-2.5 px-3.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                N° Admisión
              </TableHead>
              <TableHead className="w-36 py-2.5 px-3.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Emisión
              </TableHead>
              <TableHead className="min-w-48 py-2.5 px-3.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Paciente & Identificación
              </TableHead>
              <TableHead className="min-w-36 py-2.5 px-3.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Cobertura / Seguro
              </TableHead>
              <TableHead className="min-w-44 py-2.5 px-3.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Prestaciones Solicitadas
              </TableHead>
              <TableHead className="w-28 py-2.5 px-3.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                Total (Bs.)
              </TableHead>
              <TableHead className="w-28 py-2.5 px-3.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center">
                Estado
              </TableHead>
              <TableHead className="w-20 py-2.5 px-3.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="border-b border-border/20">
                  <TableCell className="py-2 px-3.5"><Skeleton className="h-4 w-20 rounded" /></TableCell>
                  <TableCell className="py-2 px-3.5"><Skeleton className="h-4 w-24 rounded" /></TableCell>
                  <TableCell className="py-2 px-3.5">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-36 rounded" />
                      <Skeleton className="h-3 w-24 rounded" />
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3.5"><Skeleton className="h-4 w-24 rounded" /></TableCell>
                  <TableCell className="py-2 px-3.5"><Skeleton className="h-4 w-32 rounded" /></TableCell>
                  <TableCell className="py-2 px-3.5 text-right"><Skeleton className="h-4 w-16 ml-auto rounded" /></TableCell>
                  <TableCell className="py-2 px-3.5 text-center"><Skeleton className="h-5 w-20 mx-auto rounded-full" /></TableCell>
                  <TableCell className="py-2 px-3.5 text-center"><Skeleton className="h-6 w-14 mx-auto rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <div className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground/60 mb-1">
                      <FileSpreadsheet className="size-6" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      No se encontraron registros de admisión
                    </p>
                    <p className="text-xs text-muted-foreground text-center leading-relaxed">
                      No hay admisiones que coincidan con el rango de fechas o los filtros seleccionados actualmente.
                    </p>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearFilters}
                        className="mt-2 h-7.5 text-xs rounded-lg gap-1.5 cursor-pointer font-medium"
                      >
                        <RotateCcw className="size-3" />
                        Restablecer todos los filtros
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((adm) => {
                const pacienteNombre = formatPacienteNombre(adm.paciente, adm.pacienteNombre || undefined);
                const pacienteDoc = formatPacienteDocumento(adm.paciente, adm.pacienteDocumento || undefined);
                const convenioNombre = formatConvenioNombre(adm.convenio, adm.convenioNombre);
                const hcNumero =
                  adm.paciente && "numeroHistoriaClinica" in adm.paciente
                    ? adm.paciente.numeroHistoriaClinica
                    : "HC-S/N";

                const totalCalculado =
                  adm.totalAdmision ??
                  (adm.detalles ?? []).reduce(
                    (acc, d) =>
                      acc +
                      (d.total || (d.cantidad || 1) * (d.precioUnitario || 0) - (d.descuento || 0)),
                    0
                  );

                const serviciosResumen =
                  adm.detalles && adm.detalles.length > 0
                    ? adm.detalles.map((d) => d.servicio?.nombre || d.servicioNombre || "Servicio").join(", ")
                    : "Sin servicios registrados";

                const isRowPrinting = printingId === adm.id;

                return (
                  <TableRow
                    key={adm.id}
                    className="border-b border-border/25 hover:bg-muted/30 transition-colors group"
                  >
                    {/* N° Admisión */}
                    <TableCell className="py-2.5 px-3.5 font-medium text-xs">
                      <span className="font-mono font-bold text-primary bg-primary/8 px-2 py-0.5 rounded-md inline-block">
                        {adm.numero}
                      </span>
                    </TableCell>

                    {/* Emisión (Fecha y Hora) */}
                    <TableCell className="py-2.5 px-3.5 text-xs whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground flex items-center gap-1">
                          <Calendar className="size-3 text-muted-foreground/70" />
                          {new Date(adm.fechaHora).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="size-2.5 text-muted-foreground/60" />
                          {new Date(adm.fechaHora).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </TableCell>

                    {/* Paciente & HC */}
                    <TableCell className="py-2.5 px-3.5 text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-foreground line-clamp-1">
                          {pacienteNombre}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="font-mono bg-muted/70 px-1.5 py-0.2 rounded text-[10px] font-medium text-foreground/80">
                            {hcNumero}
                          </span>
                          <span>&bull;</span>
                          <span>{pacienteDoc}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Convenio */}
                    <TableCell className="py-2.5 px-3.5 text-xs">
                      <span
                        className={cn(
                          "inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md",
                          adm.convenio
                            ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                            : "bg-muted/70 text-muted-foreground"
                        )}
                      >
                        {convenioNombre}
                      </span>
                    </TableCell>

                    {/* Servicios Solicitados */}
                    <TableCell className="py-2.5 px-3.5 text-xs max-w-56">
                      <p className="line-clamp-1 text-muted-foreground text-[11px]" title={serviciosResumen}>
                        {serviciosResumen}
                      </p>
                    </TableCell>

                    {/* Total (Bs.) */}
                    <TableCell className="py-2.5 px-3.5 text-xs text-right whitespace-nowrap">
                      <span className="font-mono font-bold text-foreground">
                        Bs. {totalCalculado.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </TableCell>

                    {/* Estado */}
                    <TableCell className="py-2.5 px-3.5 text-center">
                      <AdmisionStatusBadge estado={adm.estado} />
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="py-2.5 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSelectAdmision(adm)}
                          className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg cursor-pointer transition-colors"
                          title="Ver Ficha Detallada"
                        >
                          <Eye className="size-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onPrintPdf(adm.id)}
                          disabled={isRowPrinting}
                          className="size-7 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer transition-colors disabled:opacity-60"
                          title="Imprimir Ticket PDF"
                        >
                          {isRowPrinting ? (
                            <Loader2 className="size-3.5 animate-spin text-primary" />
                          ) : (
                            <Printer className="size-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 3. Report Footer / Pagination */}
      <div className="p-3 px-4.5 border-t border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-muted/15">
        <div className="text-muted-foreground text-[11px]">
          Mostrando <span className="font-semibold text-foreground">{fromRecord}</span> a{" "}
          <span className="font-semibold text-foreground">{toRecord}</span> de{" "}
          <span className="font-semibold text-foreground">{totalItems}</span> admisiones
        </div>

        <div className="flex items-center gap-1.5 self-center sm:self-auto">
          <span className="text-muted-foreground text-[11px] mr-1.5 font-medium">
            Página {page} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={page <= 1 || isLoading}
            className="size-7 rounded-lg border-border/50 cursor-pointer"
            title="Primera página"
          >
            <ChevronsLeft className="size-3.5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1 || isLoading}
            className="size-7 rounded-lg border-border/50 cursor-pointer"
            title="Página anterior"
          >
            <ChevronLeft className="size-3.5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || isLoading}
            className="size-7 rounded-lg border-border/50 cursor-pointer"
            title="Página siguiente"
          >
            <ChevronRight className="size-3.5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages || isLoading}
            className="size-7 rounded-lg border-border/50 cursor-pointer"
            title="Última página"
          >
            <ChevronsRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

