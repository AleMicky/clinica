export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
  },
  HOME: {
    DASHBOARD: "/dashboard",
    ANALYTICS: "/dashboard/analytics",
    PERFIL: "/dashboard/perfil",
  },
  RECEPCION: {
    ROOT: "/recepcion",
    PACIENTES: "/recepcion/pacientes",
    ADMISIONES: "/recepcion/admisiones",
  },
  SERVICIOS: {
    ROOT: "/servicios",
    CATEGORIAS: "/servicios/categorias",
    TARIFARIOS: "/servicios/tarifarios",
    CONVENIOS: "/servicios/convenios",
  },
  SEGURIDAD: {
    ROOT: "/seguridad",
    PERSONAS: "/seguridad/personas",
    USUARIOS: "/seguridad/usuarios",
    ROLES: "/seguridad/roles",
    OPCIONES_MENU: "/seguridad/opciones-menu",
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
    METODOS_PAGO: "/parametros/metodos-pago",
    BANCOS: "/parametros/bancos",
    TIPO_CAMBIO: "/parametros/tipo-cambio",
    UNIDADES_MEDIDA: "/parametros/unidades-medida",
    GENERAL: "/parametros/general",
  },
  CAJA: {
    ROOT: "/caja",
    CONFIGURACION: {
      ROOT: "/caja/configuracion",
      CAJAS: "/caja/configuracion/cajas",
    },
    TURNOS: "/caja/turnos",
    MOVIMIENTOS: "/caja/movimientos",
    ARQUEOS: "/caja/arqueos",
    ARQUEOS_NUEVO: "/caja/arqueos/nuevo",
    COBROS: "/caja/cobros",
  },
  VENTAS: {
    ROOT: "/ventas",
  },
  ALMACENES: {
    ROOT: "/almacenes",
    CATEGORIAS_PRODUCTO: "/almacenes/categorias-producto",
  },
} as const;

export type AppRoutes = typeof ROUTES;

