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
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  FileText,
  CornerDownRight,
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
 * Builds a hierarchical tree from a flat list of categories
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
      node.depth = parent.depth + 1;
      parent.children.push(node);
    } else {
      node.depth = 0;
      roots.push(node);
    }
  });

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
  const [expandedIds, setExpandedIds] = React.useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = React.useState<CategoriaProductoResponse | null>(null);

  // Compute tree
  const fullTree = React.useMemo(() => buildTree(categorias), [categorias]);
  const visibleTree = React.useMemo(() => filterTree(fullTree, searchTerm.trim()), [fullTree, searchTerm]);

  // Keep selectedCategory up to date or fallback
  React.useEffect(() => {
    if (categorias.length > 0) {
      if (!selectedCategory || !categorias.some((c) => c.id === selectedCategory.id)) {
        setSelectedCategory(categorias[0]);
      } else {
        const fresh = categorias.find((c) => c.id === selectedCategory.id);
        if (fresh) setSelectedCategory(fresh);
      }
    } else {
      setSelectedCategory(null);
    }
  }, [categorias, selectedCategory]);

  // Auto-expand all when searching
  React.useEffect(() => {
    if (searchTerm.trim()) {
      const allIds = new Set<number>();
      const addAll = (nodes: CategoryTreeNode[]) => {
        nodes.forEach((n) => {
          allIds.add(n.id);
          if (n.children.length > 0) addAll(n.children);
        });
      };
      addAll(fullTree);
      setExpandedIds(allIds);
    }
  }, [searchTerm, fullTree]);

  // Default expand root nodes on initial load
  React.useEffect(() => {
    if (fullTree.length > 0 && expandedIds.size === 0 && !searchTerm) {
      const initialExpanded = new Set<number>();
      fullTree.forEach((root) => initialExpanded.add(root.id));
      setExpandedIds(initialExpanded);
    }
  }, [fullTree, expandedIds.size, searchTerm]);

  const toggleExpand = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set<number>();
    const collect = (nodes: CategoryTreeNode[]) => {
      nodes.forEach((n) => {
        all.add(n.id);
        if (n.children.length > 0) collect(n.children);
      });
    };
    collect(fullTree);
    setExpandedIds(all);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Render tree item recursive component
  const renderTreeNode = (node: CategoryTreeNode) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const isSelected = selectedCategory?.id === node.id;

    return (
      <div key={node.id} className="flex flex-col select-none">
        <div
          onClick={() => setSelectedCategory(node)}
          style={{ paddingLeft: `${node.depth * 1.25 + 0.5}rem` }}
          className={cn(
            "group relative flex items-center justify-between gap-2 py-1.5 pr-2 rounded-lg text-xs cursor-pointer transition-all duration-150 border border-transparent",
            isSelected
              ? "bg-primary/10 text-primary border-primary/20 font-medium"
              : "text-foreground hover:bg-muted/50"
          )}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {/* Expand / Collapse Button */}
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => toggleExpand(node.id, e)}
                className="size-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer transition-colors"
                aria-label={isExpanded ? "Contraer subcategorías" : "Expandir subcategorías"}
              >
                {isExpanded ? (
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                )}
              </button>
            ) : (
              <div className="size-5 flex items-center justify-center shrink-0">
                <span className="size-1 rounded-full bg-border" />
              </div>
            )}

            {/* Folder / Category Icon */}
            <div className="shrink-0">
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen className={cn("size-3.5", isSelected ? "text-primary" : "text-amber-500")} />
                ) : (
                  <Folder className={cn("size-3.5", isSelected ? "text-primary" : "text-amber-500/80")} />
                )
              ) : (
                <Folder className={cn("size-3.5", isSelected ? "text-primary" : "text-muted-foreground/60")} />
              )}
            </div>

            {/* Code Badge */}
            <span
              className={cn(
                "font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 tracking-tight transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted text-muted-foreground group-hover:text-foreground"
              )}
            >
              {node.codigo}
            </span>

            {/* Name */}
            <span className="truncate text-xs text-foreground/90">{node.nombre}</span>

            {/* Subcategories count pill */}
            {hasChildren && (
              <span
                className={cn(
                  "text-[9px] px-1.5 py-0.2 rounded-full font-mono shrink-0 transition-colors",
                  isSelected
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {node.children.length} {node.children.length === 1 ? "sub" : "subs"}
              </span>
            )}
          </div>

          {/* Quick Action to Add Subcategory on Hover */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
            <TooltipProvider delay={200}>
              <Tooltip>
                <TooltipTrigger
                  type="button"
                  className="size-6 inline-flex items-center justify-center rounded-md bg-background border border-border/60 hover:border-primary hover:text-primary text-muted-foreground transition-colors cursor-pointer shadow-2xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddCategoria?.(node.id);
                  }}
                  aria-label="Añadir subcategoría"
                >
                  <Plus className="size-3" />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[11px]">
                  Añadir subcategoría aquí
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Children Render */}
        {hasChildren && isExpanded && (
          <div className="relative flex flex-col mt-0.5">
            {/* Guide line */}
            <div
              className="absolute left-0 top-0 bottom-2 border-l border-border/40 pointer-events-none"
              style={{ left: `${node.depth * 1.25 + 1.1}rem` }}
            />
            {node.children.map((child) => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full">
      {/* LEFT COLUMN: Tree Navigation & Management */}
      <div className="lg:col-span-7 flex flex-col gap-3 bg-card border border-border/60 rounded-xl p-4 shadow-2xs">
        {/* Tree Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <FolderTree className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Estructura Jerárquica
                </h2>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                  {categorias.length} {categorias.length === 1 ? "categoría" : "categorías"}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Explora y organiza las categorías de forma visual.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            {onRefresh && (
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                disabled={isLoading}
                className="size-7 border-border/60 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Recargar árbol"
              >
                <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
              </Button>
            )}
            <Button
              onClick={() => onAddCategoria?.(null)}
              size="sm"
              className="h-7 px-2.5 text-xs font-medium gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span>Nueva Raíz</span>
            </Button>
          </div>
        </div>

        {/* Tree Controls: Search & Expand/Collapse */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Filtrar por código o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs h-8 bg-muted/20 border-border/60 focus:bg-background w-full"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={expandAll}
              className="h-8 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Expandir
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={collapseAll}
              className="h-8 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Contraer
            </Button>
          </div>
        </div>

        {/* Tree Scroll View */}
        <div className="p-1 min-h-[380px] max-h-[560px] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-7 w-1/2 ml-4" />
              <Skeleton className="h-7 w-2/3 ml-4" />
              <Skeleton className="h-7 w-4/5" />
              <Skeleton className="h-7 w-3/5 ml-4" />
            </div>
          ) : visibleTree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-2.5 text-muted-foreground">
              <FolderTree className="size-8 stroke-1 text-muted-foreground/50" />
              <p className="text-xs font-medium text-foreground">
                {searchTerm ? "No se encontraron categorías" : "Sin categorías configuradas"}
              </p>
              <p className="text-[11px] max-w-xs">
                {searchTerm
                  ? "Prueba con otro término de búsqueda."
                  : "Crea tu primera categoría raíz para comenzar a estructurar el inventario."}
              </p>
              {!searchTerm && onAddCategoria && (
                <Button
                  onClick={() => onAddCategoria(null)}
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs gap-1.5 cursor-pointer"
                >
                  <Plus className="size-3.5 text-primary" />
                  <span>Crear Categoría Raíz</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {visibleTree.map((rootNode) => renderTreeNode(rootNode))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Detail & Inspector Card */}
      <div className="lg:col-span-5 flex flex-col gap-3">
        {selectedCategory ? (
          <div className="bg-card border border-border/60 rounded-xl p-4 shadow-2xs flex flex-col gap-3.5 sticky top-4">
            {/* Detail Header */}
            <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Layers className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {selectedCategory.codigo}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                      {selectedCategory.categoriaPadreNombre ? "Subcategoría" : "Categoría Raíz"}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground truncate mt-0.5">
                    {selectedCategory.nombre}
                  </h3>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <TooltipProvider delay={200}>
                  <Tooltip>
                    <TooltipTrigger
                      type="button"
                      className="size-7 inline-flex items-center justify-center rounded-md border border-border/60 hover:text-primary hover:border-primary/40 hover:bg-muted/40 transition-colors cursor-pointer text-muted-foreground"
                      onClick={() => onEdit?.(selectedCategory)}
                      aria-label="Editar categoría"
                    >
                      <Edit2 className="size-3.5" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[11px]">
                      Editar categoría
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger
                      type="button"
                      className="size-7 inline-flex items-center justify-center rounded-md border border-border/60 hover:text-destructive hover:border-destructive/40 hover:bg-muted/40 transition-colors cursor-pointer text-muted-foreground"
                      onClick={() => onDelete?.(selectedCategory)}
                      aria-label="Eliminar categoría"
                    >
                      <Trash2 className="size-3.5" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[11px]">
                      Eliminar categoría
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Details Content */}
            <div className="space-y-3 text-xs">
              {/* Hierarchy path */}
              <div className="space-y-1 bg-muted/30 p-2.5 rounded-lg border border-border/40">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
                  Ubicación Jerárquica
                </span>
                <div className="flex items-center gap-1.5 text-xs flex-wrap font-medium">
                  {selectedCategory.categoriaPadreNombre ? (
                    <>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Folder className="size-3 text-amber-500" />
                        {selectedCategory.categoriaPadreNombre}
                      </span>
                      <ChevronRight className="size-3 text-muted-foreground" />
                      <span className="text-foreground font-semibold flex items-center gap-1">
                        <FolderOpen className="size-3 text-primary" />
                        {selectedCategory.nombre}
                      </span>
                    </>
                  ) : (
                    <span className="text-primary font-semibold flex items-center gap-1">
                      <Folder className="size-3 text-amber-500" />
                      {selectedCategory.nombre} (Nivel Principal)
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
                  Descripción
                </span>
                <div className="p-2.5 rounded-lg bg-background border border-border/40 min-h-[44px] text-[11px] text-muted-foreground leading-relaxed">
                  {selectedCategory.descripcion || (
                    <span className="italic text-muted-foreground/60">Sin descripción asignada.</span>
                  )}
                </div>
              </div>

              {/* Stats & Metadata */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div className="p-2 rounded-lg bg-muted/20 border border-border/40 space-y-0.5">
                  <span className="text-[10px] text-muted-foreground">Subcategorías</span>
                  <div className="text-sm font-bold text-foreground">
                    {selectedCategory.cantidadSubcategorias ?? 0}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-muted/20 border border-border/40 space-y-0.5">
                  <span className="text-[10px] text-muted-foreground">ID Registro</span>
                  <div className="text-sm font-bold font-mono text-foreground">
                    #{selectedCategory.id}
                  </div>
                </div>
              </div>

              {/* Quick actions bar */}
              <div className="pt-2 border-t border-border/40 flex flex-col gap-1.5">
                <Button
                  onClick={() => onAddCategoria?.(selectedCategory.id)}
                  size="sm"
                  className="w-full text-xs gap-1.5 h-8 cursor-pointer justify-center shadow-2xs font-medium"
                >
                  <Plus className="size-3.5" />
                  <span>Añadir subcategoría aquí</span>
                </Button>

                {onViewAudit && (
                  <Button
                    onClick={() => onViewAudit(selectedCategory)}
                    variant="ghost"
                    size="sm"
                    className="w-full text-[11px] text-muted-foreground hover:text-foreground gap-1.5 h-7 cursor-pointer justify-center"
                  >
                    <Clock className="size-3 text-muted-foreground" />
                    <span>Ver historial de auditoría</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border/60 rounded-xl p-8 shadow-2xs flex flex-col items-center justify-center text-center gap-2.5 text-muted-foreground min-h-[260px]">
            <div className="p-2.5 rounded-full bg-muted/50 text-muted-foreground">
              <Info className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Ninguna categoría seleccionada</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[220px]">
                Selecciona una categoría del árbol para gestionarla o crear subniveles.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
