"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Mail,
  User,
  LayoutGrid,
  List,
  Table as TableIcon,
  KeyRound,
  Users,
  CreditCard,
  Phone,
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
  UsuarioCard,
  getPersonaFullName,
  getPersonaDocument,
  getRoleBadgeVariant,
} from "./usuario-card";
import type { UsuarioResponse } from "../types/usuario.types";
import { cn } from "@/lib/utils";

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

type StatusFilterType = "all" | "active" | "inactive" | "pending";
type ViewModeType = "grid" | "list" | "table";

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
  const [viewMode, setViewMode] = React.useState<ViewModeType>("grid");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilterType>("all");

  // Local filtering by status tab
  const filteredUsuarios = React.useMemo(() => {
    if (statusFilter === "active") return usuarios.filter((u) => u.activo);
    if (statusFilter === "inactive") return usuarios.filter((u) => !u.activo);
    if (statusFilter === "pending") return usuarios.filter((u) => u.debeCambiarPassword);
    return usuarios;
  }, [usuarios, statusFilter]);

  const counts = React.useMemo(() => {
    return {
      all: usuarios.length,
      active: usuarios.filter((u) => u.activo).length,
      inactive: usuarios.filter((u) => !u.activo).length,
      pending: usuarios.filter((u) => u.debeCambiarPassword).length,
    };
  }, [usuarios]);

  return (
    <Card className="shadow-xs border border-border/70 rounded-xl overflow-hidden">
      {/* Header & Controls Toolbar */}
      <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <span>Cuentas de Usuarios</span>
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
              Gestión de accesos, credenciales y vinculación con personas.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <SearchInput
              placeholder="Buscar por usuario, email, persona..."
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

          {counts.pending > 0 && (
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("pending")}
              className={cn(
                "h-6 px-2.5 text-[11px] rounded-full gap-1 cursor-pointer font-medium",
                statusFilter === "pending"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "text-amber-700 dark:text-amber-400 border-amber-500/30"
              )}
            >
              <KeyRound className="size-3" />
              Clave pendiente
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-background/20">
                {counts.pending}
              </span>
            </Button>
          )}
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
                        <Skeleton className="h-3.5 w-20" />
                        <Skeleton className="h-2.5 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-md" />
                  <div className="flex gap-1">
                    <Skeleton className="h-4 w-14 rounded-md" />
                  </div>
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
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2.5 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16 rounded-md" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
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
                {Array.from({ length: 5 }).map((_, idx) => (
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
                ))}
              </TableBody>
            </Table>
          )
        ) : filteredUsuarios.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="size-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
              <Users className="size-6 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              No se encontraron usuarios
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              No hay cuentas registradas o coincidentes con los filtros seleccionados.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          // Grid Cards Render
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 p-3">
            {filteredUsuarios.map((usr) => (
              <UsuarioCard
                key={usr.id}
                usuario={usr}
                viewMode="grid"
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : viewMode === "list" ? (
          // List Cards Render
          <div className="flex flex-col gap-2 p-3">
            {filteredUsuarios.map((usr) => (
              <UsuarioCard
                key={usr.id}
                usuario={usr}
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
                <TableHead className="pl-5 text-xs py-2">Usuario</TableHead>
                <TableHead className="text-xs py-2">Persona Vinculada</TableHead>
                <TableHead className="text-xs py-2">Roles</TableHead>
                <TableHead className="text-xs py-2">Estado</TableHead>
                <TableHead className="text-right pr-5 text-xs py-2">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsuarios.map((usr) => {
                const initials = (
                  usr.userName ? usr.userName.substring(0, 2) : "US"
                ).toUpperCase();
                const personaNombre = getPersonaFullName(usr.persona);
                const personaDoc = getPersonaDocument(usr.persona);

                return (
                  <TableRow
                    key={usr.id}
                    className="h-12 hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="pl-5 py-2 font-medium">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[11px]">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col leading-tight">
                          <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                            @{usr.userName}
                            {usr.debeCambiarPassword && (
                              <span title="Debe cambiar contraseña">
                                <KeyRound className="size-3 text-amber-500" />
                              </span>
                            )}
                          </span>
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
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          {personaDoc && (
                            <span className="flex items-center gap-1 font-mono">
                              <CreditCard className="size-2.5 text-muted-foreground shrink-0" />
                              {personaDoc}
                            </span>
                          )}
                          {usr.persona?.telefono && (
                            <span className="flex items-center gap-1">
                              <Phone className="size-2.5 text-muted-foreground shrink-0" />
                              {usr.persona.telefono}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex flex-wrap gap-1">
                        {usr.roles && usr.roles.length > 0 ? (
                          usr.roles.map((rol, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className={cn(
                                "text-[10px] px-1.5 py-0 h-4 font-medium",
                                getRoleBadgeVariant(rol)
                              )}
                            >
                              {rol}
                            </Badge>
                          ))
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground"
                          >
                            Sin rol
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
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Pagination Footer */}
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
