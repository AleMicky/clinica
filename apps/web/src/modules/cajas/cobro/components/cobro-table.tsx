"use client";

import {
  Search,
  MoreHorizontal,
  Ban,
  RefreshCw,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EstadoCobro,
  type CobroResponse,
} from "../types/cobro.types";

interface CobroTableProps {
  cobros: CobroResponse[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onAnular: (cobro: CobroResponse) => void;
  onRefresh: () => void;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function renderEstadoBadge(estado: EstadoCobro) {
  switch (estado) {
    case EstadoCobro.Registrado:
      return (
        <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
          Registrado
        </Badge>
      );
    case EstadoCobro.Anulado:
      return (
        <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20">
          Anulado
        </Badge>
      );
    case EstadoCobro.DevueltoParcial:
    case EstadoCobro.Devuelto:
      return (
        <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20">
          {estado === EstadoCobro.Devuelto ? "Devuelto" : "Dev. Parcial"}
        </Badge>
      );
    default:
      return <Badge variant="outline" className="text-[10px]">Sin Estado</Badge>;
  }
}

export function CobroTable({
  cobros,
  isLoading,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onAnular,
  onRefresh,
}: CobroTableProps) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div className="space-y-3">
      {/* Controles de Búsqueda y Acciones */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por N° cobro o venta..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs bg-card"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 gap-1.5 text-xs px-2.5"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </Button>
      </div>

      {/* Tabla Principal */}
      <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="h-9">
              <TableHead className="w-[120px] text-xs py-2">N° Cobro</TableHead>
              <TableHead className="w-[130px] text-xs py-2">Fecha y Hora</TableHead>
              <TableHead className="text-xs py-2">Paciente / Venta</TableHead>
              <TableHead className="w-[120px] text-xs py-2">Caja / Turno</TableHead>
              <TableHead className="w-[110px] text-right text-xs py-2">Total (Bs.)</TableHead>
              <TableHead className="w-[100px] text-xs py-2">Estado</TableHead>
              <TableHead className="w-[70px] text-right text-xs py-2">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <TableRow key={idx} className="h-10">
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-14" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-7 w-7 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : cobros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground py-4">
                    <CreditCard className="h-6 w-6 text-muted-foreground/40" />
                    <p className="text-xs font-medium">No se encontraron cobros registrados</p>
                    <p className="text-[11px] text-muted-foreground/70">
                      {searchTerm
                        ? "Intente ajustar los términos de búsqueda."
                        : "Los cobros registrados aparecerán automáticamente aquí."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              cobros.map((cobro) => {
                const isRegistrado = cobro.estado === EstadoCobro.Registrado;

                return (
                  <TableRow key={cobro.id} className="hover:bg-muted/40 transition-colors h-10">
                    <TableCell className="font-mono text-xs font-semibold text-primary py-1.5">
                      {cobro.numero}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[11px] font-mono py-1.5">
                      {formatDate(cobro.fechaHora)}
                    </TableCell>
                    <TableCell className="py-1.5">
                      <div className="flex flex-col">
                        <span className="font-medium text-xs text-foreground">
                          {cobro.ventaPagador?.pacienteNombreCompleto || (cobro.ventaPagador?.ventaNumero ? `Venta #${cobro.ventaPagador.ventaNumero}` : "-")}
                        </span>
                        {cobro.ventaPagador?.pacienteNombreCompleto && cobro.ventaPagador?.ventaNumero && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            Venta #{cobro.ventaPagador.ventaNumero}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground py-1.5">
                      {cobro.turnoCaja?.caja ? cobro.turnoCaja.caja.codigo : `- (Turno #${cobro.turnoCaja?.id || "-"})`}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-foreground py-1.5">
                      Bs. {Number(cobro.total).toFixed(2)}
                    </TableCell>
                    <TableCell className="py-1.5">
                      {renderEstadoBadge(cobro.estado)}
                    </TableCell>
                    <TableCell className="text-right py-1.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                          <span className="sr-only">Acciones</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 text-xs">
                          <DropdownMenuLabel className="text-[11px]">Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {isRegistrado && (
                            <DropdownMenuItem
                              onClick={() => onAnular(cobro)}
                              className="gap-2 text-xs text-destructive focus:text-destructive"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              <span>Anular Cobro</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Paginación Compacta */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3 py-2 border-t border-border bg-muted/20 text-[11px]">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span>Mostrar</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-7 w-[60px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>por pág. Total: <strong>{totalItems}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="sr-only">Anterior</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
              >
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="sr-only">Siguiente</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
