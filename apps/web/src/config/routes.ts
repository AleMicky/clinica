export const ROUTES = {
  HOME: {
    DASHBOARD: "/dashboard",
    ANALYTICS: "/dashboard/analytics",
  },
  SEGURIDAD: {
    ROOT: "/seguridad",
    USUARIOS: "/seguridad/usuarios",
    ROLES: "/seguridad/roles",
    AUDITORIA: "/seguridad/auditoria",
    SESIONES: "/seguridad/sesiones",
  },
  RECURSOS_HUMANOS: {
    ROOT: "/recursos-humanos",
    EMPLEADOS: "/recursos-humanos/empleados",
    HORARIOS: "/recursos-humanos/horarios",
    ASISTENCIA: "/recursos-humanos/asistencia",
    CONTRATOS: "/recursos-humanos/contratos",
    NOMINA: "/recursos-humanos/nomina",
  },
  PARAMETROS: {
    ROOT: "/parametros",
    GENERAL: "/parametros/general",
    CATALOGOS: "/parametros/catalogos",
    TARIFAS: "/parametros/tarifas",
    NOTIFICACIONES: "/parametros/notificaciones",
    SISTEMA: "/parametros/sistema",
  },
} as const

export type AppRoutes = typeof ROUTES
