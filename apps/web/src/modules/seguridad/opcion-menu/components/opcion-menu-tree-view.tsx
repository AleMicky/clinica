"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Folder,
  FolderOpen,
  History,
  Link as LinkIcon,
  MoreVertical,
  Plus,
  Power,
  Search,
  Trash2,
  FolderTree,
  CornerDownRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MenuIcon } from "./opcion-menu-icon-helper";
import type { OpcionMenuResponse, OpcionMenuTreeResponse } from "../types/opcion-menu.types";

interface TreeNodeItemProps {
  node: OpcionMenuTreeResponse;
  level?: number;
  isLast?: boolean;
  expandedMap: Record<number, boolean>;
  onToggleExpand: (id: number) => void;
  onAddChild: (parentNode: OpcionMenuTreeResponse) => void;
  onEdit: (node: OpcionMenuTreeResponse) => void;
  onToggleStatus?: (node: OpcionMenuTreeResponse) => void;
  onDelete: (node: OpcionMenuTreeResponse) => void;
  onViewAudit?: (node: OpcionMenuTreeResponse) => void;
  searchFilter: string;
  allFlatData?: OpcionMenuResponse[];
}

function TreeNodeItem({
  node,
  level = 0,
  isLast = false,
  expandedMap,
  onToggleExpand,
  onAddChild,
  onEdit,
  onToggleStatus,
  onDelete,
  onViewAudit,
  searchFilter,
  allFlatData,
}: TreeNodeItemProps) {
  const hasChildren = node.hijos && node.hijos.length > 0;
  const isExpanded = expandedMap[node.id] ?? true;

  // Check matching flat item for active status
  const flatItem = allFlatData?.find((x) => x.id === node.id);
  const isActive = flatItem ? flatItem.activo : true;

  const matchesSearch = searchFilter
    ? node.nombre.toLowerCase().includes(searchFilter.toLowerCase()) ||
      node.codigo.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (node.ruta && node.ruta.toLowerCase().includes(searchFilter.toLowerCase()))
    : false;

  return (
    <div className="relative group/node select-none">
      {/* Node container */}
      <div
        className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all duration-150 ${
          matchesSearch
            ? "bg-amber-500/10 border-amber-500/30 dark:bg-amber-950/20"
            : !isActive
            ? "bg-muted/30 border-dashed border-border/60 opacity-70"
            : level === 0
            ? "bg-card border-border/80 shadow-2xs hover:border-primary/40 hover:bg-accent/30"
            : "bg-muted/20 border-border/50 hover:bg-accent/40"
        }`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Expand/Collapse Trigger or Bullet */}
          {hasChildren ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onToggleExpand(node.id)}
              className="size-6 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer rounded-md"
            >
              {isExpanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </Button>
          ) : (
            <div className="size-6 flex items-center justify-center shrink-0 text-muted-foreground/40">
              <CornerDownRight className="size-3.5" />
            </div>
          )}

          {/* Icon Badge */}
          <div
            className={`size-8 rounded-lg flex items-center justify-center border shadow-2xs shrink-0 ${
              level === 0
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
            }`}
          >
            <MenuIcon name={node.icono} className="size-4" />
          </div>

          {/* Details */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-xs sm:text-sm text-foreground truncate">
                {node.nombre}
              </span>
              <Badge
                variant="outline"
                className="text-[10px] font-mono px-1.5 py-0 bg-background/80 text-muted-foreground"
              >
                {node.codigo}
              </Badge>
              {!isActive && (
                <Badge
                  variant="destructive"
                  className="text-[9px] px-1.5 py-0 uppercase tracking-wide"
                >
                  Inactivo
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5 flex-wrap">
              {node.ruta ? (
                <span className="flex items-center gap-1 font-mono text-primary/90 text-[11px]">
                  <LinkIcon className="size-3 shrink-0" />
                  {node.ruta}
                </span>
              ) : (
                <span className="italic text-muted-foreground/60 text-[10px]">
                  (Módulo contenedor / Sin ruta directa)
                </span>
              )}

              <span className="text-muted-foreground/40">•</span>
              <span className="text-[10px]">Orden: {node.orden}</span>

              {hasChildren && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="text-[10px] font-medium text-foreground">
                    {node.hijos.length} {node.hijos.length === 1 ? "hijo" : "hijos"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Add Submenu button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onAddChild(node)}
            className="h-7 px-2 text-xs gap-1 text-primary hover:bg-primary/10 cursor-pointer hidden sm:flex"
            title="Agregar submenú"
          >
            <Plus className="size-3.5" />
            <span>Submenú</span>
          </Button>

          {/* Quick Edit button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(node)}
            className="size-7 text-muted-foreground hover:text-foreground cursor-pointer rounded-md"
            title="Editar opción"
          >
            <Edit2 className="size-3.5" />
          </Button>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer shrink-0">
              <MoreVertical className="size-3.5" />
              <span className="sr-only">Opciones</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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

              {onToggleStatus && (
                <DropdownMenuItem
                  onClick={() => onToggleStatus(node)}
                  className="cursor-pointer gap-2 text-xs"
                >
                  <Power className={`size-3.5 ${isActive ? "text-amber-500" : "text-emerald-600"}`} />
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

      {/* Recursive Children */}
      {hasChildren && isExpanded && (
        <div className="space-y-1.5 mt-1.5">
          {node.hijos.map((child, idx) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              isLast={idx === node.hijos.length - 1}
              expandedMap={expandedMap}
              onToggleExpand={onToggleExpand}
              onAddChild={onAddChild}
              onEdit={onEdit}
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
  onToggleStatus,
  onDelete,
  onViewAudit,
}: OpcionMenuTreeViewProps) {
  const [search, setSearch] = React.useState("");
  const [expandedMap, setExpandedMap] = React.useState<Record<number, boolean>>({});

  // Helper to expand all / collapse all
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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-6 bg-card rounded-xl border border-border/70 animate-pulse">
        <div className="h-9 bg-muted/60 rounded-lg w-full max-w-sm" />
        <div className="space-y-2 mt-2">
          <div className="h-14 bg-muted/50 rounded-xl w-full" />
          <div className="h-14 bg-muted/40 rounded-xl w-[95%] ml-6" />
          <div className="h-14 bg-muted/40 rounded-xl w-[95%] ml-6" />
          <div className="h-14 bg-muted/50 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  if (!treeData || treeData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-xl border border-border/70 border-dashed">
        <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
          <FolderTree className="size-6" />
        </div>
        <h3 className="text-sm font-bold text-foreground">No hay opciones de menú</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Comienza creando el primer módulo principal o estructura de navegación para el sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-card rounded-xl border border-border/70 shadow-2xs">
      {/* Top search & controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pb-2 border-b border-border/60">
        <div className="relative w-full sm:w-72">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filtrar por nombre, código o ruta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-background"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleToggleExpandAll(true)}
            className="h-7 px-2 text-[11px] font-medium gap-1 cursor-pointer"
          >
            <FolderOpen className="size-3 text-primary" />
            <span>Expandir todo</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleToggleExpandAll(false)}
            className="h-7 px-2 text-[11px] font-medium gap-1 cursor-pointer"
          >
            <Folder className="size-3 text-muted-foreground" />
            <span>Colapsar todo</span>
          </Button>
        </div>
      </div>

      {/* Tree list */}
      <div className="space-y-2 mt-1">
        {treeData.map((node, idx) => (
          <TreeNodeItem
            key={node.id}
            node={node}
            level={0}
            isLast={idx === treeData.length - 1}
            expandedMap={expandedMap}
            onToggleExpand={handleToggleSingle}
            onAddChild={onAddChild}
            onEdit={onEdit}
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
