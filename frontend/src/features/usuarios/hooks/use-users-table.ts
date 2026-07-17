import { useCallback, useMemo, useState } from 'react'
import type { SortingState } from '@tanstack/react-table'

import type { User } from '../types/user.types'

const DEFAULT_PAGE_SIZE = 20

function compareValues(a: unknown, b: unknown) {
    if (a == null && b == null) return 0
    if (a == null) return 1
    if (b == null) return -1

    if (typeof a === 'boolean' && typeof b === 'boolean') {
        return Number(a) - Number(b)
    }

    if (typeof a === 'number' && typeof b === 'number') {
        return a - b
    }

    return String(a).localeCompare(String(b), 'es', { sensitivity: 'base' })
}

function getSortValue(user: User, columnId: string): unknown {
    switch (columnId) {
        case 'identity':
        case 'nombreCompleto':
            return user.nombreCompleto
        case 'userName':
            return user.userName
        case 'persona':
            return user.personaNombreCompleto ?? user.nombreCompleto
        case 'roles':
            return user.roles[0] ?? ''
        case 'activo':
            return user.activo
        case 'fechaCreacion':
        case 'createdAt':
            return user.createdAt ?? ''
        default:
            return ''
    }
}

export function useUsersTable(filteredUsers: User[], page: number, setPage: (page: number) => void) {
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [sorting, setSorting] = useState<SortingState>([])

    const sortedUsers = useMemo(() => {
        if (sorting.length === 0) return filteredUsers

        const [{ id, desc }] = sorting
        const direction = desc ? -1 : 1

        return [...filteredUsers].sort((left, right) => {
            return compareValues(getSortValue(left, id), getSortValue(right, id)) * direction
        })
    }, [filteredUsers, sorting])

    const totalFiltered = sortedUsers.length

    const users = useMemo(() => {
        const start = (page - 1) * pageSize
        return sortedUsers.slice(start, start + pageSize)
    }, [sortedUsers, page, pageSize])

    const activeOnPage = useMemo(
        () => users.filter((user) => user.activo).length,
        [users],
    )

    const handlePageChange = useCallback(
        (nextPage: number, nextPageSize: number) => {
            setPage(nextPage)
            setPageSize(nextPageSize)
        },
        [setPage],
    )

    return {
        users,
        totalFiltered,
        pageSize,
        sorting,
        setSorting,
        activeOnPage,
        handlePageChange,
    }
}
