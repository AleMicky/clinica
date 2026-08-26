"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { useMenuUsuario } from "@/modules/seguridad/opcion-menu/hooks/use-opcion-menu";
import type { OpcionMenuTreeResponse } from "@/modules/seguridad/opcion-menu/types/opcion-menu.types";
import { SidebarSearch } from "./sidebar-search";
import {
  SidebarLoadingSkeleton,
  SidebarError,
  SidebarSearchEmpty,
  SidebarEmpty,
} from "./sidebar-states";
import { SidebarNav, hasActiveDescendant } from "./sidebar-nav";

/**
 * Filtra el árbol recursivamente por término de búsqueda (nombre, código o ruta)
 */
function filterTreeNode(
  node: OpcionMenuTreeResponse,
  query: string
): OpcionMenuTreeResponse | null {
  const matchesSelf =
    node.nombre.toLowerCase().includes(query) ||
    node.codigo.toLowerCase().includes(query) ||
    (node.ruta ? node.ruta.toLowerCase().includes(query) : false);

  if (!node.hijos || node.hijos.length === 0) {
    return matchesSelf ? node : null;
  }

  const filteredChildren = node.hijos
    .map((child) => filterTreeNode(child, query))
    .filter(Boolean) as OpcionMenuTreeResponse[];

  if (matchesSelf || filteredChildren.length > 0) {
    return {
      ...node,
      hijos: filteredChildren.length > 0 ? filteredChildren : node.hijos,
    };
  }

  return null;
}

export function AppSidebar({
  variant = "inset",
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    data: menuTree = [],
    isLoading: isMenuLoading,
    isError,
    refetch,
  } = useMenuUsuario(isAuthenticated);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [toggledGroups, setToggledGroups] = React.useState<Record<number, boolean>>({});

  const isLoading = isAuthLoading || isMenuLoading;

  // Conjunto de IDs de grupos que contienen la ruta activa actual
  const activeGroupIds = React.useMemo(() => {
    if (!pathname || menuTree.length === 0) return new Set<number>();
    const activeIds = new Set<number>();

    function scanNode(node: OpcionMenuTreeResponse) {
      if (node.hijos && node.hijos.length > 0) {
        const hasActive = node.hijos.some((child) => hasActiveDescendant(child, pathname));
        if (hasActive) {
          activeIds.add(node.id);
        }
        node.hijos.forEach(scanNode);
      }
    }

    menuTree.forEach(scanNode);
    return activeIds;
  }, [pathname, menuTree]);

  const toggleGroup = (id: number) => {
    setToggledGroups((prev) => {
      const isCurrentlyExpanded = prev[id] ?? activeGroupIds.has(id);
      return {
        ...prev,
        [id]: !isCurrentlyExpanded,
      };
    });
  };

  // Filtrar el árbol completo según la búsqueda
  const filteredTree = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return menuTree;

    return menuTree
      .map((node) => filterTreeNode(node, query))
      .filter(Boolean) as OpcionMenuTreeResponse[];
  }, [menuTree, searchQuery]);

  // Calcular total de elementos coincidentes
  const totalResults = React.useMemo(() => {
    if (!searchQuery) return 0;
    let count = 0;
    function countNodes(nodes: OpcionMenuTreeResponse[]) {
      for (const n of nodes) {
        if (!n.hijos || n.hijos.length === 0) {
          count++;
        } else {
          countNodes(n.hijos);
        }
      }
    }
    countNodes(filteredTree);
    return count;
  }, [filteredTree, searchQuery]);

  return (
    <Sidebar variant={variant} collapsible="offcanvas" {...props}>
      {/* ================= HEADER ================= */}
      <SidebarHeader className="border-b border-sidebar-border/50 p-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-tr from-primary to-primary/80 text-primary-foreground shadow-sm shadow-primary/25">
              <Activity className="size-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
                Atenea Servicios
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Sistema de Ventas
              </span>
            </div>
          </Link>
          <Badge
            variant="outline"
            className="h-5 px-1.5 text-[10px] font-normal text-muted-foreground border-sidebar-border/80 bg-sidebar-accent/50"
          >
            v1.0
          </Badge>
        </div>

        {/* Barra de Búsqueda Rápida */}
        <SidebarSearch value={searchQuery} onChange={setSearchQuery} />
      </SidebarHeader>

      {/* ================= CONTENT ================= */}
      <SidebarContent className="gap-3 px-2 py-3 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <SidebarLoadingSkeleton />
        ) : isError ? (
          <SidebarError onRetry={() => refetch()} />
        ) : searchQuery && totalResults === 0 ? (
          <SidebarSearchEmpty searchQuery={searchQuery} />
        ) : menuTree.length === 0 ? (
          <SidebarEmpty />
        ) : (
          <SidebarNav
            tree={filteredTree}
            pathname={pathname}
            searchQuery={searchQuery}
            toggledGroups={toggledGroups}
            activeGroupIds={activeGroupIds}
            onToggleGroup={toggleGroup}
          />
        )}
      </SidebarContent>

      {/* ================= FOOTER ================= */}
      <SidebarFooter className="border-t border-sidebar-border/50 p-2">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-sidebar-accent/40 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
            </span>
            <span className="font-medium text-sidebar-foreground/90">Sistema en línea</span>
          </div>
          <span className="text-[10px] text-muted-foreground/70">Seguro &bull; SSL</span>
        </div>
      </SidebarFooter>

      {/* ================= RESIZABLE RAIL ================= */}
      <SidebarRail />
    </Sidebar>
  );
}
