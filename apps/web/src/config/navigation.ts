import {
  Home,
  Shield,
  UserCheck,
  Key,
  FileText,
  Lock,
  Users,
  Calendar,
  Clock,
  FileSpreadsheet,
  Briefcase,
  Sliders,
  Settings,
  Database,
  FileBarChart,
  HeartPulse,
  User,
  Coins,
  TrendingUp,
  Scale,
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
    title: "Pacientes",
    href: "/pacientes",
    icon: HeartPulse,
    description: "Gestión de expedientes y registros de pacientes",
  },
  {
    title: "Citas Médicas",
    href: "/citas",
    icon: Calendar,
    description: "Agenda y programación de consultas",
  },
  {
    title: "Reportes",
    href: "/reportes",
    icon: FileBarChart,
    description: "Informes y estadísticas operativas",
  },
]

// 2. Módulos Agrupados (Núcleos desplegables con sub-menú)
export const seguridadNav: NavGroup = {
  title: "Seguridad",
  icon: Shield,
  description: "Personas, usuarios, roles, accesos y auditoría",
  items: [
    {
      title: "Personas",
      href: "/seguridad/personas",
      icon: User,
      description: "Directorio general de personas y datos personales",
    },
    {
      title: "Usuarios",
      href: "/seguridad/usuarios",
      icon: Users,
      description: "Gestión de usuarios y cuentas de acceso",
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
      title: "Personal / Empleados",
      href: "/recursos-humanos/empleados",
      icon: UserCheck,
      description: "Expediente del personal médico y administrativo",
    },
    {
      title: "Horarios y Turnos",
      href: "/recursos-humanos/horarios",
      icon: Calendar,
      description: "Programación de turnos y asignación de horarios",
    },
    {
      title: "Control de Asistencia",
      href: "/recursos-humanos/asistencia",
      icon: Clock,
      description: "Registro de entradas, salidas y fichajes",
    },
    {
      title: "Contratos y Licencias",
      href: "/recursos-humanos/contratos",
      icon: Briefcase,
      description: "Gestión de contratos, vacantes y permisos",
    },
    {
      title: "Nómina y Pagos",
      href: "/recursos-humanos/nomina",
      icon: FileSpreadsheet,
      description: "Resumen de honorarios y pagos al personal",
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

// Módulos agrupados
export const moduleGroups: NavGroup[] = [
  seguridadNav,
  recursosHumanosNav,
  parametrosNav,
]

// Exportación consolidada
export const navigationConfig = {
  directNavItems,
  moduleGroups,
  seguridad: seguridadNav,
  recursosHumanos: recursosHumanosNav,
  parametros: parametrosNav,
}

export default navigationConfig
