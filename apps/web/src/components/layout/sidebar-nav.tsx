"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { getMenuLucideIcon } from "@/modules/seguridad/opcion-menu/components/opcion-menu-icon-helper";
import type { OpcionMenuTreeResponse } from "@/modules/seguridad/opcion-menu/types/opcion-menu.types";
import { cn } from "@/lib/utils";

export function isRouteActive(pathname: string | null, route?: string | null): boolean {
  if (!pathname || !route) return false;
  if (route === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === route || pathname.startsWith(route + "/");
}

export function hasActiveDescendant(node: OpcionMenuTreeResponse, pathname: string | null): boolean {
  if (!pathname) return false;
  if (isRouteActive(pathname, node.ruta)) return true;
  if (node.hijos && node.hijos.length > 0) {
    return node.hijos.some((child) => hasActiveDescendant(child, pathname));
  }
  return false;
}

interface SidebarNavProps {
  tree: OpcionMenuTreeResponse[];
  pathname: string | null;
  searchQuery: string;
  toggledGroups: Record<number, boolean>;
  activeGroupIds: Set<number>;
  onToggleGroup: (id: number) => void;
}

export function SidebarNav({
  tree,
  pathname,
  searchQuery,
  toggledGroups,
  activeGroupIds,
  onToggleGroup,
}: SidebarNavProps) {
  return (
    <>
      {tree.map((category) => {
        const categoryHasChildren = category.hijos && category.hijos.length > 0;

        return (
          <SidebarGroup key={category.id} className="p-0">
            {/* Título de la Categoría (Nivel 1) */}
            <SidebarGroupLabel className="px-2.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between">
              <span>{category.nombre}</span>
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {categoryHasChildren ? (
                  category.hijos.map((item) => {
                    const itemHasChildren = item.hijos && item.hijos.length > 0;

                    if (itemHasChildren) {
                      // ====== NIVEL 2: MÓDULO CON SUBMENÚ (ACORDEÓN) ======
                      const isExpanded = searchQuery
                        ? true
                        : (toggledGroups[item.id] ?? activeGroupIds.has(item.id));
                      const GroupIcon = getMenuLucideIcon(item.icono);
                      const subItems = item.hijos || [];
                      const hasActiveChild = subItems.some((sub) =>
                        hasActiveDescendant(sub, pathname)
                      );

                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            onClick={() => onToggleGroup(item.id)}
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

                          {/* Sub-elementos (Nivel 3) */}
                          {isExpanded && (
                            <div className="relative ml-4 pl-2.5 mt-0.5 mb-1 border-l border-sidebar-border/70 flex flex-col gap-0.5 animate-in fade-in-50 duration-200">
                              {subItems.map((sub) => {
                                const SubIcon = getMenuLucideIcon(sub.icono);
                                const subHref = sub.ruta || "#";
                                const isSubActive = isRouteActive(pathname, sub.ruta);

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
                                );
                              })}
                            </div>
                          )}
                        </SidebarMenuItem>
                      );
                    }

                    // ====== NIVEL 2: ÍTEM DIRECTO ======
                    const Icon = getMenuLucideIcon(item.icono);
                    const itemHref = item.ruta || "#";
                    const isActive = isRouteActive(pathname, item.ruta);

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
                    );
                  })
                ) : (
                  // ====== ÍTEM DIRECTO RAÍZ ======
                  (() => {
                    const Icon = getMenuLucideIcon(category.icono);
                    const itemHref = category.ruta || "#";
                    const isActive = isRouteActive(pathname, category.ruta);

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
                    );
                  })()
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        );
      })}
    </>
  );
}
