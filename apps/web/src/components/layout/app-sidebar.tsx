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

  // Garantizar que las opciones de Reportes de Admisión, Ventas y Cobranzas estén disponibles en el menú lateral
  const enrichedMenuTree = React.useMemo(() => {
    if (!menuTree || menuTree.length === 0) return menuTree;

    let hasReportesAdmision = false;
    let hasReportesVentas = false;
    let hasReportesCobros = false;
    let hasReportesMovimientos = false;
    function checkReportes(nodes: OpcionMenuTreeResponse[]) {
      for (const n of nodes) {
        if (n.ruta === "/recepcion/reportes") {
          hasReportesAdmision = true;
        }
        if (n.ruta === "/ventas/reportes") {
          hasReportesVentas = true;
        }
        if (n.ruta === "/caja/reportes") {
          hasReportesCobros = true;
        }
        if (n.ruta === "/caja/movimientos/reportes") {
          hasReportesMovimientos = true;
        }
        if (n.hijos && n.hijos.length > 0) {
          checkReportes(n.hijos);
        }
      }
    }
    checkReportes(menuTree);
    if (hasReportesAdmision && hasReportesVentas && hasReportesCobros && hasReportesMovimientos) return menuTree;

    return menuTree.map((category) => {
      const hijos = [...(category.hijos || [])];
      let changed = false;

      // 1. Reportes de Admisión
      if (!hasReportesAdmision) {
        const hasAdmisiones = hijos.some(
          (h) => h.ruta === "/recepcion/admisiones" || h.codigo === "ADMISIONES"
        );
        if (category.codigo === "CLINICA_SERVICIOS" || hasAdmisiones) {
          const admisionIdx = hijos.findIndex(
            (h) => h.ruta === "/recepcion/admisiones" || h.codigo === "ADMISIONES"
          );

          const reporteNode: OpcionMenuTreeResponse = {
            id: -9999,
            codigo: "REPORTES_ADMISIONES",
            nombre: "Reportes de Admisión",
            ruta: "/recepcion/reportes",
            icono: "FileSpreadsheet",
            orden: admisionIdx >= 0 ? (hijos[admisionIdx].orden ?? 2) + 1 : 3,
            hijos: [],
          };

          if (admisionIdx >= 0) {
            hijos.splice(admisionIdx + 1, 0, reporteNode);
          } else {
            hijos.push(reporteNode);
          }
          changed = true;
        }
      }

      // 2. Reportes de Ventas
      if (!hasReportesVentas) {
        const hasVentas = hijos.some(
          (h) => h.ruta === "/ventas" || h.codigo === "VENTAS"
        );
        if (category.codigo === "CAJA_VENTAS" || hasVentas) {
          const ventaIdx = hijos.findIndex(
            (h) => h.ruta === "/ventas" || h.codigo === "VENTAS"
          );

          const reporteVentaNode: OpcionMenuTreeResponse = {
            id: -9998,
            codigo: "REPORTES_VENTAS",
            nombre: "Reportes de Ventas",
            ruta: "/ventas/reportes",
            icono: "FileSpreadsheet",
            orden: ventaIdx >= 0 ? (hijos[ventaIdx].orden ?? 1) + 1 : 2,
            hijos: [],
          };

          if (ventaIdx >= 0) {
            hijos.splice(ventaIdx + 1, 0, reporteVentaNode);
          } else {
            hijos.push(reporteVentaNode);
          }
          changed = true;
        }
      }

      // 3. Reportes de Cobranzas
      if (!hasReportesCobros) {
        const hasCobros = hijos.some(
          (h) => h.ruta === "/caja/cobros" || h.codigo === "COBROS"
        );
        if (category.codigo === "CAJA_VENTAS" || hasCobros) {
          const cobroIdx = hijos.findIndex(
            (h) => h.ruta === "/caja/cobros" || h.codigo === "COBROS"
          );

          const reporteCobroNode: OpcionMenuTreeResponse = {
            id: -9997,
            codigo: "REPORTES_COBROS",
            nombre: "Reportes de Cobranzas",
            ruta: "/caja/reportes",
            icono: "FileSpreadsheet",
            orden: cobroIdx >= 0 ? (hijos[cobroIdx].orden ?? 2) + 1 : 3,
            hijos: [],
          };

          if (cobroIdx >= 0) {
            hijos.splice(cobroIdx + 1, 0, reporteCobroNode);
          } else {
            hijos.push(reporteCobroNode);
          }
          changed = true;
        }
      }

      // 4. Reportes de Movimientos de Caja
      if (!hasReportesMovimientos) {
        const hasMovimientos = hijos.some(
          (h) => h.ruta === "/caja/movimientos" || h.codigo === "MOVIMIENTOS_CAJA"
        );
        if (category.codigo === "CAJA_VENTAS" || hasMovimientos) {
          const movIdx = hijos.findIndex(
            (h) => h.ruta === "/caja/movimientos" || h.codigo === "MOVIMIENTOS_CAJA"
          );

          const reporteMovNode: OpcionMenuTreeResponse = {
            id: -9996,
            codigo: "REPORTES_MOVIMIENTOS",
            nombre: "Reportes de Movimientos",
            ruta: "/caja/movimientos/reportes",
            icono: "FileSpreadsheet",
            orden: movIdx >= 0 ? (hijos[movIdx].orden ?? 5) + 1 : 6,
            hijos: [],
          };

          if (movIdx >= 0) {
            hijos.splice(movIdx + 1, 0, reporteMovNode);
          } else {
            hijos.push(reporteMovNode);
          }
          changed = true;
        }
      }

      if (changed) {
        return {
          ...category,
          hijos,
        };
      }

      return category;
    });
  }, [menuTree]);

  // Lista de todas las rutas del menú para desambiguar rutas que comparten prefijo (ej. /ventas vs /ventas/reportes)
  const allRoutes = React.useMemo(() => {
    const routes: string[] = [];
    function collect(node: OpcionMenuTreeResponse) {
      if (node.ruta) routes.push(node.ruta);
      if (node.hijos && node.hijos.length > 0) node.hijos.forEach(collect);
    }
    enrichedMenuTree.forEach(collect);
    return routes;
  }, [enrichedMenuTree]);

  // Conjunto de IDs de grupos que contienen la ruta activa actual
  const activeGroupIds = React.useMemo(() => {
    if (!pathname || enrichedMenuTree.length === 0) return new Set<number>();
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

    enrichedMenuTree.forEach(scanNode);
    return activeIds;
  }, [pathname, enrichedMenuTree, allRoutes]);

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
    if (!query) return enrichedMenuTree;

    return enrichedMenuTree
      .map((node) => filterTreeNode(node, query))
      .filter(Boolean) as OpcionMenuTreeResponse[];
  }, [enrichedMenuTree, searchQuery]);

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
        ) : enrichedMenuTree.length === 0 ? (
          <SidebarEmpty />
        ) : (
          <SidebarNav
            tree={filteredTree}
            pathname={pathname}
            searchQuery={searchQuery}
            toggledGroups={toggledGroups}
            activeGroupIds={activeGroupIds}
            onToggleGroup={toggleGroup}
            allRoutes={allRoutes}
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
