"use client";

import * as React from "react";
import {
  Calendar,
  DollarSign,
  Edit2,
  History,
  Inbox,
  Layers,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination, SearchInput } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { LoteResponse } from "../types/lote.types";

interface LoteListProps {
  lotes: LoteResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onAddLote?: () => void;
  onEdit?: (lote: LoteResponse) => void;
  onDelete?: (lote: LoteResponse) => void;
  onViewAudit?: (lote: LoteResponse) => void;
  onRefresh?: () => void;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  } catch {
    return dateStr;
  }
}

function getVencimientoBadge(fechaVencimiento?: string | null) {
  if (!fechaVencimiento) {
    return (
      <Badge variant="outline" className="text-[10px] text-muted-foreground font-normal">
        Sin vencimiento
      </Badge>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(fechaVencimiento);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <Badge
        variant="outline"
        className="text-[10px] border-destructive/30 bg-destructive/10 text-destructive gap-1 font-semibold"
      >
        <XCircle className="size-2.5" /> Vencido ({formatDate(fechaVencimiento)})
      </Badge>
    );
  }

  if (diffDays <= 30) {
    return (
      <Badge
        variant="outline"
        className="text-[10px] border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 gap-1 font-semibold"
      >
        <AlertTriangle className="size-2.5" /> Vence en {diffDays}d ({formatDate(fechaVencimiento)})
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 gap-1 font-medium"
    >
      <CheckCircle2 className="size-2.5" /> Vigente ({formatDate(fechaVencimiento)})
    </Badge>
  );
}

export function LoteList({
  lotes,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onAddLote,
  onEdit,
  onDelete,
  onViewAudit,
  onRefresh,
}: LoteListProps) {
  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Mini toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-2">
          <SearchInput
            placeholder="Buscar por lote..."
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full sm:w-56 h-8 text-xs bg-muted/20 border-border/60 focus:bg-background"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="size-8 border-border/60 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Recargar lotes"
            >
              <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
            </Button>
          )}

          {onAddLote && (
            <Button
              size="sm"
              onClick={onAddLote}
              className="h-8 px-2.5 text-xs font-medium gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span>Nuevo Lote</span>
            </Button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent h-9 border-b border-border/40">
              <TableHead className="pl-3 text-xs font-semibold text-muted-foreground">N° Lote</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Fabricación</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Estado Vencimiento</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Costo Unit.</TableHead>
              <TableHead className="text-right pr-3 text-xs font-semibold text-muted-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <TableRow key={idx} className="h-10 border-border/40">
                  <TableCell className="pl-3 py-2">
                    <Skeleton className="h-4 w-20 rounded" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-16 rounded" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-5 w-28 rounded-full" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-14 rounded" />
                  </TableCell>
                  <TableCell className="text-right pr-3 py-2">
                    <Skeleton className="h-6 w-6 rounded ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : lotes.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-28 text-center text-muted-foreground text-xs py-8">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Inbox className="size-7 text-muted-foreground/40 stroke-1" />
                    <p className="font-semibold text-foreground text-xs">Sin lotes registrados</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs">
                      {searchTerm
                        ? "No hay lotes que coincidan con la búsqueda."
                        : "Haz clic en 'Nuevo Lote' para ingresar un nuevo lote a este producto."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              lotes.map((lote) => (
                <TableRow key={lote.id} className="hover:bg-muted/30 transition-colors h-11 border-border/40">
                  <TableCell className="pl-3 py-2 font-mono text-xs font-semibold text-foreground">
                    <div className="flex items-center gap-1.5">
                      <Layers className="size-3 text-primary shrink-0" />
                      <span className="bg-muted px-1.5 py-0.5 rounded border border-border/40">
                        {lote.numeroLote}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground font-medium">
                    {formatDate(lote.fechaFabricacion) || "—"}
                  </TableCell>
                  <TableCell className="py-2">
                    {getVencimientoBadge(lote.fechaVencimiento)}
                  </TableCell>
                  <TableCell className="py-2 text-xs font-mono font-semibold text-foreground">
                    {lote.costoUnitario !== null && lote.costoUnitario !== undefined ? (
                      <span>${Number(lote.costoUnitario).toFixed(2)}</span>
                    ) : (
                      <span className="text-muted-foreground/60 font-normal">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-3 py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex size-6 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <MoreHorizontal className="size-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 text-xs">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-[10px] text-muted-foreground font-normal">Opciones</DropdownMenuLabel>
                          {onViewAudit && (
                            <DropdownMenuItem
                              onClick={() => onViewAudit(lote)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <History className="size-3.5 text-muted-foreground" /> Ver Auditoría
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => onEdit?.(lote)}
                            className="gap-2 cursor-pointer text-xs"
                          >
                            <Edit2 className="size-3.5 text-muted-foreground" /> Editar Lote
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(lote)}
                          className="gap-2 text-destructive cursor-pointer text-xs"
                        >
                          <Trash2 className="size-3.5" /> Eliminar Lote
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalItems > 10 && (
          <div className="p-2 border-t border-border/40 bg-muted/10">
            <DataTablePagination
              totalItems={totalItems}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={onPageChange || (() => {})}
              onPageSizeChange={onPageSizeChange}
              isLoading={isLoading}
              itemLabel="lotes"
            />
          </div>
        )}
      </div>
    </div>
  );
}
