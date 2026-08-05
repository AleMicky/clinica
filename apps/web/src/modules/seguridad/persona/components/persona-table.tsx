"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
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
import type { PersonaResponse } from "../types/persona.types";

interface PersonaTableProps {
  personas: PersonaResponse[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
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

export function PersonaTable({
  personas,
  isLoading = false,
  isError = false,
  errorMessage,
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
  return (
    <Card className="shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <span>Listado de Personas</span>
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                  title="Recargar datos de la API"
                  className="cursor-pointer size-7"
                >
                  <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              Registros filiatorios y de identidad desde la API backend.
            </CardDescription>
          </div>
          <SearchInput
            placeholder="Buscar por nombre, documento..."
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="h-9 hover:bg-transparent">
              <TableHead className="pl-5 text-xs py-2">Persona</TableHead>
              <TableHead className="text-xs py-2">Documento de Identidad</TableHead>
              <TableHead className="text-xs py-2">Contacto / Dirección</TableHead>
              <TableHead className="text-xs py-2">Información Filiatoria</TableHead>
              <TableHead className="text-xs py-2">Estado</TableHead>
              <TableHead className="text-right pr-5 text-xs py-2">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton Loader Rows
              Array.from({ length: 5 }).map((_, idx) => (
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
              ))
            ) : isError ? (
              // Error State
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-destructive">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <AlertCircle className="size-5 text-destructive" />
                    <p className="font-semibold text-xs">
                      {errorMessage || "Error al cargar el directorio de personas desde la API."}
                    </p>
                    {onRefresh && (
                      <Button variant="outline" size="sm" onClick={onRefresh} className="h-7 text-xs mt-1 gap-1.5 cursor-pointer">
                        <RefreshCw className="size-3" /> Reintentar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : personas.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-xs">
                  No se encontraron personas registradas o coincidentes con la búsqueda.
                </TableCell>
              </TableRow>
            ) : (
              // Data Rows from API
              personas.map((persona) => {
                const nombreCompleto = [
                  persona.nombres,
                  persona.apellidoPaterno,
                  persona.apellidoMaterno,
                ]
                  .filter(Boolean)
                  .join(" ");

                const initials = (
                  (persona.nombres[0] || "") + (persona.apellidoPaterno[0] || "")
                ).toUpperCase();

                const docFormatted = `${persona.tipoDocumento} ${persona.numeroDocumento}${
                  persona.extensionDocumento ? ` ${persona.extensionDocumento}` : ""
                }${persona.complementoDocumento ? `-${persona.complementoDocumento}` : ""}`;

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
                          <span className="flex items-center gap-1 text-foreground">
                            <Phone className="size-3 text-muted-foreground shrink-0" />
                            {persona.telefono}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic text-[10px]">Sin teléfono</span>
                        )}
                        {persona.direccion && (
                          <span className="flex items-center gap-1 text-muted-foreground truncate max-w-[180px]">
                            <MapPin className="size-3 shrink-0" />
                            {persona.direccion}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex flex-col text-[11px] leading-tight gap-0.5">
                        {persona.fechaNacimiento && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="size-3 shrink-0" />
                            {persona.fechaNacimiento}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          {persona.genero && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                              {persona.genero}
                            </Badge>
                          )}
                          {persona.estadoCivil && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
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
              })
            )}
          </TableBody>
        </Table>
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
