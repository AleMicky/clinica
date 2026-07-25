import { Button, Flex, Input, theme } from 'antd'
import { ClearOutlined, SearchOutlined } from '@ant-design/icons'

type UnidadesMedidaFiltersBarProps = {
    searchInput: string
    hasActiveFilters: boolean
    onSearchInputChange: (value: string) => void
    onSearch: (value: string) => void
    onClearFilters: () => void
}

export function UnidadesMedidaFiltersBar({
    searchInput,
    hasActiveFilters,
    onSearchInputChange,
    onSearch,
    onClearFilters,
}: UnidadesMedidaFiltersBarProps) {
    const { token } = theme.useToken()

    return (
        <Flex
            gap={6}
            wrap="wrap"
            align="center"
            className="rrhh-empleados__filters"
            role="search"
            aria-label="Filtros de unidades de medida"
        >
            <Input
                allowClear
                size="small"
                className="rrhh-empleados__filter-search"
                prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                placeholder="Buscar por código, nombre o símbolo…"
                value={searchInput}
                onChange={(event) => onSearchInputChange(event.target.value)}
                onPressEnter={() => onSearch(searchInput)}
                onClear={() => {
                    onSearchInputChange('')
                    onSearch('')
                }}
                aria-label="Buscar unidad de medida"
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
