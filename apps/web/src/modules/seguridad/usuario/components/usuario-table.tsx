"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Mail,
  User,
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
import type { UsuarioResponse } from "../types/usuario.types";

interface UsuarioTableProps {
  usuarios: UsuarioResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onEdit?: (usuario: UsuarioResponse) => void;
  onDelete?: (id: number) => void;
  onRefresh?: () => void;
}

export function UsuarioTable({
  usuarios,
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
}: UsuarioTableProps) {
  return (
    <Card className="shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <span>Cuentas de Usuarios</span>
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
              Cuentas activas, roles asignados y credenciales de acceso.
            </CardDescription>
          </div>
          <SearchInput
            placeholder="Buscar por usuario, email..."
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="h-9 hover:bg-transparent">
              <TableHead className="pl-5 text-xs py-2">Usuario</TableHead>
              <TableHead className="text-xs py-2">Persona Vinculada</TableHead>
              <TableHead className="text-xs py-2">Rol Asignado</TableHead>
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
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-3.5 w-28" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-14 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right pr-5 py-2">
                    <Skeleton className="h-7 w-7 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : usuarios.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-xs">
                  No se encontraron usuarios registrados o coincidentes con la búsqueda.
                </TableCell>
              </TableRow>
            ) : (
              // Data Rows from API
              usuarios.map((usr) => {
                const initials = (usr.userName ? usr.userName.substring(0, 2) : "US").toUpperCase();
                const personaNombre = usr.persona
                  ? [usr.persona.nombres, usr.persona.apellidoPaterno, usr.persona.apellidoMaterno]
                      .filter(Boolean)
                      .join(" ")
                  : "Sin persona vinculada";

                return (
                  <TableRow key={usr.id} className="h-12 hover:bg-muted/40 transition-colors">
                    <TableCell className="pl-5 py-2 font-medium">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[11px]">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col leading-tight">
                          <span className="font-semibold text-xs text-foreground">@{usr.userName}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Mail className="size-3 shrink-0" />
                            {usr.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                          <User className="size-3 text-muted-foreground shrink-0" />
                          {personaNombre}
                        </span>
                        {usr.persona && (
                          <span className="text-[10px] text-muted-foreground">
                            {usr.persona.tipoDocumento} {usr.persona.numeroDocumento}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex flex-wrap gap-1">
                        {usr.roles && usr.roles.length > 0 ? (
                          usr.roles.map((rol, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                              {rol}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground">
                            Usuario General
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <StatusBadge active={usr.activo} />
                    </TableCell>
                    <TableCell className="text-right pr-5 py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer">
                          <MoreHorizontal className="size-3.5" />
                          <span className="sr-only">Acciones</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Gestión de Cuenta</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => onEdit?.(usr)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Edit className="size-3.5" /> Editar Usuario
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete?.(usr.id)}
                            className="gap-2 text-destructive cursor-pointer text-xs"
                          >
                            <Trash2 className="size-3.5" /> Eliminar Usuario
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
        itemLabel="usuarios"
      />
    </Card>
  );
}
