import { Button, Flex, Input, Select, theme } from 'antd'
import { ClearOutlined, SearchOutlined } from '@ant-design/icons'

type SelectOption = {
    label: string
    value: string
}

type EmpleadosFiltersBarProps = {
    searchInput: string
    areaFilter: string | undefined
    areaOptions: SelectOption[]
    hasActiveFilters: boolean
    onSearchInputChange: (value: string) => void
    onSearch: (value: string) => void
    onAreaFilterChange: (value: string | undefined) => void
    onClearFilters: () => void
}

export function EmpleadosFiltersBar({
    searchInput,
    areaFilter,
    areaOptions,
    hasActiveFilters,
    onSearchInputChange,
    onSearch,
    onAreaFilterChange,
    onClearFilters,
}: EmpleadosFiltersBarProps) {
    const { token } = theme.useToken()

    return (
        <Flex
            gap={6}
            wrap="wrap"
            align="center"
            className="rrhh-empleados__filters"
            role="search"
            aria-label="Filtros de empleados"
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
                aria-label="Buscar empleado"
            />
            <Select
                allowClear
                size="small"
                placeholder="Área"
                options={areaOptions}
                value={areaFilter}
                onChange={onAreaFilterChange}
                className="rrhh-empleados__filter-select"
                aria-label="Filtrar por área"
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
