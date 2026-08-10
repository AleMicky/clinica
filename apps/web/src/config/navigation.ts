import {
  Home,
  Shield,
  UserCheck,
  Key,
  FileText,
  Lock,
  Users,
  Calendar,
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
  Building2,
  Network,
  Stethoscope,
  Layers,
  Tag,
  Handshake,
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
  recepcionNav,
  serviciosNav,
  seguridadNav,
  recursosHumanosNav,
  parametrosNav,
]

// Exportación consolidada
export const navigationConfig = {
  directNavItems,
  moduleGroups,
  recepcion: recepcionNav,
  servicios: serviciosNav,
  seguridad: seguridadNav,
  recursosHumanos: recursosHumanosNav,
  parametros: parametrosNav,
}

export default navigationConfig


