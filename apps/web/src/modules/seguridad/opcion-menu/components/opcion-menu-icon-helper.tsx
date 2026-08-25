"use client";

import * as React from "react";
import {
  Activity,
  Archive,
  ArrowLeftRight,
  BarChart,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  CheckCircle,
  CheckSquare,
  CircleDot,
  ClipboardList,
  Clock,
  Coins,
  CreditCard,
  Database,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderKanban,
  FolderTree,
  Gauge,
  Grid,
  Handshake,
  HeartPulse,
  History,
  Home,
  Inbox,
  Key,
  Landmark,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  ListTree,
  Lock,
  Menu,
  MessageSquare,
  Network,
  Package,
  PieChart,
  Receipt,
  Scale,
  Settings,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  Table,
  Tag,
  Tags,
  TrendingUp,
  Truck,
  User,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  Vault,
  Wallet,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export interface IconOption {
  name: string;
  label: string;
  category: "seguridad" | "clinica" | "finanzas" | "general" | "configuracion";
  icon: LucideIcon;
}

export const POPULAR_MENU_ICONS: IconOption[] = [
  // Seguridad & Acceso
  { name: "Shield", label: "Escudo / Seguridad", category: "seguridad", icon: Shield },
  { name: "ShieldCheck", label: "Seguridad Verificada", category: "seguridad", icon: ShieldCheck },
  { name: "ShieldAlert", label: "Alerta Seguridad", category: "seguridad", icon: ShieldAlert },
  { name: "Key", label: "Llave / Permisos", category: "seguridad", icon: Key },
  { name: "Lock", label: "Candado / Bloqueo", category: "seguridad", icon: Lock },
  { name: "User", label: "Usuario", category: "seguridad", icon: User },
  { name: "Users", label: "Grupo de Usuarios", category: "seguridad", icon: Users },
  { name: "UserCheck", label: "Usuario Verificado", category: "seguridad", icon: UserCheck },
  { name: "UserCog", label: "Ajustes de Usuario", category: "seguridad", icon: UserCog },
  { name: "UserPlus", label: "Nuevo Usuario", category: "seguridad", icon: UserPlus },
  { name: "History", label: "Historial / Auditoría", category: "seguridad", icon: History },

  // Clínica & Salud
  { name: "HeartPulse", label: "Atención Médica", category: "clinica", icon: HeartPulse },
  { name: "Stethoscope", label: "Estetoscopio / Consulta", category: "clinica", icon: Stethoscope },
  { name: "Activity", label: "Signos / Actividad", category: "clinica", icon: Activity },
  { name: "FileText", label: "Expediente / Documento", category: "clinica", icon: FileText },
  { name: "FileCheck", label: "Ficha Validada", category: "clinica", icon: FileCheck },
  { name: "ClipboardList", label: "Lista de Tareas", category: "clinica", icon: ClipboardList },

  // Finanzas & Cajas
  { name: "Coins", label: "Monedas / Ventas", category: "finanzas", icon: Coins },
  { name: "CreditCard", label: "Tarjeta de Crédito", category: "finanzas", icon: CreditCard },
  { name: "Landmark", label: "Banco / Entidad", category: "finanzas", icon: Landmark },
  { name: "Vault", label: "Bóveda / Caja", category: "finanzas", icon: Vault },
  { name: "Calculator", label: "Calculadora / Arqueo", category: "finanzas", icon: Calculator },
  { name: "Receipt", label: "Recibo / Comprobante", category: "finanzas", icon: Receipt },
  { name: "Wallet", label: "Billetera / Saldo", category: "finanzas", icon: Wallet },
  { name: "TrendingUp", label: "Tendencias / Tarifas", category: "finanzas", icon: TrendingUp },
  { name: "Scale", label: "Balanza / Cuadre", category: "finanzas", icon: Scale },
  { name: "ArrowLeftRight", label: "Transferencia / Movimientos", category: "finanzas", icon: ArrowLeftRight },

  // Configuración & Catálogos
  { name: "Settings", label: "Configuración", category: "configuracion", icon: Settings },
  { name: "Settings2", label: "Ajustes Avanzados", category: "configuracion", icon: Settings2 },
  { name: "Sliders", label: "Parámetros", category: "configuracion", icon: Sliders },
  { name: "SlidersHorizontal", label: "Filtros de Parámetros", category: "configuracion", icon: SlidersHorizontal },
  { name: "Database", label: "Base de Datos", category: "configuracion", icon: Database },
  { name: "Layers", label: "Capas / Categorías", category: "configuracion", icon: Layers },
  { name: "Boxes", label: "Módulos / Paquetes", category: "configuracion", icon: Boxes },
  { name: "Tag", label: "Etiqueta", category: "configuracion", icon: Tag },
  { name: "Tags", label: "Catálogos / Precios", category: "configuracion", icon: Tags },
  { name: "Network", label: "Red / Áreas", category: "configuracion", icon: Network },
  { name: "Workflow", label: "Flujos de Trabajo", category: "configuracion", icon: Workflow },

  // General & Navegación
  { name: "Home", label: "Inicio", category: "general", icon: Home },
  { name: "LayoutDashboard", label: "Tablero de Control", category: "general", icon: LayoutDashboard },
  { name: "LayoutGrid", label: "Módulos del Sistema", category: "general", icon: LayoutGrid },
  { name: "ListTree", label: "Árbol de Opciones", category: "general", icon: ListTree },
  { name: "Menu", label: "Menú", category: "general", icon: Menu },
  { name: "Folder", label: "Carpeta", category: "general", icon: Folder },
  { name: "FolderTree", label: "Estructura de Carpetas", category: "general", icon: FolderTree },
  { name: "FolderKanban", label: "Proyectos / Áreas", category: "general", icon: FolderKanban },
  { name: "Building2", label: "Edificio / Empresa", category: "general", icon: Building2 },
  { name: "Briefcase", label: "Cargos / Empleos", category: "general", icon: Briefcase },
  { name: "Handshake", label: "Convenios / Acuerdos", category: "general", icon: Handshake },
  { name: "BarChart3", label: "Reportes y Gráficos", category: "general", icon: BarChart3 },
  { name: "PieChart", label: "Estadísticas", category: "general", icon: PieChart },
  { name: "Calendar", label: "Calendario / Turnos", category: "general", icon: Calendar },
  { name: "Clock", label: "Horarios / Tiempo", category: "general", icon: Clock },
  { name: "Bell", label: "Notificaciones", category: "general", icon: Bell },
  { name: "Sparkles", label: "Especiales", category: "general", icon: Sparkles },
];

const ICONS_MAP = new Map<string, LucideIcon>();
POPULAR_MENU_ICONS.forEach((item) => {
  ICONS_MAP.set(item.name.toLowerCase(), item.icon);
});

export function getMenuLucideIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return CircleDot;
  const normalized = iconName.trim().toLowerCase();
  return ICONS_MAP.get(normalized) || CircleDot;
}

interface MenuIconProps {
  name?: string | null;
  className?: string;
  fallbackIcon?: LucideIcon;
}

export function MenuIcon({
  name,
  className = "size-4",
  fallbackIcon = CircleDot,
}: MenuIconProps) {
  if (!name) {
    const Fallback = fallbackIcon;
    return <Fallback className={className} />;
  }

  const IconComponent = getMenuLucideIcon(name);
  return <IconComponent className={className} />;
}
