"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  LayoutGrid,
  List,
  Table as TableIcon,
  HeartPulse,
  Handshake,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { StatusBadge, DataTablePagination, SearchInput } from "@/components/shared";
import {
  PacienteCard,
  getPacienteFullName,
  getPacienteDocument,
  getEdad,
} from "./paciente-card";
import type { PacienteResponse } from "../types/paciente.types";
import { cn } from "@/lib/utils";

interface PacienteTableProps {
  pacientes: PacienteResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onEdit?: (paciente: PacienteResponse) => void;
  onDelete?: (id: number) => void;
  onManageConvenios?: (paciente: PacienteResponse) => void;
  onRefresh?: () => void;
}

type StatusFilterType = "all" | "active" | "inactive" | "has_phone";
type ViewModeType = "grid" | "list" | "table";

export function PacienteTable({
  pacientes,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onManageConvenios,
  onRefresh,
}: PacienteTableProps) {
  const [viewMode, setViewMode] = React.useState<ViewModeType>("grid");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilterType>("all");

  const filteredPacientes = React.useMemo(() => {
    if (statusFilter === "active") return pacientes.filter((p) => p.activo);
    if (statusFilter === "inactive") return pacientes.filter((p) => !p.activo);
    if (statusFilter === "has_phone")
      return pacientes.filter((p) => Boolean(p.persona?.telefono));
    return pacientes;
  }, [pacientes, statusFilter]);

  const counts = React.useMemo(() => {
    return {
      all: pacientes.length,
      active: pacientes.filter((p) => p.activo).length,
      inactive: pacientes.filter((p) => !p.activo).length,
      hasPhone: pacientes.filter((p) => Boolean(p.persona?.telefono)).length,
    };
  }, [pacientes]);

  return (
    <Card className="shadow-xs border border-border/70 rounded-xl overflow-hidden">
      {/* Header & Controls Toolbar */}
      <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <HeartPulse className="size-4 text-primary" />
              <span>Listado de Pacientes</span>
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="h-6 w-6 ml-1 text-muted-foreground hover:text-foreground"
                  title="Actualizar datos"
                >
                  <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
                </Button>
              )}
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <SearchInput
              value={searchTerm}
              onChange={(val) => onSearchChange?.(val)}
              placeholder="Buscar por HC, nombre o CI..."
              className="w-full md:w-64"
            />

            {/* View Mode Switches */}
            <div className="flex items-center border border-border/60 rounded-lg p-0.5 bg-background shadow-2xs">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "h-7 w-7 rounded-md text-xs",
                  viewMode === "grid"
                    ? "bg-primary/10 text-primary font-bold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Vista de cuadrícula"
              >
                <LayoutGrid className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("list")}
                className={cn(
                  "h-7 w-7 rounded-md text-xs",
                  viewMode === "list"
                    ? "bg-primary/10 text-primary font-bold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Vista de lista"
              >
                <List className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("table")}
                className={cn(
                  "h-7 w-7 rounded-md text-xs",
                  viewMode === "table"
                    ? "bg-primary/10 text-primary font-bold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Vista de tabla"
              >
                <TableIcon className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "h-7 px-2.5 rounded-full text-xs font-medium",
              statusFilter === "all"
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted/50 hover:bg-muted text-muted-foreground"
            )}
          >
            Todos ({counts.all})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilter("active")}
            className={cn(
              "h-7 px-2.5 rounded-full text-xs font-medium",
              statusFilter === "active"
                ? "bg-emerald-600 text-white font-semibold"
                : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
            )}
          >
            Activos ({counts.active})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilter("has_phone")}
            className={cn(
              "h-7 px-2.5 rounded-full text-xs font-medium",
              statusFilter === "has_phone"
                ? "bg-sky-600 text-white font-semibold"
                : "bg-sky-500/10 text-sky-600 hover:bg-sky-500/20"
            )}
          >
            Con Teléfono ({counts.hasPhone})
          </Button>
        </div>
      </CardHeader>

      {/* Main Content Area */}
      <CardContent className="p-4 sm:p-5">
        {isLoading ? (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                : "space-y-2"
            )}
          >
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredPacientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
            <HeartPulse className="size-10 text-muted-foreground/40 stroke-1" />
            <p className="font-semibold text-sm">No se encontraron pacientes</p>
            <p className="text-xs text-muted-foreground/80 max-w-sm">
              Intenta cambiar los términos de búsqueda o crear un nuevo expediente.
            </p>
          </div>
        ) : viewMode === "table" ? (
          /* Table View */
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[110px]">Hist. Clínica</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPacientes.map((paciente) => {
                  const nombre = getPacienteFullName(paciente);
                  const doc = getPacienteDocument(paciente);
                  const edad = paciente.persona ? getEdad(paciente.persona.fechaNacimiento) : null;
                  const initials = paciente.persona
                    ? (
                        (paciente.persona.nombres[0] || "") +
                        (paciente.persona.apellidoPaterno[0] || "")
                      ).toUpperCase()
                    : "PAC";

                  return (
                    <TableRow key={paciente.id} className="hover:bg-muted/30">
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-primary/5 text-primary border-primary/20 font-mono font-bold text-xs"
                        >
                          {paciente.numeroHistoriaClinica}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7 border border-border/80">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col leading-tight">
                            <span className="font-semibold text-xs text-foreground">{nombre}</span>
                            {edad && <span className="text-[10px] text-muted-foreground">{edad}</span>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{doc}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {paciente.persona?.telefono || "-"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={paciente.activo} className="text-[10px]" />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer">
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel className="text-xs">Opciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {onManageConvenios && (
                              <DropdownMenuItem
                                onClick={() => onManageConvenios(paciente)}
                                className="text-purple-600 dark:text-purple-400"
                              >
                                <Handshake className="size-3.5 mr-2" />
                                Convenios
                              </DropdownMenuItem>
                            )}
                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(paciente)}>
                                <Edit className="size-3.5 mr-2 text-primary" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem
                                onClick={() => onDelete(paciente.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="size-3.5 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          /* Grid & List Views */
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                : "space-y-2"
            )}
          >
            {filteredPacientes.map((paciente) => (
              <PacienteCard
                key={paciente.id}
                paciente={paciente}
                viewMode={viewMode}
                onEdit={onEdit}
                onDelete={onDelete}
                onManageConvenios={onManageConvenios}
              />
            ))}
          </div>
        )}

        {/* Footer Pagination */}
        {totalItems > 0 && onPageChange && onPageSizeChange && (
          <div className="mt-4 border-t border-border/40 pt-3">
            <DataTablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
