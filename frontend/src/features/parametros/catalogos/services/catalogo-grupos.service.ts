import { del, get, getPaged, post, put } from '../../../../shared/api/http'
import { catalogoGrupoEndpoints, catalogoItemEndpoints } from '../../../../shared/api/endpoints'
import type { PagedQuery } from '../../../../shared/types/pagination.types'
import type {
    CatalogoGrupo,
    CatalogoGrupoConItems,
    CatalogoItem,
    CatalogoItemOption,
    CatalogoItemPagedQuery,
    CreateCatalogoGrupoPayload,
    UpdateCatalogoGrupoPayload,
} from '../types/catalogo.types'

export class CatalogoGruposService {
    getPaged(query: PagedQuery) {
        return getPaged<CatalogoGrupo>(catalogoGrupoEndpoints.root, query)
    }

    getById(id: string) {
        return get<CatalogoGrupo>(catalogoGrupoEndpoints.byId(id))
    }

    async getItemsByGrupo(grupoId: string) {
        const query: CatalogoItemPagedQuery = {
            page: 1,
            pageSize: 100,
            catalogoGrupoId: grupoId,
        }
        const result = await getPaged<CatalogoItem>(
            catalogoItemEndpoints.root,
            query,
        )
        return result.items
    }

    async getGroupedItems(): Promise<CatalogoGrupoConItems[]> {
        const [gruposResult, itemsResult] = await Promise.all([
            this.getPaged({ page: 1, pageSize: 100 }),
            getPaged<CatalogoItem>(catalogoItemEndpoints.root, {
                page: 1,
                pageSize: 500,
            }),
        ])

        const itemsByGrupo = new Map<string, CatalogoItemOption[]>()

        for (const item of itemsResult.items) {
            const list = itemsByGrupo.get(item.catalogoGrupoId) ?? []
            list.push({
                id: item.id,
                codigo: item.codigo,
                nombre: item.nombre,
                valor: item.valor,
                orden: item.orden,
            })
            itemsByGrupo.set(item.catalogoGrupoId, list)
        }

        return gruposResult.items.map((grupo) => ({
            ...grupo,
            items: itemsByGrupo.get(grupo.id) ?? [],
        }))
    }

    create(data: CreateCatalogoGrupoPayload) {
        return post<CatalogoGrupo, CreateCatalogoGrupoPayload>(
            catalogoGrupoEndpoints.root,
            data,
        )
    }

    update(id: string, data: UpdateCatalogoGrupoPayload) {
        return put<CatalogoGrupo, UpdateCatalogoGrupoPayload>(
            catalogoGrupoEndpoints.byId(id),
            data,
        )
    }

    delete(id: string) {
        return del<void>(catalogoGrupoEndpoints.byId(id))
    }
}

export const catalogoGruposService = new CatalogoGruposService()
