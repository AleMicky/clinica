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
    unidadesMedida: {
        all: ['unidades-medida'] as const,
        list: (query: PagedQuery) => ['unidades-medida', 'list', query] as const,
        detail: (id: EntityId) => ['unidades-medida', 'detail', id] as const,
    },
    gestiones: {
        all: ['gestiones'] as const,
        list: (query: PagedQuery) => ['gestiones', 'list', query] as const,
        detail: (id: EntityId) => ['gestiones', 'detail', id] as const,
    },
    periodos: {
        all: ['periodos'] as const,
        list: (query: PagedQuery & Record<string, unknown>) =>
            ['periodos', 'list', query] as const,
    },
    correlativos: {
        all: ['correlativos'] as const,
        list: (query: PagedQuery & Record<string, unknown>) =>
            ['correlativos', 'list', query] as const,
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
        list: (query: PagedQuery & Record<string, unknown>) =>
            ['pacientes', 'list', query] as const,
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
        turnos: {
            all: ['recursos-humanos', 'turnos'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['recursos-humanos', 'turnos', 'list', query] as const,
        },
        programacionDiaria: {
            all: ['recursos-humanos', 'programacion-diaria'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['recursos-humanos', 'programacion-diaria', 'list', query] as const,
            disponibilidad: (query: Record<string, unknown>) =>
                ['recursos-humanos', 'programacion-diaria', 'disponibilidad', query] as const,
            programacionesLookup: ['recursos-humanos', 'programacion-diaria', 'programaciones-lookup'] as const,
        },
    },
    catalogoClinico: {
        all: ['catalogo-clinico'] as const,
        areas: {
            all: ['catalogo-clinico', 'areas'] as const,
            list: (query: PagedQuery) =>
                ['catalogo-clinico', 'areas', 'list', query] as const,
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
        tiposArea: {
            all: ['catalogo-clinico', 'tipos-area'] as const,
            list: (query: PagedQuery) =>
                ['catalogo-clinico', 'tipos-area', 'list', query] as const,
        },
    },
    laboratorio: {
        all: ['laboratorio'] as const,
        especialidades: {
            all: ['laboratorio', 'especialidades'] as const,
            list: (query: PagedQuery) =>
                ['laboratorio', 'especialidades', 'list', query] as const,
            detail: (id: EntityId) =>
                ['laboratorio', 'especialidades', 'detail', id] as const,
        },
        tiposExamen: {
            all: ['laboratorio', 'tipos-examen'] as const,
            list: (query: PagedQuery) =>
                ['laboratorio', 'tipos-examen', 'list', query] as const,
            detail: (id: EntityId) =>
                ['laboratorio', 'tipos-examen', 'detail', id] as const,
        },
        pruebas: {
            all: ['laboratorio', 'pruebas'] as const,
            list: (query: PagedQuery) =>
                ['laboratorio', 'pruebas', 'list', query] as const,
            detail: (id: EntityId) =>
                ['laboratorio', 'pruebas', 'detail', id] as const,
        },
        pruebaPrecios: {
            all: ['laboratorio', 'prueba-precios'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['laboratorio', 'prueba-precios', 'list', query] as const,
            detail: (id: EntityId) =>
                ['laboratorio', 'prueba-precios', 'detail', id] as const,
        },
        parametros: {
            all: ['laboratorio', 'parametros'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['laboratorio', 'parametros', 'list', query] as const,
            detail: (id: EntityId) =>
                ['laboratorio', 'parametros', 'detail', id] as const,
        },
        valoresReferencia: {
            all: ['laboratorio', 'valores-referencia'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['laboratorio', 'valores-referencia', 'list', query] as const,
            detail: (id: EntityId) =>
                ['laboratorio', 'valores-referencia', 'detail', id] as const,
        },
        laboratoriosExternos: {
            all: ['laboratorio', 'laboratorios-externos'] as const,
            list: (query: PagedQuery) =>
                ['laboratorio', 'laboratorios-externos', 'list', query] as const,
            detail: (id: EntityId) =>
                ['laboratorio', 'laboratorios-externos', 'detail', id] as const,
        },
        solicitudes: {
            all: ['laboratorio', 'solicitudes'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['laboratorio', 'solicitudes', 'list', query] as const,
            detail: (id: EntityId) =>
                ['laboratorio', 'solicitudes', 'detail', id] as const,
        },
        muestras: {
            all: ['laboratorio', 'muestras'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['laboratorio', 'muestras', 'list', query] as const,
            detail: (id: EntityId) =>
                ['laboratorio', 'muestras', 'detail', id] as const,
        },
        resultados: {
            all: ['laboratorio', 'resultados'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['laboratorio', 'resultados', 'list', query] as const,
            detail: (id: EntityId) =>
                ['laboratorio', 'resultados', 'detail', id] as const,
        },
    },
    caja: {
        all: ['caja'] as const,
        cuentas: {
            all: ['caja', 'cuentas'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['caja', 'cuentas', 'list', query] as const,
            detail: (id: EntityId) => ['caja', 'cuentas', 'detail', id] as const,
        },
        cajas: {
            all: ['caja', 'cajas'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['caja', 'cajas', 'list', query] as const,
        },
        turnos: {
            all: ['caja', 'turnos'] as const,
            abierto: ['caja', 'turnos', 'abierto'] as const,
            resumen: (id: EntityId) => ['caja', 'turnos', 'resumen', id] as const,
            arqueo: (id: EntityId) => ['caja', 'turnos', 'arqueo', id] as const,
        },
        pagos: {
            all: ['caja', 'pagos'] as const,
            detail: (id: EntityId) => ['caja', 'pagos', 'detail', id] as const,
        },
        movimientos: {
            all: ['caja', 'movimientos'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['caja', 'movimientos', 'list', query] as const,
        },
        metodosPago: ['caja', 'metodos-pago'] as const,
        conceptos: ['caja', 'conceptos'] as const,
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
    },
    workflow: {
        all: ['workflow'] as const,
        definitions: {
            all: ['workflow', 'definitions'] as const,
            list: (query: PagedQuery) => ['workflow', 'definitions', 'list', query] as const,
            detail: (id: EntityId) => ['workflow', 'definitions', 'detail', id] as const,
        },
        customQueries: {
            all: ['workflow', 'custom-queries'] as const,
            list: (query: PagedQuery) => ['workflow', 'custom-queries', 'list', query] as const,
            detail: (id: EntityId) => ['workflow', 'custom-queries', 'detail', id] as const,
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
            assignees: (id: EntityId, transitionCode: string, page: number, pageSize: number) =>
                ['workflow', 'instances', id, 'assignees', transitionCode, page, pageSize] as const,
            history: (id: EntityId) => ['workflow', 'instances', id, 'history'] as const,
        },
    },
    almacen: {
        categorias: {
            all: ['almacen', 'categorias'] as const,
            list: (query: PagedQuery) => ['almacen', 'categorias', 'list', query] as const,
        },
        productos: {
            all: ['almacen', 'productos'] as const,
            list: (query: PagedQuery) => ['almacen', 'productos', 'list', query] as const,
        },
        existencias: {
            all: ['almacen', 'existencias'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['almacen', 'existencias', 'list', query] as const,
        },
        movimientos: {
            all: ['almacen', 'movimientos'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['almacen', 'movimientos', 'list', query] as const,
        },
    },
    compras: {
        proveedores: {
            all: ['compras', 'proveedores'] as const,
            list: (query: PagedQuery) => ['compras', 'proveedores', 'list', query] as const,
        },
        ordenes: {
            all: ['compras', 'ordenes'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['compras', 'ordenes', 'list', query] as const,
        },
    },
    farmacia: {
        precios: {
            all: ['farmacia', 'precios'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['farmacia', 'precios', 'list', query] as const,
        },
        recetas: {
            all: ['farmacia', 'recetas'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['farmacia', 'recetas', 'list', query] as const,
        },
        dispensaciones: {
            all: ['farmacia', 'dispensaciones'] as const,
            list: (query: PagedQuery & Record<string, unknown>) =>
                ['farmacia', 'dispensaciones', 'list', query] as const,
        },
    },

}
