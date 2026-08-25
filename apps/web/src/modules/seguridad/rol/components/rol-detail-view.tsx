"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Edit,
  FolderTree,
  Key,
  Layers,
  Loader2,
  Lock,
  MinusSquare,
  PlusSquare,
  RotateCcw,
  Search,
  Shield,
  Trash2,
  XSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { useOpcionesMenuTree } from "@/modules/seguridad/opcion-menu/hooks/use-opcion-menu";
import { MenuIcon } from "@/modules/seguridad/opcion-menu/components/opcion-menu-icon-helper";
import type { OpcionMenuTreeResponse } from "@/modules/seguridad/opcion-menu/types/opcion-menu.types";
import {
  useAsignarRolOpcionesMenu,
  useRolOpcionesMenu,
} from "../hooks/use-rol-opciones-menu";
import type { RolResponse } from "../types/rol.types";
import { getRoleColorTheme } from "./rol-card";
import { cn } from "@/lib/utils";

interface RolDetailViewProps {
  rol: RolResponse | null;
  onEdit: (rol: RolResponse) => void;
  onDelete: (rol: RolResponse) => void;
}

// Helper to collect all node IDs recursively
function getAllNodeIds(nodes: OpcionMenuTreeResponse[]): number[] {
  const ids: number[] = [];
  function traverse(list: OpcionMenuTreeResponse[]) {
    for (const node of list) {
      ids.push(node.id);
      if (node.hijos && node.hijos.length > 0) {
        traverse(node.hijos);
      }
    }
  }
  traverse(nodes);
  return ids;
}

// Helper to collect all descendant IDs of a single node
function getDescendantIds(node: OpcionMenuTreeResponse): number[] {
  const ids: number[] = [node.id];
  function traverse(list: OpcionMenuTreeResponse[]) {
    for (const child of list) {
      ids.push(child.id);
      if (child.hijos && child.hijos.length > 0) {
        traverse(child.hijos);
      }
    }
  }
  if (node.hijos && node.hijos.length > 0) {
    traverse(node.hijos);
  }
  return ids;
}

// Helper to find ancestor IDs of a node in the tree
function findAncestorIds(
  nodes: OpcionMenuTreeResponse[],
  targetId: number,
  currentPath: number[] = []
): number[] | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return currentPath;
    }
    if (node.hijos && node.hijos.length > 0) {
      const found = findAncestorIds(node.hijos, targetId, [
        ...currentPath,
        node.id,
      ]);
      if (found) return found;
    }
  }
  return null;
}

export function RolDetailView({ rol, onEdit, onDelete }: RolDetailViewProps) {
  const rolId = rol?.id ?? 0;
  const esProtegido = rol?.name.toUpperCase() === "ADMINISTRADOR";
  const theme = rol ? getRoleColorTheme(rol.name) : null;

  // Search & Tree view state
  const [search, setSearch] = React.useState("");
  const [expandedMap, setExpandedMap] = React.useState<Record<number, boolean>>(
    {}
  );
  const [selectedIdsOverride, setSelectedIdsOverride] =
    React.useState<Set<number> | null>(null);

  // Queries
  const { data: fullMenuTree, isLoading: isLoadingTree } =
    useOpcionesMenuTree();

  const { data: rolMenuData, isLoading: isLoadingRolMenu } =
    useRolOpcionesMenu(rolId, rolId > 0);

  const asignarMutation = useAsignarRolOpcionesMenu();

  const initialSelectedIds = React.useMemo(() => {
    if (!rolMenuData?.opcionesMenu) return new Set<number>();
    return new Set(rolMenuData.opcionesMenu.map((item) => item.opcionMenuId));
  }, [rolMenuData]);

  const selectedIds = selectedIdsOverride ?? initialSelectedIds;

  const allAvailableIds = React.useMemo(() => {
    return fullMenuTree ? getAllNodeIds(fullMenuTree) : [];
  }, [fullMenuTree]);

  // Check if there are unsaved changes
  const hasChanges = React.useMemo(() => {
    if (selectedIdsOverride === null) return false;
    if (selectedIds.size !== initialSelectedIds.size) return true;
    for (const id of selectedIds) {
      if (!initialSelectedIds.has(id)) return true;
    }
    return false;
  }, [selectedIds, initialSelectedIds, selectedIdsOverride]);

  // Toggle single node expansion
  const toggleExpand = (id: number) => {
    setExpandedMap((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  };

  // Expand all
  const handleExpandAll = () => {
    const next: Record<number, boolean> = {};
    allAvailableIds.forEach((id) => {
      next[id] = true;
    });
    setExpandedMap(next);
  };

  // Collapse all
  const handleCollapseAll = () => {
    const next: Record<number, boolean> = {};
    allAvailableIds.forEach((id) => {
      next[id] = false;
    });
    setExpandedMap(next);
  };

  // Select all options
  const handleSelectAll = () => {
    setSelectedIdsOverride(new Set(allAvailableIds));
  };

  // Deselect all options
  const handleDeselectAll = () => {
    setSelectedIdsOverride(new Set());
  };

  // Reset to saved state
  const handleReset = () => {
    setSelectedIdsOverride(null);
  };

  // Handle node selection toggle with cascading logic
  const handleToggleNode = (node: OpcionMenuTreeResponse) => {
    const isCurrentlySelected = selectedIds.has(node.id);
    const newSelected = new Set(selectedIds);
    const descendantIds = getDescendantIds(node);

    if (isCurrentlySelected) {
      // Uncheck node and all its children
      descendantIds.forEach((id) => newSelected.delete(id));
    } else {
      // Check node and all its children
      descendantIds.forEach((id) => newSelected.add(id));

      // Also ensure all ancestor parent nodes are checked
      if (fullMenuTree) {
        const ancestors = findAncestorIds(fullMenuTree, node.id);
        if (ancestors) {
          ancestors.forEach((ancId) => newSelected.add(ancId));
        }
      }
    }

    setSelectedIdsOverride(newSelected);
  };

  // Handle Save
  const handleSave = async () => {
    if (!rol) return;
    try {
      await asignarMutation.mutateAsync({
        rolId: rol.id,
        request: {
          opcionMenuIds: Array.from(selectedIds),
        },
      });
      toast.success(
        `Opciones de menú guardadas exitosamente para el rol "${rol.name}".`
      );
      setSelectedIdsOverride(null);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { detail?: string; message?: string } };
      };
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "No se pudieron actualizar las opciones de menú del rol.";
      toast.error(msg);
    }
  };

  const isLoading = isLoadingTree || isLoadingRolMenu;
  const isSaving = asignarMutation.isPending;

  // Filter tree nodes based on search
  const visibleTree = React.useMemo(() => {
    if (!fullMenuTree) return [];
    if (!search.trim()) return fullMenuTree;

    const query = search.toLowerCase();
    function filterNodes(
      nodes: OpcionMenuTreeResponse[]
    ): OpcionMenuTreeResponse[] {
      return nodes
        .map((node) => {
          const matchesSelf =
            node.nombre.toLowerCase().includes(query) ||
            node.codigo.toLowerCase().includes(query) ||
            (node.ruta && node.ruta.toLowerCase().includes(query));

          const matchingChildren = node.hijos
            ? filterNodes(node.hijos)
            : [];

          if (matchesSelf || matchingChildren.length > 0) {
            return {
              ...node,
              hijos: matchingChildren,
            };
          }
          return null;
        })
        .filter((n): n is OpcionMenuTreeResponse => n !== null);
    }

    return filterNodes(fullMenuTree);
  }, [fullMenuTree, search]);

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: OpcionMenuTreeResponse, level = 0) => {
    const hasChildren = node.hijos && node.hijos.length > 0;
    const isExpanded = expandedMap[node.id] ?? true;
    const isChecked = selectedIds.has(node.id);

    const descendantIds = getDescendantIds(node);
    const checkedDescendantsCount = descendantIds.filter(
      (id) => id !== node.id && selectedIds.has(id)
    ).length;

    const isFilteredMatch =
      search.trim().length > 0 &&
      (node.nombre.toLowerCase().includes(search.toLowerCase()) ||
        node.codigo.toLowerCase().includes(search.toLowerCase()) ||
        (node.ruta && node.ruta.toLowerCase().includes(search.toLowerCase())));

    return (
      <div key={node.id} className="flex flex-col">
        <div
          className={cn(
            "group flex items-center justify-between gap-2 p-2 rounded-lg border text-xs transition-colors my-0.5 select-none",
            isChecked
              ? "bg-primary/5 border-primary/25 dark:bg-primary/10 dark:border-primary/30"
              : "bg-card border-border/50 hover:bg-muted/40",
            isFilteredMatch && "ring-1 ring-amber-500/50 bg-amber-500/5"
          )}
          style={{ marginLeft: `${level * 20}px` }}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Expand toggle */}
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.id);
                }}
                className="size-5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors shrink-0 cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronDown className="size-3.5" />
                ) : (
                  <ChevronRight className="size-3.5" />
                )}
              </button>
            ) : (
              <div className="size-5 shrink-0" />
            )}

            {/* Checkbox */}
            <Checkbox
              id={`detail-menu-${node.id}`}
              checked={isChecked}
              onCheckedChange={() => handleToggleNode(node)}
              className="cursor-pointer"
            />

            {/* Menu Icon */}
            <div
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-md text-xs",
                isChecked
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <MenuIcon name={node.icono} className="size-3.5" />
            </div>

            {/* Label and details */}
            <div
              className="flex flex-col min-w-0 cursor-pointer"
              onClick={() => handleToggleNode(node)}
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={cn(
                    "font-semibold truncate",
                    isChecked ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {node.nombre}
                </span>

                <Badge
                  variant="outline"
                  className="font-mono text-[9px] px-1 py-0 h-4 bg-muted/50 text-muted-foreground font-normal"
                >
                  {node.codigo}
                </Badge>

                {node.ruta && (
                  <span className="text-[10px] text-muted-foreground/80 font-mono hidden sm:inline-block">
                    {node.ruta}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right badges */}
          <div className="flex items-center gap-1.5 shrink-0">
            {hasChildren && (
              <Badge
                variant="secondary"
                className="text-[9px] px-1.5 py-0 h-4 text-muted-foreground"
              >
                {checkedDescendantsCount > 0
                  ? `${checkedDescendantsCount}/${descendantIds.length - 1} sub`
                  : `${node.hijos.length} sub`}
              </Badge>
            )}
          </div>
        </div>

        {/* Render child nodes if expanded */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col border-l border-border/40 ml-2.5 pl-1">
            {node.hijos.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // If no role selected
  if (!rol) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full bg-card rounded-xl border border-dashed border-border/70 min-h-[480px]">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
          <FolderTree className="size-7" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Seleccione un Rol</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Elija un rol de la lista izquierda para visualizar su configuración y
          asignar las opciones de menú y accesos autorizados.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border/70 shadow-2xs overflow-hidden">
      {/* 1. Header Card: Selected Role Info */}
      <div className="p-4 sm:p-5 border-b border-border/60 bg-muted/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg shadow-2xs font-semibold text-sm",
                theme?.iconBg || "bg-primary/10 text-primary"
              )}
            >
              {esProtegido ? (
                <Lock className="size-5" />
              ) : (
                <Shield className="size-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-foreground">
                  {rol.name}
                </h2>
                <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 h-4">
                  ID #{rol.id}
                </Badge>
                {esProtegido ? (
                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] gap-1 px-1.5 py-0 h-4 font-medium"
                  >
                    <Lock className="size-2.5" />
                    Sistema
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] gap-1 px-1.5 py-0 h-4 font-medium"
                  >
                    <Shield className="size-2.5" />
                    Personalizado
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {rol.descripcion || "Sin descripción asignada."}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(rol)}
              className="h-8 text-xs px-2.5 gap-1.5"
            >
              <Edit className="size-3.5" />
              <span>Editar</span>
            </Button>
            {!esProtegido && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(rol)}
                className="h-8 text-xs px-2.5 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
              >
                <Trash2 className="size-3.5" />
                <span>Eliminar</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Menu Permissions Toolbar & Search */}
      <div className="p-3 sm:px-4 border-b border-border/50 bg-background/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Filtrar menú..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-background"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="h-7 text-xs px-2 gap-1"
            disabled={isLoading || isSaving}
          >
            <CheckCheck className="size-3.5 text-primary" />
            <span className="hidden sm:inline">Seleccionar</span> Todo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            className="h-7 text-xs px-2 gap-1"
            disabled={isLoading || isSaving}
          >
            <MinusSquare className="size-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Deseleccionar</span> Todo
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleExpandAll}
            className="h-7 text-xs px-2 gap-1 text-muted-foreground"
            disabled={isLoading || isSaving}
            title="Expandir todo"
          >
            <PlusSquare className="size-3.5" />
            Expandir
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCollapseAll}
            className="h-7 text-xs px-2 gap-1 text-muted-foreground"
            disabled={isLoading || isSaving}
            title="Colapsar todo"
          >
            <XSquare className="size-3.5" />
            Colapsar
          </Button>
        </div>
      </div>

      {/* 3. Interactive Tree Content Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 bg-muted/10 min-h-[300px] max-h-[calc(100vh-380px)]">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded-lg border bg-card/60"
                style={{ marginLeft: `${(i % 3) * 20}px` }}
              >
                <Skeleton className="size-4 rounded" />
                <Skeleton className="size-6 rounded-md" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-16 ml-auto" />
              </div>
            ))}
          </div>
        ) : visibleTree.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-card/50">
            <FolderTree className="size-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-semibold text-foreground">
              No se encontraron opciones de menú
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {search
                ? `Ninguna opción coincide con "${search}".`
                : "No hay opciones de menú configuradas en el sistema."}
            </p>
          </div>
        ) : (
          visibleTree.map((rootNode) => renderTreeNode(rootNode))
        )}
      </div>

      {/* 4. Bottom Actions & Stats Bar */}
      <div className="p-3 sm:px-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Layers className="size-3.5 text-primary" />
          <span>
            <strong className="text-foreground font-semibold">
              {selectedIds.size}
            </strong>{" "}
            de {allAvailableIds.length} opciones asignadas
          </span>
          {hasChanges && (
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] px-1.5 py-0 h-4">
              Cambios pendientes
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isSaving}
              className="h-8 text-xs px-2.5 gap-1 text-muted-foreground"
            >
              <RotateCcw className="size-3.5" />
              Restablecer
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isLoading || isSaving || !hasChanges}
            className="h-8 text-xs px-4"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Key className="mr-1.5 size-3.5" />
                Guardar Permisos
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
