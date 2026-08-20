import {
  Home,
  Shield,
  UserCheck,
  Key,
  FileText,
  Lock,
  Users,
  Briefcase,
  Sliders,
  Settings,
  Database,
  HeartPulse,
  User,
  Coins,
  TrendingUp,
  Scale,
  Building2,
  Network,
  Stethoscope,
  Layers,
  Tag,
  Handshake,
  Landmark,
  Vault,
  ArrowLeftRight,
  Calculator,
  CreditCard,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon?: LucideIcon
  description?: string
  badge?: string | number
  roles?: string[]
}

export interface NavGroup {
  title: string
  icon?: LucideIcon
  description?: string
  items: NavItem[]
}

// 1. Ítems Directos (Sin grupo - Menú Principal directo)
export const directNavItems: NavItem[] = [
  {
    title: "Inicio",
    href: "/dashboard",
    icon: Home,
    description: "Panel principal del sistema",
  },
  {
    title: "Admisiones",
    href: "/recepcion/admisiones",
    icon: FileText,
    description: "Registro de ingresos, atención y detalle de servicios",
  },
  {
    title: "Ventas",
    href: "/ventas",
    icon: Coins,
    description: "Gestión de ventas, comprobantes y detalle de pagadores",
  },
  {
    title: "Cobros",
    href: "/cobros",
    icon: CreditCard,
    description: "Gestión de cobros procesados y comprobantes de pago",
  },
]


// 2. Módulos Agrupados (Núcleos desplegables con sub-menú)
export const recepcionNav: NavGroup = {
  title: "Recepción",
  icon: HeartPulse,
  description: "Expedientes de pacientes y atención médica",
  items: [
    {
      title: "Pacientes",
      href: "/recepcion/pacientes",
      icon: User,
      description: "Registro de expedientes e historias clínicas",
    },
  ],
}

export const serviciosNav: NavGroup = {
  title: "Servicios",
  icon: Stethoscope,
  description: "Categorías, servicios clínicos, tarifarios y convenios",
  items: [
    {
      title: "Categorías y Servicios",
      href: "/servicios/categorias",
      icon: Layers,
      description: "Gestión de categorías y catálogo de prestaciones médicas",
    },
    {
      title: "Tarifarios",
      href: "/servicios/tarifarios",
      icon: Tag,
      description: "Listas de precios vigentes y detalle por servicio",
    },
    {
      title: "Convenios",
      href: "/servicios/convenios",
      icon: Handshake,
      description: "Convenios institucionales y asignación de tarifarios",
    },
  ],
}

export const seguridadNav: NavGroup = {
  title: "Seguridad",
  icon: Shield,
  description: "Personas, usuarios, roles, accesos y auditoría",
  items: [
    {
      title: "Mi Perfil",
      href: "/dashboard/perfil",
      icon: User,
      description: "Información personal y cambio de contraseña",
    },
    {
      title: "Usuarios",
      href: "/seguridad/usuarios",
      icon: Users,
      description: "Gestión de usuarios y cuentas de acceso",
    },
    {
      title: "Personas",
      href: "/seguridad/personas",
      icon: User,
      description: "Directorio general de personas y datos personales",
    },
    {
      title: "Roles y Permisos",
      href: "/seguridad/roles",
      icon: Key,
      description: "Asignación de roles y matriz de permisos",
    },
    {
      title: "Auditoría de Sistema",
      href: "/seguridad/auditoria",
      icon: FileText,
      description: "Registro de actividad y logs de auditoría",
    },
    {
      title: "Sesiones Activas",
      href: "/seguridad/sesiones",
      icon: Lock,
      description: "Monitoreo y control de sesiones activas",
    },
  ],
}

export const recursosHumanosNav: NavGroup = {
  title: "Recursos Humanos",
  icon: Users,
  description: "Empleados, turnos, contratos y asistencia",
  items: [
    {
      title: "Empleados",
      href: "/recursos-humanos/empleados",
      icon: UserCheck,
      description: "Expediente del personal médico y administrativo",
    },
    {
      title: "Médicos",
      href: "/recursos-humanos/medicos",
      icon: HeartPulse,
      description: "Gestión de cuerpo médico, especialidades y acuerdos",
    },
    {
      title: "Cargos",
      href: "/recursos-humanos/cargos",
      icon: Briefcase,
      description: "Administración de cargos y puestos del personal",
    },
    {
      title: "Especialidades",
      href: "/recursos-humanos/especialidades",
      icon: Stethoscope,
      description: "Catálogo de especialidades médicas del personal",
    },
    {
      title: "Tipos de Área",
      href: "/recursos-humanos/tipos-area",
      icon: Building2,
      description: "Clasificación de áreas organizacionales",
    },
    {
      title: "Áreas",
      href: "/recursos-humanos/areas",
      icon: Network,
      description: "Administración jerárquica de áreas",
    },
  ],
}

export const parametrosNav: NavGroup = {
  title: "Parámetros",
  icon: Sliders,
  description: "Catálogos, monedas, tipos de cambio y unidades de medida",
  items: [
    {
      title: "Catálogos",
      href: "/parametros/catalogos",
      icon: Database,
      description: "Especialidades, diagnósticos, servicios y tablas maestras",
    },
    {
      title: "Monedas",
      href: "/parametros/monedas",
      icon: Coins,
      description: "Definición de divisas y monedas de facturación",
    },
    {
      title: "Bancos y Cuentas",
      href: "/parametros/bancos",
      icon: Landmark,
      description: "Entidades bancarias y cuentas de recaudo",
    },
    {
      title: "Tipo de Cambio",
      href: "/parametros/tipo-cambio",
      icon: TrendingUp,
      description: "Histórico y cotización diaria de divisas",
    },
    {
      title: "Unidades de Medida",
      href: "/parametros/unidades-medida",
      icon: Scale,
      description: "Unidades de dosificación, pesaje y mediciones clínicas",
    },
    {
      title: "Configuración General",
      href: "/parametros/general",
      icon: Settings,
      description: "Ajustes globales del sistema",
    },
  ],
}

export const cajasNav: NavGroup = {
  title: "Cajas",
  icon: Vault,
  description: "Administración de cajas y control de turnos",
  items: [
    {
      title: "Puntos de Caja",
      href: "/cajas",
      icon: Vault,
      description: "Catálogo y administración de terminales de cobro",
    },
    {
      title: "Movimientos",
      href: "/cajas/movimientos",
      icon: ArrowLeftRight,
      description: "Registro de ingresos, egresos, retiros y reposiciones",
    },
    {
      title: "Arqueos y Cierres",
      href: "/cajas/arqueos",
      icon: Calculator,
      description: "Conteo físico y conciliación de saldos por turno",
    },
  ],
}

// Categorías organizadas para navegación moderna en acordeón
export interface NavCategory {
  title: string
  items: (NavItem | NavGroup)[]
}

export function isNavGroup(item: NavItem | NavGroup): item is NavGroup {
  return "items" in item && Array.isArray((item as NavGroup).items)
}

export const navCategories: NavCategory[] = [
  {
    title: "Principal",
    items: [
      {
        title: "Inicio",
        href: "/dashboard",
        icon: Home,
        description: "Panel principal del sistema",
      },
      {
        title: "Admisiones",
        href: "/recepcion/admisiones",
        icon: FileText,
        description: "Registro de ingresos, atención y detalle de servicios",
      },
    ],
  },
  {
    title: "Clínica & Servicios",
    items: [
      recepcionNav,
      serviciosNav,
    ],
  },
  {
    title: "Caja & Ventas",
    items: [
      {
        title: "Ventas",
        href: "/ventas",
        icon: Coins,
        description: "Gestión de ventas, comprobantes y detalle de pagadores",
      },
      {
        title: "Cobros",
        href: "/cobros",
        icon: CreditCard,
        description: "Gestión de cobros procesados y comprobantes de pago",
      },
      cajasNav,
    ],
  },
  {
    title: "Gestión Humana",
    items: [
      recursosHumanosNav,
    ],
  },
  {
    title: "Configuración & Sistema",
    items: [
      seguridadNav,
      parametrosNav,
    ],
  },
]

// Módulos agrupados (compatibilidad)
export const moduleGroups: NavGroup[] = [
  recepcionNav,
  cajasNav,
  serviciosNav,
  seguridadNav,
  recursosHumanosNav,
  parametrosNav,
]

// Exportación consolidada
export const navigationConfig = {
  directNavItems,
  moduleGroups,
  navCategories,
  recepcion: recepcionNav,
  cajas: cajasNav,
  servicios: serviciosNav,
  seguridad: seguridadNav,
  recursosHumanos: recursosHumanosNav,
  parametros: parametrosNav,
}

export default navigationConfig


