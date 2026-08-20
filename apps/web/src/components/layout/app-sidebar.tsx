"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  Search,
  X,
  Sparkles,
  Activity,
  Receipt,
  Layers,
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
import {
  navCategories,
  isNavGroup,
  type NavItem,
  type NavGroup,
} from "@/config/navigation"
import { cn } from "@/lib/utils"

export function AppSidebar({ variant = "inset", ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({})

  // Detect which group contains the current route
  const activeGroupTitle = React.useMemo(() => {
    if (!pathname) return null
    for (const category of navCategories) {
      for (const item of category.items) {
        if (isNavGroup(item)) {
          const hasActiveChild = item.items.some(
            (sub) => pathname === sub.href || (sub.href !== "/dashboard" && pathname.startsWith(sub.href))
          )
          if (hasActiveChild) return item.title
        }
      }
    }
    return null
  }, [pathname])

  // Automatically keep active group expanded on route change
  React.useEffect(() => {
    if (activeGroupTitle) {
      setExpandedGroups((prev) => ({
        ...prev,
        [activeGroupTitle]: true,
      }))
    }
  }, [activeGroupTitle])

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  // Filter categories and groups by search query
  const filteredCategories = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return navCategories

    return navCategories
      .map((category) => {
        const filteredItems = category.items
          .map((item) => {
            if (isNavGroup(item)) {
              // Check if group title matches or if any sub-item matches
              const groupMatches = item.title.toLowerCase().includes(query)
              const matchingSubItems = item.items.filter(
                (sub) =>
                  sub.title.toLowerCase().includes(query) ||
                  sub.description?.toLowerCase().includes(query)
              )

              if (groupMatches || matchingSubItems.length > 0) {
                return {
                  ...item,
                  // If group matches directly, keep all or matching items
                  items: matchingSubItems.length > 0 ? matchingSubItems : item.items,
                }
              }
              return null
            } else {
              // Direct item
              const matches =
                item.title.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query)
              return matches ? item : null
            }
          })
          .filter(Boolean) as (NavItem | NavGroup)[]

        return {
          ...category,
          items: filteredItems,
        }
      })
      .filter((category) => category.items.length > 0)
  }, [searchQuery])

  // Total matching items for search feedback
  const totalResults = React.useMemo(() => {
    if (!searchQuery) return 0
    let count = 0
    filteredCategories.forEach((cat) => {
      cat.items.forEach((item) => {
        if (isNavGroup(item)) {
          count += item.items.length
        } else {
          count += 1
        }
      })
    })
    return count
  }, [filteredCategories, searchQuery])

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
            placeholder="Filtrar módulos..."
            className="w-full h-8 pl-8 pr-7 text-xs rounded-md bg-sidebar-accent/40 border border-sidebar-border/50 text-sidebar-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-sidebar-accent/70 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-sidebar-foreground transition-colors p-0.5 rounded-xs"
              title="Limpiar búsqueda"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </SidebarHeader>

      {/* ================= CONTENT: CATEGORÍAS Y ACORDEÓN ================= */}
      <SidebarContent className="gap-4 px-2 py-3 overflow-y-auto custom-scrollbar">
        {searchQuery && totalResults === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Search className="size-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-semibold text-sidebar-foreground">Sin resultados</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              No hay módulos que coincidan con &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <SidebarGroup key={category.title} className="p-0">
              <SidebarGroupLabel className="px-2.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between">
                <span>{category.title}</span>
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {category.items.map((item) => {
                    if (isNavGroup(item)) {
                      // ====== GRUPO CON SUB-MENÚ (ACORDEÓN) ======
                      const isExpanded = searchQuery
                        ? true
                        : (expandedGroups[item.title] ?? false)
                      const GroupIcon = item.icon
                      const subItems = item.items
                      const hasActiveChild = subItems.some(
                        (sub) =>
                          pathname === sub.href ||
                          (sub.href !== "/dashboard" && pathname?.startsWith(sub.href))
                      )

                      return (
                        <SidebarMenuItem key={item.title}>
                          {/* Botón de Cabecera del Grupo */}
                          <SidebarMenuButton
                            onClick={() => toggleGroup(item.title)}
                            isActive={hasActiveChild && !isExpanded}
                            className={cn(
                              "h-8.5 text-xs font-medium px-2.5 rounded-md justify-between group/group-btn transition-all duration-150",
                              hasActiveChild
                                ? "text-primary font-semibold"
                                : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {GroupIcon && (
                                <GroupIcon
                                  className={cn(
                                    "size-4 shrink-0 transition-colors",
                                    hasActiveChild
                                      ? "text-primary"
                                      : "text-muted-foreground group-hover/group-btn:text-sidebar-foreground"
                                  )}
                                />
                              )}
                              <span className="truncate">{item.title}</span>
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

                          {/* Sub-elementos con guía visual vertical */}
                          {isExpanded && (
                            <div className="relative ml-4 pl-2.5 mt-0.5 mb-1 border-l border-sidebar-border/70 flex flex-col gap-0.5 animate-in fade-in-50 duration-200">
                              {subItems.map((sub) => {
                                const SubIcon = sub.icon
                                const isSubActive =
                                  pathname === sub.href ||
                                  (sub.href !== "/dashboard" && pathname?.startsWith(sub.href))

                                return (
                                  <SidebarMenuButton
                                    key={sub.title}
                                    isActive={isSubActive}
                                    tooltip={sub.description || sub.title}
                                    render={<Link href={sub.href} />}
                                    className={cn(
                                      "h-7.5 text-xs px-2 rounded-md transition-all duration-150 flex items-center justify-between",
                                      isSubActive
                                        ? "bg-primary/10 text-primary font-medium shadow-2xs"
                                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                                    )}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      {SubIcon ? (
                                        <SubIcon
                                          className={cn(
                                            "size-3.5 shrink-0",
                                            isSubActive ? "text-primary" : "text-muted-foreground/70"
                                          )}
                                        />
                                      ) : (
                                        <div
                                          className={cn(
                                            "size-1.5 rounded-full",
                                            isSubActive ? "bg-primary" : "bg-muted-foreground/40"
                                          )}
                                        />
                                      )}
                                      <span className="truncate">{sub.title}</span>
                                    </div>
                                    {sub.badge && (
                                      <span className="text-[10px] px-1 rounded-sm bg-primary/20 text-primary font-medium">
                                        {sub.badge}
                                      </span>
                                    )}
                                  </SidebarMenuButton>
                                )
                              })}
                            </div>
                          )}
                        </SidebarMenuItem>
                      )
                    } else {
                      // ====== ÍTEM DIRECTO ======
                      const Icon = item.icon
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname?.startsWith(item.href))

                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={item.description || item.title}
                            render={<Link href={item.href} />}
                            className={cn(
                              "h-8.5 text-xs px-2.5 rounded-md transition-all duration-150 flex items-center justify-between",
                              isActive
                                ? "bg-primary/10 text-primary font-semibold shadow-2xs"
                                : "text-sidebar-foreground/85 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {Icon && (
                                <Icon
                                  className={cn(
                                    "size-4 shrink-0 transition-colors",
                                    isActive ? "text-primary" : "text-primary/70"
                                  )}
                                />
                              )}
                              <span className="truncate">{item.title}</span>
                            </div>
                            {item.badge && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-primary/15 text-primary font-medium">
                                {item.badge}
                              </span>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    }
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
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



