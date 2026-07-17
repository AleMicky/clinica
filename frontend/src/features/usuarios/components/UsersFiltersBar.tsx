import { Button, Input, Select, theme } from 'antd'
import { FilterOutlined, SearchOutlined } from '@ant-design/icons'

export type StatusFilter = 'all' | 'activo' | 'inactivo'

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

export function UsersFiltersBar({
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
        <div className={className}>
            <Input
                allowClear
                size="small"
                className="seguridad-usuarios__filter-search"
                prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                placeholder="Buscar por usuario o persona…"
                value={searchInput}
                onChange={(event) => onSearchInputChange(event.target.value)}
                onPressEnter={() => onSearch(searchInput)}
                onClear={() => {
                    onSearchInputChange('')
                    onSearch('')
                }}
            />
            <Select
                allowClear
                size="small"
                className="seguridad-usuarios__filter-select"
                placeholder="Rol"
                value={roleFilter ?? undefined}
                options={roleOptions.map((role) => ({ label: role, value: role }))}
                onChange={(value) => onRoleFilterChange(value ?? null)}
            />
            <Select
                size="small"
                className="seguridad-usuarios__filter-select"
                placeholder="Estado"
                value={statusFilter}
                options={[
                    { label: 'Todos', value: 'all' },
                    { label: 'Activos', value: 'activo' },
                    { label: 'Inactivos', value: 'inactivo' },
                ]}
                onChange={onStatusFilterChange}
            />
            {hasActiveFilters ? (
                <Button
                    type="link"
                    size="small"
                    icon={<FilterOutlined />}
                    onClick={onClearFilters}
                    className="seguridad-usuarios__filter-clear"
                >
                    Limpiar
                </Button>
            ) : null}
        </div>
    )
}
