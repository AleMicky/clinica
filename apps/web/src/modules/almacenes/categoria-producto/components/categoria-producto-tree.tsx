"use client";

import * as React from "react";
import {
  FolderTree,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  Clock,
  X,
  UnfoldVertical,
  FoldVertical,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CategoriaProductoResponse } from "../types/categoria-producto.types";

export interface CategoryTreeNode extends CategoriaProductoResponse {
  children: CategoryTreeNode[];
  depth: number;
}

interface CategoriaProductoTreeProps {
  categorias: CategoriaProductoResponse[];
  isLoading?: boolean;
  onAddCategoria?: (padreId?: number | null) => void;
  onEdit?: (categoria: CategoriaProductoResponse) => void;
  onDelete?: (categoria: CategoriaProductoResponse) => void;
  onRefresh?: () => void;
  onViewAudit?: (categoria: CategoriaProductoResponse) => void;
}

/**
 * Builds a hierarchical tree from a flat list of categories with guaranteed depth calculations
 */
function buildTree(items: CategoriaProductoResponse[]): CategoryTreeNode[] {
  const itemMap = new Map<number, CategoryTreeNode>();

  items.forEach((item) => {
    itemMap.set(item.id, { ...item, children: [], depth: 0 });
  });

  const roots: CategoryTreeNode[] = [];

  items.forEach((item) => {
    const node = itemMap.get(item.id)!;
    if (item.categoriaPadreId && itemMap.has(item.categoriaPadreId)) {
      const parent = itemMap.get(item.categoriaPadreId)!;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Calculate depths recursively from roots to avoid ordering issues
  function assignDepth(nodes: CategoryTreeNode[], currentDepth: number) {
    nodes.forEach((node) => {
      node.depth = currentDepth;
      if (node.children.length > 0) {
        assignDepth(node.children, currentDepth + 1);
      }
    });
  }

  assignDepth(roots, 0);

  return roots;
}

/**
 * Filter tree nodes recursively based on search query
 */
function filterTree(nodes: CategoryTreeNode[], term: string): CategoryTreeNode[] {
  if (!term) return nodes;
  const lowerTerm = term.toLowerCase();

  function matchOrHasMatchingChild(node: CategoryTreeNode): CategoryTreeNode | null {
    const isDirectMatch =
      node.nombre.toLowerCase().includes(lowerTerm) ||
      node.codigo.toLowerCase().includes(lowerTerm) ||
      (node.descripcion?.toLowerCase().includes(lowerTerm) ?? false);

    const matchingChildren: CategoryTreeNode[] = [];
    for (const child of node.children) {
      const matchedChild = matchOrHasMatchingChild(child);
      if (matchedChild) {
        matchingChildren.push(matchedChild);
      }
    }

    if (isDirectMatch || matchingChildren.length > 0) {
      return {
        ...node,
        children: matchingChildren,
      };
    }

    return null;
  }

  return nodes
    .map((root) => matchOrHasMatchingChild(root))
    .filter((node): node is CategoryTreeNode => node !== null);
}

/**
 * Collect all IDs recursively from tree nodes
 */
function getAllNodeIds(nodes: CategoryTreeNode[]): Set<number> {
  const all = new Set<number>();
  const collect = (list: CategoryTreeNode[]) => {
    list.forEach((n) => {
      all.add(n.id);
      if (n.children.length > 0) collect(n.children);
    });
  };
  collect(nodes);
  return all;
}

/**
 * Counts total visible nodes in a tree
 */
function countTreeNodes(nodes: CategoryTreeNode[]): number {
  let count = 0;
  const walk = (list: CategoryTreeNode[]) => {
    count += list.length;
    list.forEach((n) => {
      if (n.children.length > 0) walk(n.children);
    });
  };
  walk(nodes);
  return count;
}

interface TreeNodeItemProps {
  node: CategoryTreeNode;
  searchTerm: string;
  expandedIds: Set<number>;
  onToggle: (id: number, e?: React.MouseEvent) => void;
  onAddSubcategoria?: (padreId: number) => void;
  onEdit?: (categoria: CategoriaProductoResponse) => void;
  onDelete?: (categoria: CategoriaProductoResponse) => void;
  onViewAudit?: (categoria: CategoriaProductoResponse) => void;
}

/**
 * Memoized individual tree item with direct actions
 */
const TreeNodeItem = React.memo(function TreeNodeItem({
  node,
  searchTerm,
  expandedIds,
  onToggle,
  onAddSubcategoria,
  onEdit,
  onDelete,
  onViewAudit,
}: TreeNodeItemProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = Boolean(searchTerm.trim()) || expandedIds.has(node.id);
  const isRoot = node.depth === 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" && hasChildren && !isExpanded) {
      e.preventDefault();
      onToggle(node.id);
    } else if (e.key === "ArrowLeft" && hasChildren && isExpanded) {
      e.preventDefault();
      onToggle(node.id);
    }
  };

  return (
    <div
      className="flex flex-col select-none"
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
    >
      <div
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{ paddingLeft: `${node.depth * 1.5 + 0.6}rem` }}
        className="group relative flex items-center justify-between gap-3 py-2 pr-3 rounded-lg text-xs transition-all duration-150 border border-transparent hover:bg-muted/60 hover:border-border/50 outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {/* Left Side: Icon, Code Badge, Name, Description and Subcategory Count */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Expand / Collapse Button */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => onToggle(node.id, e)}
              className="size-5 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground shrink-0 cursor-pointer transition-colors hover:bg-muted"
              aria-label={isExpanded ? "Contraer subcategorías" : "Expandir subcategorías"}
            >
              {isExpanded ? (
                <ChevronDown className="size-3.5 transition-transform" />
              ) : (
                <ChevronRight className="size-3.5 transition-transform" />
              )}
            </button>
          ) : (
            <div className="size-5 flex items-center justify-center shrink-0">
              <span className="size-1.5 rounded-full bg-muted-foreground/40" />
            </div>
          )}

          {/* Folder Icon */}
          <div className="shrink-0">
            {isRoot ? (
              <div className="size-6 rounded-md flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {isExpanded && hasChildren ? (
                  <FolderOpen className="size-3.5" />
                ) : (
                  <Folder className="size-3.5" />
                )}
              </div>
            ) : (
              <div className="size-6 rounded-md flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
                {isExpanded && hasChildren ? (
                  <FolderOpen className="size-3.5" />
                ) : (
                  <Folder className="size-3.5" />
                )}
              </div>
            )}
          </div>

          {/* Code Badge */}
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 tracking-tight bg-muted/80 text-foreground/80 border border-border/60">
            {node.codigo}
          </span>

          {/* Category Name */}
          <span className="font-semibold text-xs text-foreground truncate">
            {node.nombre}
          </span>

          {/* Optional Description */}
          {node.descripcion && (
            <span className="text-[11px] text-muted-foreground truncate hidden md:inline max-w-xs font-normal">
              — {node.descripcion}
            </span>
          )}

          {/* Subcategories count badge */}
          {hasChildren && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono shrink-0 bg-muted text-muted-foreground font-medium border border-border/40 ml-1">
              {node.children.length} {node.children.length === 1 ? "subcategoría" : "subcategorías"}
            </span>
          )}
        </div>

        {/* Right Side: Action Buttons directly in tree row */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Add Subcategory */}
          <Tooltip>
            <TooltipTrigger
              type="button"
              className="inline-flex items-center gap-1 h-7 px-2 text-[11px] font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 border border-primary/25 transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onAddSubcategoria?.(node.id);
              }}
              aria-label="Añadir subcategoría"
            >
              <Plus className="size-3" />
              <span className="hidden sm:inline">Subcategoría</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[11px]">
              Añadir subcategoría en {node.nombre}
            </TooltipContent>
          </Tooltip>

          {/* Quick Edit Button */}
          <Tooltip>
            <TooltipTrigger
              type="button"
              className="size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60 hover:border-border transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(node);
              }}
              aria-label="Editar categoría"
            >
              <Edit2 className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[11px]">
              Editar categoría
            </TooltipContent>
          </Tooltip>

          {/* Quick Delete Button */}
          <Tooltip>
            <TooltipTrigger
              type="button"
              className="size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border/60 hover:border-destructive/30 transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(node);
              }}
              aria-label="Eliminar categoría"
            >
              <Trash2 className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[11px]">
              Eliminar categoría
            </TooltipContent>
          </Tooltip>

          {/* More options dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              className="size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60 transition-colors cursor-pointer"
              aria-label="Más opciones"
            >
              <MoreVertical className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuLabel className="text-[10px] text-muted-foreground font-normal uppercase tracking-wider">
                {node.codigo} - {node.nombre}
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onAddSubcategoria?.(node.id)}
                className="cursor-pointer gap-2 text-xs"
              >
                <Plus className="size-3.5 text-primary" />
                <span>Añadir subcategoría</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit?.(node)}
                className="cursor-pointer gap-2 text-xs"
              >
                <Edit2 className="size-3.5 text-muted-foreground" />
                <span>Editar categoría</span>
              </DropdownMenuItem>
              {onViewAudit && (
                <DropdownMenuItem
                  onClick={() => onViewAudit(node)}
                  className="cursor-pointer gap-2 text-xs"
                >
                  <Clock className="size-3.5 text-muted-foreground" />
                  <span>Ver auditoría</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(node)}
                className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
                <span>Eliminar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Children Render with Connector Line */}
      {hasChildren && isExpanded && (
        <div className="relative flex flex-col mt-0.5">
          {/* Vertical Guide line */}
          <div
            className="absolute top-0 bottom-2 border-l border-border/50 pointer-events-none"
            style={{ left: `${node.depth * 1.5 + 1.25}rem` }}
          />
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              searchTerm={searchTerm}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onAddSubcategoria={onAddSubcategoria}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewAudit={onViewAudit}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export function CategoriaProductoTree({
  categorias,
  isLoading = false,
  onAddCategoria,
  onEdit,
  onDelete,
  onRefresh,
  onViewAudit,
}: CategoriaProductoTreeProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [manualExpandedIds, setManualExpandedIds] = React.useState<Set<number> | null>(null);

  // Compute tree
  const fullTree = React.useMemo(() => buildTree(categorias), [categorias]);
  const visibleTree = React.useMemo(() => filterTree(fullTree, searchTerm.trim()), [fullTree, searchTerm]);
  const visibleCount = React.useMemo(() => countTreeNodes(visibleTree), [visibleTree]);

  // Derived expanded IDs: defaults to root nodes on initial load if not manually modified
  const expandedIds = React.useMemo(() => {
    if (manualExpandedIds !== null) {
      return manualExpandedIds;
    }
    const initialExpanded = new Set<number>();
    fullTree.forEach((root) => initialExpanded.add(root.id));
    return initialExpanded;
  }, [manualExpandedIds, fullTree]);

  const toggleExpand = React.useCallback(
    (id: number, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setManualExpandedIds((prev) => {
        const current = prev ?? new Set(fullTree.map((r) => r.id));
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [fullTree]
  );

  const expandAll = React.useCallback(() => {
    setManualExpandedIds(getAllNodeIds(fullTree));
  }, [fullTree]);

  const collapseAll = React.useCallback(() => {
    setManualExpandedIds(new Set());
  }, []);

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <TooltipProvider delay={200}>
      <div className="w-full flex flex-col gap-3.5 bg-card border border-border/70 rounded-xl p-4.5 shadow-2xs">
        {/* Tree Header & Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <FolderTree className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Árbol Jerárquico
                </h2>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono border-border/70">
                  {searchTerm.trim() ? `${visibleCount} de ${categorias.length}` : `${categorias.length} total`}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Navega y administra la categorización multinivel y sus subcategorías.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            {onRefresh && (
              <Tooltip>
                <TooltipTrigger
                  type="button"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="size-7.5 inline-flex items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                  aria-label="Recargar árbol"
                >
                  <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[11px]">
                  Recargar datos
                </TooltipContent>
              </Tooltip>
            )}

            <Button
              onClick={() => onAddCategoria?.(null)}
              size="sm"
              className="h-7.5 px-3 text-xs font-medium gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span>Nueva Categoría Raíz</span>
            </Button>
          </div>
        </div>

        {/* Search & Collapse/Expand Controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Filtrar por código, nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-8 text-xs h-8 bg-muted/20 border-border/60 focus:bg-background w-full"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Limpiar búsqueda"
                aria-label="Limpiar búsqueda"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Tooltip>
              <TooltipTrigger
                type="button"
                onClick={expandAll}
                className="size-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                aria-label="Expandir todo"
              >
                <UnfoldVertical className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[11px]">
                Expandir todas las carpetas
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                type="button"
                onClick={collapseAll}
                className="size-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                aria-label="Contraer todo"
              >
                <FoldVertical className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[11px]">
                Contraer todas las carpetas
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Tree List View */}
        <div
          className="p-1 min-h-[350px] overflow-y-auto"
          role="tree"
          aria-label="Árbol de categorías de productos"
        >
          {isLoading ? (
            <div className="space-y-3 p-2">
              <div className="flex items-center gap-2">
                <Skeleton className="size-5 rounded-md" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-5 w-1/3 ml-auto" />
              </div>
              <div className="flex items-center gap-2 ml-6">
                <Skeleton className="size-4.5 rounded" />
                <Skeleton className="h-5.5 w-1/3" />
              </div>
              <div className="flex items-center gap-2 ml-12">
                <Skeleton className="size-4.5 rounded" />
                <Skeleton className="h-5.5 w-1/4" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Skeleton className="size-5 rounded-md" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-5 w-1/3 ml-auto" />
              </div>
            </div>
          ) : visibleTree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3 text-muted-foreground">
              <div className="size-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center">
                <FolderTree className="size-7 stroke-1 text-muted-foreground/60" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {searchTerm ? "No se encontraron categorías" : "Sin categorías configuradas"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">
                  {searchTerm
                    ? "Prueba buscando por otro código o nombre de categoría."
                    : "Crea tu primera categoría raíz para comenzar a estructurar el inventario."}
                </p>
              </div>
              {searchTerm ? (
                <Button
                  onClick={handleClearSearch}
                  variant="outline"
                  size="sm"
                  className="mt-1 text-xs gap-1.5 cursor-pointer h-7.5"
                >
                  <X className="size-3.5" />
                  <span>Limpiar búsqueda</span>
                </Button>
              ) : (
                onAddCategoria && (
                  <Button
                    onClick={() => onAddCategoria(null)}
                    variant="outline"
                    size="sm"
                    className="mt-1 text-xs gap-1.5 cursor-pointer h-7.5 shadow-2xs"
                  >
                    <Plus className="size-3.5 text-primary" />
                    <span>Crear Categoría Raíz</span>
                  </Button>
                )
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {visibleTree.map((rootNode) => (
                <TreeNodeItem
                  key={rootNode.id}
                  node={rootNode}
                  searchTerm={searchTerm}
                  expandedIds={expandedIds}
                  onToggle={toggleExpand}
                  onAddSubcategoria={onAddCategoria}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onViewAudit={onViewAudit}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
