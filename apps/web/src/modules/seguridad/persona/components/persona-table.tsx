"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Phone,
  MapPin,
  Calendar,
  LayoutGrid,
  List,
  Table as TableIcon,
  Users,
  CreditCard,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge, DataTablePagination, SearchInput } from "@/components/shared";
import {
  PersonaCard,
  getPersonaFullName,
  getPersonaDocument,
  getEdad,
} from "./persona-card";
import type { PersonaResponse } from "../types/persona.types";
import { cn } from "@/lib/utils";

interface PersonaTableProps {
  personas: PersonaResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onEdit?: (persona: PersonaResponse) => void;
  onDelete?: (id: number) => void;
  onRefresh?: () => void;
}

type StatusFilterType = "all" | "active" | "inactive" | "has_phone";
type ViewModeType = "grid" | "list" | "table";

export function PersonaTable({
  personas,
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
  onRefresh,
}: PersonaTableProps) {
  const [viewMode, setViewMode] = React.useState<ViewModeType>("grid");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilterType>("all");

  const filteredPersonas = React.useMemo(() => {
    if (statusFilter === "active") return personas.filter((p) => p.activo);
    if (statusFilter === "inactive") return personas.filter((p) => !p.activo);
    if (statusFilter === "has_phone") return personas.filter((p) => Boolean(p.telefono));
    return personas;
  }, [personas, statusFilter]);

  const counts = React.useMemo(() => {
    return {
      all: personas.length,
      active: personas.filter((p) => p.activo).length,
      inactive: personas.filter((p) => !p.activo).length,
      hasPhone: personas.filter((p) => Boolean(p.telefono)).length,
    };
  }, [personas]);

  return (
    <Card className="shadow-xs border border-border/70 rounded-xl overflow-hidden">
      {/* Header & Controls Toolbar */}
      <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <span>Listado de Personas</span>
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRefresh}
                  disabled={isLoading}
                  title="Recargar datos"
                  className="cursor-pointer size-7 rounded-md"
                >
                  <RefreshCw
                    className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              )}
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Registros filiatorios, identidad y datos de contacto.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <SearchInput
              placeholder="Buscar por nombre, documento, teléfono..."
              value={searchTerm}
              onChange={onSearchChange}
              className="w-full sm:w-64"
            />

            {/* View Mode Toggle Buttons */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/50 shrink-0">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                title="Vista en tarjetas"
                className={cn(
                  "h-7 px-2.5 text-xs gap-1.5 cursor-pointer font-medium transition-all rounded-md",
                  viewMode === "grid" && "bg-background text-foreground shadow-xs"
                )}
              >
                <LayoutGrid className="size-3.5" />
                <span className="hidden sm:inline">Tarjetas</span>
              </Button>

              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                title="Vista en lista compacta"
                className={cn(
                  "h-7 px-2.5 text-xs gap-1.5 cursor-pointer font-medium transition-all rounded-md",
                  viewMode === "list" && "bg-background text-foreground shadow-xs"
                )}
              >
                <List className="size-3.5" />
                <span className="hidden sm:inline">Lista</span>
              </Button>

              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                title="Vista en tabla"
                className={cn(
                  "h-7 px-2.5 text-xs gap-1.5 cursor-pointer font-medium transition-all rounded-md",
                  viewMode === "table" && "bg-background text-foreground shadow-xs"
                )}
              >
                <TableIcon className="size-3.5" />
                <span className="hidden sm:inline">Tabla</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs / Quick Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] font-medium text-muted-foreground mr-1">
            Filtrar:
          </span>
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
            className="h-6 px-2.5 text-[11px] rounded-full gap-1 cursor-pointer font-medium"
          >
            Todos
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-background/20">
              {counts.all}
            </span>
          </Button>

          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("active")}
            className={cn(
              "h-6 px-2.5 text-[11px] rounded-full gap-1 cursor-pointer font-medium",
              statusFilter === "active"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
            )}
          >
            Activos
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-background/20">
              {counts.active}
            </span>
          </Button>

          <Button
            variant={statusFilter === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("inactive")}
            className={cn(
              "h-6 px-2.5 text-[11px] rounded-full gap-1 cursor-pointer font-medium",
              statusFilter === "inactive"
                ? "bg-destructive text-destructive-foreground"
                : "text-destructive border-destructive/30"
            )}
          >
            Inactivos
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-background/20">
              {counts.inactive}
            </span>
          </Button>

          <Button
            variant={statusFilter === "has_phone" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("has_phone")}
            className={cn(
              "h-6 px-2.5 text-[11px] rounded-full gap-1 cursor-pointer font-medium",
              statusFilter === "has_phone"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "text-blue-700 dark:text-blue-400 border-blue-500/30"
            )}
          >
            <Phone className="size-3" />
            Con Teléfono
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-background/20">
              {counts.hasPhone}
            </span>
          </Button>
        </div>
      </CardHeader>

      {/* Main Content Area */}
      <CardContent className="p-0">
        {isLoading ? (
          // Loading Skeletons
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 p-3">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-border/50 p-3 space-y-2 bg-card"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-2.5 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ))}
            </div>
          ) : viewMode === "list" ? (
            <div className="flex flex-col gap-2 p-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-card gap-3"
                >
                  <div className="flex items-center gap-2.5 flex-1">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-2.5 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="h-9 hover:bg-transparent">
                  <TableHead className="pl-5 text-xs py-2">Persona</TableHead>
                  <TableHead className="text-xs py-2">Documento de Identidad</TableHead>
                  <TableHead className="text-xs py-2">Contacto / Dirección</TableHead>
                  <TableHead className="text-xs py-2">Filiación</TableHead>
                  <TableHead className="text-xs py-2">Estado</TableHead>
                  <TableHead className="text-right pr-5 text-xs py-2">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx} className="h-12">
                    <TableCell className="pl-5 py-2">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-3.5 w-28" />
                          <Skeleton className="h-3 w-14" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <Skeleton className="h-3.5 w-24" />
                    </TableCell>
                    <TableCell className="py-2">
                      <Skeleton className="h-3.5 w-32" />
                    </TableCell>
                    <TableCell className="py-2">
                      <Skeleton className="h-3.5 w-20" />
                    </TableCell>
                    <TableCell className="py-2">
                      <Skeleton className="h-4 w-14 rounded-full" />
                    </TableCell>
                    <TableCell className="text-right pr-5 py-2">
                      <Skeleton className="h-7 w-7 rounded-md ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        ) : filteredPersonas.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="size-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
              <Users className="size-6 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              No se encontraron personas
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              No hay personas registradas o coincidentes con los filtros seleccionados.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          // Grid Cards Render
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 p-3">
            {filteredPersonas.map((p) => (
              <PersonaCard
                key={p.id}
                persona={p}
                viewMode="grid"
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : viewMode === "list" ? (
          // List Cards Render
          <div className="flex flex-col gap-2 p-3">
            {filteredPersonas.map((p) => (
              <PersonaCard
                key={p.id}
                persona={p}
                viewMode="list"
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          // Classic Table Render
          <Table>
            <TableHeader>
              <TableRow className="h-9 hover:bg-transparent">
                <TableHead className="pl-5 text-xs py-2">Persona</TableHead>
                <TableHead className="text-xs py-2">Documento de Identidad</TableHead>
                <TableHead className="text-xs py-2">Contacto / Dirección</TableHead>
                <TableHead className="text-xs py-2">Filiación</TableHead>
                <TableHead className="text-xs py-2">Estado</TableHead>
                <TableHead className="text-right pr-5 text-xs py-2">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPersonas.map((persona) => {
                const nombreCompleto = getPersonaFullName(persona);
                const initials = (
                  (persona.nombres[0] || "") + (persona.apellidoPaterno[0] || "")
                ).toUpperCase();
                const docFormatted = getPersonaDocument(persona);
                const edad = getEdad(persona.fechaNacimiento);

                return (
                  <TableRow key={persona.id} className="h-12 hover:bg-muted/40 transition-colors">
                    <TableCell className="pl-5 py-2 font-medium">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[11px]">
                            {initials || "PER"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col leading-tight">
                          <span className="font-semibold text-xs text-foreground">{nombreCompleto}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ID: #{persona.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex flex-col leading-tight">
                        <span className="font-mono text-xs font-semibold">{docFormatted}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {persona.tipoDocumento}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex flex-col text-[11px] leading-tight gap-0.5">
                        {persona.telefono ? (
                          <span className="flex items-center gap-1 text-foreground font-medium">
                            <Phone className="size-2.5 text-muted-foreground shrink-0" />
                            {persona.telefono}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic text-[10px]">Sin teléfono</span>
                        )}
                        {persona.direccion && (
                          <span className="flex items-center gap-1 text-muted-foreground truncate max-w-[180px]">
                            <MapPin className="size-2.5 shrink-0" />
                            {persona.direccion}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex flex-col text-[11px] leading-tight gap-0.5">
                        {persona.fechaNacimiento && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="size-2.5 shrink-0" />
                            {persona.fechaNacimiento} {edad ? `(${edad})` : ""}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          {persona.genero && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 capitalize">
                              {persona.genero}
                            </Badge>
                          )}
                          {persona.estadoCivil && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 capitalize">
                              {persona.estadoCivil}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <StatusBadge active={persona.activo} />
                    </TableCell>
                    <TableCell className="text-right pr-5 py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer">
                          <MoreHorizontal className="size-3.5" />
                          <span className="sr-only">Acciones</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => onEdit?.(persona)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Edit className="size-3.5" /> Editar Datos
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete?.(persona.id)}
                            className="gap-2 text-destructive cursor-pointer text-xs"
                          >
                            <Trash2 className="size-3.5" /> Eliminar Persona
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <DataTablePagination
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={onPageChange || (() => {})}
        onPageSizeChange={onPageSizeChange}
        isLoading={isLoading}
        itemLabel="personas"
      />
    </Card>
  );
}
