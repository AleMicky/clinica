"use client";

import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  RefreshCw,
  Calculator,
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
import type { ArqueoCajaResponse } from "../types/arqueo-caja.types";

interface ArqueoCajaTableProps {
  arqueos: ArqueoCajaResponse[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (arqueo: ArqueoCajaResponse) => void;
  onDelete: (arqueo: ArqueoCajaResponse) => void;
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

export function ArqueoCajaTable({
  arqueos,
  isLoading,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onRefresh,
}: ArqueoCajaTableProps) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div className="space-y-3">
      {/* Controles de Búsqueda y Acciones */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por observaciones o turno..."
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
              <TableHead className="w-[130px] text-xs py-2">Fecha y Hora</TableHead>
              <TableHead className="w-[120px] text-xs py-2">Caja / Turno</TableHead>
              <TableHead className="w-[110px] text-right text-xs py-2">Esperado</TableHead>
              <TableHead className="w-[110px] text-right text-xs py-2">Contado</TableHead>
              <TableHead className="w-[110px] text-right text-xs py-2">Diferencia</TableHead>
              <TableHead className="w-[100px] text-xs py-2">Estado</TableHead>
              <TableHead className="w-[70px] text-right text-xs py-2">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <TableRow key={idx} className="h-10">
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-4 w-14" /></TableCell>
                  <TableCell className="py-1.5"><Skeleton className="h-7 w-7 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : arqueos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground py-4">
                    <Calculator className="h-6 w-6 text-muted-foreground/40" />
                    <p className="text-xs font-medium">No se encontraron arqueos registrados</p>
                    <p className="text-[11px] text-muted-foreground/70">
                      {searchTerm
                        ? "Intente ajustar los términos de búsqueda."
                        : "Comience creando un nuevo arqueo de caja."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              arqueos.map((arq) => {
                const diff = Number(arq.diferencia);
                const isCuadrado = Math.abs(diff) < 0.01;

                return (
                  <TableRow key={arq.id} className="hover:bg-muted/40 transition-colors h-10">
                    <TableCell className="text-muted-foreground text-[11px] font-mono py-1.5">
                      {formatDate(arq.fechaHora)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground py-1.5">
                      {arq.turnoCaja?.caja ? arq.turnoCaja.caja.codigo : `- (Turno #${arq.turnoCaja?.id || "-"})`}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-medium py-1.5">
                      S/ {Number(arq.totalEsperado).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-medium py-1.5">
                      S/ {Number(arq.totalContado).toFixed(2)}
                    </TableCell>
                    <TableCell className={`text-right font-mono text-xs font-semibold py-1.5 ${isCuadrado ? "text-emerald-600 dark:text-emerald-400" : diff > 0 ? "text-blue-600" : "text-rose-600"}`}>
                      S/ {diff.toFixed(2)}
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Badge
                        variant={isCuadrado ? "default" : "secondary"}
                        className={`text-[10px] px-2 py-0.5 ${
                          isCuadrado
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {isCuadrado ? "Cuadrado" : "Con Diferencia"}
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
                          <DropdownMenuItem onClick={() => onEdit(arq)} className="gap-2 text-xs">
                            <Pencil className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(arq)}
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
