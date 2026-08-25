"use client";

import * as React from "react";
import Link from "next/link";
import {
  RefreshCw,
  Search,
  Shield,
  ArrowRight,
  ChevronRight,
  FolderTree,
  LayoutGrid,
  Sparkles,
  X,
  Compass,
  Zap,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useMenuUsuario } from "@/modules/seguridad/opcion-menu/hooks/use-opcion-menu";
import { MenuIcon } from "@/modules/seguridad/opcion-menu/components/opcion-menu-icon-helper";
import type { OpcionMenuTreeResponse } from "@/modules/seguridad/opcion-menu/types/opcion-menu.types";
import { cn } from "@/lib/utils";

/**
 * Representa una acción o pantalla navegable individual
 */
interface NavActionItem {
  id: number;
  codigo: string;
  nombre: string;
  ruta: string;
  icono?: string | null;
  categoria: string;
  categoriaIcono?: string | null;
  descripcion: string;
  theme: ModuleTheme;
}

interface ModuleTheme {
  bgLight: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  borderHover: string;
  ringGlow: string;
}

/**
 * Genera una descripción contextual clara según el nombre o código de la opción
 */
function getOptionDescription(nombre: string, codigo: string, parentName?: string): string {
  const n = nombre.toLowerCase();
  const c = codigo.toLowerCase();

  if (n.includes("admision") || c.includes("adm")) return "Registro de atenciones, pacientes y órdenes médicas ambulatorias.";
  if (n.includes("recepcion") || c.includes("rec")) return "Control de llegada, triaje y recepción de pacientes en clínica.";
  if (n.includes("paciente") || c.includes("pac")) return "Directorio clínico, datos personales e historias médicas.";
  if (n.includes("venta") || c.includes("vta")) return "Facturación electrónica, órdenes de servicio y comprobantes.";
  if (n.includes("cobro") || c.includes("cob")) return "Gestión de cobros, métodos de pago y liquidaciones diarias.";
  if (n.includes("arqueo")) return "Control de balances, conteo físico y cierre de caja.";
  if (n.includes("movimiento")) return "Registro de ingresos y egresos extraordinarios de caja.";
  if (n.includes("turno")) return "Asignación de turnos, apertura y control de cajeros.";
  if (n.includes("caja")) return "Administración de cajas operativas y puntos de recaudo.";
  if (n.includes("tarifario") || n.includes("tarifa")) return "Catálogo de precios de consultas, laboratorios y procedimientos.";
  if (n.includes("servicio") || n.includes("categor")) return "Catálogo estructurado de prestaciones médicas de la clínica.";
  if (n.includes("convenio")) return "Planes de aseguradoras, convenios corporativos y coberturas.";
  if (n.includes("medico") || n.includes("doctor")) return "Directorio médico, especialidades y acuerdos de honorarios.";
  if (n.includes("empleado")) return "Gestión de colaboradores, contratos y asignaciones.";
  if (n.includes("cargo")) return "Estructura de puestos laborales y roles del personal.";
  if (n.includes("especialidad")) return "Especialidades médicas y servicios clínicos ofrecidos.";
  if (n.includes("area") || n.includes("tipo-area")) return "Organización departamental y sectores clínicos.";
  if (n.includes("usuario")) return "Administración de usuarios, accesos y credenciales del sistema.";
  if (n.includes("rol") || n.includes("role")) return "Perfiles de seguridad, permisos y privilegios del sistema.";
  if (n.includes("persona")) return "Padrón central de personas físicas y datos de contacto.";
  if (n.includes("opcion") || n.includes("menu")) return "Gestión jerárquica del árbol de menús y opciones.";
  if (n.includes("parametro") || n.includes("banco") || n.includes("moneda") || n.includes("catalogo") || n.includes("tipo-cambio")) {
    return "Configuración de tablas maestras, monedas y parámetros globales.";
  }

  return parentName ? `Acceso directo y gestión de ${parentName}.` : "Acceso y gestión del módulo del sistema.";
}

/**
 * Obtiene el tema visual basado en la categoría o nombre
 */
function getActionTheme(nombre: string, codigo: string, categoria: string): ModuleTheme {
  const text = `${nombre} ${codigo} ${categoria}`.toLowerCase();

  if (text.includes("rec") || text.includes("admisi") || text.includes("paciente")) {
    return {
      bgLight: "hover:bg-teal-500/[0.04] dark:hover:bg-teal-500/[0.08]",
      iconBg: "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 border-teal-500/20",
      iconColor: "text-teal-600 dark:text-teal-400",
      badgeBg: "bg-teal-50 dark:bg-teal-950/60 border-teal-200/60",
      badgeText: "text-teal-700 dark:text-teal-300",
      borderHover: "hover:border-teal-500/50 hover:shadow-teal-500/5",
      ringGlow: "group-hover:ring-teal-500/20",
    };
  }

  if (text.includes("vta") || text.includes("venta") || text.includes("factura")) {
    return {
      bgLight: "hover:bg-indigo-500/[0.04] dark:hover:bg-indigo-500/[0.08]",
      iconBg: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-500/20",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      badgeBg: "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/60",
      badgeText: "text-indigo-700 dark:text-indigo-300",
      borderHover: "hover:border-indigo-500/50 hover:shadow-indigo-500/5",
      ringGlow: "group-hover:ring-indigo-500/20",
    };
  }

  if (text.includes("caj") || text.includes("caja") || text.includes("cobro") || text.includes("arqueo")) {
    return {
      bgLight: "hover:bg-emerald-500/[0.04] dark:hover:bg-emerald-500/[0.08]",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      badgeBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60",
      badgeText: "text-emerald-700 dark:text-emerald-300",
      borderHover: "hover:border-emerald-500/50 hover:shadow-emerald-500/5",
      ringGlow: "group-hover:ring-emerald-500/20",
    };
  }

  if (text.includes("srv") || text.includes("servicio") || text.includes("tarif") || text.includes("convenio")) {
    return {
      bgLight: "hover:bg-amber-500/[0.04] dark:hover:bg-amber-500/[0.08]",
      iconBg: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      badgeBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-200/60",
      badgeText: "text-amber-700 dark:text-amber-300",
      borderHover: "hover:border-amber-500/50 hover:shadow-amber-500/5",
      ringGlow: "group-hover:ring-amber-500/20",
    };
  }

  if (text.includes("rrhh") || text.includes("empleado") || text.includes("medico") || text.includes("especialidad")) {
    return {
      bgLight: "hover:bg-purple-500/[0.04] dark:hover:bg-purple-500/[0.08]",
      iconBg: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border-purple-500/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      badgeBg: "bg-purple-50 dark:bg-purple-950/60 border-purple-200/60",
      badgeText: "text-purple-700 dark:text-purple-300",
      borderHover: "hover:border-purple-500/50 hover:shadow-purple-500/5",
      ringGlow: "group-hover:ring-purple-500/20",
    };
  }

  if (text.includes("seg") || text.includes("rol") || text.includes("usuario") || text.includes("persona")) {
    return {
      bgLight: "hover:bg-rose-500/[0.04] dark:hover:bg-rose-500/[0.08]",
      iconBg: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/20",
      iconColor: "text-rose-600 dark:text-rose-400",
      badgeBg: "bg-rose-50 dark:bg-rose-950/60 border-rose-200/60",
      badgeText: "text-rose-700 dark:text-rose-300",
      borderHover: "hover:border-rose-500/50 hover:shadow-rose-500/5",
      ringGlow: "group-hover:ring-rose-500/20",
    };
  }

  return {
    bgLight: "hover:bg-blue-500/[0.04] dark:hover:bg-blue-500/[0.08]",
    iconBg: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-50 dark:bg-blue-950/60 border-blue-200/60",
    badgeText: "text-blue-700 dark:text-blue-300",
    borderHover: "hover:border-blue-500/50 hover:shadow-blue-500/5",
    ringGlow: "group-hover:ring-blue-500/20",
  };
}

/**
 * Convierte el árbol de menús en una lista plana de acciones navegables con sus categorías
 */
function extractActionItems(nodes: OpcionMenuTreeResponse[], parentName = ""): NavActionItem[] {
  const items: NavActionItem[] = [];

  for (const node of nodes) {
    const hasChildren = node.hijos && node.hijos.length > 0;

    if (hasChildren) {
      // Si tiene hijos, recursivamente extraemos las pantallas hijas
      const childrenItems = extractActionItems(node.hijos, node.nombre);
      items.push(...childrenItems);
    } else if (node.ruta) {
      // Es una hoja navegable directa
      const categoria = parentName || "General";
      items.push({
        id: node.id,
        codigo: node.codigo,
        nombre: node.nombre,
        ruta: node.ruta,
        icono: node.icono,
        categoria,
        descripcion: getOptionDescription(node.nombre, node.codigo, parentName),
        theme: getActionTheme(node.nombre, node.codigo, categoria),
      });
    }
  }

  return items;
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("TODOS");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const {
    data: menuTree = [],
    isLoading: isMenuLoading,
    refetch: refetchMenu,
  } = useMenuUsuario(isAuthenticated);

  const userName =
    user?.nombreCompleto ||
    (user?.nombres
      ? `${user.nombres} ${user.apellidoPaterno || ""}`.trim()
      : user?.userName ?? "Usuario");

  const userRoles = user?.roles ?? [];

  // Saludo dinámico según la hora del día
  const timeGreeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  // Extraer todas las acciones navegables
  const allActionItems = React.useMemo(() => {
    return extractActionItems(menuTree);
  }, [menuTree]);

  // Lista de categorías únicas con sus conteos
  const categoriesWithCounts = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const item of allActionItems) {
      map.set(item.categoria, (map.get(item.categoria) || 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [allActionItems]);

  // Filtrado de elementos por búsqueda y categoría
  const filteredActions = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return allActionItems.filter((item) => {
      const matchCategory =
        selectedCategory === "TODOS" || item.categoria === selectedCategory;

      if (!matchCategory) return false;
      if (!q) return true;

      return (
        item.nombre.toLowerCase().includes(q) ||
        item.codigo.toLowerCase().includes(q) ||
        item.categoria.toLowerCase().includes(q) ||
        item.descripcion.toLowerCase().includes(q) ||
        item.ruta.toLowerCase().includes(q)
      );
    });
  }, [allActionItems, searchQuery, selectedCategory]);

  // Fecha actual formateada
  const formattedToday = React.useMemo(() => {
    return new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  return (
    <div className="flex-1 space-y-6 w-full max-w-7xl mx-auto animate-in fade-in-50 duration-300">
      {/* ======================================================== */}
      {/* HERO HEADER COMPACTO Y MODERNO */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-r from-primary/10 via-background to-accent/20 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>

              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  {timeGreeting}
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                  <span>{userName}</span>
                  <span className="text-lg">👋</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              {userRoles.map((role) => (
                <Badge
                  key={role}
                  variant="secondary"
                  className="gap-1 px-2.5 py-0.5 text-[11px] font-bold bg-primary/15 text-primary border border-primary/25 rounded-full uppercase tracking-wider shadow-2xs"
                >
                  <Shield className="size-3 shrink-0" />
                  <span>{role}</span>
                </Badge>
              ))}

              <span className="text-muted-foreground/40 hidden sm:inline">•</span>

              <span className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                <Compass className="size-3.5 text-primary/70 shrink-0" />
                <span>{formattedToday}</span>
              </span>
            </div>
          </div>

          {/* Botón sincronizar */}
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchMenu()}
              disabled={isMenuLoading}
              className="h-9 text-xs font-semibold gap-1.5 rounded-xl border-border/80 hover:bg-accent cursor-pointer shadow-2xs bg-background/80 backdrop-blur-xs"
              title="Actualizar permisos y módulos"
            >
              <RefreshCw className={cn("size-3.5 text-muted-foreground", isMenuLoading && "animate-spin text-primary")} />
              <span>Actualizar Menús</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BARRA DE CONTROLES: FILTROS POR CATEGORÍA + BUSCADOR */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Pills / Categorías Rápidas */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory("TODOS")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border",
                selectedCategory === "TODOS"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-muted/50 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground"
              )}
            >
              <LayoutGrid className="size-3.5" />
              <span>Todos</span>
              <Badge
                variant="secondary"
                className={cn(
                  "px-1.5 py-0 text-[10px] font-mono font-bold rounded-full ml-0.5",
                  selectedCategory === "TODOS"
                    ? "bg-white/20 text-white"
                    : "bg-background text-muted-foreground"
                )}
              >
                {allActionItems.length}
              </Badge>
            </button>

            {categoriesWithCounts.map(({ name, count }) => {
              const isSelected = selectedCategory === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedCategory(name)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/50 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span>{name}</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "px-1.5 py-0 text-[10px] font-mono font-bold rounded-full ml-0.5",
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-background text-muted-foreground"
                    )}
                  >
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>

          {/* Buscador interactivo en vivo */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground/70" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar pantalla, módulo o acción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-8 text-xs bg-background rounded-xl border-border/70 shadow-2xs focus-visible:ring-primary/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground p-0.5 rounded-md cursor-pointer transition-colors"
                title="Limpiar búsqueda"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CUADRÍCULA DE TARJETAS DE ACCIÓN DIRECTA (BENTO LAUNCHPAD) */}
      {/* ======================================================== */}
      <div>
        {isMenuLoading ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-border/60 bg-card space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="size-11 rounded-xl" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredActions.length === 0 ? (
          /* Estado Vacío */
          <div className="py-16 px-4 text-center border border-dashed border-border/80 rounded-2xl bg-muted/10 space-y-3.5">
            <div className="size-14 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground/60 shadow-2xs">
              <FolderTree className="size-7" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <p className="font-bold text-sm text-foreground">
                {searchQuery
                  ? "No se encontraron pantallas con ese filtro"
                  : "No tienes pantallas asignadas"}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {searchQuery
                  ? `No se encontró ninguna opción que coincida con "${searchQuery}".`
                  : "Tu rol actual aún no tiene opciones asignadas. Contacta al administrador."}
              </p>
            </div>
            {(searchQuery || selectedCategory !== "TODOS") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("TODOS");
                }}
                className="h-8.5 text-xs font-semibold rounded-xl cursor-pointer shadow-2xs gap-1.5"
              >
                <X className="size-3.5" />
                <span>Restablecer filtros</span>
              </Button>
            )}
          </div>
        ) : (
          /* Cuadrícula de Tarjetas de Acción */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredActions.map((action) => {
              const theme = action.theme;

              return (
                <Link
                  key={action.id}
                  href={action.ruta}
                  className={cn(
                    "group relative p-4.5 rounded-2xl border border-border/70 bg-card transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-md hover:-translate-y-1 cursor-pointer overflow-hidden",
                    theme.borderHover,
                    theme.bgLight
                  )}
                >
                  {/* Top Bar: Icono + Categoría Tag */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div
                      className={cn(
                        "size-11 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-105 shadow-2xs",
                        theme.iconBg
                      )}
                    >
                      <MenuIcon name={action.icono} className="size-5.5" />
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs",
                        theme.badgeBg,
                        theme.badgeText
                      )}
                    >
                      {action.categoria}
                    </Badge>
                  </div>

                  {/* Info: Título + Código + Descripción */}
                  <div className="space-y-1.5 mb-4 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {action.nombre}
                      </h3>
                    </div>

                    <p className="text-[11.5px] text-muted-foreground leading-relaxed line-clamp-2">
                      {action.descripcion}
                    </p>
                  </div>

                  {/* Bottom Footer: Enlace e Indicador de Flecha */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-border/40 text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    <span className="font-mono text-[10px] text-muted-foreground/70 uppercase">
                      {action.codigo}
                    </span>

                    <div className="flex items-center gap-1 text-[11px] text-primary">
                      <span>Ingresar</span>
                      <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}