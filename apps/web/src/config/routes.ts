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
    CARGOS: "/recursos-humanos/cargos",
    ESPECIALIDADES: "/recursos-humanos/especialidades",
    TIPOS_AREA: "/recursos-humanos/tipos-area",
    AREAS: "/recursos-humanos/areas",
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
