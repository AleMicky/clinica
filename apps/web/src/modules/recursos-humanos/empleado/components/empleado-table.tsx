"use client";

import * as React from "react";
import {
    MoreHorizontal,
    Edit,
    Trash2,
    RefreshCw,
    AlertCircle,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
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
import {
    StatusBadge,
    DataTablePagination,
    SearchInput,
} from "@/components/shared";

export interface EmpleadoItem {
    id: number | string;
    personaId: number;
    nombreCompleto: string;
    documento: string;
    codigoEmpleado: string;
    fechaIngreso: string;
    fechaRetiro?: string | null;
    activo: boolean;
}

interface EmpleadoTableProps {
    empleados: EmpleadoItem[];
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

export function EmpleadoTable({
    empleados,
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
}: EmpleadoTableProps) {
    return (
        <Card className="shadow-xs">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <span>Listado de Empleados</span>
                            {onRefresh && (
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={onRefresh}
                                    disabled={isLoading}
                                    title="Recargar datos de la API"
                                    className="cursor-pointer"
                                >
                                    <RefreshCw
                                        className={`size-4 ${
                                            isLoading ? "animate-spin" : ""
                                        }`}
                                    />
                                </Button>
                            )}
                        </CardTitle>
                        <CardDescription>
                            Empleados obtenidos directamente de la API backend
                            de la clínica.
                        </CardDescription>
                    </div>
                    <SearchInput
                        placeholder="Buscar por código, nombre o documento..."
                        value={searchTerm}
                        onChange={onSearchChange}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6">
                                Código
                            </TableHead>
                            <TableHead>Empleado</TableHead>
                            <TableHead>Documento</TableHead>
                            <TableHead>Fecha Ingreso</TableHead>
                            <TableHead>Fecha Retiro</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right pr-6">
                                Acciones
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, idx) => (
                                <TableRow key={idx}>
                                    <TableCell className="pl-6">
                                        <Skeleton className="h-4 w-16" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-40" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-28" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-20" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-20" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : isError ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="h-32 text-center text-destructive"
                                >
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <AlertCircle className="size-6 text-destructive" />
                                        <p className="font-semibold text-sm">
                                            {errorMessage ||
                                                "Error al cargar la información desde la API."}
                                        </p>
                                        {onRefresh && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={onRefresh}
                                                className="mt-1 gap-2 cursor-pointer"
                                            >
                                                <RefreshCw className="size-3.5" />{" "}
                                                Reintentar
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : empleados.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="h-28 text-center text-muted-foreground text-sm"
                                >
                                    No se encontraron empleados registrados o
                                    coincidentes.
                                </TableCell>
                            </TableRow>
                        ) : (
                            empleados.map((emp) => (
                                <TableRow key={emp.id}>
                                    <TableCell className="pl-6 font-mono font-bold text-sm">
                                        {emp.codigoEmpleado}
                                    </TableCell>
                                    <TableCell className="font-medium text-sm">
                                        {emp.nombreCompleto}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {emp.documento}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        {formatDate(emp.fechaIngreso)}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        {formatDate(emp.fechaRetiro)}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge active={emp.activo} />
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer">
                                                <MoreHorizontal className="size-4" />
                                                <span className="sr-only">
                                                    Acciones
                                                </span>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuGroup>
                                                    <DropdownMenuLabel>
                                                        Acciones
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            onEdit?.(emp)
                                                        }
                                                        className="gap-2 cursor-pointer"
                                                    >
                                                        <Edit className="size-4" />{" "}
                                                        Editar Empleado
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onDelete?.(emp.id)
                                                    }
                                                    className="gap-2 text-destructive cursor-pointer"
                                                >
                                                    <Trash2 className="size-4" />{" "}
                                                    Eliminar Empleado
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
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
                itemLabel="empleados"
            />
        </Card>
    );
}