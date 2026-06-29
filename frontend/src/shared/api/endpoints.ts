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

export const userEndpoints = createEndpoints(`${api.seguridad}/users`)

export const catalogoGrupoEndpoints = createEndpoints(
    `${api.parametros}/catalogo-grupos`,
)

export const personaEndpoints = createEndpoints(`${api.personas}`)

export const catalogoItemEndpoints = createEndpoints(`${api.parametros}/catalogo-items`)

export const pacienteEndpoints = createEndpoints(`${api.personas}/pacientes`)

export const empleadoEndpoints = createEndpoints(`${api.personas}/empleados`)

export const medicoEndpoints = createEndpoints(`${api.personas}/medicos`)

export const catalogoClinicoEndpoints = {
    areas: createEndpoints(`${api.recursosHumanos}/areas`, (root) => ({
        departamentos: (id: EntityId) => `${root}/${id}/departamentos`,
    })),
    departamentos: createEndpoints(`${api.recursosHumanos}/departamentos`, (root) => ({
        servicios: (id: EntityId) => `${root}/${id}/servicios`,
    })),
    servicios: createEndpoints(`${api.recursosHumanos}/servicios`, (root) => ({
        prestaciones: (id: EntityId) => `${root}/${id}/prestaciones`,
    })),
    prestaciones: createEndpoints(`${api.recursosHumanos}/prestaciones`),
    especialidades: createEndpoints(`${api.recursosHumanos}/especialidades`),
    profesiones: createEndpoints(`${api.recursosHumanos}/profesiones`),
    cargos: createEndpoints(`${api.recursosHumanos}/cargos`),
} as const

export const atencionMedicaEndpoints = {
    atenciones: createEndpoints(`${api.atencionMedica}/atenciones`),
    tiposAtencion: createEndpoints(`${api.atencionMedica}/tipos-atencion`),
    tiposCampoFormulario: createEndpoints(`${api.atencionMedica}/tipos-campo-formulario`),
    formulariosClinicos: createEndpoints(`${api.atencionMedica}/formularios-clinicos`),
    formularioSecciones: createEndpoints(`${api.atencionMedica}/formulario-secciones`),
    formularioCampos: createEndpoints(`${api.atencionMedica}/formulario-campos`),
    atencionRespuestas: createEndpoints(`${api.atencionMedica}/atencion-respuestas`),
    diagnosticos: createEndpoints(`${api.atencionMedica}/diagnosticos`),
    diagnosticoAtenciones: createEndpoints(`${api.atencionMedica}/diagnostico-atenciones`),
    signosVitales: createEndpoints(`${api.atencionMedica}/signos-vitales`),
    tratamientos: createEndpoints(`${api.atencionMedica}/tratamientos`),
    estudios: createEndpoints(`${api.atencionMedica}/estudios`),
    resultadosEstudio: createEndpoints(`${api.atencionMedica}/resultados-estudio`),
    interconsultas: createEndpoints(`${api.atencionMedica}/interconsultas`),
    prescripciones: createEndpoints(`${api.atencionMedica}/prescripciones`),
    prescripcionDetalles: createEndpoints(`${api.atencionMedica}/prescripcion-detalles`),
    recepcion: createEndpoints(`${api.atencionMedica}/recepcion`, (root) => ({
        pendientes: `${root}/pendientes`,
    })),
} as const

export const workflowEndpoints = {
    definitions: createEndpoints(`${api.workflow}/definitions`),
    states: (definitionId: EntityId) => `${api.workflow}/definitions/${definitionId}/states`,
    stateById: (id: EntityId) => `${api.workflow}/states/${id}`,
    transitions: (definitionId: EntityId) => `${api.workflow}/definitions/${definitionId}/transitions`,
    transitionById: (id: EntityId) => `${api.workflow}/transitions/${id}`,
    instances: {
        start: `${api.workflow}/instances/start`,
        byId: (id: EntityId) => `${api.workflow}/instances/${id}`,
        byReference: (referenceModule: string, referenceEntity: string, referenceId: EntityId) =>
            `${api.workflow}/instances/by-reference/${referenceModule}/${referenceEntity}/${referenceId}`,
        availableActions: (id: EntityId) => `${api.workflow}/instances/${id}/available-actions`,
        execute: (id: EntityId) => `${api.workflow}/instances/${id}/execute`,
        history: (id: EntityId) => `${api.workflow}/instances/${id}/history`,
    },
} as const