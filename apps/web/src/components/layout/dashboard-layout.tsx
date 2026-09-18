"use client";

import type { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";

type DashboardLayoutWrapperProps = {
  children: ReactNode;
  defaultOpen?: boolean;
};

export function DashboardLayoutWrapper({
  children,
  defaultOpen = true,
}: DashboardLayoutWrapperProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen} className="h-svh max-h-svh overflow-hidden">
      {/* Botón de accesibilidad: Saltar al contenido */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-md text-xs font-semibold focus:outline-none"
      >
        Saltar al contenido principal
      </a>

      <div className="relative flex h-svh max-h-svh w-full bg-sidebar/40 text-foreground antialiased overflow-hidden selection:bg-primary/10 selection:text-primary">
        <AppSidebar variant="inset" />
        <SidebarInset className="flex flex-col flex-1 min-w-0 h-full md:h-[calc(100svh-1rem)] md:max-h-[calc(100svh-1rem)] border-0 md:border md:border-border/50 bg-background/95 shadow-none md:shadow-sm rounded-none md:rounded-2xl overflow-hidden transition-all duration-200 md:my-2 md:mr-2">
          <AppHeader />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 w-full focus:outline-none"
          >
            <div className="animate-in fade-in-50 duration-300">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

