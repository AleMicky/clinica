"use client";

import * as React from "react";
import {
  Edit2,
  History,
  MoreVertical,
  Power,
  Search,
  Trash2,
  FolderTree,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { MenuIcon } from "./opcion-menu-icon-helper";
import type {
  OpcionMenuResponse,
  PagedResult,
} from "../types/opcion-menu.types";

interface OpcionMenuTableProps {
  data?: PagedResult<OpcionMenuResponse>;
  allOptions?: OpcionMenuResponse[];
  isLoading?: boolean;
  search: string;
  onSearchChange: (search: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (item: OpcionMenuResponse) => void;
  onToggleStatus?: (item: OpcionMenuResponse) => void;
  onDelete: (item: OpcionMenuResponse) => void;
  onViewAudit?: (item: OpcionMenuResponse) => void;
}

export function OpcionMenuTable({
  data,
  allOptions = [],
  isLoading = false,
  search,
  onSearchChange,
  onPageChange,
  onEdit,
  onToggleStatus,
  onDelete,
  onViewAudit,
}: OpcionMenuTableProps) {
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all");
  const [levelFilter, setLevelFilter] = React.useState<"all" | "root" | "sub">("all");

  const items = data?.items || [];

  // Filter in memory if status/level filter is active
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      if (statusFilter === "active" && !item.activo) return false;
      if (statusFilter === "inactive" && item.activo) return false;
      if (levelFilter === "root" && item.padreId !== null) return false;
      if (levelFilter === "sub" && item.padreId === null) return false;
      return true;
    });
  }, [items, statusFilter, levelFilter]);

  // Helper map for parent names
  const parentMap = React.useMemo(() => {
    const map = new Map<number, string>();
    for (const opt of allOptions) {
      map.set(opt.id, opt.nombre);
    }
    return map;
  }, [allOptions]);

  return (
    <div className="flex flex-col gap-3 bg-card p-4 rounded-xl border border-border/70 shadow-2xs">
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, nombre o ruta..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-8 text-xs bg-background"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              if (val) setStatusFilter(val as "all" | "active" | "inactive");
            }}
          >
            <SelectTrigger className="h-8 text-xs w-[130px] bg-background cursor-pointer">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Solo Activos</SelectItem>
              <SelectItem value="inactive">Solo Inactivos</SelectItem>
            </SelectContent>
          </Select>

          {/* Level Filter */}
          <Select
            value={levelFilter}
            onValueChange={(val) => {
              if (val) setLevelFilter(val as "all" | "root" | "sub");
            }}
          >
            <SelectTrigger className="h-8 text-xs w-[140px] bg-background cursor-pointer">
              <SelectValue placeholder="Jerarquía" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda la jerarquía</SelectItem>
              <SelectItem value="root">Módulos Raíz</SelectItem>
              <SelectItem value="sub">Submenús</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-muted-foreground w-[40px]">
                Icono
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                Opción de Menú
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                Código
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                Ruta
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                Menú Padre
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-center">
                Orden
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                Estado
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-right w-[80px]">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell colSpan={8} className="py-4">
                    <div className="h-4 bg-muted/60 rounded animate-pulse w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                    <FolderTree className="size-6 text-muted-foreground/50" />
                    <p className="text-xs font-medium">No se encontraron opciones de menú</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const parentName = item.padreId ? parentMap.get(item.padreId) : null;

                return (
                  <TableRow key={item.id} className="hover:bg-accent/20 transition-colors">
                    <TableCell>
                      <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <MenuIcon name={item.icono} className="size-3.5" />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-foreground">
                          {item.nombre}
                        </span>
                        {item.padreId === null && (
                          <span className="text-[10px] text-primary font-medium">
                            Módulo Raíz
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono bg-background/80"
                      >
                        {item.codigo}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {item.ruta ? (
                        <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                          <LinkIcon className="size-3 text-primary/70 shrink-0" />
                          {item.ruta}
                        </span>
                      ) : (
                        <span className="italic text-[10px] text-muted-foreground/50">
                          -
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      {parentName ? (
                        <Badge variant="secondary" className="text-[10px] font-medium">
                          {parentName}
                        </Badge>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Raíz (Sin Padre)
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-center font-mono text-xs">
                      {item.orden}
                    </TableCell>

                    <TableCell>
                      <StatusBadge active={item.activo} />
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(item)}
                          className="size-7 text-muted-foreground hover:text-foreground cursor-pointer rounded-md"
                          title="Editar"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer shrink-0">
                            <MoreVertical className="size-3.5" />
                            <span className="sr-only">Opciones</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => onEdit(item)}
                              className="cursor-pointer gap-2 text-xs"
                            >
                              <Edit2 className="size-3.5 text-muted-foreground" />
                              <span>Editar</span>
                            </DropdownMenuItem>

                            {onToggleStatus && (
                              <DropdownMenuItem
                                onClick={() => onToggleStatus(item)}
                                className="cursor-pointer gap-2 text-xs"
                              >
                                <Power className={`size-3.5 ${item.activo ? "text-amber-500" : "text-emerald-600"}`} />
                                <span>{item.activo ? "Inactivar" : "Activar"}</span>
                              </DropdownMenuItem>
                            )}

                            {onViewAudit && (
                              <DropdownMenuItem
                                onClick={() => onViewAudit(item)}
                                className="cursor-pointer gap-2 text-xs"
                              >
                                <History className="size-3.5 text-blue-500" />
                                <span>Auditoría</span>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => onDelete(item)}
                              className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && (
        <DataTablePagination
          currentPage={data.page}
          pageSize={data.pageSize}
          totalItems={data.totalItems}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
