"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Receipt,
  Search,
  X,
  Sparkles,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { directNavItems, moduleGroups, NavGroup, NavItem } from "@/config/navigation"

export function AppSidebar({ variant = "inset", ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  // Buscador rápido de navegación
  const [searchQuery, setSearchQuery] = React.useState("")

  // Detectar grupo de módulos activo según la URL
  const detectedGroup = React.useMemo(() => {
    if (!pathname) return null
    return (
      moduleGroups.find((group) =>
        group.items.some(
          (item) =>
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
        )
      ) ?? null
    )
  }, [pathname])

  // Seguimiento del grupo activo (null = Menú Principal)
  const [activeGroupTitle, setActiveGroupTitle] = React.useState<string | null>(
    () => detectedGroup?.title ?? null
  )

  // Auto-actualizar grupo activo al navegar directamente por URL
  React.useEffect(() => {
    if (detectedGroup) {
      setActiveGroupTitle(detectedGroup.title)
    } else {
      const isDirectRoute = directNavItems.some(
        (item) =>
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname?.startsWith(item.href))
      )
      if (isDirectRoute) {
        setActiveGroupTitle(null)
      }
    }
  }, [detectedGroup, pathname])

  const activeGroup: NavGroup | undefined = moduleGroups.find(
    (g) => g.title === activeGroupTitle
  )

  // Filtrado dinámico de búsqueda
  const searchResults = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return null

    const matchedDirect = directNavItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    )

    const matchedGroups: Array<{ groupTitle: string; items: NavItem[] }> = []
    moduleGroups.forEach((group) => {
      const items = group.items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          group.title.toLowerCase().includes(query)
      )
      if (items.length > 0) {
        matchedGroups.push({ groupTitle: group.title, items })
      }
    })

    return { matchedDirect, matchedGroups }
  }, [searchQuery])

  return (
    <Sidebar variant={variant} collapsible="icon" {...props}>
      {/* ================= MARCA DE LA CLÍNICA ================= */}
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-1.5 h-11 rounded-xl transition-all duration-200 hover:bg-sidebar-accent/80"
              tooltip="MediServ - Sistema Médico"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary/90 to-blue-600 text-primary-foreground shadow-md shadow-primary/20 ring-1 ring-white/20">
                <Receipt className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 text-left leading-none group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-sidebar-foreground tracking-tight">
                    MediServ
                  </span>
                  <Badge variant="secondary" className="px-1 py-0 text-[9px] font-medium bg-primary/10 text-primary border-primary/20">
                    v1.0
                  </Badge>
                </div>
                <span className="text-[11px] text-sidebar-foreground/60 font-normal">
                  Sistema Medico
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ================= CONTENIDO DE NAVEGACIÓN ================= */}
      <SidebarContent className="p-2 gap-2">
        {/* BUSCADOR RÁPIDO */}
        <div className="px-1 group-data-[collapsible=icon]:hidden">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 size-3.5 text-sidebar-foreground/50 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar opción..."
              className="w-full h-8 pl-8 pr-7 text-xs bg-sidebar-accent/50 hover:bg-sidebar-accent focus:bg-background border border-sidebar-border/50 rounded-lg text-sidebar-foreground placeholder:text-sidebar-foreground/40 outline-none ring-primary/20 focus:ring-2 focus:border-primary/40 transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 p-0.5 text-sidebar-foreground/50 hover:text-sidebar-foreground rounded-full hover:bg-sidebar-accent"
              >
                <X className="size-3" />
              </button>
            ) : (
              <kbd className="absolute right-2 text-[9px] font-mono text-sidebar-foreground/40 bg-sidebar-accent/80 px-1 rounded border border-sidebar-border/40 pointer-events-none">
                ⌘K
              </kbd>
            )}
          </div>
        </div>

        {/* VISTA DE RESULTADOS DE BÚSQUEDA */}
        {searchResults ? (
          <SidebarGroup className="p-0 animate-in fade-in-50 duration-150">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1 mt-1">
                {searchResults.matchedDirect.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        render={<Link href={item.href} />}
                        className="h-9 text-xs px-2.5 rounded-lg transition-all"
                      >
                        {Icon && <Icon className="size-4 shrink-0 text-primary" />}
                        <span className="font-medium truncate">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}

                {searchResults.matchedGroups.map((group) =>
                  group.items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
                    return (
                      <SidebarMenuItem key={`${group.groupTitle}-${item.title}`}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={`${group.groupTitle} > ${item.title}`}
                          render={<Link href={item.href} />}
                          className="h-9 text-xs px-2.5 rounded-lg justify-between transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {Icon && <Icon className="size-4 shrink-0 text-primary/80" />}
                            <span className="font-medium truncate">{item.title}</span>
                          </div>
                          <span className="text-[10px] text-sidebar-foreground/50 bg-sidebar-accent px-1.5 py-0.5 rounded font-mono shrink-0">
                            {group.groupTitle}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })
                )}

                {searchResults.matchedDirect.length === 0 && searchResults.matchedGroups.length === 0 && (
                  <div className="py-6 text-center text-xs text-sidebar-foreground/50">
                    Sin resultados para &quot;{searchQuery}&quot;
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : activeGroupTitle === null ? (
          /* ---------------- VISTA 1: MENÚ PRINCIPAL ---------------- */
          <SidebarGroup className="p-0 animate-in fade-in-50 slide-in-from-left-2 duration-200">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {/* Ítems Directos */}
                {directNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname?.startsWith(item.href))

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        render={<Link href={item.href} />}
                        className={`h-9 text-xs px-2.5 rounded-lg transition-all duration-150 relative ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold shadow-xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-primary before:rounded-r-full"
                            : "hover:bg-sidebar-accent hover:translate-x-0.5 text-sidebar-foreground/80 hover:text-sidebar-foreground"
                        }`}
                      >
                        {Icon && (
                          <Icon
                            className={`size-4 shrink-0 transition-colors ${
                              isActive ? "text-primary" : "text-sidebar-foreground/70 group-hover/menu-button:text-primary"
                            }`}
                          />
                        )}
                        <span className="font-medium truncate">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}

                <SidebarSeparator className="my-1 border-sidebar-border/40" />

                {/* Módulos Agrupados */}
                {moduleGroups.map((group) => {
                  const GroupIcon = group.icon
                  const itemCount = group.items.length
                  const isCurrentActiveGroup = detectedGroup?.title === group.title

                  return (
                    <SidebarMenuItem key={group.title}>
                      <SidebarMenuButton
                        onClick={() => setActiveGroupTitle(group.title)}
                        isActive={isCurrentActiveGroup}
                        tooltip={group.title}
                        className={`h-9 text-xs justify-between px-2.5 rounded-lg transition-all duration-150 ${
                          isCurrentActiveGroup
                            ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
                            : "hover:bg-sidebar-accent hover:translate-x-0.5 text-sidebar-foreground/80 hover:text-sidebar-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {GroupIcon && (
                            <GroupIcon
                              className={`size-4 shrink-0 transition-colors ${
                                isCurrentActiveGroup ? "text-primary" : "text-sidebar-foreground/70 group-hover/menu-button:text-primary"
                              }`}
                            />
                          )}
                          <span className="font-medium truncate">{group.title}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden shrink-0">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-sidebar-accent text-sidebar-foreground/60 group-hover/menu-button:bg-primary/10 group-hover/menu-button:text-primary transition-colors">
                            {itemCount}
                          </span>
                          <ChevronRight className="size-3.5" />
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          /* ---------------- VISTA 2: NÚCLEO DEL GRUPO SELECCIONADO ---------------- */
          <div className="flex flex-col gap-2 animate-in fade-in-50 slide-in-from-right-2 duration-200">
            {/* Botón Volver */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveGroupTitle(null)}
              className="h-8 justify-start gap-1.5 px-2 text-xs font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/80 hover:-translate-x-0.5 transition-all group-data-[collapsible=icon]:justify-center"
              title="Volver al menú principal"
            >
              <ChevronLeft className="size-3.5 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Volver al menú</span>
            </Button>

            {/* Cabecera del Módulo */}
            {activeGroup && (
              <SidebarGroup className="p-0">
                <div className="flex items-center gap-2.5 p-2.5 mb-2 rounded-lg bg-sidebar-accent/50 border border-sidebar-border/40 group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:justify-center">
                  {activeGroup.icon && (
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <activeGroup.icon className="size-4 shrink-0" />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                    <span className="text-xs font-bold text-sidebar-foreground truncate">
                      {activeGroup.title}
                    </span>
                    {activeGroup.description && (
                      <span className="text-[10px] text-sidebar-foreground/60 font-normal line-clamp-1">
                        {activeGroup.description}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sub-elementos */}
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    {activeGroup.items.map((item) => {
                      const Icon = item.icon
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname?.startsWith(item.href))

                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={item.title}
                            render={<Link href={item.href} />}
                            className={`h-9 text-xs px-2.5 rounded-lg transition-all duration-150 relative ${
                              isActive
                                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                : "hover:bg-sidebar-accent hover:translate-x-0.5 text-sidebar-foreground/80 hover:text-sidebar-foreground"
                            }`}
                          >
                            {Icon && (
                              <Icon
                                className={`size-4 shrink-0 transition-colors ${
                                  isActive ? "text-primary-foreground" : "text-sidebar-foreground/70 group-hover/menu-button:text-primary"
                                }`}
                              />
                            )}
                            <span className="truncate">{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </div>
        )}
      </SidebarContent>

      <SidebarSeparator />

      {/* ================= FOOTER: ESTADO DEL SISTEMA ================= */}
      <SidebarFooter className="p-2.5">
        <div className="px-2 py-1 flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-2 text-[11px] text-sidebar-foreground/60 font-medium">
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="group-data-[collapsible=icon]:hidden">Sistema en línea</span>
          </div>
          <Sparkles className="size-3 text-primary/70 animate-pulse group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
