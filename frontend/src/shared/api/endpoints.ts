export type EntityId = number | string

export type BaseEndpoints = {
    root: string
    byId: (id: EntityId) => string
}

const api = {
    seguridad: '/api/seguridad',
    personas: '/api/personas',
    parametros: '/api/parametros',
    recursosHumanos: '/api/recursos-humanos',
    atencionMedica: '/api/atencion-medica',
    laboratorio: '/api/laboratorio',
    caja: '/api/caja',
    almacen: '/api/almacen',
    compras: '/api/compras',
    farmacia: '/api/farmacia',
    workflow: '/api/workflow',
} as const

export const createEndpoints = <
    T extends Record<string, unknown> = Record<string, never>,
>(
    root: string,
    extra?: (root: string) => T,
): BaseEndpoints & T => {
    const base: BaseEndpoints = {
        root,
        byId: (id: EntityId) => `${root}/${id}`,
    }
    return {
        ...base,
        ...(extra?.(root) ?? {}),
    } as BaseEndpoints & T
}

export const authEndpoints = createEndpoints(`${api.seguridad}/auth`, (root) => ({
    login: `${root}/login`,
    refresh: `${root}/refresh`,
    me: `${root}/me`,
    logout: `${root}/logout`,
    changePassword: `${root}/change-password`,
}))

export const roleEndpoints = createEndpoints(`${api.seguridad}/roles`)

export const userEndpoints = createEndpoints(`${api.seguridad}/users`, (root) => ({
    conPersona: `${root}/con-persona`,
}))

export const catalogoGrupoEndpoints = createEndpoints(
    `${api.parametros}/catalogo-grupos`,
)

export const catalogoItemEndpoints = createEndpoints(`${api.parametros}/catalogo-items`)

export const unidadesMedidaEndpoints = createEndpoints(
    `${api.parametros}/unidades-medida`,
)

export const gestionesEndpoints = createEndpoints(`${api.parametros}/gestiones`)

export const periodosEndpoints = createEndpoints(`${api.parametros}/periodos`)

export const correlativoEndpoints = createEndpoints(
    `${api.parametros}/correlativos`,
    (root) => ({
        generar: `${root}/generar`,
    }),
)

export const personaEndpoints = createEndpoints(`${api.personas}`)

export const pacienteEndpoints = createEndpoints(`${api.personas}/pacientes`)

export const empleadoEndpoints = createEndpoints(`${api.recursosHumanos}/empleados`)

export const medicoEndpoints = createEndpoints(`${api.personas}/medicos`)

export const catalogoClinicoEndpoints = {
    areas: createEndpoints(`${api.recursosHumanos}/areas`),
    especialidades: createEndpoints(`${api.recursosHumanos}/especialidades`),
    profesiones: createEndpoints(`${api.recursosHumanos}/profesiones`),
    cargos: createEndpoints(`${api.recursosHumanos}/cargos`),
    tiposArea: createEndpoints(`${api.recursosHumanos}/tipos-area`),
} as const

export const atencionMedicaEndpoints = {
    atenciones: createEndpoints(`${api.atencionMedica}/atenciones`, (root) => ({
        recepcionar: `${root}/recepcionar`,
        enviarACaja: (id: EntityId) => `${root}/${id}/enviar-a-caja`,
    })),
    tiposAtencion: createEndpoints(`${api.atencionMedica}/tipos-atencion`),
    tiposCampoFormulario: createEndpoints(`${api.atencionMedica}/tipos-campo-formulario`),
    formulariosClinicos: createEndpoints(`${api.atencionMedica}/formularios-clinicos`),
    formularioSecciones: createEndpoints(`${api.atencionMedica}/formulario-secciones`),
    formularioCampos: createEndpoints(`${api.atencionMedica}/formulario-campos`),
    atencionRespuestas: createEndpoints(`${api.atencionMedica}/atencion-respuestas`),
} as const

export const laboratorioEndpoints = {
    especialidades: createEndpoints(`${api.laboratorio}/especialidades`),
    tiposExamen: createEndpoints(`${api.laboratorio}/tipos-examen`),
    pruebas: createEndpoints(`${api.laboratorio}/pruebas`),
    pruebaPrecios: createEndpoints(`${api.laboratorio}/prueba-precios`),
    parametros: createEndpoints(`${api.laboratorio}/parametros`),
    valoresReferencia: createEndpoints(`${api.laboratorio}/valores-referencia`),
    solicitudes: createEndpoints(`${api.laboratorio}/solicitudes`, (root) => ({
        enviarACaja: (id: EntityId) => `${root}/${id}/enviar-a-caja`,
        estado: (id: EntityId) => `${root}/${id}/estado`,
        tomarMuestra: (id: EntityId) => `${root}/${id}/muestras`,
        registrarResultados: (id: EntityId) => `${root}/${id}/resultados`,
    })),
    muestras: createEndpoints(`${api.laboratorio}/muestras`),
    resultados: createEndpoints(`${api.laboratorio}/resultados`, (root) => ({
        validar: (id: EntityId) => `${root}/${id}/validar`,
        entregar: (id: EntityId) => `${root}/${id}/entregar`,
    })),
} as const

export const cajaEndpoints = {
    root: api.caja,
    cajas: createEndpoints(`${api.caja}/cajas`, (root) => ({
        estado: (id: EntityId) => `${root}/${id}/estado`,
    })),
    turnos: createEndpoints(`${api.caja}/turnos`, (root) => ({
        abierto: `${root}/abierto`,
        abrir: `${root}/abrir`,
        cerrar: (id: EntityId) => `${root}/${id}/cerrar`,
        resumen: (id: EntityId) => `${root}/${id}/resumen`,
        arqueo: (id: EntityId) => `${root}/${id}/arqueo`,
    })),
    cuentas: createEndpoints(`${api.caja}/cuentas`, (root) => ({
        cargos: `${root}/cargos`,
        pagos: (id: EntityId) => `${root}/${id}/pagos`,
        anular: (id: EntityId) => `${root}/${id}/anular`,
        byReferencia: (moduloOrigen: string, entidadOrigen: string, referenciaId: EntityId) =>
            `${root}/by-referencia/${moduloOrigen}/${entidadOrigen}/${referenciaId}`,
    })),
    pagos: createEndpoints(`${api.caja}/pagos`, (root) => ({
        anular: (id: EntityId) => `${root}/${id}/anular`,
        recibo: (id: EntityId) => `${root}/${id}/recibo`,
    })),
    movimientos: createEndpoints(`${api.caja}/movimientos`, (root) => ({
        ingreso: `${root}/ingreso`,
        egreso: `${root}/egreso`,
    })),
    metodosPago: createEndpoints(`${api.caja}/metodos-pago`),
    conceptos: createEndpoints(`${api.caja}/conceptos`),
} as const


export const almacenEndpoints = {
    productos: createEndpoints(`${api.almacen}/productos`),
    categorias: createEndpoints(`${api.almacen}/categorias`),
    unidadesMedida: createEndpoints(`${api.almacen}/unidades-medida`),
    formasFarmaceuticas: createEndpoints(`${api.almacen}/formas-farmaceuticas`),
    almacenes: createEndpoints(`${api.almacen}/almacenes`, (root) => ({
        tipos: `${root}/tipos`,
    })),
    movimientos: createEndpoints(`${api.almacen}/movimientos`, (root) => ({
        disponibilidad: (productoId: EntityId) => `${root}/disponibilidad/${productoId}`,
        ingresos: `${root}/ingresos`,
        salidas: `${root}/salidas`,
        ajustes: `${root}/ajustes`,
        bajas: `${root}/bajas`,
        transferencias: `${root}/transferencias`,
        fefo: `${root}/fefo`,
        aplicar: (id: EntityId) => `${root}/${id}/aplicar`,
        anular: (id: EntityId) => `${root}/${id}/anular`,
    })),
    transferencias: createEndpoints(`${api.almacen}/transferencias`, (root) => ({
        solicitar: (id: EntityId) => `${root}/${id}/solicitar`,
        aprobar: (id: EntityId) => `${root}/${id}/aprobar`,
        preparar: (id: EntityId) => `${root}/${id}/preparar`,
        enviar: (id: EntityId) => `${root}/${id}/enviar`,
        recibir: (id: EntityId) => `${root}/${id}/recibir`,
        rechazar: (id: EntityId) => `${root}/${id}/rechazar`,
        anular: (id: EntityId) => `${root}/${id}/anular`,
    })),
    solicitudes: createEndpoints(`${api.almacen}/solicitudes`, (root) => ({
        solicitar: (id: EntityId) => `${root}/${id}/solicitar`,
        aprobar: (id: EntityId) => `${root}/${id}/aprobar`,
        atender: (id: EntityId) => `${root}/${id}/atender`,
        rechazar: (id: EntityId) => `${root}/${id}/rechazar`,
        anular: (id: EntityId) => `${root}/${id}/anular`,
    })),
    inventariosFisicos: createEndpoints(`${api.almacen}/inventarios-fisicos`, (root) => ({
        iniciarConteo: (id: EntityId) => `${root}/${id}/iniciar-conteo`,
        contar: (id: EntityId) => `${root}/${id}/contar`,
        finalizarConteo: (id: EntityId) => `${root}/${id}/finalizar-conteo`,
        aprobar: (id: EntityId) => `${root}/${id}/aprobar`,
        anular: (id: EntityId) => `${root}/${id}/anular`,
    })),
} as const

export const comprasEndpoints = {
    proveedores: createEndpoints(`${api.compras}/proveedores`),
    ordenes: createEndpoints(`${api.compras}/ordenes`, (root) => ({
        confirmar: (id: EntityId) => `${root}/${id}/confirmar`,
        recibir: (id: EntityId) => `${root}/${id}/recibir`,
        anular: (id: EntityId) => `${root}/${id}/anular`,
    })),
} as const

export const farmaciaEndpoints = {
    precios: createEndpoints(`${api.farmacia}/precios`, (root) => ({
        vigente: (productoId: EntityId) => `${root}/vigente/${productoId}`,
    })),
    recetas: createEndpoints(`${api.farmacia}/recetas`, (root) => ({
        anular: (id: EntityId) => `${root}/${id}/anular`,
    })),
    dispensaciones: createEndpoints(`${api.farmacia}/dispensaciones`, (root) => ({
        confirmar: (id: EntityId) => `${root}/${id}/confirmar`,
        anular: (id: EntityId) => `${root}/${id}/anular`,
    })),
} as const

export const workflowEndpoints = {

    definitions: createEndpoints(`${api.workflow}/definitions`),
    customQueries: createEndpoints(`${api.workflow}/custom-queries`),
    states: (definitionId: EntityId) => `${api.workflow}/definitions/${definitionId}/states`,
    stateById: (id: EntityId) => `${api.workflow}/states/${id}`,
    statePosition: (id: EntityId) => `${api.workflow}/states/${id}/position`,
    transitions: (definitionId: EntityId) => `${api.workflow}/definitions/${definitionId}/transitions`,
    transitionById: (id: EntityId) => `${api.workflow}/transitions/${id}`,
    instances: {
        start: `${api.workflow}/instances/start`,
        byId: (id: EntityId) => `${api.workflow}/instances/${id}`,
        byReference: (referenceModule: string, referenceEntity: string, referenceId: EntityId) =>
            `${api.workflow}/instances/by-reference/${referenceModule}/${referenceEntity}/${referenceId}`,
        availableActions: (id: EntityId) => `${api.workflow}/instances/${id}/available-actions`,
        assignees: (id: EntityId) => `${api.workflow}/instances/${id}/assignees`,
        execute: (id: EntityId) => `${api.workflow}/instances/${id}/execute`,
        history: (id: EntityId) => `${api.workflow}/instances/${id}/history`,
    },
} as const