"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Mapa de títulos conocidos para convertir slugs en títulos legibles
const titleMap: Record<string, string> = {
  dashboard: "Inicio",
  recepcion: "Recepción",
  pacientes: "Pacientes",
  admisiones: "Admisiones",
  citas: "Citas Médicas",
  medicos: "Directorio Médico",
  servicios: "Servicios Clínicos",
  categorias: "Categorías",
  tarifarios: "Tarifarios",
  convenios: "Convenios",
  reportes: "Reportes",
  configuracion: "Configuración",
  perfil: "Mi Perfil",
  seguridad: "Seguridad",
  personas: "Personas",
  usuarios: "Usuarios",
  roles: "Roles y Permisos",
  auditoria: "Auditoría de Sistema",
  sesiones: "Sesiones Activas",
  "recursos-humanos": "Recursos Humanos",
  empleados: "Personal / Empleados",
  cargos: "Cargos y Puestos",
  especialidades: "Especialidades",
  "tipos-area": "Tipos de Área",
  areas: "Áreas Organigramas",
  parametros: "Parámetros",
  catalogos: "Catálogos",
  monedas: "Monedas",
  "tipo-cambio": "Tipo de Cambio",
  "unidades-medida": "Unidades de Medida",
  general: "Configuración General",
};

export function AppBreadcrumbs() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-1 font-semibold text-xs text-foreground">
              <Home className="h-3.5 w-3.5 text-primary" />
              <span>Inicio</span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Generar rutas intermedias
  const breadcrumbItems = segments.map((segment, index) => {
    const url = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;

    let title = titleMap[segment];
    if (!title) {
      title = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    return {
      title,
      url,
      isLast,
    };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs font-medium text-muted-foreground flex-nowrap overflow-hidden">
        {/* Enlace Inicio siempre visible */}
        <BreadcrumbItem>
          <BreadcrumbLink
            render={
              <Link
                href="/dashboard"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              />
            }
          >
            <Home className="h-3.5 w-3.5 text-muted-foreground/80 hover:text-primary transition-colors" />
            <span className="hidden sm:inline">Inicio</span>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbItems.map((item, idx) => {
          // Evitar duplicar "Inicio" si el primer segmento es "dashboard"
          if (idx === 0 && segments[0] === "dashboard") {
            return null;
          }

          return (
            <React.Fragment key={item.url}>
              <BreadcrumbSeparator className="text-muted-foreground/40">
                <ChevronRight className="size-3" />
              </BreadcrumbSeparator>
              <BreadcrumbItem className="truncate max-w-[140px] sm:max-w-[200px]">
                {item.isLast ? (
                  <BreadcrumbPage className="font-semibold text-foreground truncate">
                    {item.title}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={
                      <Link
                        href={item.url}
                        className="hover:text-foreground transition-colors truncate"
                      />
                    }
                  >
                    {item.title}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
