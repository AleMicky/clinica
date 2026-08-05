"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { navigationConfig } from "@/config/navigation";

// Mapa de títulos conocidos para convertir slugs en títulos legibles
const titleMap: Record<string, string> = {
  dashboard: "Inicio",
  pacientes: "Pacientes",
  citas: "Citas Médicas",
  medicos: "Directorio Médico",
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
  horarios: "Horarios y Turnos",
  asistencia: "Control de Asistencia",
  contratos: "Contratos y Licencias",
  nomina: "Nómina y Pagos",
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
            <BreadcrumbPage className="flex items-center gap-1 font-medium text-xs">
              <Home className="h-3.5 w-3.5" />
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

    // Obtener título bonito
    let title = titleMap[segment];
    if (!title) {
      // Capitalizar si es dinámico o desconocido
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
      <BreadcrumbList className="text-xs sm:text-sm">
        {/* Enlace Inicio siempre visible */}
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/dashboard" className="flex items-center gap-1.5" />}>
            <Home className="h-3.5 w-3.5 text-muted-foreground" />
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
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {item.isLast ? (
                  <BreadcrumbPage className="font-semibold text-foreground">
                    {item.title}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={item.url} />}>
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
