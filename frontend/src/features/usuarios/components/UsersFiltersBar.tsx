import { memo } from 'react'
import { Button, Flex, Input, Select, Tooltip, theme } from 'antd'
import { ClearOutlined, SearchOutlined } from '@ant-design/icons'

import type { StatusFilter } from '../hooks/use-users-filters'

export type { StatusFilter }

type UsersFiltersBarProps = {
    searchInput: string
    roleFilter: string | null
    statusFilter: StatusFilter
    roleOptions: string[]
    hasActiveFilters: boolean
    onSearchInputChange: (value: string) => void
    onSearch: (value: string) => void
    onRoleFilterChange: (value: string | null) => void
    onStatusFilterChange: (value: StatusFilter) => void
    onClearFilters: () => void
    className?: string
}

export const UsersFiltersBar = memo(function UsersFiltersBar({
    searchInput,
    roleFilter,
    statusFilter,
    roleOptions,
    hasActiveFilters,
    onSearchInputChange,
    onSearch,
    onRoleFilterChange,
    onStatusFilterChange,
    onClearFilters,
    className = 'seguridad-usuarios__filters',
}: UsersFiltersBarProps) {
    const { token } = theme.useToken()

    return (
        <Flex
            gap={8}
            wrap="wrap"
            align="center"
            className={className}
            role="search"
            aria-label="Filtros de usuarios"
        >
            <Input
                allowClear
                size="middle"
                className="seguridad-usuarios__filter-search"
                prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                placeholder="Buscar usuario, persona o documento…"
                value={searchInput}
                onChange={(event) => onSearchInputChange(event.target.value)}
                onPressEnter={() => onSearch(searchInput)}
                onClear={() => {
                    onSearchInputChange('')
                    onSearch('')
                }}
                aria-label="Buscar usuario"
            />
            <Select
                allowClear
                size="middle"
                className="seguridad-usuarios__filter-select"
                placeholder="Filtrar por rol"
                value={roleFilter ?? undefined}
                options={roleOptions.map((role) => ({ label: role, value: role }))}
                onChange={(value) => onRoleFilterChange(value ?? null)}
                aria-label="Filtrar por rol"
            />
            <Select
                size="middle"
                className="seguridad-usuarios__filter-select"
                placeholder="Estado"
                value={statusFilter}
                options={[
                    { label: 'Todos', value: 'all' },
                    { label: 'Activos', value: 'activo' },
                    { label: 'Inactivos', value: 'inactivo' },
                ]}
                onChange={onStatusFilterChange}
                aria-label="Filtrar por estado"
            />
            {hasActiveFilters ? (
                <Tooltip title="Quitar filtros de rol y estado">
                    <Button
                        type="text"
                        size="middle"
                        icon={<ClearOutlined />}
                        onClick={onClearFilters}
                        className="seguridad-usuarios__filter-clear"
                        aria-label="Limpiar filtros"
                    >
                        Limpiar
                    </Button>
                </Tooltip>
            ) : null}
        </Flex>
    )
})

/** Alias semántico solicitado en la arquitectura. */
export const UsersFilters = UsersFiltersBar
