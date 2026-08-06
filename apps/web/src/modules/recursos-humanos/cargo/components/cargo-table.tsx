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

export interface CargoItem {
    id: number | string;
    codigo: string;
    nombre: string;
    descripcion?: string | null;
    activo: boolean;
}

interface CargoTableProps {
    cargos: CargoItem[];
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
    onEdit?: (cargo: CargoItem) => void;
    onDelete?: (id: number | string) => void;
    onRefresh?: () => void;
}

export function CargoTable({
    cargos,
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
}: CargoTableProps) {
    return (
        <Card className="shadow-xs">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <span>Listado de Cargos</span>
                            {onRefresh && (
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={onRefresh}
                                    disabled={isLoading}
                                    title="Recargar datos de la API"
                                    className="cursor-pointer"
                                >
                                    <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
                                </Button>
                            )}
                        </CardTitle>
                        <CardDescription>
                            Cargos obtenidos directamente de la API backend de la clínica.
                        </CardDescription>
                    </div>
                    <SearchInput
                        placeholder="Buscar por código o nombre..."
                        value={searchTerm}
                        onChange={onSearchChange}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6">Código</TableHead>
                            <TableHead>Nombre del Cargo</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right pr-6">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, idx) => (
                                <TableRow key={idx}>
                                    <TableCell className="pl-6">
                                        <Skeleton className="h-4 w-12" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-32" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-40" />
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
                                <TableCell colSpan={5} className="h-32 text-center text-destructive">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <AlertCircle className="size-6 text-destructive" />
                                        <p className="font-semibold text-sm">
                                            {errorMessage || "Error al cargar la información desde la API."}
                                        </p>
                                        {onRefresh && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={onRefresh}
                                                className="mt-1 gap-2 cursor-pointer"
                                            >
                                                <RefreshCw className="size-3.5" /> Reintentar
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : cargos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-28 text-center text-muted-foreground text-sm">
                                    No se encontraron cargos registrados o coincidentes.
                                </TableCell>
                            </TableRow>
                        ) : (
                            cargos.map((cargo) => (
                                <TableRow key={cargo.id}>
                                    <TableCell className="pl-6 font-mono font-bold text-sm">
                                        {cargo.codigo}
                                    </TableCell>
                                    <TableCell className="font-medium text-sm">
                                        {cargo.nombre}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                                        {cargo.descripcion || "—"}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge active={cargo.activo} />
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer">
                                                <MoreHorizontal className="size-4" />
                                                <span className="sr-only">Acciones</span>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuGroup>
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => onEdit?.(cargo)}
                                                        className="gap-2 cursor-pointer"
                                                    >
                                                        <Edit className="size-4" /> Editar Cargo
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onDelete?.(cargo.id)}
                                                    className="gap-2 text-destructive cursor-pointer"
                                                >
                                                    <Trash2 className="size-4" /> Eliminar Cargo
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
                itemLabel="cargos"
            />
        </Card>
    );
}