import { Button, Flex, Input, theme } from 'antd'
import { ClearOutlined, SearchOutlined } from '@ant-design/icons'

export type CrudSearchFiltersBarProps = {
    searchInput: string
    hasActiveFilters: boolean
    onSearchInputChange: (value: string) => void
    onSearch: (value: string) => void
    onClearFilters: () => void
    ariaLabel: string
    searchAriaLabel: string
    placeholder?: string
}

export function CrudSearchFiltersBar({
    searchInput,
    hasActiveFilters,
    onSearchInputChange,
    onSearch,
    onClearFilters,
    ariaLabel,
    searchAriaLabel,
    placeholder = 'Buscar por código, nombre o descripción…',
}: CrudSearchFiltersBarProps) {
    const { token } = theme.useToken()

    return (
        <Flex
            gap={6}
            wrap="wrap"
            align="center"
            className="rrhh-empleados__filters"
            role="search"
            aria-label={ariaLabel}
        >
            <Input
                allowClear
                size="small"
                className="rrhh-empleados__filter-search"
                prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                placeholder={placeholder}
                value={searchInput}
                onChange={(event) => onSearchInputChange(event.target.value)}
                onPressEnter={() => onSearch(searchInput)}
                onClear={() => {
                    onSearchInputChange('')
                    onSearch('')
                }}
                aria-label={searchAriaLabel}
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
