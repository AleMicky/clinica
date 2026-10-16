"use client";

import * as React from "react";
import {
  Layers,
  Plus,
  Search,
  RotateCw,
  MoreHorizontal,
  Edit2,
  Trash2,
  History,
  AlertTriangle,
  CalendarCheck,
  CalendarX,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Inbox,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PartidaInventarioResponse } from "../types/partida-inventario.types";
import { formatDate } from "@/lib/utils";

interface PartidaInventarioListProps {
  partidas: PartidaInventarioResponse[];
  isLoading?: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onAddPartida?: () => void;
  onEdit?: (partida: PartidaInventarioResponse) => void;
  onDelete?: (partida: PartidaInventarioResponse) => void;
  onViewAudit?: (partida: PartidaInventarioResponse) => void;
  onRefresh?: () => void;
}

export function PartidaInventarioList({
  partidas,
  isLoading = false,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onAddPartida,
  onEdit,
  onDelete,
  onViewAudit,
  onRefresh,
}: PartidaInventarioListProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const fromItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toItem = Math.min(totalItems, currentPage * pageSize);

  const getVencimientoBadge = (fechaVencimiento?: string | null) => {
    if (!fechaVencimiento) {
      return (
        <span className="text-muted-foreground/60 text-xs flex items-center gap-1">
          <Calendar className="size-3 text-muted-foreground/40" />
          <span>Sin fecha</span>
        </span>
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = fechaVencimiento.split("-");
    let expDate = new Date(fechaVencimiento);
    if (parts.length === 3) {
      expDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    expDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <Badge
          variant="destructive"
          className="text-[10px] px-2 py-0.5 gap-1 font-medium bg-destructive/15 text-destructive border border-destructive/30"
        >
          <CalendarX className="size-3" />
          <span>Vencido ({formatDate(fechaVencimiento)})</span>
        </Badge>
      );
    }

    if (diffDays <= 30) {
      return (
        <Badge
          variant="outline"
          className="text-[10px] px-2 py-0.5 gap-1 font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
        >
          <AlertTriangle className="size-3 text-amber-500" />
          <span>Por vencer ({diffDays}d)</span>
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="text-[10px] px-2 py-0.5 gap-1 font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
      >
        <CalendarCheck className="size-3 text-emerald-500" />
        <span>Vigente ({formatDate(fechaVencimiento)})</span>
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* List Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por número de partida..."
            className="pl-8 pr-7 h-8 text-xs bg-background/50 border-border/40 focus:bg-background"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8 px-2 text-xs border-border/40 hover:bg-muted cursor-pointer shrink-0"
              title="Actualizar listado"
            >
              <RotateCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          )}

          {onAddPartida && (
            <Button
              size="sm"
              onClick={onAddPartida}
              className="h-8 px-2.5 text-xs gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="size-3.5" />
              <span>Nueva Partida</span>
            </Button>
          )}
        </div>
      </div>

      {/* Partidas Table */}
      <div className="rounded-xl border border-border/40 overflow-hidden bg-card/40">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 h-9 border-border/40">
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pl-3 py-1.5">
                N° Partida
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider py-1.5">
                Vencimiento
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider py-1.5">
                Costo Unitario
              </TableHead>
              <TableHead className="w-10 text-right pr-3 py-1.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <TableRow key={idx} className="h-10 border-border/40">
                  <TableCell className="pl-3 py-2">
                    <Skeleton className="h-4 w-24 rounded" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-5 w-28 rounded-full" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-16 rounded" />
                  </TableCell>
                  <TableCell className="text-right pr-3 py-2">
                    <Skeleton className="h-6 w-6 rounded ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : partidas.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="h-28 text-center text-muted-foreground text-xs py-8">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Inbox className="size-7 text-muted-foreground/40 stroke-1" />
                    <p className="font-semibold text-foreground text-xs">Sin partidas registradas</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs">
                      {searchTerm
                        ? "No hay partidas que coincidan con la búsqueda."
                        : "Haz clic en 'Nueva Partida' para ingresar una partida a este producto."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              partidas.map((partida) => (
                <TableRow
                  key={partida.id}
                  className="hover:bg-muted/30 transition-colors h-11 border-border/40"
                >
                  <TableCell className="pl-3 py-2 font-mono text-xs font-semibold text-foreground">
                    <div className="flex items-center gap-1.5">
                      <Layers className="size-3.5 text-primary shrink-0" />
                      {partida.numeroPartida ? (
                        <span className="bg-muted px-1.5 py-0.5 rounded border border-border/40 font-mono">
                          {partida.numeroPartida}
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-normal italic">
                          #{partida.id}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    {getVencimientoBadge(partida.fechaVencimiento)}
                  </TableCell>
                  <TableCell className="py-2 text-xs font-mono font-semibold text-foreground">
                    <span>Bs. {Number(partida.costoUnitario ?? 0).toFixed(2)}</span>
                  </TableCell>
                  <TableCell className="text-right pr-3 py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex size-6 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <MoreHorizontal className="size-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-38 text-xs">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-[10px] text-muted-foreground font-normal">
                            Opciones
                          </DropdownMenuLabel>
                          {onViewAudit && (
                            <DropdownMenuItem
                              onClick={() => onViewAudit(partida)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <History className="size-3.5 text-muted-foreground" /> Ver Auditoría
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => onEdit?.(partida)}
                            className="gap-2 cursor-pointer text-xs"
                          >
                            <Edit2 className="size-3.5 text-muted-foreground" /> Editar Partida
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(partida)}
                          className="gap-2 text-destructive cursor-pointer text-xs"
                        >
                          <Trash2 className="size-3.5" /> Eliminar Partida
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Compact Pagination Footer */}
        {totalItems > 0 && (
          <div className="px-3 py-2 border-t border-border/30 bg-muted/15 flex items-center justify-between gap-2 text-xs">
            <div className="text-[11px] text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{fromItem}-{toItem}</span> de{" "}
              <span className="font-semibold text-foreground">{totalItems}</span> partidas
            </div>

            <div className="flex items-center gap-2">
              {onPageSizeChange && (
                <Select
                  value={String(pageSize)}
                  onValueChange={(val) => onPageSizeChange(Number(val))}
                >
                  <SelectTrigger className="h-6 w-16 text-[10px] bg-background border-border/40 px-1.5 py-0 font-medium">
                    <SelectValue placeholder={String(pageSize)} />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    {[5, 10, 20, 50].map((size) => (
                      <SelectItem key={size} value={String(size)} className="text-xs">
                        {size} / pág
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-6 cursor-pointer border-border/40 bg-background hover:bg-muted"
                  onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1 || isLoading}
                  title="Página anterior"
                >
                  <ChevronLeft className="size-3" />
                </Button>
                <span className="text-[10px] text-muted-foreground px-1 font-mono font-medium">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-6 cursor-pointer border-border/40 bg-background hover:bg-muted"
                  onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages || isLoading}
                  title="Página siguiente"
                >
                  <ChevronRight className="size-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
