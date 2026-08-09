"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Phone,
  User,
  CalendarDays,
  HeartHandshake,
  IdCard,
  FileClock,
  Filter,
  Inbox,
  CalendarX,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  StatusBadge,
  DataTablePagination,
  SearchInput,
} from "@/components/shared";
import { cn } from "@/lib/utils";

export interface EmpleadoItem {
  id: number | string;
  personaId: number;
  nombreCompleto: string;
  documento: string;
  codigoEmpleado: string;
  fechaIngreso: string;
  fechaRetiro?: string | null;
  activo: boolean;
  telefono?: string | null;
  fechaNacimiento?: string;
  genero?: string | null;
  estadoCivil?: string | null;
  complementoDocumento?: string | null;
  extensionDocumento?: string | null;
  tipoDocumento?: string;
  numeroDocumento?: string;
  fechaCreacion?: string;
  fechaModificacion?: string | null;
  creadoPor?: string | null;
  modificadoPor?: string | null;
}

interface EmpleadoTableProps {
  empleados: EmpleadoItem[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  estadoFilter?: string;
  onSearchChange?: (value: string) => void;
  onEstadoFilterChange?: (estado: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onEdit?: (empleado: EmpleadoItem) => void;
  onDelete?: (id: number | string) => void;
  onRefresh?: () => void;
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value + (value.length === 10 ? "T00:00:00" : ""));
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calcularEdad(fechaNacimiento?: string): string {
  if (!fechaNacimiento) return "—";
  const d = new Date(fechaNacimiento + "T00:00:00");
  if (isNaN(d.getTime())) return "—";
  const hoy = new Date();
  let edad = hoy.getFullYear() - d.getFullYear();
  const m = hoy.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < d.getDate())) edad--;
  return Number.isFinite(edad) && edad >= 0 ? `${edad} años` : "—";
}

function documentoCompleto(emp: EmpleadoItem): string {
  if (!emp.tipoDocumento && !emp.numeroDocumento) return emp.documento ?? "—";
  const partes = [
    emp.tipoDocumento,
    emp.numeroDocumento,
    emp.extensionDocumento,
    emp.complementoDocumento ? `-${emp.complementoDocumento}` : null,
  ].filter(Boolean);
  return partes.join(" ").trim() || "—";
}

function getInitials(name: string): string {
  if (!name || name === "—") return "EM";
  const parts = name.split(/[\s,]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0]?.substring(0, 2).toUpperCase() ?? "EM";
}

export function EmpleadoTable({
  empleados,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  estadoFilter = "Todos",
  onSearchChange,
  onEstadoFilterChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onRefresh,
}: EmpleadoTableProps) {
  const [expandedIds, setExpandedIds] = React.useState<Set<number | string>>(new Set());
  const estados = ["Todos", "Activos", "Inactivos"];

  const toggleExpand = (id: number | string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4 w-full">
      {/* Compact Toolbar Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchInput
            placeholder="Buscar por código, nombre o documento..."
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full sm:w-72 h-8 text-xs"
          />

          {onEstadoFilterChange && (
            <div className="flex items-center gap-1 border rounded-md p-0.5 bg-muted/30 overflow-x-auto text-xs">
              <Filter className="size-3 text-muted-foreground ml-1.5 shrink-0" />
              {estados.map((est) => (
                <button
                  key={est}
                  type="button"
                  onClick={() => onEstadoFilterChange(est)}
                  className={cn(
                    "px-2.5 py-1 rounded-sm font-medium transition-all text-xs whitespace-nowrap cursor-pointer",
                    estadoFilter === est
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                  )}
                >
                  {est}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              title="Recargar datos"
              className="h-8 px-2.5 text-xs gap-1.5 cursor-pointer"
            >
              <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Card List Container */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="rounded-lg border bg-card p-4 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-7 w-7 rounded-md" />
              </div>
              <div className="space-y-2 pt-2 border-t">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3.5 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : empleados.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          <div className="flex flex-col items-center justify-center gap-2">
            <Inbox className="size-9 text-muted-foreground/50 stroke-1" />
            <p className="font-semibold text-foreground text-base">No se encontraron empleados</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              No hay empleados que coincidan con los criterios de búsqueda o filtro seleccionados.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {empleados.map((emp) => {
            const isExpanded = expandedIds.has(emp.id);

            return (
              <div
                key={emp.id}
                className="group relative rounded-lg border bg-card p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3.5"
              >
                {/* Header: Avatar, Name, Code & Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                      {getInitials(emp.nombreCompleto)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate leading-tight">
                        {emp.nombreCompleto}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="bg-primary/5 border border-primary/20 text-primary font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded">
                          {emp.codigoEmpleado}
                        </span>
                        <StatusBadge active={emp.activo} />
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer shrink-0">
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Acciones</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 text-xs">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal">Acciones</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => onEdit?.(emp)}
                          className="gap-2 cursor-pointer text-xs"
                        >
                          <Edit className="size-3.5" /> Editar Empleado
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete?.(emp.id)}
                        className="gap-2 text-destructive cursor-pointer text-xs"
                      >
                        <Trash2 className="size-3.5" /> Eliminar Empleado
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Key Information Fields */}
                <div className="space-y-1.5 pt-2 border-t text-xs text-muted-foreground">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <IdCard className="size-3.5 text-primary/70 shrink-0" />
                      <span className="truncate">{documentoCompleto(emp)}</span>
                    </div>
                    {emp.telefono && (
                      <div className="flex items-center gap-1 shrink-0 text-foreground font-medium">
                        <Phone className="size-3 text-muted-foreground" />
                        <span>{emp.telefono}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5 text-[11px]">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <CalendarDays className="size-3 shrink-0" />
                      <span>Ingreso: <strong className="text-foreground">{formatDate(emp.fechaIngreso)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Expandable Extra Details */}
                {isExpanded && (
                  <div className="space-y-2 pt-2.5 border-t border-dashed text-xs bg-muted/30 p-2.5 rounded-md mt-1">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-muted-foreground block">Fecha de Nacimiento:</span>
                        <span className="font-medium text-foreground">{formatDate(emp.fechaNacimiento)} ({calcularEdad(emp.fechaNacimiento)})</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Género / Civil:</span>
                        <span className="font-medium text-foreground">{[emp.genero, emp.estadoCivil].filter(Boolean).join(" · ") || "—"}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                      <div className="flex items-center gap-1">
                        <FileClock className="size-3 shrink-0 text-primary/60" />
                        <span className="truncate">Creado: {emp.creadoPor ?? "—"} ({formatDateTime(emp.fechaCreacion)})</span>
                      </div>
                      {emp.modificadoPor && (
                        <div className="pl-4">
                          <span>Modificado: {emp.modificadoPor} ({formatDateTime(emp.fechaModificacion)})</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Expand/Collapse Toggle Button */}
                <button
                  type="button"
                  onClick={() => toggleExpand(emp.id)}
                  className="flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground pt-1 transition-colors cursor-pointer w-full border-t border-border/30"
                >
                  <span>{isExpanded ? "Menos información" : "Más detalles"}</span>
                  {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer - Only show if totalItems > 10 */}
      {totalItems > 10 && (
        <div className="rounded-lg border bg-card overflow-hidden shadow-2xs">
          <DataTablePagination
            totalItems={totalItems}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={onPageChange || (() => {})}
            onPageSizeChange={onPageSizeChange}
            isLoading={isLoading}
            itemLabel="empleados"
          />
        </div>
      )}
    </div>
  );
}