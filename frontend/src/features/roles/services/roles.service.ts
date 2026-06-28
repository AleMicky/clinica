import { del, get, post, put } from '../../../shared/api/http'
import { roleEndpoints } from '../../../shared/api/endpoints'
import type { PagedQuery, PagedResult } from '../../../shared/types/pagination.types'
import { paginateList } from '../../../shared/utils/pagination'
import type {
    CreateRoleApiPayload,
    CreateRolePayload,
    Role,
    UpdateRoleApiPayload,
    UpdateRolePayload,
} from '../types/role.types'

function filterRoles(role: Role, search: string) {
    return (
        role.name.toLowerCase().includes(search) ||
        (role.descripcion ?? '').toLowerCase().includes(search)
    )
}

export class RolesService {
    async getPaged(query: PagedQuery): Promise<PagedResult<Role>> {
        const roles = await get<Role[]>(roleEndpoints.root)
        return paginateList(roles, query, filterRoles)
    }

    getById(id: string) {
        return get<Role>(roleEndpoints.byId(id))
    }

    create(data: CreateRolePayload) {
        const payload: CreateRoleApiPayload = {
            name: data.name,
            descripcion: data.descripcion,
        }

        return post<Role, CreateRoleApiPayload>(roleEndpoints.root, payload)
    }

    update(id: string, data: UpdateRolePayload) {
        const payload: UpdateRoleApiPayload = {
            name: data.name,
            descripcion: data.descripcion,
        }

        return put<Role, UpdateRoleApiPayload>(roleEndpoints.byId(id), payload)
    }

    delete(id: string) {
        return del<void>(roleEndpoints.byId(id))
    }
}

export const rolesService = new RolesService()
