"use client";

import * as React from "react";
import {
    MoreHorizontal,
    Edit,
    Trash2,
    RefreshCw,
    ChevronDown,
    ChevronRight,
    Phone,
    User,
    CalendarDays,
    HeartHandshake,
    IdCard,
    FileClock,
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
    telefono?: string | null;
    fechaNacimiento?: string;
    genero?: string | null;
    estadoCivil?: string | null;
    complementoDocumento?: string | null;
    extensionDocumento?: string | null;
    tipoDocumento?: string;
    numeroDocumento?: string;
    fechaCreacion?: string;
    fechaModificacion?: string | null;
    creadoPor?: string | null;
    modificadoPor?: string | null;
}

interface EmpleadoTableProps {
    empleados: EmpleadoItem[];
    isLoading?: boolean;
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

function formatDateTime(value?: string | null): string {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString("es-BO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function calcularEdad(fechaNacimiento?: string): string {
    if (!fechaNacimiento) return "—";
    const d = new Date(fechaNacimiento + "T00:00:00");
    if (isNaN(d.getTime())) return "—";
    const hoy = new Date();
    let edad = hoy.getFullYear() - d.getFullYear();
    const m = hoy.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < d.getDate())) edad--;
    return Number.isFinite(edad) && edad >= 0 ? `${edad} años` : "—";
}

function documentoCompleto(emp: EmpleadoItem): string {
    if (!emp.tipoDocumento && !emp.numeroDocumento) return emp.documento ?? "—";
    const partes = [
        emp.tipoDocumento,
        emp.numeroDocumento,
        emp.extensionDocumento,
        emp.complementoDocumento ? `-${emp.complementoDocumento}` : null,
    ].filter(Boolean);
    return partes.join(" ").trim() || "—";
}

export function EmpleadoTable({
    empleados,
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
}: EmpleadoTableProps) {
    const [expandedIds, setExpandedIds] = React.useState<
        Set<number | string>
    >(new Set());

    const toggleExpand = (id: number | string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

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
                            de la clínica. Haga clic en la flecha de cada fila
                            para ver más información de la persona.
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
                            <TableHead className="w-10 pl-6" />
                            <TableHead>Código</TableHead>
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
                                        <Skeleton className="h-4 w-4" />
                                    </TableCell>
                                    <TableCell>
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
                        ) : empleados.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-28 text-center text-muted-foreground text-sm"
                                >
                                    No se encontraron empleados registrados o
                                    coincidentes.
                                </TableCell>
                            </TableRow>
                        ) : (
                            empleados.flatMap((emp) => {
                                const expandido = expandedIds.has(emp.id);
                                return [
                                    <TableRow
                                        key={`row-${emp.id}`}
                                        aria-expanded={expandido}
                                    >
                                        <TableCell className="pl-6">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleExpand(emp.id)
                                                }
                                                aria-label={
                                                    expandido
                                                        ? "Contraer"
                                                        : "Expandir"
                                                }
                                                className="inline-flex size-6 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer"
                                            >
                                                {expandido ? (
                                                    <ChevronDown className="size-4" />
                                                ) : (
                                                    <ChevronRight className="size-4" />
                                                )}
                                            </button>
                                        </TableCell>
                                        <TableCell className="font-mono font-bold text-sm">
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
                                    </TableRow>,
                                    expandido ? (
                                        <TableRow
                                            key={`detail-${emp.id}`}
                                            className="bg-muted/30 hover:bg-muted/30"
                                        >
                                            <TableCell colSpan={8} className="p-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-xs whitespace-normal">
                                                    <div className="flex items-start gap-2">
                                                        <Phone className="size-3.5 text-muted-foreground mt-0.5" />
                                                        <div>
                                                            <div className="text-muted-foreground">
                                                                Teléfono
                                                            </div>
                                                            <div className="font-medium">
                                                                {emp.telefono ?? "—"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <CalendarDays className="size-3.5 text-muted-foreground mt-0.5" />
                                                        <div>
                                                            <div className="text-muted-foreground">
                                                                Fecha nacimiento
                                                            </div>
                                                            <div className="font-medium">
                                                                {formatDate(
                                                                    emp.fechaNacimiento,
                                                                )}{" "}
                                                                <span className="text-muted-foreground">
                                                                    ({calcularEdad(
                                                                        emp.fechaNacimiento,
                                                                    )})
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <User className="size-3.5 text-muted-foreground mt-0.5" />
                                                        <div>
                                                            <div className="text-muted-foreground">
                                                                Género
                                                            </div>
                                                            <div className="font-medium">
                                                                {emp.genero ?? "—"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <HeartHandshake className="size-3.5 text-muted-foreground mt-0.5" />
                                                        <div>
                                                            <div className="text-muted-foreground">
                                                                Estado civil
                                                            </div>
                                                            <div className="font-medium">
                                                                {emp.estadoCivil ?? "—"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <IdCard className="size-3.5 text-muted-foreground mt-0.5" />
                                                        <div>
                                                            <div className="text-muted-foreground">
                                                                Documento completo
                                                            </div>
                                                            <div className="font-medium">
                                                                {documentoCompleto(emp)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-2 sm:col-span-2 lg:col-span-1">
                                                        <FileClock className="size-3.5 text-muted-foreground mt-0.5" />
                                                        <div className="min-w-0">
                                                            <div className="text-muted-foreground">
                                                                Auditoría
                                                            </div>
                                                            <div className="font-medium space-y-0.5">
                                                                <div>
                                                                    Creado por{" "}
                                                                    <span className="text-foreground">
                                                                        {emp.creadoPor ?? "—"}
                                                                    </span>{" "}
                                                                    el{" "}
                                                                    <span className="text-foreground">
                                                                        {formatDateTime(
                                                                            emp.fechaCreacion,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    Modificado por{" "}
                                                                    <span className="text-foreground">
                                                                        {emp.modificadoPor ?? "—"}
                                                                    </span>{" "}
                                                                    el{" "}
                                                                    <span className="text-foreground">
                                                                        {formatDateTime(
                                                                            emp.fechaModificacion,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : null,
                                ];
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
                itemLabel="empleados"
            />
        </Card>
    );
}