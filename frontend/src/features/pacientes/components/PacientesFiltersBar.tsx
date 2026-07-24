import { Button, Flex, Input, theme } from 'antd'
import { ClearOutlined, SearchOutlined } from '@ant-design/icons'

type PacientesFiltersBarProps = {
    searchInput: string
    hcFilterInput: string
    docFilterInput: string
    hasActiveFilters: boolean
    onSearchInputChange: (value: string) => void
    onSearch: (value: string) => void
    onHcFilterInputChange: (value: string) => void
    onDocFilterInputChange: (value: string) => void
    onClearFilters: () => void
}

export function PacientesFiltersBar({
    searchInput,
    hcFilterInput,
    docFilterInput,
    hasActiveFilters,
    onSearchInputChange,
    onSearch,
    onHcFilterInputChange,
    onDocFilterInputChange,
    onClearFilters,
}: PacientesFiltersBarProps) {
    const { token } = theme.useToken()

    return (
        <Flex
            gap={6}
            wrap="wrap"
            align="center"
            className="rrhh-pacientes__filters"
            role="search"
            aria-label="Filtros de pacientes"
        >
            <Input
                allowClear
                size="small"
                className="rrhh-pacientes__filter-search"
                prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                placeholder="Buscar paciente…"
                value={searchInput}
                onChange={(event) => onSearchInputChange(event.target.value)}
                onPressEnter={() => onSearch(searchInput)}
                onClear={() => {
                    onSearchInputChange('')
                    onSearch('')
                }}
                aria-label="Buscar paciente"
            />
            <Input
                allowClear
                size="small"
                className="rrhh-pacientes__filter-input"
                placeholder="Historia clínica"
                value={hcFilterInput}
                onChange={(event) => onHcFilterInputChange(event.target.value)}
                aria-label="Filtrar por historia clínica"
            />
            <Input
                allowClear
                size="small"
                className="rrhh-pacientes__filter-input"
                placeholder="Documento"
                value={docFilterInput}
                onChange={(event) => onDocFilterInputChange(event.target.value)}
                aria-label="Filtrar por documento"
            />
            {hasActiveFilters ? (
                <Button
                    type="text"
                    size="small"
                    icon={<ClearOutlined />}
                    onClick={onClearFilters}
                    className="rrhh-pacientes__filter-clear"
                    aria-label="Limpiar filtros"
                >
                    Limpiar
                </Button>
            ) : null}
        </Flex>
    )
}
