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
    MEDICOS: "/recursos-humanos/medicos",
    MEDICO_DETALLE: (id: number | string) => `/recursos-humanos/medicos/${id}`,
    ASIGNACIONES_EMPLEADO: "/recursos-humanos/asignaciones-empleado",
    CARGOS: "/recursos-humanos/cargos",
    ESPECIALIDADES: "/recursos-humanos/especialidades",
    TIPOS_AREA: "/recursos-humanos/tipos-area",
    AREAS: "/recursos-humanos/areas",
  },
  PARAMETROS: {
    ROOT: "/parametros",
    CATALOGOS: "/parametros/catalogos",
    MONEDAS: "/parametros/monedas",
    BANCOS: "/parametros/bancos",
    TIPO_CAMBIO: "/parametros/tipo-cambio",
    UNIDADES_MEDIDA: "/parametros/unidades-medida",
    GENERAL: "/parametros/general",
  },
  CAJAS: {
    ROOT: "/cajas",
    TURNOS: "/cajas/turnos",
    MOVIMIENTOS: "/cajas/movimientos",
    ARQUEOS: "/cajas/arqueos",
    COBROS: "/cajas/cobros",
  },
} as const

export type AppRoutes = typeof ROUTES
