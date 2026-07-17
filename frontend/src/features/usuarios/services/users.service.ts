import { del, get, post, put } from '../../../shared/api/http'
import { userEndpoints } from '../../../shared/api/endpoints'
import type { PagedQuery, PagedResult } from '../../../shared/types/pagination.types'
import { paginateList } from '../../../shared/utils/pagination'
import type {
    CreateUsuarioPersonaApiPayload,
    UpdateUserApiPayload,
    UpdateUserPayload,
    User,
    UsuarioPersona,
} from '../types/user.types'

function filterUsers(user: User, search: string) {
    return (
        user.userName.toLowerCase().includes(search) ||
        user.nombreCompleto.toLowerCase().includes(search) ||
        (user.email?.toLowerCase().includes(search) ?? false) ||
        (user.personaNombreCompleto?.toLowerCase().includes(search) ?? false) ||
        (user.personaNumeroDocumento?.toLowerCase().includes(search) ?? false) ||
        (user.personaTipoDocumentoNombre?.toLowerCase().includes(search) ?? false) ||
        (user.personaTelefono?.toLowerCase().includes(search) ?? false) ||
        user.roles.some((role) => role.toLowerCase().includes(search))
    )
}

export class UsersService {
    async getPaged(query: PagedQuery): Promise<PagedResult<User>> {
        const users = await get<User[]>(userEndpoints.root)
        return paginateList(users, query, filterUsers)
    }

    createWithPersona(data: CreateUsuarioPersonaApiPayload) {
        return post<UsuarioPersona, CreateUsuarioPersonaApiPayload>(
            userEndpoints.conPersona,
            data,
        )
    }

    update(id: string, data: UpdateUserPayload) {
        const payload: UpdateUserApiPayload = {
            nombreCompleto: data.nombreCompleto,
            activo: data.activo,
            email: data.email,
        }

        return put<User, UpdateUserApiPayload>(userEndpoints.byId(id), payload)
    }

    assignRole(userId: string, role: string) {
        return post<User, { role: string }>(
            `${userEndpoints.byId(userId)}/roles`,
            { role },
        )
    }

    removeRole(userId: string, role: string) {
        return del<void>(
            `${userEndpoints.byId(userId)}/roles/${encodeURIComponent(role)}`,
        )
    }

    delete(id: string) {
        return del<void>(userEndpoints.byId(id))
    }
}

export const usersService = new UsersService()
