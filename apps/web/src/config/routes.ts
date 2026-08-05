export const ROUTES = {
  HOME: {
    DASHBOARD: "/dashboard",
    ANALYTICS: "/dashboard/analytics",
  },
  SEGURIDAD: {
    ROOT: "/seguridad",
    PERSONAS: "/seguridad/personas",
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
    CATALOGOS: "/parametros/catalogos",
    MONEDAS: "/parametros/monedas",
    TIPO_CAMBIO: "/parametros/tipo-cambio",
    UNIDADES_MEDIDA: "/parametros/unidades-medida",
    GENERAL: "/parametros/general",
  },
} as const

export type AppRoutes = typeof ROUTES
