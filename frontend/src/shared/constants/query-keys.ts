import type { PagedQuery } from '../types/pagination.types'

type EntityId = string

export const queryKeys = {
    auth: {
        all: ['auth'] as const,
        me: ['auth', 'me'] as const,
    },
    roles: {
        all: ['roles'] as const,
        list: (query: PagedQuery) => ['roles', 'list', query] as const,
        detail: (id: EntityId) => ['roles', 'detail', id] as const,
    },
    users: {
        all: ['users'] as const,
        list: (query: PagedQuery) => ['users', 'list', query] as const,
        detail: (id: EntityId) => ['users', 'detail', id] as const,
    },
    catalogoGrupos: {
        all: ['catalogo-grupos'] as const,
        list: (query: PagedQuery) => ['catalogo-grupos', 'list', query] as const,
        detail: (id: EntityId) => ['catalogo-grupos', 'detail', id] as const,
        items: (grupoId: EntityId) =>
            ['catalogo-grupos', grupoId, 'items'] as const,
    },
    catalogoItems: {
        all: ['catalogo-items'] as const,
    },
    personas: {
        all: ['personas'] as const,
        lookup: ['personas', 'lookup'] as const,
        list: (query: PagedQuery & Record<string, unknown>) =>
            ['personas', 'list', query] as const,
        detail: (id: EntityId) => ['personas', 'detail', id] as const,
    },
    pacientes: {
        all: ['pacientes'] as const,
        list: (query: PagedQuery) => ['pacientes', 'list', query] as const,
        detail: (id: EntityId) => ['pacientes', 'detail', id] as const,
    },
    empleados: {
        all: ['empleados'] as const,
        lookup: ['empleados', 'lookup'] as const,
        list: (query: PagedQuery & Record<string, unknown>) =>
            ['empleados', 'list', query] as const,
        detail: (id: EntityId) => ['empleados', 'detail', id] as const,
    },
    medicos: {
        all: ['medicos'] as const,
        list: (query: PagedQuery & Record<string, unknown>) =>
            ['medicos', 'list', query] as const,
        detail: (id: EntityId) => ['medicos', 'detail', id] as const,
    },
    recursosHumanos: {
        jerarquia: {
            all: ['recursos-humanos', 'jerarquia'] as const,
            tree: (includeCounts?: boolean) =>
                ['recursos-humanos', 'jerarquia', { includeCounts: !!includeCounts }] as const,
        },
    },
    catalogoClinico: {
        all: ['catalogo-clinico'] as const,
        areas: {
            all: ['catalogo-clinico', 'areas'] as const,
            list: (query: PagedQuery) =>
                ['catalogo-clinico', 'areas', 'list', query] as const,
            departamentos: (id: EntityId) =>
                ['catalogo-clinico', 'areas', id, 'departamentos'] as const,
        },
        departamentos: {
            all: ['catalogo-clinico', 'departamentos'] as const,
            list: (query: PagedQuery) =>
                ['catalogo-clinico', 'departamentos', 'list', query] as const,
            servicios: (id: EntityId) =>
                ['catalogo-clinico', 'departamentos', id, 'servicios'] as const,
        },
        servicios: {
            all: ['catalogo-clinico', 'servicios'] as const,
            list: (query: PagedQuery) =>
                ['catalogo-clinico', 'servicios', 'list', query] as const,
            prestaciones: (id: EntityId) =>
                ['catalogo-clinico', 'servicios', id, 'prestaciones'] as const,
        },
        prestaciones: {
            all: ['catalogo-clinico', 'prestaciones'] as const,
            list: (query: PagedQuery) =>
                ['catalogo-clinico', 'prestaciones', 'list', query] as const,
        },
        especialidades: {
            all: ['catalogo-clinico', 'especialidades'] as const,
            list: (query: PagedQuery) =>
                ['catalogo-clinico', 'especialidades', 'list', query] as const,
        },
        profesiones: {
            all: ['catalogo-clinico', 'profesiones'] as const,
            list: (query: PagedQuery) =>
                ['catalogo-clinico', 'profesiones', 'list', query] as const,
        },
        cargos: {
            all: ['catalogo-clinico', 'cargos'] as const,
            list: (query: PagedQuery) =>
                ['catalogo-clinico', 'cargos', 'list', query] as const,
        },
    },
    atencionMedica: {
        all: ['atencion-medica'] as const,
        atenciones: {
            all: ['atencion-medica', 'atenciones'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['atencion-medica', 'atenciones', 'list', query] as const,
            detail: (id: string) =>
                ['atencion-medica', 'atenciones', 'detail', id] as const,
        },
        tiposAtencion: {
            all: ['atencion-medica', 'tipos-atencion'] as const,
            list: (query: PagedQuery) =>
                ['atencion-medica', 'tipos-atencion', 'list', query] as const,
        },
        formulariosClinicos: {
            all: ['atencion-medica', 'formularios-clinicos'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['atencion-medica', 'formularios-clinicos', 'list', query] as const,
        },
        tiposCampoFormulario: {
            all: ['atencion-medica', 'tipos-campo-formulario'] as const,
            list: (query: PagedQuery) =>
                ['atencion-medica', 'tipos-campo-formulario', 'list', query] as const,
        },
        formularioSecciones: {
            all: ['atencion-medica', 'formulario-secciones'] as const,
        },
        formularioCampos: {
            all: ['atencion-medica', 'formulario-campos'] as const,
        },
        atencionRespuestas: {
            all: ['atencion-medica', 'atencion-respuestas'] as const,
        },
        pacientesLookup: {
            all: ['atencion-medica', 'pacientes-lookup'] as const,
            list: (query: PagedQuery) =>
                ['atencion-medica', 'pacientes-lookup', 'list', query] as const,
        },
        especialidadesLookup: {
            all: ['atencion-medica', 'especialidades-lookup'] as const,
            list: (query: PagedQuery) =>
                ['atencion-medica', 'especialidades-lookup', 'list', query] as const,
        },
        diagnosticos: {
            all: ['atencion-medica', 'diagnosticos'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['atencion-medica', 'diagnosticos', 'list', query] as const,
        },
        diagnosticoAtenciones: {
            all: ['atencion-medica', 'diagnostico-atenciones'] as const,
        },
        signosVitales: {
            all: ['atencion-medica', 'signos-vitales'] as const,
        },
        tratamientos: {
            all: ['atencion-medica', 'tratamientos'] as const,
        },
        estudios: {
            all: ['atencion-medica', 'estudios'] as const,
        },
        resultadosEstudio: {
            all: ['atencion-medica', 'resultados-estudio'] as const,
        },
        interconsultas: {
            all: ['atencion-medica', 'interconsultas'] as const,
        },
        prescripciones: {
            all: ['atencion-medica', 'prescripciones'] as const,
        },
        recepcion: {
            all: ['atencion-medica', 'recepcion'] as const,
            pendientes: ['atencion-medica', 'recepcion', 'pendientes'] as const,
            formulario: (tipoAtencionId: string) =>
                ['atencion-medica', 'recepcion', 'formulario', tipoAtencionId] as const,
            detail: (id: string) =>
                ['atencion-medica', 'recepcion', 'detail', id] as const,
        },
        prescripcionDetalles: {
            all: ['atencion-medica', 'prescripcion-detalles'] as const,
        },
    },
    workflow: {
        all: ['workflow'] as const,
        definitions: {
            all: ['workflow', 'definitions'] as const,
            list: (query: PagedQuery) => ['workflow', 'definitions', 'list', query] as const,
            detail: (id: EntityId) => ['workflow', 'definitions', 'detail', id] as const,
        },
        states: {
            all: ['workflow', 'states'] as const,
            byDefinition: (definitionId: EntityId) =>
                ['workflow', 'states', definitionId] as const,
        },
        transitions: {
            all: ['workflow', 'transitions'] as const,
            byDefinition: (definitionId: EntityId) =>
                ['workflow', 'transitions', definitionId] as const,
        },
        instances: {
            all: ['workflow', 'instances'] as const,
            detail: (id: EntityId) => ['workflow', 'instances', 'detail', id] as const,
            byReference: (referenceModule: string, referenceEntity: string, referenceId: EntityId) =>
                ['workflow', 'instances', 'reference', referenceModule, referenceEntity, referenceId] as const,
            availableActions: (id: EntityId) =>
                ['workflow', 'instances', id, 'available-actions'] as const,
            history: (id: EntityId) => ['workflow', 'instances', id, 'history'] as const,
        },
    },
}
