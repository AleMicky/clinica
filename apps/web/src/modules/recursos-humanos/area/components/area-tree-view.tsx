"use client";

import * as React from "react";
import {
    ChevronRight,
    ChevronDown,
    MoreHorizontal,
    Edit,
    Trash2,
    Plus,
    RefreshCw,
    Network,
    Search,
    ChevronsDownUp,
    ChevronsUpDown,
    X,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type {
    AreaArbolResponse,
    AreaResponse,
} from "../types/area.types";
import type { AreaItem } from "./area-table";

type AreaTreeItem = AreaResponse | AreaItem;

interface AreaTreeViewProps {
    isLoading?: boolean;
    onRefresh?: () => void;
    onEdit?: (area: AreaTreeItem) => void;
    onAddSubarea?: (parentId: number) => void;
    onDelete?: (id: number) => void;
    onAdd?: () => void;
    arbol?: AreaArbolResponse | null;
}

const NIVELES_COLOR = [
    "text-primary",
    "text-primary/70",
    "text-primary/55",
    "text-primary/40",
    "text-muted-foreground",
];

function contarNodos(nodos: AreaArbolResponse[] | undefined): number {
    if (!nodos || nodos.length === 0) return 0;
    return nodos.reduce(
        (acc, n) => acc + 1 + contarNodos(n.subareas),
        0,
    );
}

function maxProfundidad(nodos: AreaArbolResponse[] | undefined): number {
    if (!nodos || nodos.length === 0) return 0;
    return 1 + Math.max(...nodos.map((n) => maxProfundidad(n.subareas)));
}

/**
 * Filtra el árbol conservando un nodo si coincide con el término
 * (nombre o código, case-insensitive) o si alguno de sus descendientes
 * coincide. Devuelve también el set de ids que deben estar expandidos.
 */
function filtrarArbol(
    nodos: AreaArbolResponse[],
    termino: string,
): { nodos: AreaArbolResponse[]; expandir: Set<number> } {
    const t = termino.trim().toLowerCase();
    const expandir = new Set<number>();
    if (!t) return { nodos, expandir };

    const rec = (lista: AreaArbolResponse[]): AreaArbolResponse[] => {
        const resultado: AreaArbolResponse[] = [];
        for (const nodo of lista) {
            const coincide =
                nodo.nombre.toLowerCase().includes(t) ||
                nodo.codigo.toLowerCase().includes(t) ||
                (nodo.tipoAreaNombre?.toLowerCase().includes(t) ?? false);
            const hijosFiltrados = rec(nodo.subareas);
            if (coincide || hijosFiltrados.length > 0) {
                if (hijosFiltrados.length > 0) expandir.add(nodo.id);
                resultado.push({ ...nodo, subareas: hijosFiltrados });
            }
        }
        return resultado;
    };

    const nodosFiltrados = rec(nodos);
    return { nodos: nodosFiltrados, expandir };
}

function recogerTodosIds(nodos: AreaArbolResponse[], acc = new Set<number>()): Set<number> {
    for (const n of nodos) {
        if (n.subareas.length > 0) {
            acc.add(n.id);
            recogerTodosIds(n.subareas, acc);
        }
    }
    return acc;
}

function recogerIdsRaices(nodos: AreaArbolResponse[]): Set<number> {
    return new Set(nodos.filter((n) => n.subareas.length > 0).map((n) => n.id));
}

export function AreaTreeView({
    isLoading = false,
    onRefresh,
    onEdit,
    onAddSubarea,
    onDelete,
    onAdd,
    arbol,
}: AreaTreeViewProps) {
    const [busqueda, setBusqueda] = React.useState("");
    const [expandidos, setExpandidos] = React.useState<Set<number>>(() =>
        recogerIdsRaices(arbol?.subareas ?? []),
    );
    const [seleccionado, setSeleccionado] = React.useState<number | null>(null);

    const arbolNormalizado = React.useMemo(() => {
        if (!arbol) return [];
        return arbol.subareas;
    }, [arbol]);

    const { nodos: nodosVisibles, expandir: expandirPorBusqueda } =
        React.useMemo(
            () => filtrarArbol(arbolNormalizado, busqueda),
            [arbolNormalizado, busqueda],
        );

    const expandidosFinal = React.useMemo(() => {
        if (busqueda) {
            const merged = new Set(expandidos);
            expandirPorBusqueda.forEach((id) => merged.add(id));
            return merged;
        }
        return expandidos;
    }, [expandidos, expandirPorBusqueda, busqueda]);

    const total = React.useMemo(
        () => contarNodos(arbolNormalizado),
        [arbolNormalizado],
    );
    const profundidad = React.useMemo(
        () => maxProfundidad(arbolNormalizado),
        [arbolNormalizado],
    );

    const toggleNodo = (id: number) => {
        setExpandidos((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const expandirTodo = () =>
        setExpandidos(recogerTodosIds(arbolNormalizado));
    const colapsarTodo = () => setExpandidos(new Set<number>());

    const limpiarBusqueda = () => setBusqueda("");

    const hayArbol =
        !!arbol && arbol.subareas.length > 0;
    const hayResultados = nodosVisibles.length > 0;

    return (
        <Card className="shadow-xs">
            <CardHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                                <Network className="size-4 text-primary" />
                                <span>Jerarquía de Áreas</span>
                                {hayArbol && (
                                    <>
                                        <Badge
                                            variant="secondary"
                                            className="text-[10px] font-medium"
                                        >
                                            {total} {total === 1 ? "nodo" : "nodos"}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] font-medium"
                                        >
                                            Profundidad {profundidad}
                                        </Badge>
                                    </>
                                )}
                                {onRefresh && (
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={onRefresh}
                                        disabled={isLoading}
                                        title="Recargar árbol"
                                        className="cursor-pointer"
                                    >
                                        <RefreshCw
                                            className={cn(
                                                "size-4",
                                                isLoading && "animate-spin",
                                            )}
                                        />
                                    </Button>
                                )}
                            </CardTitle>
                            <CardDescription>
                                Estructura jerárquica de áreas organizacionales.
                            </CardDescription>
                        </div>

                        {hayArbol && (
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={busqueda}
                                        onChange={(e) =>
                                            setBusqueda(e.target.value)
                                        }
                                        placeholder="Buscar área..."
                                        className="h-8 w-48 pl-8 pr-7 text-sm"
                                        aria-label="Buscar área"
                                    />
                                    {busqueda && (
                                        <button
                                            type="button"
                                            onClick={limpiarBusqueda}
                                            title="Limpiar búsqueda"
                                            className="absolute right-1.5 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={expandirTodo}
                                    className="gap-1.5 cursor-pointer"
                                    title="Expandir todo"
                                >
                                    <ChevronsUpDown className="size-3.5" />
                                    <span className="hidden sm:inline">
                                        Expandir
                                    </span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={colapsarTodo}
                                    className="gap-1.5 cursor-pointer"
                                    title="Colapsar todo"
                                >
                                    <ChevronsDownUp className="size-3.5" />
                                    <span className="hidden sm:inline">
                                        Colapsar
                                    </span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-1.5">
                        {[0, 1, 2, 3, 4].map((idx) => (
                            <div
                                key={idx}
                                style={{ marginLeft: `${idx * 14}px` }}
                                className="flex items-center gap-2"
                            >
                                <Skeleton className="size-4 rounded-sm" />
                                <Skeleton
                                    className={cn(
                                        "h-4",
                                        idx % 2 === 0 ? "w-[55%]" : "w-[40%]",
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                ) : !hayArbol ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                            <Network className="size-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-sm">
                                No hay áreas registradas
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Crea la primera área para comenzar a estructurar
                                la jerarquía organizacional.
                            </p>
                        </div>
                        {onAdd && (
                            <Button
                                size="sm"
                                onClick={onAdd}
                                className="gap-2 cursor-pointer"
                            >
                                <Plus className="size-4" /> Agregar primera área
                            </Button>
                        )}
                    </div>
                ) : busqueda && !hayResultados ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
                        <Search className="size-5" />
                        <p className="text-sm">
                            No se encontraron áreas para{" "}
                            <span className="font-medium text-foreground">
                                &ldquo;{busqueda}&rdquo;
                            </span>
                            .
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={limpiarBusqueda}
                            className="gap-1.5 cursor-pointer"
                        >
                            <X className="size-3.5" /> Limpiar búsqueda
                        </Button>
                    </div>
                ) : (
                    <ul className="space-y-0.5">
                        {nodosVisibles.map((nodo) => (
                            <AreaTreeNode
                                key={nodo.id}
                                nodo={nodo}
                                depth={0}
                                expandidos={expandidosFinal}
                                onToggle={toggleNodo}
                                seleccionado={seleccionado}
                                onSeleccionar={setSeleccionado}
                                termino={busqueda}
                                onEdit={onEdit}
                                onAddSubarea={onAddSubarea}
                                onDelete={onDelete}
                            />
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}

interface AreaTreeNodeProps {
    nodo: AreaArbolResponse;
    depth: number;
    expandidos: Set<number>;
    onToggle: (id: number) => void;
    seleccionado: number | null;
    onSeleccionar: (id: number | null) => void;
    termino: string;
    onEdit?: (area: AreaTreeItem) => void;
    onAddSubarea?: (parentId: number) => void;
    onDelete?: (id: number) => void;
}

function AreaTreeNode({
    nodo,
    depth,
    expandidos,
    onToggle,
    seleccionado,
    onSeleccionar,
    termino,
    onEdit,
    onAddSubarea,
    onDelete,
}: AreaTreeNodeProps) {
    const tieneSubareas = nodo.subareas.length > 0;
    const expandido = expandidos.has(nodo.id);
    const esSeleccionado = seleccionado === nodo.id;
    const colorIcono =
        NIVELES_COLOR[Math.min(depth, NIVELES_COLOR.length - 1)];

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (tieneSubareas) onToggle(nodo.id);
    };

    const handleSeleccionar = () => {
        onSeleccionar(esSeleccionado ? null : nodo.id);
    };

    const handleEdit = () => {
        onEdit?.({
            id: nodo.id,
            codigo: nodo.codigo,
            nombre: nodo.nombre,
            descripcion: null,
            tipoAreaId: nodo.tipoAreaId,
            tipoAreaNombre: nodo.tipoAreaNombre,
            areaPadreId: null,
            activo: true,
        });
    };

    return (
        <li>
            <div
                role="button"
                tabIndex={0}
                onClick={handleSeleccionar}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSeleccionar();
                    }
                }}
                className={cn(
                    "group relative flex items-center gap-2 rounded-lg py-1.5 pr-2 transition-colors outline-none",
                    "hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring/40",
                    esSeleccionado && "bg-primary/10 ring-1 ring-primary/30",
                )}
                title={`${nodo.codigo} · ${nodo.nombre}`}
            >
                <button
                    type="button"
                    onClick={handleToggle}
                    disabled={!tieneSubareas}
                    className={cn(
                        "inline-flex size-5 items-center justify-center shrink-0 rounded transition-colors",
                        tieneSubareas
                            ? "text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            : "text-transparent cursor-default",
                    )}
                    aria-label={expandido ? "Contraer" : "Expandir"}
                    aria-expanded={expandido}
                >
                    {tieneSubareas && expandido ? (
                        <ChevronDown className="size-4" />
                    ) : (
                        <ChevronRight className="size-4" />
                    )}
                </button>

                <Network className={cn("size-4 shrink-0", colorIcono)} />

                <Resaltar text={nodo.codigo} termino={termino} />
                <span className="font-medium text-sm">
                    <Resaltar text={nodo.nombre} termino={termino} />
                </span>

                {nodo.tipoAreaNombre && (
                    <Badge
                        variant="outline"
                        className="text-[10px] ml-1.5 font-normal"
                    >
                        {nodo.tipoAreaNombre}
                    </Badge>
                )}

                {tieneSubareas && (
                    <Badge
                        variant="secondary"
                        className="text-[10px] font-medium"
                    >
                        {nodo.subareas.length}
                    </Badge>
                )}

                <div className="ml-auto flex items-center gap-0.5">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit();
                        }}
                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 cursor-pointer"
                        title="Editar"
                    >
                        <Edit className="size-3.5" />
                        <span className="sr-only">Editar</span>
                    </Button>
                    {onAddSubarea && (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddSubarea(nodo.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 cursor-pointer"
                            title="Agregar subárea"
                        >
                            <Plus className="size-3.5" />
                            <span className="sr-only">Agregar subárea</span>
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer"
                        >
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Acciones</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={handleEdit}
                                    className="gap-2 cursor-pointer"
                                >
                                    <Edit className="size-4" /> Editar Área
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        onAddSubarea?.(nodo.id)
                                    }
                                    className="gap-2 cursor-pointer"
                                >
                                    <Plus className="size-4" /> Agregar Subárea
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete?.(nodo.id)}
                                className="gap-2 text-destructive cursor-pointer focus:text-destructive"
                            >
                                <Trash2 className="size-4" /> Eliminar Área
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {tieneSubareas && expandido && (
                <ul
                    className={cn(
                        "ml-[14px] pl-2 space-y-0.5",
                        "border-l border-dashed border-accent/40",
                    )}
                >
                    {nodo.subareas.map((hijo) => (
                        <AreaTreeNode
                            key={hijo.id}
                            nodo={hijo}
                            depth={depth + 1}
                            expandidos={expandidos}
                            onToggle={onToggle}
                            seleccionado={seleccionado}
                            onSeleccionar={onSeleccionar}
                            termino={termino}
                            onEdit={onEdit}
                            onAddSubarea={onAddSubarea}
                            onDelete={onDelete}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

function Resaltar({ text, termino }: { text: string; termino: string }) {
    const t = termino.trim();
    if (!t) return <>{text}</>;

    const lower = text.toLowerCase();
    const tLower = t.toLowerCase();
    const idx = lower.indexOf(tLower);
    if (idx === -1) return <>{text}</>;

    return (
        <>
            {text.slice(0, idx)}
            <mark className="rounded-sm bg-yellow-100/80 px-0.5 text-foreground dark:bg-yellow-500/30">
                {text.slice(idx, idx + t.length)}
            </mark>
            {text.slice(idx + t.length)}
        </>
    );
}