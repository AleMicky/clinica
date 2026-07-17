import { Button, Flex, Input, Select, theme } from 'antd'
import { ClearOutlined, SearchOutlined } from '@ant-design/icons'

type SelectOption = {
    label: string
    value: string
}

type MedicosFiltersBarProps = {
    searchInput: string
    especialidadFilter: string | undefined
    especialidadOptions: SelectOption[]
    hasActiveFilters: boolean
    onSearchInputChange: (value: string) => void
    onSearch: (value: string) => void
    onEspecialidadFilterChange: (value: string | undefined) => void
    onClearFilters: () => void
}

export function MedicosFiltersBar({
    searchInput,
    especialidadFilter,
    especialidadOptions,
    hasActiveFilters,
    onSearchInputChange,
    onSearch,
    onEspecialidadFilterChange,
    onClearFilters,
}: MedicosFiltersBarProps) {
    const { token } = theme.useToken()

    return (
        <Flex
            gap={6}
            wrap="wrap"
            align="center"
            className="rrhh-medicos__filters"
            role="search"
            aria-label="Filtros de médicos"
        >
            <Input
                allowClear
                size="small"
                className="rrhh-medicos__filter-search"
                prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                placeholder="Buscar por nombre o matrícula…"
                value={searchInput}
                onChange={(event) => onSearchInputChange(event.target.value)}
                onPressEnter={() => onSearch(searchInput)}
                onClear={() => {
                    onSearchInputChange('')
                    onSearch('')
                }}
                aria-label="Buscar médico"
            />
            <Select
                allowClear
                size="small"
                placeholder="Especialidad"
                options={especialidadOptions}
                value={especialidadFilter}
                onChange={onEspecialidadFilterChange}
                className="rrhh-medicos__filter-select"
                aria-label="Filtrar por especialidad"
            />
            {hasActiveFilters ? (
                <Button
                    type="text"
                    size="small"
                    icon={<ClearOutlined />}
                    onClick={onClearFilters}
                    className="rrhh-medicos__filter-clear"
                    aria-label="Limpiar filtros"
                >
                    Limpiar
                </Button>
            ) : null}
        </Flex>
    )
}
