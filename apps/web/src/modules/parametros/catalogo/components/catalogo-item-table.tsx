"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import type { CatalogoGrupoResponse, CatalogoItemResponse } from "../types/catalogo.types";

interface CatalogoItemTableProps {
  selectedGrupo: CatalogoGrupoResponse | null;
  items: CatalogoItemResponse[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onAddItem: () => void;
  onEditItem: (item: CatalogoItemResponse) => void;
  onDeleteItem: (item: CatalogoItemResponse) => void;
  onRefresh: () => void;
}

export function CatalogoItemTable({
  selectedGrupo,
  items,
  isLoading,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onRefresh,
}: CatalogoItemTableProps) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (!selectedGrupo) {
    return (
      <Card className="shadow-2xs border-border/60 h-full min-h-[380px] flex items-center justify-center p-6 text-center border-dashed">
        <div className="flex flex-col items-center gap-2 max-w-sm">
          <Tag className="size-8 text-muted-foreground/40" />
          <h3 className="font-semibold text-sm">Seleccione un Catálogo</h3>
          <p className="text-xs text-muted-foreground">
            Elija una tabla maestra del panel izquierdo para gestionar sus elementos.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xs border-border/60 h-full flex flex-col justify-between overflow-hidden">
      <div>
        <div className="p-3 border-b border-border/60 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-base font-bold tracking-tight text-foreground truncate">
                {selectedGrupo.nombre}
              </h2>
              <Badge variant="outline" className="text-[10px] font-mono bg-muted/50 shrink-0">
                {selectedGrupo.codigo}
              </Badge>
              {selectedGrupo.descripcion && (
                <span className="text-xs text-muted-foreground truncate hidden md:inline max-w-[200px]">
                  • {selectedGrupo.descripcion}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                title="Actualizar"
                className="h-8 size-8 p-0 border-border/60"
              >
                <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button size="sm" onClick={onAddItem} className="gap-1.5 shrink-0 h-8 text-xs font-medium">
                <Plus className="size-3.5" />
                <span>Nuevo Ítem</span>
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por valor o nombre..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 text-xs h-8 bg-muted/30 border-border/60 focus:bg-background"
            />
          </div>
        </div>

        <div className="p-0 overflow-x-auto">
          <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/60 text-[11px]">
                  <TableHead className="pl-4 py-2 w-[70px]">Orden</TableHead>
                  <TableHead className="py-2 w-[130px]">Valor / Código</TableHead>
                  <TableHead className="py-2">Nombre / Descripción</TableHead>
                  <TableHead className="py-2 w-[100px]">Estado</TableHead>
                  <TableHead className="py-2 text-right pr-4 w-[70px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-4 py-2.5"><Skeleton className="h-3.5 w-6" /></TableCell>
                      <TableCell className="py-2.5"><Skeleton className="h-3.5 w-16" /></TableCell>
                      <TableCell className="py-2.5"><Skeleton className="h-3.5 w-32" /></TableCell>
                      <TableCell className="py-2.5"><Skeleton className="h-3.5 w-14" /></TableCell>
                      <TableCell className="py-2.5 text-right pr-4"><Skeleton className="h-3.5 w-6 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-xs text-muted-foreground">
                      No se encontraron elementos en este catálogo.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors border-b border-border/40 text-xs">
                      <TableCell className="pl-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                        {item.orden}
                      </TableCell>
                      <TableCell className="py-2.5 font-mono text-[11px] font-semibold text-foreground">
                        {item.valor}
                      </TableCell>
                      <TableCell className="py-2.5 font-medium text-xs text-foreground">
                        {item.nombre}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <Badge
                          variant={item.activo ? "outline" : "destructive"}
                          className={`w-fit gap-1 text-[10px] px-1.5 py-0 font-medium ${
                            item.activo
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : ""
                          }`}
                        >
                          {item.activo ? (
                            <CheckCircle2 className="size-2.5" />
                          ) : (
                            <XCircle className="size-2.5" />
                          )}
                          {item.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2.5 text-right pr-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer">
                            <MoreHorizontal className="size-3.5" />
                            <span className="sr-only">Acciones</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">Opciones</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => onEditItem(item)}
                              className="gap-2 text-xs cursor-pointer"
                            >
                              <Edit className="size-3.5" /> Editar Ítem
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDeleteItem(item)}
                              className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Trash2 className="size-3.5" /> Eliminar Ítem
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 border-t border-border/60 text-xs text-muted-foreground bg-muted/10">
        <div className="text-[11px]">
          Mostrando <span className="font-medium text-foreground">{startItem}</span>-
          <span className="font-medium text-foreground">{endItem}</span> de{" "}
          <span className="font-medium text-foreground">{totalItems}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span>Filas:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-7 w-14 text-xs border-border/60">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 size-7 p-0 border-border/60"
              onClick={() => onPageChange(1)}
              disabled={currentPage <= 1 || isLoading}
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 size-7 p-0 border-border/60"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="px-2 text-[11px] font-medium text-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 size-7 p-0 border-border/60"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 size-7 p-0 border-border/60"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage >= totalPages || isLoading}
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
