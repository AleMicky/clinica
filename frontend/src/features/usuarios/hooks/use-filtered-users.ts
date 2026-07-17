import { useMemo } from 'react'

import type { User } from '../types/user.types'
import type { StatusFilter } from './use-users-filters'

export function filterUsersByRoleAndStatus(
    users: User[],
    roleFilter: string | null,
    statusFilter: StatusFilter,
) {
    let list = users

    if (roleFilter) {
        list = list.filter((user) => user.roles.includes(roleFilter))
    }

    if (statusFilter === 'activo') {
        list = list.filter((user) => user.activo)
    } else if (statusFilter === 'inactivo') {
        list = list.filter((user) => !user.activo)
    }

    return list
}

export function useFilteredUsers(
    users: User[],
    roleFilter: string | null,
    statusFilter: StatusFilter,
) {
    return useMemo(
        () => filterUsersByRoleAndStatus(users, roleFilter, statusFilter),
        [users, roleFilter, statusFilter],
    )
}
