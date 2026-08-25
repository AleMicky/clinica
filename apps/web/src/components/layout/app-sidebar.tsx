"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  Search,
  X,
  Activity,
  RotateCcw,
  ShieldAlert,
  FolderTree,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/providers/auth-provider"
import { useMenuUsuario } from "@/modules/seguridad/opcion-menu/hooks/use-opcion-menu"
import { getMenuLucideIcon } from "@/modules/seguridad/opcion-menu/components/opcion-menu-icon-helper"
import type { OpcionMenuTreeResponse } from "@/modules/seguridad/opcion-menu/types/opcion-menu.types"
import { cn } from "@/lib/utils"

/**
 * Verifica si una ruta coincide exactamente o es sub-ruta de la URL activa
 */
function isRouteActive(pathname: string | null, route?: string | null): boolean {
  if (!pathname || !route) return false
  if (route === "/dashboard") {
    return pathname === "/dashboard"
  }
  return pathname === route || pathname.startsWith(route + "/")
}

/**
 * Verifica recursivamente si un nodo o alguno de sus descendientes contiene la ruta activa
 */
function hasActiveDescendant(node: OpcionMenuTreeResponse, pathname: string | null): boolean {
  if (!pathname) return false
  if (isRouteActive(pathname, node.ruta)) return true
  if (node.hijos && node.hijos.length > 0) {
    return node.hijos.some((child) => hasActiveDescendant(child, pathname))
  }
  return false
}

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
    (node.ruta ? node.ruta.toLowerCase().includes(query) : false)

  if (!node.hijos || node.hijos.length === 0) {
    return matchesSelf ? node : null
  }

  const filteredChildren = node.hijos
    .map((child) => filterTreeNode(child, query))
    .filter(Boolean) as OpcionMenuTreeResponse[]

  if (matchesSelf || filteredChildren.length > 0) {
    return {
      ...node,
      hijos: filteredChildren.length > 0 ? filteredChildren : node.hijos,
    }
  }

  return null
}

export function AppSidebar({ variant = "inset", ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const {
    data: menuTree = [],
    isLoading: isMenuLoading,
    isError,
    refetch,
  } = useMenuUsuario(isAuthenticated)

  const [searchQuery, setSearchQuery] = React.useState("")
  const [expandedGroups, setExpandedGroups] = React.useState<Record<number, boolean>>({})

  const isLoading = isAuthLoading || isMenuLoading

  // Conjunto de IDs de grupos que contienen la ruta activa actual
  const activeGroupIds = React.useMemo(() => {
    if (!pathname || menuTree.length === 0) return new Set<number>()
    const activeIds = new Set<number>()

    function scanNode(node: OpcionMenuTreeResponse) {
      if (node.hijos && node.hijos.length > 0) {
        const hasActive = node.hijos.some((child) => hasActiveDescendant(child, pathname))
        if (hasActive) {
          activeIds.add(node.id)
        }
        node.hijos.forEach(scanNode)
      }
    }

    menuTree.forEach(scanNode)
    return activeIds
  }, [pathname, menuTree])

  // Mantener automáticamente expandidos los grupos con la ruta activa al cambiar de página
  React.useEffect(() => {
    if (activeGroupIds.size > 0) {
      setExpandedGroups((prev) => {
        const next = { ...prev }
        activeGroupIds.forEach((id) => {
          next[id] = true
        })
        return next
      })
    }
  }, [activeGroupIds])

  const toggleGroup = (id: number) => {
    setExpandedGroups((prev) => {
      // Si aún no estaba en el estado, determinar su valor inicial a partir de activeGroupIds
      const current = prev[id] ?? activeGroupIds.has(id)
      return {
        ...prev,
        [id]: !current,
      }
    })
  }

  // Filtrar el árbol completo según la búsqueda
  const filteredTree = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return menuTree

    return menuTree
      .map((node) => filterTreeNode(node, query))
      .filter(Boolean) as OpcionMenuTreeResponse[]
  }, [menuTree, searchQuery])

  // Calcular total de elementos que coinciden para feedback visual
  const totalResults = React.useMemo(() => {
    if (!searchQuery) return 0
    let count = 0
    function countNodes(nodes: OpcionMenuTreeResponse[]) {
      for (const n of nodes) {
        if (!n.hijos || n.hijos.length === 0) {
          count++
        } else {
          countNodes(n.hijos)
        }
      }
    }
    countNodes(filteredTree)
    return count
  }, [filteredTree, searchQuery])

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
                MediServ
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Sistema Clínico
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

        {/* Quick Search Filter */}
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/70 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar módulos y accesos..."
            className="w-full h-8 pl-8 pr-7 text-xs rounded-md bg-sidebar-accent/40 border border-sidebar-border/50 text-sidebar-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-sidebar-accent/70 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-sidebar-foreground transition-colors p-0.5 rounded-xs cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </SidebarHeader>

      {/* ================= CONTENT: MENÚ JERÁRQUICO DINÁMICO ================= */}
      <SidebarContent className="gap-3 px-2 py-3 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          // ====== SKELETON LOADING STATE ======
          <div className="space-y-4 px-1 py-1">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16 bg-sidebar-accent/60 mb-2" />
              <Skeleton className="h-8 w-full rounded-md bg-sidebar-accent/50" />
              <Skeleton className="h-8 w-full rounded-md bg-sidebar-accent/50" />
            </div>
            <div className="space-y-1.5 pt-2">
              <Skeleton className="h-3 w-24 bg-sidebar-accent/60 mb-2" />
              <Skeleton className="h-8 w-full rounded-md bg-sidebar-accent/50" />
              <Skeleton className="h-8 w-full rounded-md bg-sidebar-accent/50" />
              <Skeleton className="h-8 w-full rounded-md bg-sidebar-accent/50" />
            </div>
          </div>
        ) : isError ? (
          // ====== ERROR STATE ======
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
              <ShieldAlert className="size-5" />
            </div>
            <p className="text-xs font-semibold text-sidebar-foreground">Error al cargar el menú</p>
            <p className="text-[11px] text-muted-foreground mt-1 mb-3">
              No se pudieron obtener los permisos del usuario.
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground border border-sidebar-border transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3" />
              <span>Reintentar</span>
            </button>
          </div>
        ) : searchQuery && totalResults === 0 ? (
          // ====== SIN RESULTADOS DE BÚSQUEDA ======
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Search className="size-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-semibold text-sidebar-foreground">Sin resultados</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              No hay módulos que coincidan con &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        ) : menuTree.length === 0 ? (
          // ====== SIN OPCIONES ASIGNADAS ======
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <FolderTree className="size-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-semibold text-sidebar-foreground">Menú no asignado</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Tu rol actual no tiene opciones de menú configuradas o activas.
            </p>
          </div>
        ) : (
          filteredTree.map((category) => {
            const categoryHasChildren = category.hijos && category.hijos.length > 0

            return (
              <SidebarGroup key={category.id} className="p-0">
                {/* Título de la Categoría / Sección (Nivel 1) */}
                <SidebarGroupLabel className="px-2.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between">
                  <span>{category.nombre}</span>
                </SidebarGroupLabel>

                <SidebarGroupContent>
                  <SidebarMenu className="gap-0.5">
                    {categoryHasChildren ? (
                      category.hijos.map((item) => {
                        const itemHasChildren = item.hijos && item.hijos.length > 0

                        if (itemHasChildren) {
                          // ====== NIVEL 2: MÓDULO AGRUPADO CON SUB-MENÚ (ACORDEÓN) ======
                          const isExpanded = searchQuery
                            ? true
                            : (expandedGroups[item.id] ?? activeGroupIds.has(item.id))
                          const GroupIcon = getMenuLucideIcon(item.icono)
                          const subItems = item.hijos || []
                          const hasActiveChild = subItems.some((sub) =>
                            hasActiveDescendant(sub, pathname)
                          )

                          return (
                            <SidebarMenuItem key={item.id}>
                              {/* Botón Cabecera del Grupo */}
                              <SidebarMenuButton
                                onClick={() => toggleGroup(item.id)}
                                isActive={hasActiveChild && !isExpanded}
                                className={cn(
                                  "h-8.5 text-xs font-medium px-2.5 rounded-md justify-between group/group-btn transition-all duration-150 cursor-pointer",
                                  hasActiveChild
                                    ? "text-primary font-semibold"
                                    : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                                )}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <GroupIcon
                                    className={cn(
                                      "size-4 shrink-0 transition-colors",
                                      hasActiveChild
                                        ? "text-primary"
                                        : "text-muted-foreground group-hover/group-btn:text-sidebar-foreground"
                                    )}
                                  />
                                  <span className="truncate">{item.nombre}</span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground/70">
                                  <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-sidebar-accent/80 font-normal">
                                    {subItems.length}
                                  </span>
                                  <ChevronDown
                                    className={cn(
                                      "size-3.5 transition-transform duration-200",
                                      isExpanded && "rotate-180"
                                    )}
                                  />
                                </div>
                              </SidebarMenuButton>

                              {/* Sub-elementos (Nivel 3) con guía vertical */}
                              {isExpanded && (
                                <div className="relative ml-4 pl-2.5 mt-0.5 mb-1 border-l border-sidebar-border/70 flex flex-col gap-0.5 animate-in fade-in-50 duration-200">
                                  {subItems.map((sub) => {
                                    const SubIcon = getMenuLucideIcon(sub.icono)
                                    const subHref = sub.ruta || "#"
                                    const isSubActive = isRouteActive(pathname, sub.ruta)

                                    return (
                                      <SidebarMenuButton
                                        key={sub.id}
                                        isActive={isSubActive}
                                        tooltip={sub.nombre}
                                        render={<Link href={subHref} />}
                                        className={cn(
                                          "h-7.5 text-xs px-2 rounded-md transition-all duration-150 flex items-center justify-between",
                                          isSubActive
                                            ? "bg-primary/10 text-primary font-semibold shadow-2xs"
                                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                                        )}
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <SubIcon
                                            className={cn(
                                              "size-3.5 shrink-0",
                                              isSubActive ? "text-primary" : "text-muted-foreground/70"
                                            )}
                                          />
                                          <span className="truncate">{sub.nombre}</span>
                                        </div>
                                      </SidebarMenuButton>
                                    )
                                  })}
                                </div>
                              )}
                            </SidebarMenuItem>
                          )
                        } else {
                          // ====== NIVEL 2: ÍTEM DIRECTO DENTRO DE CATEGORÍA ======
                          const Icon = getMenuLucideIcon(item.icono)
                          const itemHref = item.ruta || "#"
                          const isActive = isRouteActive(pathname, item.ruta)

                          return (
                            <SidebarMenuItem key={item.id}>
                              <SidebarMenuButton
                                isActive={isActive}
                                tooltip={item.nombre}
                                render={<Link href={itemHref} />}
                                className={cn(
                                  "h-8.5 text-xs px-2.5 rounded-md transition-all duration-150 flex items-center justify-between",
                                  isActive
                                    ? "bg-primary/10 text-primary font-semibold shadow-2xs"
                                    : "text-sidebar-foreground/85 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                                )}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Icon
                                    className={cn(
                                      "size-4 shrink-0 transition-colors",
                                      isActive ? "text-primary" : "text-primary/70"
                                    )}
                                  />
                                  <span className="truncate">{item.nombre}</span>
                                </div>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          )
                        }
                      })
                    ) : (
                      // ====== ÍTEM DIRECTO RAÍZ (SIN CATEGORÍA) ======
                      (() => {
                        const Icon = getMenuLucideIcon(category.icono)
                        const itemHref = category.ruta || "#"
                        const isActive = isRouteActive(pathname, category.ruta)

                        return (
                          <SidebarMenuItem key={category.id}>
                            <SidebarMenuButton
                              isActive={isActive}
                              tooltip={category.nombre}
                              render={<Link href={itemHref} />}
                              className={cn(
                                "h-8.5 text-xs px-2.5 rounded-md transition-all duration-150 flex items-center justify-between",
                                isActive
                                  ? "bg-primary/10 text-primary font-semibold shadow-2xs"
                                  : "text-sidebar-foreground/85 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Icon
                                  className={cn(
                                    "size-4 shrink-0 transition-colors",
                                    isActive ? "text-primary" : "text-primary/70"
                                  )}
                                />
                                <span className="truncate">{category.nombre}</span>
                              </div>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )
                      })()
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )
          })
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
  )
}

