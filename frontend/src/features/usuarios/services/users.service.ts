import { del, get, post, put } from '../../../shared/api/http'
import { userEndpoints } from '../../../shared/api/endpoints'
import type { PagedQuery, PagedResult } from '../../../shared/types/pagination.types'
import { paginateList } from '../../../shared/utils/pagination'
import type {
    CreateUserApiPayload,
    CreateUserPayload,
    UpdateUserApiPayload,
    UpdateUserPayload,
    User,
} from '../types/user.types'

function filterUsers(user: User, search: string) {
    return (
        user.userName.toLowerCase().includes(search) ||
        user.nombreCompleto.toLowerCase().includes(search) ||
        user.roles.some((role) => role.toLowerCase().includes(search))
    )
}

export class UsersService {
    async getPaged(query: PagedQuery): Promise<PagedResult<User>> {
        const users = await get<User[]>(userEndpoints.root)
        return paginateList(users, query, filterUsers)
    }

    getById(id: string) {
        return get<User>(userEndpoints.byId(id))
    }

    create(data: CreateUserPayload) {
        const payload: CreateUserApiPayload = {
            userName: data.userName,
            password: data.password,
            nombreCompleto: data.nombreCompleto,
            role: data.rol,
        }

        return post<User, CreateUserApiPayload>(userEndpoints.root, payload)
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
