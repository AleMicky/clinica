import { del, get, getPaged, post, put } from '../../../shared/api/http'
import { catalogoClinicoEndpoints } from '../../../shared/api/endpoints'
import type { PagedQuery } from '../../../shared/types/pagination.types'
import type {
    Area,
    Cargo,
    CreateCatalogoBasePayload,
    CreateCatalogoResult,
    Especialidad,
    Profesion,
    UpdateCatalogoBasePayload,
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

export const especialidadesService = createSimpleCatalogService<Especialidad>(
    catalogoClinicoEndpoints.especialidades.root,
)

export const profesionesService = createSimpleCatalogService<Profesion>(
    catalogoClinicoEndpoints.profesiones.root,
)

export const cargosService = createSimpleCatalogService<Cargo>(
    catalogoClinicoEndpoints.cargos.root,
)
