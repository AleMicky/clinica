import { Button, Flex, Input, Select } from 'antd'
import { ClearOutlined, SearchOutlined } from '@ant-design/icons'

type PagosFiltersBarProps = {
    searchInput: string
    estadoFilter: string | undefined
    hasActiveFilters: boolean
    onSearchInputChange: (value: string) => void
    onSearch: (value: string) => void
    onEstadoFilterChange: (value: string | undefined) => void
    onClearFilters: () => void
}

export function PagosFiltersBar({
    searchInput,
    estadoFilter,
    hasActiveFilters,
    onSearchInputChange,
    onSearch,
    onEstadoFilterChange,
    onClearFilters,
}: PagosFiltersBarProps) {
    return (
        <Flex
            gap={6}
            wrap="wrap"
            align="center"
            className="rrhh-empleados__filters"
            role="search"
            aria-label="Filtros de pagos"
        >
            <Input
                allowClear
                size="small"
                prefix={<SearchOutlined />}
                placeholder="Buscar por número…"
                value={searchInput}
                onChange={(e) => onSearchInputChange(e.target.value)}
                onPressEnter={() => onSearch(searchInput)}
                aria-label="Buscar por número de pago"
                style={{ minWidth: 200, maxWidth: 280 }}
            />
            <Select
                allowClear
                size="small"
                placeholder="Estado"
                className="rrhh-empleados__filter-select"
                value={estadoFilter}
                options={[
                    { label: 'Confirmado', value: 'CONFIRMADO' },
                    { label: 'Anulado', value: 'ANULADO' },
                    { label: 'Devuelto', value: 'DEVUELTO' },
                    { label: 'Parc. devuelto', value: 'PARCIALMENTE_DEVUELTO' },
                ]}
                onChange={(value) => onEstadoFilterChange(value)}
                aria-label="Filtrar por estado"
                style={{ minWidth: 160 }}
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
