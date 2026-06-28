import { del, post, put } from '../../../shared/api/http'
import { catalogoItemEndpoints } from '../../../shared/api/endpoints'
import type {
    CatalogoItem,
    CreateCatalogoItemPayload,
    UpdateCatalogoItemPayload,
} from '../types/catalogo.types'

export class CatalogoItemsService {
    create(data: CreateCatalogoItemPayload) {
        return post<CatalogoItem, CreateCatalogoItemPayload>(
            catalogoItemEndpoints.root,
            data,
        )
    }

    update(id: string, data: UpdateCatalogoItemPayload) {
        return put<CatalogoItem, UpdateCatalogoItemPayload>(
            catalogoItemEndpoints.byId(id),
            data,
        )
    }

    delete(id: string) {
        return del<void>(catalogoItemEndpoints.byId(id))
    }
}

export const catalogoItemsService = new CatalogoItemsService()

export type { CatalogoItem }
