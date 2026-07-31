import { Button, Flex, Input, Select, theme } from 'antd'
import { ClearOutlined, SearchOutlined } from '@ant-design/icons'

type ConceptosCajaFiltersBarProps = {
    searchInput: string
    activoFilter: boolean | undefined
    tipoFilter: string | undefined
    hasActiveFilters: boolean
    onSearchInputChange: (value: string) => void
    onSearch: (value: string) => void
    onActivoFilterChange: (value: boolean | undefined) => void
    onTipoFilterChange: (value: string | undefined) => void
    onClearFilters: () => void
}

export function ConceptosCajaFiltersBar({
    searchInput,
    activoFilter,
    tipoFilter,
    hasActiveFilters,
    onSearchInputChange,
    onSearch,
    onActivoFilterChange,
    onTipoFilterChange,
    onClearFilters,
}: ConceptosCajaFiltersBarProps) {
    const { token } = theme.useToken()

    return (
        <Flex
            gap={6}
            wrap="wrap"
            align="center"
            className="rrhh-empleados__filters"
            role="search"
            aria-label="Filtros de conceptos de caja"
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
                aria-label="Buscar concepto"
            />
            <Select
                allowClear
                size="small"
                placeholder="Tipo"
                className="rrhh-empleados__filter-select"
                value={tipoFilter}
                options={[
                    { label: 'Ingreso', value: 'INGRESO' },
                    { label: 'Egreso', value: 'EGRESO' },
                ]}
                onChange={(value) => onTipoFilterChange(value)}
                aria-label="Filtrar por tipo de movimiento"
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
                    { label: 'Activos', value: 'true' },
                    { label: 'Inactivos', value: 'false' },
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
