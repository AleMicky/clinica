import { useMemo } from 'react'

import { useRoles } from '../../roles/hooks/roles.hooks'
import { useFilteredUsers } from './use-filtered-users'
import { useUserActions } from './use-user-actions'
import { useUserFormModal } from './use-user-form-modal'
import { useUsersFilters } from './use-users-filters'
import { useUsersTable } from './use-users-table'
import { useUsers } from './users.hooks'

const FETCH_PAGE_SIZE = 5000

export function useUsersView() {
    const filters = useUsersFilters()

    const { data, isFetching } = useUsers({
        page: 1,
        pageSize: FETCH_PAGE_SIZE,
        search: filters.search || undefined,
    })
    const { data: rolesData } = useRoles({ page: 1, pageSize: 100 })

    const allUsers = data?.items ?? []
    const totalUsers = data?.totalRecords ?? 0
    const totalRoles = rolesData?.totalRecords ?? rolesData?.items.length ?? 0

    const roleOptions = useMemo(
        () => rolesData?.items.map((role) => role.name) ?? [],
        [rolesData?.items],
    )

    const filteredUsers = useFilteredUsers(
        allUsers,
        filters.roleFilter,
        filters.statusFilter,
    )

    const table = useUsersTable(filteredUsers, filters.page, filters.setPage)
    const formModal = useUserFormModal()
    const actions = useUserActions()

    const captionTotal = filters.hasActiveFilters ? table.totalFiltered : totalUsers

    const caption = useMemo(() => {
        const plural = captionTotal === 1 ? '' : 's'
        const searchPart = filters.search ? ` · buscando "${filters.search}"` : ''
        const filtersPart = filters.hasActiveFilters ? ' · filtros activos' : ''
        return `${captionTotal} registrado${plural}${searchPart}${filtersPart}`
    }, [captionTotal, filters.search, filters.hasActiveFilters])

    return {
        loading: isFetching,
        totalUsers,
        totalRoles,
        roleOptions,
        caption,
        filters: {
            searchInput: filters.searchInput,
            search: filters.search,
            roleFilter: filters.roleFilter,
            statusFilter: filters.statusFilter,
            hasActiveFilters: filters.hasActiveFilters,
            onSearchInputChange: filters.handleSearchInputChange,
            onSearch: filters.handleSearch,
            onRoleFilterChange: filters.handleRoleFilterChange,
            onStatusFilterChange: filters.handleStatusFilterChange,
            onClearFilters: filters.clearFilters,
        },
        table: {
            users: table.users,
            total: filters.hasActiveFilters ? table.totalFiltered : totalUsers,
            page: filters.page,
            pageSize: table.pageSize,
            sorting: table.sorting,
            onSortingChange: table.setSorting,
            onPageChange: table.handlePageChange,
            activeOnPage: table.activeOnPage,
        },
        formModal,
        actions,
    }
}
