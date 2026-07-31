import { Button, Flex, Input, Select, theme } from 'antd'
import { ClearOutlined, SearchOutlined } from '@ant-design/icons'

type CajasFiltersBarProps = {
    searchInput: string
    activoFilter: boolean | undefined
    hasActiveFilters: boolean
    onSearchInputChange: (value: string) => void
    onSearch: (value: string) => void
    onActivoFilterChange: (value: boolean | undefined) => void
    onClearFilters: () => void
}

export function CajasFiltersBar({
    searchInput,
    activoFilter,
    hasActiveFilters,
    onSearchInputChange,
    onSearch,
    onActivoFilterChange,
    onClearFilters,
}: CajasFiltersBarProps) {
    const { token } = theme.useToken()

    return (
        <Flex
            gap={6}
            wrap="wrap"
            align="center"
            className="rrhh-empleados__filters"
            role="search"
            aria-label="Filtros de cajas"
        >
            <Input
                allowClear
                size="small"
                className="rrhh-empleados__filter-search"
                prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                placeholder="Buscar por nombre o código…"
                value={searchInput}
                onChange={(event) => onSearchInputChange(event.target.value)}
                onPressEnter={() => onSearch(searchInput)}
                onClear={() => {
                    onSearchInputChange('')
                    onSearch('')
                }}
                aria-label="Buscar caja"
            />
            <Select
                allowClear
                size="small"
                placeholder="Estado"
                className="rrhh-empleados__filter-select"
                value={
                    activoFilter === undefined
                        ? undefined
                        : activoFilter
                          ? 'true'
                          : 'false'
                }
                options={[
                    { label: 'Activas', value: 'true' },
                    { label: 'Inactivas', value: 'false' },
                ]}
                onChange={(value) => {
                    if (value === undefined) {
                        onActivoFilterChange(undefined)
                        return
                    }
                    onActivoFilterChange(value === 'true')
                }}
                aria-label="Filtrar por estado"
            />
            {hasActiveFilters ? (
                <Button
                    type="text"
                    size="small"
                    icon={<ClearOutlined />}
                    onClick={onClearFilters}
                    className="rrhh-empleados__filter-clear"
                    aria-label="Limpiar filtros"
                >
                    Limpiar
                </Button>
            ) : null}
        </Flex>
    )
}
