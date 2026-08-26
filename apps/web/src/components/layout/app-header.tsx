"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "./app-breadcrumbs";
import { ThemeToggle } from "./theme-toggle";
import { NotificationsPopover } from "./notifications-popover";
import { UserNav } from "./user-nav";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/50 bg-background/80 px-4 sm:px-6 backdrop-blur-md transition-all duration-200">
      {/* Sección Izquierda: Trigger Sidebar + Breadcrumbs */}
      <div className="flex items-center gap-2.5 min-w-0">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-colors" />
        <Separator orientation="vertical" className="h-4 bg-border/60" />
        <AppBreadcrumbs />
      </div>

      {/* Sección Derecha: Notificaciones, Tema y Perfil de Usuario */}
      <div className="flex items-center gap-2 shrink-0">
        <NotificationsPopover />
        <ThemeToggle />
        <Separator orientation="vertical" className="h-4 mx-0.5 bg-border/60" />
        <UserNav />
      </div>
    </header>
  );
}
