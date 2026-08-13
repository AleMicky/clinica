"use client";

import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  RefreshCw,
  Clock,
  LogOut,
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
  EstadoTurnoCaja,
  type TurnoCajaResponse,
} from "../types/turno-caja.types";

interface TurnoCajaTableProps {
  turnos: TurnoCajaResponse[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (turno: TurnoCajaResponse) => void;
  onCloseTurno: (turno: TurnoCajaResponse) => void;
  onDelete: (turno: TurnoCajaResponse) => void;
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

export function TurnoCajaTable({
  turnos,
  isLoading,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onCloseTurno,
  onDelete,
  onRefresh,
}: TurnoCajaTableProps) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div className="space-y-3">
      {/* Controles de Búsqueda y Acciones */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por caja o cajero..."
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
              <TableHead className="w-[130px] text-xs py-2">Caja</TableHead>
              <TableHead className="text-xs py-2">Cajero / Empleado</TableHead>
              <TableHead className="w-[140px] text-xs py-2">Fecha Apertura</TableHead>
              <TableHead className="w-[140px] text-xs py-2">Fecha Cierre</TableHead>
              <TableHead className="w-[100px] text-xs py-2">Estado</TableHead>
              <TableHead className="w-[70px] text-right text-xs py-2">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <TableRow key={idx} className="h-10">
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-14" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-7 w-7 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : turnos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground py-4">
                    <Clock className="h-6 w-6 text-muted-foreground/40" />
                    <p className="text-xs font-medium">No se encontraron turnos de caja</p>
                    <p className="text-[11px] text-muted-foreground/70">
                      {searchTerm
                        ? "Intente ajustar los términos de búsqueda."
                        : "Comience abriendo un nuevo turno de caja."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              turnos.map((turno) => {
                const isAbierto = turno.estado === EstadoTurnoCaja.Abierto;
                return (
                  <TableRow key={turno.id} className="hover:bg-muted/40 transition-colors h-10">
                    <TableCell className="font-mono text-xs font-semibold text-primary py-1.5">
                      {turno.caja ? `${turno.caja.codigo}` : "-"}
                    </TableCell>
                    <TableCell className="font-medium text-xs text-foreground py-1.5">
                      {turno.empleado ? turno.empleado.nombreCompleto : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[11px] font-mono py-1.5">
                      {formatDate(turno.fechaHoraApertura)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[11px] font-mono py-1.5">
                      {formatDate(turno.fechaHoraCierre)}
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Badge
                        variant={isAbierto ? "default" : "secondary"}
                        className={`text-[10px] px-2 py-0.5 ${
                          isAbierto
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {isAbierto ? "Abierto" : "Cerrado"}
                      </Badge>
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
                          {isAbierto && (
                            <DropdownMenuItem
                              onClick={() => onCloseTurno(turno)}
                              className="gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium"
                            >
                              <LogOut className="h-3.5 w-3.5" />
                              <span>Cerrar Turno</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onEdit(turno)} className="gap-2 text-xs">
                            <Pencil className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Editar Detalle</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(turno)}
                            className="gap-2 text-xs text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Eliminar</span>
                          </DropdownMenuItem>
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
