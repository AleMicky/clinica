"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard General",
  "/pacientes": "Gestión de Pacientes",
  "/citas": "Agenda y Citas Médicas",
  "/medicos": "Directorio Médico",
  "/reportes": "Reportes y Estadísticas",
  "/configuracion": "Configuración del Sistema",
  "/perfil": "Mi Perfil",
};

export function AppHeader() {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (pageTitles[path]) return pageTitles[path];
    const match = Object.keys(pageTitles).find((key) => path.startsWith(key));
    if (match) return pageTitles[match];
    return "Sistema de Gestión Clínica";
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/95 px-6 backdrop-blur-sm transition-all">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          {getPageTitle(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar paciente, cita..."
            className="pl-9 h-9 text-sm bg-muted/40"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="size-5" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-primary" />
          <span className="sr-only">Notificaciones</span>
        </Button>
      </div>
    </header>
  );
}
