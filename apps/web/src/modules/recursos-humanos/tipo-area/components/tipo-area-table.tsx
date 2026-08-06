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
import { Badge } from "@/components/ui/badge";
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

export interface TipoAreaItem {
    id: number | string;
    codigo: string;
    nombre: string;
    descripcion?: string | null;
    orden: number;
    activo: boolean;
}

interface TipoAreaTableProps {
    tiposArea: TipoAreaItem[];
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
    onEdit?: (tipoArea: TipoAreaItem) => void;
    onDelete?: (id: number | string) => void;
    onRefresh?: () => void;
}

export function TipoAreaTable({
    tiposArea,
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
}: TipoAreaTableProps) {
    return (
        <Card className="shadow-xs">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <span>Listado de Tipos de Área</span>
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
                            Tipos de área obtenidos directamente de la API backend de la clínica.
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
                            <TableHead>Nombre</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-center">Orden</TableHead>
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
                                    <TableCell className="text-center">
                                        <Skeleton className="h-5 w-8 mx-auto" />
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
                                <TableCell colSpan={6} className="h-32 text-center text-destructive">
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
                        ) : tiposArea.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-28 text-center text-muted-foreground text-sm">
                                    No se encontraron tipos de área registrados o coincidentes.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tiposArea.map((tipoArea) => (
                                <TableRow key={tipoArea.id}>
                                    <TableCell className="pl-6 font-mono font-bold text-sm">
                                        {tipoArea.codigo}
                                    </TableCell>
                                    <TableCell className="font-medium text-sm">
                                        {tipoArea.nombre}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                                        {tipoArea.descripcion || "—"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {tipoArea.orden}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge active={tipoArea.activo} />
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
                                                        onClick={() => onEdit?.(tipoArea)}
                                                        className="gap-2 cursor-pointer"
                                                    >
                                                        <Edit className="size-4" /> Editar Tipo de Área
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onDelete?.(tipoArea.id)}
                                                    className="gap-2 text-destructive cursor-pointer"
                                                >
                                                    <Trash2 className="size-4" /> Eliminar Tipo de Área
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
                itemLabel="tipos de área"
            />
        </Card>
    );
}