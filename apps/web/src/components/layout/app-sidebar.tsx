"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Activity,
  Receipt,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { directNavItems, moduleGroups, NavGroup } from "@/config/navigation"

export function AppSidebar({ variant = "inset", ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  // Detect if current pathname matches a grouped module item
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

  // Track active group title (null = Main Menu view)
  const [activeGroupTitle, setActiveGroupTitle] = React.useState<string | null>(
    () => detectedGroup?.title ?? null
  )

  // Auto update open group when navigating directly to a grouped route
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

  return (
    <Sidebar variant={variant} collapsible="offcanvas" {...props}>
      <SidebarHeader className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="default" className="data-[slot=sidebar-menu-button]:p-1.5! h-8">
              <div className="flex size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <Receipt className="size-3.5" />
              </div>
              <span className="text-base font-semibold">MediServ</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-2 p-2">
        {activeGroupTitle === null ? (
          /* ================= VISTA: MENÚ PRINCIPAL ================= */
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {/* 1. Ítems Directos (Inicio, Pacientes, Citas, Reportes) */}
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
                        className="h-9 text-sm px-2.5 rounded-md"
                      >
                        {Icon && <Icon className="size-4 shrink-0 text-primary" />}
                        <span className="font-medium">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}

                {/* Separador sutil */}
                <div className="my-1 border-t border-sidebar-border/40" />

                {/* 2. Módulos Agrupados (Seguridad, Recursos Humanos, Parámetros) */}
                {moduleGroups.map((group) => {
                  const GroupIcon = group.icon
                  const itemCount = group.items.length
                  const isCurrentActiveGroup = detectedGroup?.title === group.title

                  return (
                    <SidebarMenuItem key={group.title}>
                      <SidebarMenuButton
                        onClick={() => setActiveGroupTitle(group.title)}
                        isActive={isCurrentActiveGroup}
                        className="h-9 text-sm justify-between px-2.5 rounded-md hover:bg-sidebar-accent duration-150 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          {GroupIcon && <GroupIcon className="size-4 text-primary shrink-0" />}
                          <span className="font-medium">{group.title}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sidebar-foreground/50">
                          <span className="text-xs font-normal">({itemCount})</span>
                          <ChevronRight className="size-4" />
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          /* ================= VISTA: NÚCLEO DEL GRUPO SELECCIONADO ================= */
          <div className="flex flex-col gap-3">
            {/* Botón para Volver al Menú Principal */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveGroupTitle(null)}
              className="h-8 justify-start gap-2 px-2 text-xs font-medium text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/80 transition-all"
            >
              <ChevronLeft className="size-4" />
              <span>Volver al menú principal</span>
            </Button>

            {/* Cabecera del Grupo Actual */}
            {activeGroup && (
              <SidebarGroup className="p-0">
                <div className="flex items-center gap-2 px-2 py-1 mb-1 border-b border-sidebar-border/40 pb-2">
                  {activeGroup.icon && (
                    <activeGroup.icon className="size-4 text-primary shrink-0" />
                  )}
                  <span className="text-sm font-semibold text-sidebar-foreground">
                    {activeGroup.title}
                  </span>
                </div>

                {/* Sub-elementos del Grupo */}
                <SidebarGroupContent className="mt-1">
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
                            className="h-9 text-sm px-2.5 rounded-md"
                          >
                            {Icon && <Icon className="size-4 shrink-0" />}
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
    </Sidebar>
  )
}


