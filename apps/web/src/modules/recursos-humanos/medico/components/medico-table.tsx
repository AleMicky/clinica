"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Inbox,
  Stethoscope,
  UserCheck,
  FileBadge,
} from "lucide-react";
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
import { StatusBadge, DataTablePagination, SearchInput } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { MedicoResponse } from "../types/medico.types";

interface MedicoTableProps {
  medicos: MedicoResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onEdit?: (medico: MedicoResponse) => void;
  onManageExpediente?: (medico: MedicoResponse) => void;
  onDelete?: (medico: MedicoResponse) => void;
  onRefresh?: () => void;
}

export function MedicoTable({
  medicos,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onManageExpediente,
  onDelete,
  onRefresh,
}: MedicoTableProps) {
  return (
    <div className="space-y-3 w-full">
      {/* Toolbar Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-1 items-center gap-2">
          <SearchInput
            placeholder="Buscar por matrícula profesional o minsal..."
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full sm:w-80 h-8 text-xs"
          />
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

      {/* Main Table Container */}
      <div className="border rounded-md bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[120px] font-semibold text-xs">Cód. Empleado</TableHead>
                <TableHead className="font-semibold text-xs">Médico / Profesional</TableHead>
                <TableHead className="font-semibold text-xs">Matrícula Prof.</TableHead>
                <TableHead className="font-semibold text-xs">Reg. Min. Salud</TableHead>
                <TableHead className="w-[100px] text-center font-semibold text-xs">Estado</TableHead>
                <TableHead className="w-[60px] text-right font-semibold text-xs">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: pageSize > 10 ? 10 : pageSize }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : medicos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <Inbox className="size-8 stroke-1" />
                      <p className="text-xs font-medium">No se encontraron médicos registrados.</p>
                      {searchTerm && (
                        <p className="text-[11px] text-muted-foreground/80">
                          Intente ajustar los términos de búsqueda.
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                medicos.map((medico) => {
                  const nombreCompleto =
                    medico.empleado?.nombreCompleto ||
                    [
                      medico.empleado?.persona?.nombres,
                      medico.empleado?.persona?.apellidoPaterno,
                      medico.empleado?.persona?.apellidoMaterno,
                    ]
                      .filter(Boolean)
                      .join(" ") ||
                    `Empleado #${medico.empleadoId}`;

                  return (
                    <TableRow key={medico.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                        {medico.empleado?.codigoEmpleado || `EMP-${medico.empleadoId}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-full bg-primary/10 text-primary shrink-0">
                            <UserCheck className="size-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-xs text-foreground block">
                              {nombreCompleto}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              ID Médico: #{medico.id}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted/50 border">
                          {medico.matriculaProfesional}
                        </span>
                      </TableCell>
                      <TableCell>
                        {medico.registroMinisterioSalud ? (
                          <span className="font-mono text-xs text-muted-foreground flex items-center gap-1">
                            <FileBadge className="size-3 text-sky-500" />
                            {medico.registroMinisterioSalud}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50 italic">
                            Sin registro
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge active={medico.activo} activeLabel="Activo" inactiveLabel="Inactivo" />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer shrink-0">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Acciones</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel className="text-[11px] text-muted-foreground">
                              Gestión de Médico
                            </DropdownMenuLabel>
                            <DropdownMenuGroup>
                              {onManageExpediente && (
                                <DropdownMenuItem onClick={() => onManageExpediente(medico)}>
                                  <Stethoscope className="mr-2 size-3.5 text-primary" />
                                  <span>Expediente Completo</span>
                                </DropdownMenuItem>
                              )}
                              {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(medico)}>
                                  <Edit className="mr-2 size-3.5" />
                                  <span>Editar Expediente</span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuGroup>
                            {onDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onDelete(medico)}
                                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                >
                                  <Trash2 className="mr-2 size-3.5" />
                                  <span>Inhabilitar Médico</span>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer Pagination */}
        {totalItems > 0 && (
          <DataTablePagination
            totalItems={totalItems}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={onPageChange ?? (() => {})}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </div>
    </div>
  );
}
