"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pacientes": "Pacientes",
  "/citas": "Citas Médicas",
  "/medicos": "Directorio Médico",
  "/reportes": "Reportes",
  "/configuracion": "Configuración",
  "/perfil": "Mi Perfil",
};

export function AppHeader() {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (pageTitles[path]) return pageTitles[path];
    const match = Object.keys(pageTitles).find((key) => path.startsWith(key));
    if (match) return pageTitles[match];
    return "Documents";
  };

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-sm font-medium text-foreground">
          {getPageTitle(pathname)}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex text-xs font-normal dark:text-foreground text-muted-foreground hover:text-foreground"
            />
          }
        >
          GitHub
        </Button>
      </div>
    </header>
  );
}
