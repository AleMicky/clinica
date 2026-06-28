import { del, get, getPaged, post, put } from '../../../shared/api/http'
import { catalogoClinicoEndpoints } from '../../../shared/api/endpoints'
import type { PagedQuery } from '../../../shared/types/pagination.types'
import type {
    Area,
    Cargo,
    CreateCatalogoBasePayload,
    CreateCatalogoResult,
    CreateDepartamentoPayload,
    CreatePrestacionPayload,
    CreateServicioPayload,
    Departamento,
    Especialidad,
    Prestacion,
    Profesion,
    Servicio,
    TipoAtencionCatalogo,
    UpdateCatalogoBasePayload,
    UpdateDepartamentoPayload,
    UpdatePrestacionPayload,
    UpdateServicioPayload,
} from '../types/catalogo-clinico.types'

function createSimpleCatalogService<T>(root: string) {
    return {
        getPaged: (query: PagedQuery) => getPaged<T>(root, query),
        getById: (id: string) => get<T>(`${root}/${id}`),
        create: (data: CreateCatalogoBasePayload) =>
            post<CreateCatalogoResult, CreateCatalogoBasePayload>(root, data),
        update: (id: string, data: UpdateCatalogoBasePayload) =>
            put<void, UpdateCatalogoBasePayload>(`${root}/${id}`, data),
        delete: (id: string) => del<void>(`${root}/${id}`),
    }
}

export const areasService = {
    ...createSimpleCatalogService<Area>(catalogoClinicoEndpoints.areas.root),
}

export const departamentosService = {
    getPaged(query: PagedQuery) {
        return getPaged<Departamento>(
            catalogoClinicoEndpoints.departamentos.root,
            query,
        )
    },
    getById: (id: string) =>
        get<Departamento>(catalogoClinicoEndpoints.departamentos.byId(id)),
    create(data: CreateDepartamentoPayload) {
        return post<CreateCatalogoResult, CreateDepartamentoPayload>(
            catalogoClinicoEndpoints.departamentos.root,
            data,
        )
    },
    update(id: string, data: UpdateDepartamentoPayload) {
        return put<void, UpdateDepartamentoPayload>(
            catalogoClinicoEndpoints.departamentos.byId(id),
            data,
        )
    },
    delete: (id: string) =>
        del<void>(catalogoClinicoEndpoints.departamentos.byId(id)),
}

export const serviciosService = {
    getPaged(query: PagedQuery) {
        return getPaged<Servicio>(catalogoClinicoEndpoints.servicios.root, query)
    },
    getById(id: string) {
        return get<Servicio>(catalogoClinicoEndpoints.servicios.byId(id))
    },
    create(data: CreateServicioPayload) {
        return post<CreateCatalogoResult, CreateServicioPayload>(
            catalogoClinicoEndpoints.servicios.root,
            data,
        )
    },
    update(id: string, data: UpdateServicioPayload) {
        return put<void, UpdateServicioPayload>(
            catalogoClinicoEndpoints.servicios.byId(id),
            data,
        )
    },
    delete(id: string) {
        return del<void>(catalogoClinicoEndpoints.servicios.byId(id))
    },
    getPrestaciones(servicioId: string) {
        return get<Prestacion[]>(
            catalogoClinicoEndpoints.servicios.prestaciones(servicioId),
        )
    },
}

export const prestacionesService = {
    getPaged(query: PagedQuery) {
        return getPaged<Prestacion>(catalogoClinicoEndpoints.prestaciones.root, query)
    },
    getById(id: string) {
        return get<Prestacion>(catalogoClinicoEndpoints.prestaciones.byId(id))
    },
    create(data: CreatePrestacionPayload) {
        return post<CreateCatalogoResult, CreatePrestacionPayload>(
            catalogoClinicoEndpoints.prestaciones.root,
            data,
        )
    },
    update(id: string, data: UpdatePrestacionPayload) {
        return put<void, UpdatePrestacionPayload>(
            catalogoClinicoEndpoints.prestaciones.byId(id),
            data,
        )
    },
    delete(id: string) {
        return del<void>(catalogoClinicoEndpoints.prestaciones.byId(id))
    },
}

export const especialidadesService = createSimpleCatalogService<Especialidad>(
    catalogoClinicoEndpoints.especialidades.root,
)

export const profesionesService = createSimpleCatalogService<Profesion>(
    catalogoClinicoEndpoints.profesiones.root,
)

export const cargosService = createSimpleCatalogService<Cargo>(
    catalogoClinicoEndpoints.cargos.root,
)

export const tiposAtencionCatalogoService =
    createSimpleCatalogService<TipoAtencionCatalogo>(
        catalogoClinicoEndpoints.tiposAtencion.root,
    )
