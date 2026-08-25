"use client";

import * as React from "react";
import {
  ChevronRight,
  ChevronDown,
  Network,
  Search,
  Check,
  Building2,
  FolderTree,
  ChevronsUpDown,
  ChevronsDownUp,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useArbolAreas, useAreas } from "../hooks/use-areas";
import type { AreaArbolResponse, AreaResponse } from "../types/area.types";

interface AreaTreeSelectProps {
  id?: string;
  value?: number | null;
  onValueChange: (value: number, area?: AreaResponse | AreaArbolResponse | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

/**
 * Busca recursivamente la ruta de nombres (breadcrumb) hasta un nodo específico.
 */
function findNodePath(
  nodes: AreaArbolResponse[],
  targetId: number,
  currentPath: string[] = []
): string[] | null {
  for (const node of nodes) {
    const nextPath = [...currentPath, node.nombre];
    if (node.id === targetId) {
      return nextPath;
    }
    if (node.subareas && node.subareas.length > 0) {
      const found = findNodePath(node.subareas, targetId, nextPath);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Busca un nodo por su ID en el árbol.
 */
function findNodeById(
  nodes: AreaArbolResponse[],
  targetId: number
): AreaArbolResponse | null {
  for (const node of nodes) {
    if (node.id === targetId) return node;
    if (node.subareas && node.subareas.length > 0) {
      const found = findNodeById(node.subareas, targetId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Filtra el árbol según el término de búsqueda y devuelve los IDs de los nodos que deben expandirse.
 */
function filterTreeNodes(
  nodes: AreaArbolResponse[],
  term: string
): { filtered: AreaArbolResponse[]; toExpand: Set<number> } {
  const t = term.trim().toLowerCase();
  const toExpand = new Set<number>();
  if (!t) return { filtered: nodes, toExpand };

  const filterRecursive = (list: AreaArbolResponse[]): AreaArbolResponse[] => {
    const result: AreaArbolResponse[] = [];
    for (const node of list) {
      const matchSelf =
        node.nombre.toLowerCase().includes(t) ||
        node.codigo.toLowerCase().includes(t) ||
        (node.tipoAreaNombre?.toLowerCase().includes(t) ?? false);

      const filteredChildren = node.subareas ? filterRecursive(node.subareas) : [];

      if (matchSelf || filteredChildren.length > 0) {
        if (filteredChildren.length > 0) {
          toExpand.add(node.id);
        }
        result.push({
          ...node,
          subareas: filteredChildren,
        });
      }
    }
    return result;
  };

  return { filtered: filterRecursive(nodes), toExpand };
}

/**
 * Componente recursivo para renderizar cada nodo del árbol.
 */
interface TreeNodeItemProps {
  node: AreaArbolResponse;
  level: number;
  selectedValue?: number | null;
  expandedSet: Set<number>;
  onToggleExpand: (id: number) => void;
  onSelect: (node: AreaArbolResponse) => void;
  searchTerm?: string;
}

function TreeNodeItem({
  node,
  level,
  selectedValue,
  expandedSet,
  onToggleExpand,
  onSelect,
  searchTerm = "",
}: TreeNodeItemProps) {
  const hasChildren = node.subareas && node.subareas.length > 0;
  const isExpanded = expandedSet.has(node.id);
  const isSelected = selectedValue === node.id;

  const isMatchSearch =
    searchTerm.trim().length > 0 &&
    (node.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.codigo.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col select-none">
      <div
        className={cn(
          "group flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-150 text-xs",
          isSelected
            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
            : "hover:bg-accent/60 text-foreground",
          isMatchSearch && !isSelected && "bg-primary/10 text-primary font-medium"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node)}
      >
        {/* Toggle Expand Icon */}
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.id);
            }}
            className={cn(
              "size-5 flex items-center justify-center rounded hover:bg-black/10 dark:hover:bg-white/10 shrink-0 transition-transform",
              isSelected ? "text-primary-foreground" : "text-muted-foreground"
            )}
          >
            {isExpanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
          </button>
        ) : (
          <span className="size-5 shrink-0 flex items-center justify-center">
            <span
              className={cn(
                "size-1.5 rounded-full",
                isSelected ? "bg-primary-foreground/70" : "bg-muted-foreground/40"
              )}
            />
          </span>
        )}

        {/* Node Icon */}
        <Building2
          className={cn(
            "size-3.5 shrink-0",
            isSelected ? "text-primary-foreground" : "text-primary/70"
          )}
        />

        {/* Node Name and Code */}
        <div className="min-w-0 flex-1 flex items-center gap-1.5">
          <span className="truncate">{node.nombre}</span>
          <span
            className={cn(
              "font-mono text-[10px] px-1 py-0.2 rounded shrink-0",
              isSelected
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted/70 text-muted-foreground"
            )}
          >
            {node.codigo}
          </span>
        </div>

        {/* Tipo de Área Badge */}
        {node.tipoAreaNombre && (
          <span
            className={cn(
              "text-[9.5px] px-1.5 py-0.2 rounded-full font-medium shrink-0 hidden sm:inline-block",
              isSelected
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            {node.tipoAreaNombre}
          </span>
        )}

        {/* Selected Checkmark */}
        {isSelected && (
          <Check className="size-4 text-primary-foreground shrink-0 ml-1" />
        )}
      </div>

      {/* Render Recursive Subareas if expanded */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col border-l border-border/40 ml-4 pl-1 mt-0.5 space-y-0.5">
          {node.subareas.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedValue={selectedValue}
              expandedSet={expandedSet}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AreaTreeSelect({
  id,
  value,
  onValueChange,
  placeholder = "Seleccionar área en el árbol...",
  disabled = false,
  error = false,
  className,
}: AreaTreeSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [expandedNodes, setExpandedNodes] = React.useState<Set<number>>(new Set());

  // Queries
  const { data: arbolData, isLoading: isLoadingArbol } = useArbolAreas();
  const { data: flatAreasData } = useAreas({ page: 1, pageSize: 200 });

  const rootNodes: AreaArbolResponse[] = React.useMemo(() => {
    if (!arbolData) return [];
    if (Array.isArray(arbolData.subareas) && arbolData.subareas.length > 0) {
      return arbolData.subareas;
    }
    return [arbolData];
  }, [arbolData]);

  // Selected Area Info
  const selectedNode = React.useMemo(() => {
    if (!value) return null;
    return findNodeById(rootNodes, value);
  }, [rootNodes, value]);

  const selectedFlatArea = React.useMemo(() => {
    if (!value) return null;
    return flatAreasData?.items?.find((a) => a.id === value) || null;
  }, [flatAreasData, value]);

  // Breadcrumb path of the selected area
  const selectedPath = React.useMemo(() => {
    if (!value || rootNodes.length === 0) return null;
    const path = findNodePath(rootNodes, value);
    return path ? path.join(" › ") : null;
  }, [rootNodes, value]);

  // Filtered Tree & Auto-expand matching branches on search
  const { filtered: visibleNodes, toExpand: autoExpandSet } = React.useMemo(() => {
    return filterTreeNodes(rootNodes, searchTerm);
  }, [rootNodes, searchTerm]);

  // Sync auto-expand on search changes
  React.useEffect(() => {
    if (searchTerm.trim().length > 0) {
      setExpandedNodes((prev) => new Set([...prev, ...autoExpandSet]));
    }
  }, [searchTerm, autoExpandSet]);

  const handleToggleExpand = (nodeId: number) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    const allIds = new Set<number>();
    const collectIds = (nodes: AreaArbolResponse[]) => {
      for (const n of nodes) {
        allIds.add(n.id);
        if (n.subareas) collectIds(n.subareas);
      }
    };
    collectIds(rootNodes);
    setExpandedNodes(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedNodes(new Set());
  };

  const handleSelectNode = (node: AreaArbolResponse) => {
    onValueChange(node.id, node);
    setOpen(false);
  };

  const displayName = selectedNode
    ? `${selectedNode.nombre} (${selectedNode.codigo})`
    : selectedFlatArea
    ? `${selectedFlatArea.nombre} (${selectedFlatArea.codigo})`
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        className={cn(
          "w-full h-9.5 flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-lg border bg-background text-left transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          error
            ? "border-destructive focus-visible:ring-destructive"
            : "border-input hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FolderTree
            className={cn(
              "size-4 shrink-0",
              value ? "text-primary" : "text-muted-foreground"
            )}
          />
          {displayName ? (
            <div className="min-w-0 flex-1 truncate">
              <span className="font-semibold text-foreground">{displayName}</span>
              {selectedPath && (
                <span className="text-[10px] text-muted-foreground block truncate">
                  {selectedPath}
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground truncate">{placeholder}</span>
          )}
        </div>

        <ChevronsUpDown className="size-3.5 text-muted-foreground shrink-0 opacity-70" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[340px] sm:w-[460px] p-0 shadow-2xl border-border/80 rounded-xl overflow-hidden"
      >
        {/* Popover Header with Search */}
        <div className="p-3 border-b border-border/60 bg-muted/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Network className="size-3.5 text-primary" />
              Jerarquía de Áreas Organizacionales
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleExpandAll}
                className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer gap-1"
                title="Expandir todas las ramas"
              >
                <ChevronsUpDown className="size-3" />
                Expandir
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCollapseAll}
                className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer gap-1"
                title="Colapsar ramas"
              >
                <ChevronsDownUp className="size-3" />
                Colapsar
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar área por nombre, código o tipo..."
              className="h-8 pl-8 pr-7 text-xs bg-background"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="size-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Tree Content */}
        <div className="max-h-[320px] overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
          {isLoadingArbol ? (
            <div className="p-3 space-y-2">
              <Skeleton className="h-7 w-full rounded-md" />
              <Skeleton className="h-7 w-5/6 ml-4 rounded-md" />
              <Skeleton className="h-7 w-4/6 ml-8 rounded-md" />
            </div>
          ) : visibleNodes.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">No se encontraron áreas</p>
              <p className="text-[11px]">
                {searchTerm
                  ? `Ningún área coincide con "${searchTerm}"`
                  : "No hay áreas organizacionales registradas"}
              </p>
            </div>
          ) : (
            visibleNodes.map((node) => (
              <TreeNodeItem
                key={node.id}
                node={node}
                level={0}
                selectedValue={value}
                expandedSet={expandedNodes}
                onToggleExpand={handleToggleExpand}
                onSelect={handleSelectNode}
                searchTerm={searchTerm}
              />
            ))
          )}
        </div>

        {/* Selected Breadcrumb Footer */}
        {selectedPath && (
          <div className="p-2 px-3 border-t border-border/50 bg-muted/20 text-[11px] text-muted-foreground flex items-center justify-between gap-2">
            <span className="truncate">
              <strong>Seleccionado:</strong> {selectedPath}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onValueChange(0, null)}
              className="h-5 px-1.5 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
            >
              Limpiar
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
