"use client";

import * as React from "react";
import {
    Search,
    RefreshCw,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    Building2,
    Briefcase,
    Calendar,
    Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { AsignacionEmpleadoResponse } from "../types/asignacion-empleado.types";

export interface AsignacionEmpleadoItem extends AsignacionEmpleadoResponse {}

interface AsignacionEmpleadoTableProps {
    asignaciones: AsignacionEmpleadoItem[];
    isLoading: boolean;
    totalItems: number;
    currentPage: number;
    pageSize: number;
    searchTerm: string;
    estadoFilter: string;
    onSearchChange: (term: string) => void;
    onEstadoFilterChange: (estado: string) => void;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    onEdit: (item: AsignacionEmpleadoItem) => void;
    onDelete: (id: number) => void;
    onRefresh: () => void;
}

export function AsignacionEmpleadoTable({
    asignaciones,
    isLoading,
    totalItems,
    currentPage,
    pageSize,
    searchTerm,
    estadoFilter,
    onSearchChange,
    onEstadoFilterChange,
    onPageChange,
    onPageSizeChange,
    onEdit,
    onDelete,
    onRefresh,
}: AsignacionEmpleadoTableProps) {
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    return (
        <div className="flex flex-col gap-4 bg-card border border-border/60 rounded-xl p-4 shadow-xs">
            {/* Table Filters & Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-1 items-center gap-2 max-w-lg">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por empleado, área o cargo..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-8 h-9 text-xs"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <Filter className="size-3.5 text-muted-foreground" />
                        <Select
                            value={estadoFilter}
                            onValueChange={(val) => val && onEstadoFilterChange(val)}
                        >
                            <SelectTrigger className="h-9 w-[130px] text-xs">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Todas" className="text-xs">
                                    Todas
                                </SelectItem>
                                <SelectItem value="Activas" className="text-xs">
                                    Activas
                                </SelectItem>
                                <SelectItem value="Finalizadas" className="text-xs">
                                    Finalizadas
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onRefresh}
                        className="size-9 cursor-pointer"
                        title="Refrescar lista"
                    >
                        <RefreshCw className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="relative overflow-x-auto rounded-lg border border-border/40">
                <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/40">
                        <tr>
                            <th className="py-3 px-4">Empleado</th>
                            <th className="py-3 px-4">Área</th>
                            <th className="py-3 px-4">Cargo</th>
                            <th className="py-3 px-4">Fecha Inicio</th>
                            <th className="py-3 px-4">Fecha Fin</th>
                            <th className="py-3 px-4">Estado</th>
                            <th className="py-3 px-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="py-3 px-4">
                                        <Skeleton className="h-4 w-32" />
                                    </td>
                                    <td className="py-3 px-4">
                                        <Skeleton className="h-4 w-24" />
                                    </td>
                                    <td className="py-3 px-4">
                                        <Skeleton className="h-4 w-24" />
                                    </td>
                                    <td className="py-3 px-4">
                                        <Skeleton className="h-4 w-20" />
                                    </td>
                                    <td className="py-3 px-4">
                                        <Skeleton className="h-4 w-20" />
                                    </td>
                                    <td className="py-3 px-4">
                                        <Skeleton className="h-4 w-16" />
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <Skeleton className="h-7 w-14 ml-auto" />
                                    </td>
                                </tr>
                            ))
                        ) : asignaciones.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="py-8 text-center text-muted-foreground text-xs"
                                >
                                    No se encontraron asignaciones registradas.
                                </td>
                            </tr>
                        ) : (
                            asignaciones.map((asig) => {
                                const isActiva = !asig.fechaFin;
                                return (
                                    <tr
                                        key={asig.id}
                                        className="hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="py-3 px-4 font-medium text-foreground">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">
                                                    {asig.empleado?.nombreCompleto || "—"}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground font-mono">
                                                    {asig.empleado?.codigoEmpleado || ""}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1.5">
                                                <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                                                <span>
                                                    {asig.area?.nombre || "—"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1.5">
                                                <Briefcase className="size-3.5 text-muted-foreground shrink-0" />
                                                <span>
                                                    {asig.cargo?.nombre || "—"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 font-mono text-[11px]">
                                            {asig.fechaInicio}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-[11px]">
                                            {asig.fechaFin ?? "—"}
                                        </td>
                                        <td className="py-3 px-4">
                                            {isActiva ? (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-medium"
                                                >
                                                    Activa
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-muted text-muted-foreground border-border/40 text-[11px] font-medium"
                                                >
                                                    Finalizada
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onEdit(asig)}
                                                    className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="size-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onDelete(asig.id)}
                                                    className="size-7 text-destructive/80 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-1">
                <div>
                    Mostrando{" "}
                    <span className="font-semibold text-foreground">
                        {asignaciones.length}
                    </span>{" "}
                    de{" "}
                    <span className="font-semibold text-foreground">
                        {totalItems}
                    </span>{" "}
                    registros
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span>Mostrar:</span>
                        <Select
                            value={String(pageSize)}
                            onValueChange={(v) => v && onPageSizeChange(Number(v))}
                        >
                            <SelectTrigger className="h-8 w-16 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5" className="text-xs">
                                    5
                                </SelectItem>
                                <SelectItem value="10" className="text-xs">
                                    10
                                </SelectItem>
                                <SelectItem value="25" className="text-xs">
                                    25
                                </SelectItem>
                                <SelectItem value="50" className="text-xs">
                                    50
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={currentPage <= 1}
                            onClick={() => onPageChange(currentPage - 1)}
                            className="size-8 cursor-pointer"
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                        <span className="px-2 font-medium">
                            Página {currentPage} de {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={currentPage >= totalPages}
                            onClick={() => onPageChange(currentPage + 1)}
                            className="size-8 cursor-pointer"
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
