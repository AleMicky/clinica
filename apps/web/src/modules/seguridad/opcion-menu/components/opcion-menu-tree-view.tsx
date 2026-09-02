"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  Edit2,
  Folder,
  FolderInput,
  FolderOpen,
  FolderTree,
  GripVertical,
  History,
  Link as LinkIcon,
  MoreVertical,
  Plus,
  Power,
  Search,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MenuIcon } from "./opcion-menu-icon-helper";
import type { OpcionMenuResponse, OpcionMenuTreeResponse } from "../types/opcion-menu.types";

interface TreeNodeItemProps {
  node: OpcionMenuTreeResponse;
  level?: number;
  expandedMap: Record<number, boolean>;
  draggedNode: OpcionMenuTreeResponse | null;
  setDraggedNode: (node: OpcionMenuTreeResponse | null) => void;
  onToggleExpand: (id: number) => void;
  onAddChild: (parentNode: OpcionMenuTreeResponse) => void;
  onEdit: (node: OpcionMenuTreeResponse) => void;
  onMoveNode?: (
    sourceItem: OpcionMenuResponse | OpcionMenuTreeResponse,
    newParentId: number | null,
    newOrder: number
  ) => void;
  onToggleStatus?: (node: OpcionMenuTreeResponse) => void;
  onDelete: (node: OpcionMenuTreeResponse) => void;
  onViewAudit?: (node: OpcionMenuTreeResponse) => void;
  searchFilter: string;
  allFlatData?: OpcionMenuResponse[];
}

/**
 * Verifica recursivamente si targetId es el propio ancestro o un descendiente de él
 */
function isDescendant(targetId: number, ancestor: OpcionMenuTreeResponse): boolean {
  if (ancestor.id === targetId) return true;
  if (!ancestor.hijos || ancestor.hijos.length === 0) return false;
  return ancestor.hijos.some((child) => isDescendant(targetId, child));
}

function TreeNodeItem({
  node,
  level = 0,
  expandedMap,
  draggedNode,
  setDraggedNode,
  onToggleExpand,
  onAddChild,
  onEdit,
  onMoveNode,
  onToggleStatus,
  onDelete,
  onViewAudit,
  searchFilter,
  allFlatData,
}: TreeNodeItemProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const hasChildren = Boolean(node.hijos && node.hijos.length > 0);
  const isExpanded = expandedMap[node.id] ?? true;

  // Check matching flat item for active status & current parent
  const flatItem = allFlatData?.find((x) => x.id === node.id);
  const isActive = flatItem ? flatItem.activo : true;
  const currentParentId = flatItem?.padreId ?? null;

  const matchesSearch = searchFilter
    ? node.nombre.toLowerCase().includes(searchFilter.toLowerCase()) ||
      node.codigo.toLowerCase().includes(searchFilter.toLowerCase()) ||
      Boolean(node.ruta && node.ruta.toLowerCase().includes(searchFilter.toLowerCase()))
    : false;

  const isBeingDragged = draggedNode?.id === node.id;
  const isValidDropTarget =
    Boolean(draggedNode) && !isBeingDragged && !isDescendant(node.id, draggedNode!);

  // Handler for dropping onto this node (making dragged item a child of this node)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (!draggedNode || !isValidDropTarget || !onMoveNode) return;

    // Calculate next order in this new parent
    const siblings = (allFlatData || []).filter(
      (x) => x.id !== draggedNode.id && (x.padreId ?? null) === node.id
    );
    const maxOrder =
      siblings.length > 0
        ? Math.max(...siblings.map((x) => Number(x.orden) || 0), 0)
        : 0;

    onMoveNode(draggedNode, node.id, maxOrder + 1);
    setDraggedNode(null);
  };

  // Quick move via dropdown submenu (zero forms)
  const handleQuickMove = (targetParentId: number | null) => {
    if (!onMoveNode) return;
    const siblings = (allFlatData || []).filter(
      (x) => x.id !== node.id && (x.padreId ?? null) === targetParentId
    );
    const maxOrder =
      siblings.length > 0
        ? Math.max(...siblings.map((x) => Number(x.orden) || 0), 0)
        : 0;

    onMoveNode(node, targetParentId, maxOrder + 1);
  };

  // Available groups for quick move dropdown (excluding self & descendants)
  const availableGroups = React.useMemo(() => {
    if (!allFlatData) return [];
    return allFlatData.filter((x) => !isDescendant(x.id, node));
  }, [allFlatData, node]);

  return (
    <div
      className="relative select-none"
      onDragOver={(e) => {
        if (isValidDropTarget) {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(true);
        }
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
      }}
      onDrop={handleDrop}
    >
      {/* Compact Row */}
      <div
        className={`group flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg transition-all ${
          isBeingDragged
            ? "opacity-30 border border-dashed border-primary/50 bg-primary/5"
            : isDragOver && isValidDropTarget
            ? "bg-primary/15 border-2 border-primary border-dashed ring-2 ring-primary/20 scale-[1.01]"
            : matchesSearch
            ? "bg-amber-500/15 border border-amber-500/40 dark:bg-amber-950/30"
            : !isActive
            ? "opacity-60 hover:bg-muted/40"
            : "hover:bg-accent/60"
        }`}
      >
        {/* Left: Drag Handle + Expand Trigger + Icon + Name & Route */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Drag Grip Handle */}
          <div
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              setDraggedNode(node);
              e.dataTransfer.setData("text/plain", String(node.id));
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragEnd={() => {
              setDraggedNode(null);
            }}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground p-0.5 rounded hover:bg-muted shrink-0 transition-colors"
            title="Arrastra para mover a otro grupo o a la raíz"
          >
            <GripVertical className="size-3.5" />
          </div>

          {/* Expand Toggle */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggleExpand(node.id)}
              className="size-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer shrink-0 transition-transform"
            >
              {isExpanded ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronRight className="size-3.5" />
              )}
            </button>
          ) : (
            <div className="size-5 flex items-center justify-center shrink-0 text-muted-foreground/30">
              <CornerDownRight className="size-3" />
            </div>
          )}

          {/* Icon */}
          <div
            className={`size-6 rounded-md flex items-center justify-center shrink-0 border ${
              level === 0
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
            }`}
          >
            <MenuIcon name={node.icono} className="size-3.5" />
          </div>

          {/* Title & Tags */}
          <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
            <span
              className={`text-xs truncate ${
                level === 0 ? "font-semibold text-foreground" : "font-medium text-foreground/90"
              }`}
            >
              {node.nombre}
            </span>

            <span className="text-[10px] font-mono text-muted-foreground/80 bg-muted/60 px-1 py-0.2 rounded border border-border/40 shrink-0">
              {node.codigo}
            </span>

            {node.ruta && (
              <span className="flex items-center gap-1 font-mono text-[11px] text-primary/80 truncate">
                <LinkIcon className="size-2.5 shrink-0 opacity-70" />
                {node.ruta}
              </span>
            )}

            {!isActive && (
              <Badge
                variant="destructive"
                className="text-[9px] px-1 py-0 h-4 font-normal"
              >
                Inactivo
              </Badge>
            )}

            {hasChildren && (
              <span className="text-[10px] text-muted-foreground/70 bg-muted/40 px-1 rounded">
                {node.hijos.length} {node.hijos.length === 1 ? "submenú" : "submenús"}
              </span>
            )}

            <span className="text-[10px] text-muted-foreground/50 font-mono">
              #{node.orden}
            </span>

            {/* Drop target badge indicator */}
            {isDragOver && isValidDropTarget && (
              <Badge className="text-[9px] bg-primary text-primary-foreground animate-pulse px-1.5 py-0 h-4">
                Soltar aquí para mover a este grupo
              </Badge>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0 transition-opacity">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onAddChild(node)}
            className="h-6 px-1.5 text-[11px] gap-1 text-primary hover:bg-primary/10 cursor-pointer hidden sm:flex"
            title="Agregar submenú"
          >
            <Plus className="size-3" />
            <span>Submenú</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(node)}
            className="size-6 text-muted-foreground hover:text-foreground cursor-pointer rounded"
            title="Editar opción"
          >
            <Edit2 className="size-3" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex size-6 items-center justify-center rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer shrink-0">
              <MoreVertical className="size-3" />
              <span className="sr-only">Opciones</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onClick={() => onAddChild(node)}
                className="cursor-pointer gap-2 text-xs"
              >
                <Plus className="size-3.5 text-primary" />
                <span>Agregar Submenú</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onEdit(node)}
                className="cursor-pointer gap-2 text-xs"
              >
                <Edit2 className="size-3.5 text-muted-foreground" />
                <span>Editar Opción</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Direct in-tree Move Actions without forms */}
              {onMoveNode && (
                <DropdownMenuGroup>
                  {currentParentId !== null && (
                    <DropdownMenuItem
                      onClick={() => handleQuickMove(null)}
                      className="cursor-pointer gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium"
                    >
                      <FolderInput className="size-3.5" />
                      <span>⭐ Mover a Módulo Raíz</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer gap-2 text-xs">
                      <FolderTree className="size-3.5 text-muted-foreground" />
                      <span>Mover al grupo...</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-56 max-h-64 overflow-y-auto">
                      <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">
                        Seleccionar grupo destino
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleQuickMove(null)}
                        disabled={currentParentId === null}
                        className="cursor-pointer text-xs font-medium text-emerald-600 dark:text-emerald-400"
                      >
                        ⭐ Módulo Raíz (Sin Padre)
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {availableGroups.map((group) => {
                        const isCurrent = group.id === currentParentId;
                        return (
                          <DropdownMenuItem
                            key={group.id}
                            disabled={isCurrent}
                            onClick={() => handleQuickMove(group.id)}
                            className="cursor-pointer text-xs"
                          >
                            <span className="truncate">
                              {group.padreId ? "└─ " : "📁 "}
                              {group.nombre}
                              {isCurrent ? " (Actual)" : ""}
                            </span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
              )}

              <DropdownMenuSeparator />

              {onToggleStatus && (
                <DropdownMenuItem
                  onClick={() => onToggleStatus(node)}
                  className="cursor-pointer gap-2 text-xs"
                >
                  <Power
                    className={`size-3.5 ${
                      isActive ? "text-amber-500" : "text-emerald-600"
                    }`}
                  />
                  <span>{isActive ? "Inactivar Menú" : "Activar Menú"}</span>
                </DropdownMenuItem>
              )}

              {onViewAudit && (
                <DropdownMenuItem
                  onClick={() => onViewAudit(node)}
                  className="cursor-pointer gap-2 text-xs"
                >
                  <History className="size-3.5 text-blue-500" />
                  <span>Ver Auditoría</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => onDelete(node)}
                className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
              >
                <Trash2 className="size-3.5" />
                <span>Eliminar Opción</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Recursive Children with Tree Guide Lines */}
      {hasChildren && isExpanded && (
        <div className="relative ml-4 pl-3 border-l border-border/50 space-y-0.5 mt-0.5">
          {node.hijos.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              expandedMap={expandedMap}
              draggedNode={draggedNode}
              setDraggedNode={setDraggedNode}
              onToggleExpand={onToggleExpand}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onMoveNode={onMoveNode}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
              onViewAudit={onViewAudit}
              searchFilter={searchFilter}
              allFlatData={allFlatData}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface OpcionMenuTreeViewProps {
  treeData: OpcionMenuTreeResponse[];
  flatData?: OpcionMenuResponse[];
  isLoading?: boolean;
  onAddChild: (parentNode: OpcionMenuTreeResponse) => void;
  onEdit: (node: OpcionMenuTreeResponse) => void;
  onMoveNode?: (
    sourceItem: OpcionMenuResponse | OpcionMenuTreeResponse,
    newParentId: number | null,
    newOrder: number
  ) => void;
  onToggleStatus?: (node: OpcionMenuTreeResponse) => void;
  onDelete: (node: OpcionMenuTreeResponse) => void;
  onViewAudit?: (node: OpcionMenuTreeResponse) => void;
}

export function OpcionMenuTreeView({
  treeData,
  flatData,
  isLoading = false,
  onAddChild,
  onEdit,
  onMoveNode,
  onToggleStatus,
  onDelete,
  onViewAudit,
}: OpcionMenuTreeViewProps) {
  const [search, setSearch] = React.useState("");
  const [expandedMap, setExpandedMap] = React.useState<Record<number, boolean>>({});
  const [draggedNode, setDraggedNode] = React.useState<OpcionMenuTreeResponse | null>(null);
  const [isOverRootZone, setIsOverRootZone] = React.useState(false);

  // Expand all / collapse all
  const handleToggleExpandAll = (expand: boolean) => {
    const nextMap: Record<number, boolean> = {};
    const traverse = (items: OpcionMenuTreeResponse[]) => {
      for (const item of items) {
        nextMap[item.id] = expand;
        if (item.hijos?.length) {
          traverse(item.hijos);
        }
      }
    };
    traverse(treeData);
    setExpandedMap(nextMap);
  };

  const handleToggleSingle = (id: number) => {
    setExpandedMap((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  };

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOverRootZone(false);

    if (!draggedNode || !onMoveNode) return;

    // Calculate next order in root
    const rootSiblings = (flatData || []).filter(
      (x) => x.id !== draggedNode.id && !x.padreId
    );
    const maxOrder =
      rootSiblings.length > 0
        ? Math.max(...rootSiblings.map((x) => Number(x.orden) || 0), 0)
        : 0;

    onMoveNode(draggedNode, null, maxOrder + 1);
    setDraggedNode(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4 bg-card rounded-xl border border-border/70 animate-pulse">
        <div className="h-8 bg-muted/60 rounded-lg w-full max-w-xs" />
        <div className="space-y-1.5 mt-2">
          <div className="h-8 bg-muted/50 rounded-lg w-full" />
          <div className="h-8 bg-muted/40 rounded-lg w-[90%] ml-6" />
          <div className="h-8 bg-muted/40 rounded-lg w-[90%] ml-6" />
          <div className="h-8 bg-muted/50 rounded-lg w-full" />
        </div>
      </div>
    );
  }

  if (!treeData || treeData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center bg-card rounded-xl border border-border/70 border-dashed">
        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2.5">
          <FolderTree className="size-5" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">No hay opciones de menú</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Comienza creando el primer módulo principal o estructura de navegación para el sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 p-3.5 bg-card rounded-xl border border-border/70 shadow-2xs">
      {/* Top search & controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pb-2.5 border-b border-border/50">
        <div className="relative w-full sm:w-64">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filtrar por nombre, código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7.5 pl-8 text-xs bg-background"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleToggleExpandAll(true)}
            className="h-7 px-2 text-[11px] font-medium gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <FolderOpen className="size-3 text-primary" />
            <span>Expandir todo</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleToggleExpandAll(false)}
            className="h-7 px-2 text-[11px] font-medium gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Folder className="size-3" />
            <span>Colapsar todo</span>
          </Button>
        </div>
      </div>

      {/* Root Drop Zone (Appears when dragging any item) */}
      {draggedNode && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsOverRootZone(true);
          }}
          onDragLeave={() => setIsOverRootZone(false)}
          onDrop={handleRootDrop}
          className={`p-2.5 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
            isOverRootZone
              ? "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 scale-[1.01]"
              : "bg-primary/5 border-primary/40 text-primary hover:bg-primary/10"
          }`}
        >
          <FolderInput className="size-4" />
          <span>⭐ Soltar aquí para convertir en Módulo Raíz (Sin Padre)</span>
        </div>
      )}

      {/* Tree list */}
      <div className="space-y-0.5">
        {treeData.map((node) => (
          <TreeNodeItem
            key={node.id}
            node={node}
            level={0}
            expandedMap={expandedMap}
            draggedNode={draggedNode}
            setDraggedNode={setDraggedNode}
            onToggleExpand={handleToggleSingle}
            onAddChild={onAddChild}
            onEdit={onEdit}
            onMoveNode={onMoveNode}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onViewAudit={onViewAudit}
            searchFilter={search}
            allFlatData={flatData}
          />
        ))}
      </div>
    </div>
  );
}


