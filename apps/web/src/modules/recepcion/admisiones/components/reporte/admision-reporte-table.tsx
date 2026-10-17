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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  return (
    <Card className="border border-border/70 bg-card shadow-2xs overflow-hidden">
      {/* Table Top Toolbar */}
      <div className="p-2 px-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-muted/20">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Vista Previa de Registros
          </h2>
          <Badge variant="outline" className="text-[10px] font-semibold bg-background py-0 h-5">
            {totalItems} encontrados
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground text-[11px]">Filas por página:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger className="h-6.5 text-[11px] w-16">
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

      {/* Table Content */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="w-24 h-7.5 py-1 px-2.5 text-[11px] font-semibold">N° Admisión</TableHead>
              <TableHead className="w-32 h-7.5 py-1 px-2.5 text-[11px] font-semibold">Fecha y Hora</TableHead>
              <TableHead className="min-w-44 h-7.5 py-1 px-2.5 text-[11px] font-semibold">Paciente & HC</TableHead>
              <TableHead className="min-w-32 h-7.5 py-1 px-2.5 text-[11px] font-semibold">Convenio / Seguro</TableHead>
              <TableHead className="min-w-40 h-7.5 py-1 px-2.5 text-[11px] font-semibold">Servicios Solicitados</TableHead>
              <TableHead className="w-24 h-7.5 py-1 px-2.5 text-[11px] font-semibold text-right">Total (Bs.)</TableHead>
              <TableHead className="w-24 h-7.5 py-1 px-2.5 text-[11px] font-semibold text-center">Estado</TableHead>
              <TableHead className="w-20 h-7.5 py-1 px-2.5 text-[11px] font-semibold text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="border-border/40">
                  <TableCell className="py-1.5 px-2.5"><Skeleton className="h-3.5 w-18" /></TableCell>
                  <TableCell className="py-1.5 px-2.5"><Skeleton className="h-3.5 w-24" /></TableCell>
                  <TableCell className="py-1.5 px-2.5">
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-2.5 w-20" />
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 px-2.5"><Skeleton className="h-3.5 w-20" /></TableCell>
                  <TableCell className="py-1.5 px-2.5"><Skeleton className="h-3.5 w-28" /></TableCell>
                  <TableCell className="py-1.5 px-2.5 text-right"><Skeleton className="h-3.5 w-14 ml-auto" /></TableCell>
                  <TableCell className="py-1.5 px-2.5 text-center"><Skeleton className="h-4.5 w-18 mx-auto rounded-full" /></TableCell>
                  <TableCell className="py-1.5 px-2.5 text-center"><Skeleton className="h-6 w-14 mx-auto rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1.5 max-w-sm mx-auto">
                    <div className="size-10 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground/60 mb-0.5">
                      <FileSpreadsheet className="size-5" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                      No se encontraron admisiones
                    </p>
                    <p className="text-[11px] text-muted-foreground text-center">
                      No existen registros que coincidan con el rango de fechas o los filtros seleccionados.
                    </p>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearFilters}
                        className="mt-1 h-7 text-xs"
                      >
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
                    className="border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    {/* N° Admisión */}
                    <TableCell className="py-1.5 px-2.5 font-semibold text-xs text-foreground">
                      <span className="font-mono text-primary font-bold">
                        {adm.numero}
                      </span>
                    </TableCell>

                    {/* Fecha y Hora */}
                    <TableCell className="py-1.5 px-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {new Date(adm.fechaHora).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(adm.fechaHora).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </TableCell>

                    {/* Paciente & HC */}
                    <TableCell className="py-1.5 px-2.5 text-xs">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground line-clamp-1">
                          {pacienteNombre}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <span className="font-mono bg-muted px-1 rounded">
                            {hcNumero}
                          </span>
                          <span>&bull;</span>
                          <span>{pacienteDoc}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Convenio */}
                    <TableCell className="py-1.5 px-2.5 text-xs">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-medium border-border/80 py-0",
                          adm.convenio ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {convenioNombre}
                      </Badge>
                    </TableCell>

                    {/* Servicios */}
                    <TableCell className="py-1.5 px-2.5 text-xs max-w-52">
                      <p className="line-clamp-1 text-muted-foreground text-[11px]" title={serviciosResumen}>
                        {serviciosResumen}
                      </p>
                    </TableCell>

                    {/* Total */}
                    <TableCell className="py-1.5 px-2.5 text-xs text-right font-bold font-mono text-foreground whitespace-nowrap">
                      Bs. {totalCalculado.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>

                    {/* Estado */}
                    <TableCell className="py-1.5 px-2.5 text-center">
                      <AdmisionStatusBadge estado={adm.estado} />
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="py-1.5 px-2.5 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSelectAdmision(adm)}
                          className="size-6 text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Ver Ficha Detallada"
                        >
                          <Eye className="size-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onPrintPdf(adm.id)}
                          disabled={isRowPrinting}
                          className="size-6 text-muted-foreground hover:text-primary cursor-pointer disabled:opacity-60"
                          title="Imprimir Ticket PDF"
                        >
                          {isRowPrinting ? (
                            <Loader2 className="size-3 animate-spin text-primary" />
                          ) : (
                            <Printer className="size-3" />
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

      {/* Table Footer / Pagination */}
      <div className="p-2 px-3 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-muted/10">
        <div className="text-muted-foreground text-[11px]">
          Mostrando {items.length} de {totalItems} admisiones
        </div>

        <div className="flex items-center gap-1 self-center sm:self-auto">
          <span className="text-muted-foreground text-[11px] mr-1">
            Página {page} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={page <= 1 || isLoading}
            className="size-6.5 cursor-pointer"
            title="Primera página"
          >
            <ChevronsLeft className="size-3" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1 || isLoading}
            className="size-6.5 cursor-pointer"
            title="Página anterior"
          >
            <ChevronLeft className="size-3" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || isLoading}
            className="size-6.5 cursor-pointer"
            title="Página siguiente"
          >
            <ChevronRight className="size-3" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages || isLoading}
            className="size-6.5 cursor-pointer"
            title="Última página"
          >
            <ChevronsRight className="size-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
