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

/**
 * Elimina ramas o categorías contenedoras que no tienen ruta navegable
 * ni subopciones accesibles para el usuario según sus permisos de rol.
 */
function pruneEmptyBranches(
  nodes: OpcionMenuTreeResponse[]
): OpcionMenuTreeResponse[] {
  return nodes
    .map((node) => {
      if (node.hijos && node.hijos.length > 0) {
        const cleanedChildren = pruneEmptyBranches(node.hijos);
        return {
          ...node,
          hijos: cleanedChildren,
        };
      }
      return node;
    })
    .filter((node) => {
      // Si tiene ruta navegable directa, se conserva
      if (node.ruta) return true;
      // Si no tiene ruta (es carpeta/categoría), solo se conserva si contiene hijos accesibles
      return Boolean(node.hijos && node.hijos.length > 0);
    });
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

  // Árbol de menú depurado: respeta estrictamente los permisos del rol del usuario
  // y descarta categorías o grupos vacíos sin opciones permitidas.
  const cleanMenuTree = React.useMemo(() => {
    if (!menuTree || menuTree.length === 0) return [];
    return pruneEmptyBranches(menuTree);
  }, [menuTree]);

  // Lista de todas las rutas del menú para desambiguar rutas que comparten prefijo (ej. /ventas vs /ventas/reportes)
  const allRoutes = React.useMemo(() => {
    const routes: string[] = [];
    function collect(node: OpcionMenuTreeResponse) {
      if (node.ruta) routes.push(node.ruta);
      if (node.hijos && node.hijos.length > 0) node.hijos.forEach(collect);
    }
    cleanMenuTree.forEach(collect);
    return routes;
  }, [cleanMenuTree]);

  // Conjunto de IDs de grupos que contienen la ruta activa actual
  const activeGroupIds = React.useMemo(() => {
    if (!pathname || cleanMenuTree.length === 0) return new Set<number>();
    const activeIds = new Set<number>();

    function scanNode(node: OpcionMenuTreeResponse) {
      if (node.hijos && node.hijos.length > 0) {
        const hasActive = node.hijos.some((child) => hasActiveDescendant(child, pathname, allRoutes));
        if (hasActive) {
          activeIds.add(node.id);
        }
        node.hijos.forEach(scanNode);
      }
    }

    cleanMenuTree.forEach(scanNode);
    return activeIds;
  }, [pathname, cleanMenuTree, allRoutes]);

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
    if (!query) return cleanMenuTree;

    return cleanMenuTree
      .map((node) => filterTreeNode(node, query))
      .filter(Boolean) as OpcionMenuTreeResponse[];
  }, [cleanMenuTree, searchQuery]);

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

  const renderContent = () => {
    if (isLoading) {
      return <SidebarLoadingSkeleton />;
    }

    if (isError) {
      return <SidebarError onRetry={() => refetch()} />;
    }

    if (searchQuery && totalResults === 0) {
      return <SidebarSearchEmpty searchQuery={searchQuery} />;
    }

    if (cleanMenuTree.length === 0) {
      return <SidebarEmpty />;
    }

    return (
      <SidebarNav
        tree={filteredTree}
        pathname={pathname}
        searchQuery={searchQuery}
        toggledGroups={toggledGroups}
        activeGroupIds={activeGroupIds}
        onToggleGroup={toggleGroup}
        allRoutes={allRoutes}
      />
    );
  };

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
        {renderContent()}
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
